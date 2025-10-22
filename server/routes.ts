import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import nodemailer from "nodemailer";

// Initialize Stripe if API key is available
let stripe: Stripe | null = null;

if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-09-30.clover",
  });
} else {
  console.warn('⚠️  Stripe API keys not configured. Payment features will be disabled.');
  console.warn('To enable payments, add STRIPE_SECRET_KEY and VITE_STRIPE_PUBLIC_KEY to your secrets.');
}

// Login schema
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function registerRoutes(app: Express): Promise<Server> {

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  // Products endpoint (fallback if PocketBase is not available)
  // Invite endpoint (SMTP email sending)
  const inviteSchema = z.object({
    email: z.string().email(),
    inviterId: z.string().min(1),
  });

  app.post('/api/invite', async (req, res) => {
    try {
      const { email, inviterId } = inviteSchema.parse(req.body);

      const origin = "https://starfish.levelingupdata.com/";

      // Hardcoded SMTP credentials per user request
      const smtpConfig = {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user: 'atom@levelingupdata.com', pass: 'tblmdineodbegxge' },
        from: 'hello@levelingupdata.com',
      };

      const transporter = nodemailer.createTransport({
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        auth: smtpConfig.auth,
      });

      // Redirect to provided login/signup URL directly (no PB flows)
      const loginUrl = `https://starfish.levelingupdata.com/`;
      const subject = `You're invited to join`;
      const textBody = `You've been invited. Click the link to sign up or log in: ${loginUrl}`;
      const htmlBody = `
        <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height:1.6;">
          <h2>You're invited</h2>
          <p>You have been invited by user <strong>${inviterId}</strong>.</p>
          <p>Click the button below to sign up or log in:</p>
          <p>
            <a href="${loginUrl}"
               style="display:inline-block;background:#111827;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">
              Open Login / Signup
            </a>
          </p>
          <p>If the button doesn't work, copy and paste this URL into your browser:<br/>
            <a href="${loginUrl}">${loginUrl}</a>
          </p>
        </div>
      `;

      await transporter.sendMail({
        from: smtpConfig.from,
        to: email,
        subject,
        text: textBody,
        html: htmlBody,
      });

      res.json({ status: 'sent', email, inviterId, timestamp: new Date().toISOString() });
    } catch (err: any) {
      const message = err?.message || 'Invalid request';
      res.status(400).json({ message });
    }
  });

  // Removed Sentry uptime proxy per request

  app.get('/api/products', (req, res) => {
    const products = [
      {
        id: '1',
        name: 'Starter',
        price: 1900,
        features: ['Up to 1,000 users', '5GB storage', 'Email support', 'Basic analytics', 'API access'],
        maxUsers: 1000,
        storage: '5GB',
        priority: 1
      },
      {
        id: '2',
        name: 'Professional',
        price: 4900,
        features: ['Up to 10,000 users', '50GB storage', 'Priority support', 'Advanced analytics', 'Unlimited API access', 'Custom domains', 'Team collaboration'],
        maxUsers: 10000,
        storage: '50GB',
        priority: 2
      },
      {
        id: '3',
        name: 'Enterprise',
        price: 19900,
        features: ['Unlimited users', '500GB storage', '24/7 phone support', 'Custom analytics', 'Dedicated API', 'White-label options', 'Advanced security', 'SLA guarantee'],
        maxUsers: -1,
        storage: '500GB',
        priority: 3
      }
    ];

    res.json(products);
  });

  // Products are now served from PocketBase

  // Authentication is now handled by PocketBase

  // Subscription creation is now handled by PocketBase custom route

  // Stripe webhook handler
  app.post('/api/webhook', async (req, res) => {
    if (!stripe) {
      return res.status(503).json({ message: "Payment processing is not configured" });
    }

    const sig = req.headers['stripe-signature'] as string;

    try {
      const event = stripe.webhooks.constructEvent(
        req.rawBody as Buffer,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );

      switch (event.type) {
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          // Stripe types can vary across API versions; use a safe accessor
          const subObj: any = event.data.object as any;
          const currentPeriodEndUnix: number | undefined = typeof subObj?.current_period_end === 'number' ? subObj.current_period_end : undefined;

          const dbSubscription = await storage.getSubscriptionByStripeId(String(subObj.id));
          if (dbSubscription) {
            await storage.updateSubscription(dbSubscription.id, {
              status: String(subObj.status || dbSubscription.status),
              currentPeriodEnd: currentPeriodEndUnix ? new Date(currentPeriodEndUnix * 1000) : dbSubscription.currentPeriodEnd,
            });
          }
          break;

        case 'invoice.payment_succeeded':
          {
            const invoiceObj: any = event.data.object as any;
            if (invoiceObj?.subscription && typeof invoiceObj.subscription === 'string') {
              const sub = await storage.getSubscriptionByStripeId(invoiceObj.subscription);
              if (sub) {
                await storage.updateSubscription(sub.id, {
                  status: 'active'
                });
              }
            }
          }
          break;

        case 'invoice.payment_failed':
          {
            const failedInvoiceObj: any = event.data.object as any;
            if (failedInvoiceObj?.subscription && typeof failedInvoiceObj.subscription === 'string') {
              const sub = await storage.getSubscriptionByStripeId(failedInvoiceObj.subscription);
              if (sub) {
                await storage.updateSubscription(sub.id, {
                  status: 'past_due'
                });
              }
            }
          }
          break;
      }

      res.json({ received: true });
    } catch (error: any) {
      console.error('Webhook error:', error);
      res.status(400).json({ message: 'Webhook error: ' + error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
