# PocketBase Hooks for LUD-SaaS

This directory contains the custom hooks needed for the LUD-SaaS application to work with PocketBase.

## Files

- `create-subscription.js` - Handles subscription creation with Stripe integration
- `stripe-webhook.js` - Handles Stripe webhook events for subscription updates

## Installation

1. **Copy the hook files** to your PocketBase hooks directory:
   ```bash
   # On your PocketBase server
   cp create-subscription.js /path/to/pocketbase/hooks/
   cp stripe-webhook.js /path/to/pocketbase/hooks/
   ```

2. **Install Stripe dependency** in your PocketBase environment:
   ```bash
   # In your PocketBase directory
   npm install stripe
   ```

3. **Set environment variables** in PocketBase admin:
   - `STRIPE_SECRET_KEY` - Your Stripe secret key
   - `STRIPE_WEBHOOK_SECRET` - Your Stripe webhook secret
   - `STRIPE_STARTER_PRICE_ID` - Stripe price ID for starter plan
   - `STRIPE_PROFESSIONAL_PRICE_ID` - Stripe price ID for professional plan
   - `STRIPE_ENTERPRISE_PRICE_ID` - Stripe price ID for enterprise plan

4. **Restart PocketBase** to load the new hooks:
   ```bash
   ./pocketbase serve
   ```

## What These Hooks Do

### create-subscription.js
- Creates a POST endpoint at `/api/create-subscription`
- Handles subscription creation with Stripe
- Creates Stripe customer if needed
- Creates subscription with 14-day trial
- Updates PocketBase user and subscriptions collections
- Returns client secret for Stripe payment confirmation

### stripe-webhook.js
- Creates a POST endpoint at `/api/webhook`
- Handles Stripe webhook events
- Updates subscription status in PocketBase
- Handles payment success/failure events
- Verifies webhook signatures for security

## Testing

After installation, you can test the endpoints:

1. **Test subscription creation**:
   ```bash
   curl -X POST https://pb.levelingupdata.com/api/create-subscription \
     -H "Content-Type: application/json" \
     -d '{"userId": "user_id", "stripePriceId": "price_xxx"}'
   ```

2. **Test webhook** (from Stripe dashboard):
   - Configure webhook URL: `https://pb.levelingupdata.com/api/webhook`
   - Select events: `customer.subscription.*`, `invoice.payment_*`

## Troubleshooting

- **Check PocketBase logs** for any errors
- **Verify environment variables** are set correctly
- **Ensure Stripe keys** are valid and have proper permissions
- **Check webhook signature** verification is working
