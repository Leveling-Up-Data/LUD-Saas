// webhook.js
import express from "express";
import Stripe from "stripe";
import PocketBase from "pocketbase";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 4242;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const pb = new PocketBase(process.env.POCKETBASE_URL);

async function pbLoginAsAdmin() {
  try {
    const adminEmail = process.env.PB_ADMIN_EMAIL;
    const adminPassword = process.env.PB_ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.warn("PocketBase admin credentials not provided. Set PB_ADMIN_EMAIL and PB_ADMIN_PASSWORD in .env");
      return;
    }

    // Try pb.admins.authWithPassword (preferred when available)
    try {
      if (typeof pb.admins?.authWithPassword === "function") {
        const auth = await pb.admins.authWithPassword(adminEmail, adminPassword);
        console.log("PocketBase: logged in as admin (pb.admins) ->", auth.record?.email || auth.record?.id);
        return;
      }
    } catch (err) {
      console.warn("pb.admins.authWithPassword failed or not available:", err?.message || err);
    }

    // Fallback: try _superusers collection (some SDKs)
    try {
      if (typeof pb.collection === "function") {
        const auth = await pb.collection("_superusers").authWithPassword(adminEmail, adminPassword);
        console.log("PocketBase: logged in as admin (_superusers) ->", auth.record?.email || auth.record?.id);
        return;
      }
    } catch (err) {
      console.warn("_superusers authWithPassword failed:", err?.message || err);
    }

    // Last fallback: try authenticating as a normal user
    try {
      const auth = await pb.collection("users").authWithPassword(adminEmail, adminPassword);
      console.log("PocketBase: logged in as regular user (fallback) ->", auth.record?.email || auth.record?.id);
      return;
    } catch (err) {
      console.warn("Regular users authWithPassword failed:", err?.message || err);
    }

    throw new Error("PocketBase admin login unsuccessful. Check credentials and SDK version.");
  } catch (err) {
    console.error("PocketBase login error:", err?.message || err);
    throw err;
  }
}

/** helper - convert cents to float */
function toAmount(cents) {
  if (typeof cents !== "number") return 0;
  return cents / 100;
}

