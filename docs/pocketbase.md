## PocketBase Hooks and Routes

These server-side JavaScript hooks run inside PocketBase and expose custom routes used by the app.

### Create Subscription
Location: `pocketbase-hooks/create-subscription.js`

- Method: POST
- Path: `/api/create-subscription`
- Body JSON:
  - `userId: string`
  - `stripePriceId: string`
- Behavior:
  - Ensures Stripe customer exists for the user (creates if missing)
  - Creates a Stripe subscription with a 14-day trial
  - Updates the user with `stripeSubscriptionId`
  - Creates a `subscriptions` record in PocketBase
- Response 200 JSON:
```json
{
  "subscriptionId": "sub_...",
  "clientSecret": "pi_..._secret_...",
  "status": "trialing"
}
```
- Errors: 4xx/5xx with `{ error: string }`

### Stripe Webhook (PocketBase)
Location: `pocketbase-hooks/stripe-webhook.js`

- Method: POST
- Path: `/api/webhook`
- Headers: `stripe-signature`
- Verifies the Stripe webhook signature and updates PocketBase records:
  - `customer.subscription.updated` / `deleted` → update subscription status and `currentPeriodEnd`
  - `invoice.payment_succeeded` → set status `active`
  - `invoice.payment_failed` → set status `past_due`
- Response: `{ "received": true }` or `{ "error": string }`

### Environment variables in PocketBase
Set the following in the PocketBase environment where the hooks run:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

### Example: creating a subscription from client
```ts
const res = await fetch("/api/create-subscription", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ userId, stripePriceId }),
});
const json = await res.json();
// Confirm payment with Stripe using json.clientSecret if needed
```