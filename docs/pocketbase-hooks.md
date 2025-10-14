# PocketBase Hooks & Routes

This project delegates auth, products, and subscriptions to PocketBase with custom routes.

## Routes
- `POST /api/create-subscription`
  - Body: `{ userId: string, stripePriceId: string }`
  - Creates Stripe subscription, saves customer/subscription IDs to user, and creates a `subscriptions` record.
  - Response: `{ subscriptionId, clientSecret?, status }`

- `POST /api/webhook`
  - Validates Stripe signature and handles:
    - `customer.subscription.updated` / `deleted`
    - `invoice.payment_succeeded` / `failed`
  - Updates `subscriptions` status in PocketBase.

## Setup
- Copy `pocketbase-hooks/create-subscription.js` and `pocketbase-hooks/stripe-webhook.js` into your PocketBase hooks directory.
- Set environment variables in PocketBase:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `STRIPE_STARTER_PRICE_ID`, `STRIPE_PROFESSIONAL_PRICE_ID`, `STRIPE_ENTERPRISE_PRICE_ID`
- Configure Stripe to send webhooks to your PocketBase: `https://pb.levelingupdata.com/api/webhook`.

## Example: Create Subscription
```bash
curl -X POST https://pb.levelingupdata.com/api/create-subscription \
  -H 'Content-Type: application/json' \
  -d '{"userId":"USER_ID","stripePriceId":"price_123"}'
```

## Client Integration
```ts
import { pb } from '@/lib/pocketbase'

async function createSubscription(stripePriceId: string) {
  const res = await fetch(`${pb.baseUrl}/api/create-subscription`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: pb.authStore.model?.id, stripePriceId }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
```

See `POCKETBASE_SETUP.md` for full collection definitions and step-by-step setup.