/** helper - safe parse metadata (string or object) */
function parseMetadataField(raw) {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/** helper - upsert into PocketBase with simple idempotency check */
async function upsertCustomerRecord(payload, eventId) {
  const collection = "customers";
  let existing = null;

  try {
    if (payload.stripe_customer_id) {
      const found = await pb.collection(collection).getList(1, 1, {
        filter: `stripe_customer_id = "${payload.stripe_customer_id}"`,
      });
      if (found.items.length) existing = found.items[0];
    }
  } catch (err) {
    console.warn("PocketBase lookup by stripe_customer_id failed:", err?.message || err);
  }

  if (!existing && payload.email) {
    try {
      const found = await pb.collection(collection).getList(1, 1, {
        filter: `email = "${payload.email}"`,
      });
      if (found.items.length) existing = found.items[0];
    } catch (err) {
      console.warn("PocketBase lookup by email failed:", err?.message || err);
    }
  }

  // Idempotency: if existing record has last_event_id equal to eventId, skip processing
  if (existing) {
    const existingMeta = parseMetadataField(existing.metadata || existing?.metadata || "{}");
    if (existingMeta?.last_event_id && eventId && existingMeta.last_event_id === eventId) {
      console.log("Skipping event - already processed event id:", eventId);
      return { skipped: true, id: existing.id };
    }
  }

  // Attach last_event_id into metadata so we can detect duplicates
  const meta = parseMetadataField(payload.metadata || {});
  if (eventId) meta.last_event_id = eventId;
  payload.metadata = JSON.stringify(meta);

  if (existing) {
    const updated = await pb.collection(collection).update(existing.id, payload);
    console.log("✅ Updated existing customer:", updated.id);
    return { skipped: false, id: updated.id };
  } else {
    const created = await pb.collection(collection).create(payload);
    console.log("✅ Created new customer:", created.id);
    return { skipped: false, id: created.id };
  }
}

/** main async init and server start */
(async () => {
  try {
    // Login to PocketBase
    await pbLoginAsAdmin();

    const app = express();

    // Stripe requires raw body for signature verification
    app.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
      const sig = req.headers["stripe-signature"];
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      let event;

      try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      } catch (err) {
        console.error("⚠️ Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      const eventId = event.id;
      try {
        // handle multiple event types
        switch (event.type) {
          case "checkout.session.completed": {
            const session = event.data.object;

            // retrieve full customer when possible
            let stripeCustomer = null;
            if (session.customer) {
              try {
                stripeCustomer = await stripe.customers.retrieve(session.customer);
              } catch (err) {
                console.warn("Could not retrieve stripe customer:", err?.message || err);
              }
            }

            // fetch payment intent for payment details if present
            let paymentIntent = null;
            try {
              if (session.payment_intent) {
                paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
              }
            } catch (err) {
              console.warn("Could not retrieve payment intent:", err?.message || err);
            }

            const charge = paymentIntent?.charges?.data?.[0] || null;

            const payload = {
              name: (stripeCustomer?.name || session.customer_details?.name || "") + "",
              email: (stripeCustomer?.email || session.customer_details?.email || "") + "",
              phone: (stripeCustomer?.phone || session.customer_details?.phone || "") + "",
              stripe_customer_id: session.customer || (stripeCustomer?.id || ""),
              plan: session.metadata?.plan || session.display_items?.[0]?.plan?.nickname || session.display_items?.[0]?.price?.id || "default",

              amount: toAmount(session.amount_total || paymentIntent?.amount || charge?.amount || 0),
              currency: session.currency || paymentIntent?.currency || charge?.currency || "unknown",
              payment_status: session.payment_status || (paymentIntent?.status || "unknown"),
              payment_intent: session.payment_intent || (paymentIntent?.id || ""),
              payment_method: charge?.payment_method_details?.card?.brand || (paymentIntent?.payment_method_types?.[0] || "unknown"),
              card_last4: charge?.payment_method_details?.card?.last4 || "",
              receipt_url: charge?.receipt_url || "",
              hosted_invoice_url: "",
              last_payment: new Date().toISOString(),
              metadata: JSON.stringify(session.metadata || {}),
            };

            await upsertCustomerRecord(payload, eventId);
            break;
          }

          case "invoice.created":
          case "invoice.finalized":
          case "invoice.paid":
          case "invoice.payment_succeeded": {
            const invoice = event.data.object;

            // Get customer details
            let stripeCustomer = null;
            if (invoice.customer) {
              try {
                stripeCustomer = await stripe.customers.retrieve(invoice.customer);
              } catch (err) {
                console.warn("Could not retrieve stripe customer for invoice:", err?.message || err);
              }
            }

            // Payment details - use payment_intent if available
            let paymentIntent = null;
            let charge = null;
            try {
              if (invoice.payment_intent) {
                paymentIntent = await stripe.paymentIntents.retrieve(invoice.payment_intent);
                charge = paymentIntent?.charges?.data?.[0] || null;
              } else if (invoice.charge) {
                try {
                  // invoice.charge might be a charge id
                  charge = await stripe.charges.retrieve(invoice.charge);
                } catch (err) {
                  console.warn("Could not retrieve charge:", err?.message || err);
                }
              }
            } catch (err) {
              console.warn("Error fetching payment details for invoice:", err?.message || err);
            }

            let planDescription = "invoice";
            try {
              if (invoice.lines && invoice.lines.data && invoice.lines.data.length) {
                planDescription = invoice.lines.data
                  .map((l) => l.description || l.price?.nickname || l.price?.product || l.price?.id)
                  .join(", ");
              }
            } catch {
              planDescription = "invoice";
            }

            const payload = {
              name: (stripeCustomer?.name || invoice?.customer_name || "") + "",
              email: (stripeCustomer?.email || invoice.customer_email || "") + "",
              phone: stripeCustomer?.phone || "",
              stripe_customer_id: invoice.customer || (stripeCustomer?.id || ""),
              plan: invoice.metadata?.plan || planDescription,
              amount: toAmount(invoice.amount_paid || invoice.amount_due || charge?.amount || 0),
              currency: invoice.currency || charge?.currency || "unknown",
              payment_status: invoice.status || (paymentIntent?.status || "unknown"),
              payment_intent: invoice.payment_intent || (paymentIntent?.id || ""),
              payment_method: charge?.payment_method_details?.card?.brand || "unknown",
              card_last4: charge?.payment_method_details?.card?.last4 || "",
              receipt_url: charge?.receipt_url || invoice.hosted_invoice_url || "",
              hosted_invoice_url: invoice.hosted_invoice_url || "",
              invoice_id: invoice.id || "",
              last_payment: new Date().toISOString(),
              metadata: JSON.stringify(invoice.metadata || {}),
            };

            await upsertCustomerRecord(payload, eventId);
            break;
          }

          case "payment_intent.succeeded": {
            const pi = event.data.object;

            let stripeCustomer = null;
            if (pi.customer) {
              try {
                stripeCustomer = await stripe.customers.retrieve(pi.customer);
              } catch (err) {
                console.warn("Could not retrieve customer for payment_intent:", err?.message || err);
              }
            }

            const charge = pi.charges?.data?.[0] || null;

            const payload = {
              name: stripeCustomer?.name || "",
              email: stripeCustomer?.email || "",
              phone: stripeCustomer?.phone || "",
              stripe_customer_id: stripeCustomer?.id || (pi.customer || ""),
              plan: pi.metadata?.plan || "payment",
              amount: toAmount(pi.amount || charge?.amount || 0),
              currency: pi.currency || charge?.currency || "unknown",
              payment_status: pi.status || "unknown",
              payment_intent: pi.id || "",
              payment_method: charge?.payment_method_details?.card?.brand || "unknown",
              card_last4: charge?.payment_method_details?.card?.last4 || "",
              receipt_url: charge?.receipt_url || "",
              last_payment: new Date().toISOString(),
              metadata: JSON.stringify(pi.metadata || {}),
            };

            await upsertCustomerRecord(payload, eventId);
            break;
          }

          default:
            console.log(`Unhandled event type: ${event.type}`);
        }

        // Acknowledge receipt of the event
        res.json({ received: true });
      } catch (err) {
        console.error("❌ Error handling event:", err?.message || err);
        // Respond with 200 to avoid Stripe retry storm only if you intentionally want to ignore errors.
        // Better to return 500 so Stripe will retry; return 500 here so you can see failures during testing.
        res.status(500).send("Server error");
      }
    });

    // Other routes can use express.json() safely
    app.use(express.json());
    app.get("/", (req, res) => res.send("OK"));

    app.listen(PORT, () => {
      console.log(`Listening on ${PORT}`);
    });
  } catch (err) {
    console.error("Startup error:", err?.message || err);
    process.exit(1);
  }
})();
