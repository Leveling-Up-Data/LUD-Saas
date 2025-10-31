# Stripe Webhook Test Server Setup

This Python webhook server receives and logs all Stripe events for testing and integration purposes.

## Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Set Environment Variables

Set your Stripe credentials:

**Windows (Command Prompt):**
```cmd
set STRIPE_SECRET_KEY=sk_test_your_secret_key_here
set STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

**Windows (PowerShell):**
```powershell
$env:STRIPE_SECRET_KEY="sk_test_your_secret_key_here"
$env:STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret_here"
```

**Linux/Mac:**
```bash
export STRIPE_SECRET_KEY=sk_test_your_secret_key_here
export STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

Or create a `.env` file (if using python-dotenv):
```
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 3. Run the Server

```bash
python main.py
```

The server will start on `http://localhost:5000`

## Testing Locally with Stripe

Since Stripe needs to send webhooks to a public URL, you'll need to expose your local server:

### Option 1: Using ngrok (Recommended)

1. **Install ngrok**: Download from https://ngrok.com/download

2. **Start the webhook server**:
   ```bash
   python main.py
   ```

3. **In another terminal, start ngrok**:
   ```bash
   ngrok http 5000
   ```

4. **Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`)

5. **Configure Stripe Webhook**:
   - Go to https://dashboard.stripe.com/test/webhooks
   - Click "Add endpoint"
   - Enter URL: `https://abc123.ngrok.io/webhook`
   - Select events: Choose "Send all events" or select specific events
   - Click "Add endpoint"

6. **Copy the webhook signing secret**:
   - After creating the endpoint, click on it
   - Copy the "Signing secret" (starts with `whsec_`)
   - Set it as `STRIPE_WEBHOOK_SECRET` environment variable
   - Restart the webhook server

### Option 2: Using Stripe CLI

1. **Install Stripe CLI**: https://stripe.com/docs/stripe-cli

2. **Login to Stripe**:
   ```bash
   stripe login
   ```

3. **Forward webhooks to local server**:
   ```bash
   stripe listen --forward-to localhost:5000/webhook
   ```

4. **The CLI will show you the webhook secret** - copy it and set as `STRIPE_WEBHOOK_SECRET`

## Endpoints

- **POST /webhook** - Main Stripe webhook endpoint
- **GET /events** - List all received events (last 50)
- **GET /health** - Health check endpoint
- **GET /** - API information and setup instructions

## Event Handlers

The server currently includes handlers for:

- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `customer.created`
- `customer.updated`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

You can add more handlers by editing `main.py` and adding new handler functions.

## Testing Events

To test that webhooks are working:

1. **Trigger a test event from Stripe Dashboard**:
   - Go to https://dashboard.stripe.com/test/webhooks
   - Click on your webhook endpoint
   - Click "Send test webhook"
   - Select an event type (e.g., "customer.subscription.created")
   - Click "Send test webhook"

2. **Or trigger real events**:
   - Create a test subscription in your app
   - Create a test payment
   - Update a customer
   - etc.

## Viewing Events

All events are logged to the console with full details. You can also:

- **View in console**: Events are printed with formatting
- **View via API**: GET `/events` to see JSON list of all received events
- **Check health**: GET `/health` to see server status and event count

## Integration

Once you've tested and understand the event structure, you can:

1. **Modify event handlers** in `main.py` to integrate with your database/backend
2. **Add new event types** as needed
3. **Store events** in a database instead of in-memory
4. **Add authentication** if exposing the `/events` endpoint publicly

## Security Notes

- ⚠️ **Always verify webhook signatures in production** using `STRIPE_WEBHOOK_SECRET`
- The webhook endpoint should be publicly accessible for Stripe to send events
- Consider adding rate limiting for production use
- Don't expose sensitive data in logs or the `/events` endpoint

## Next Steps

After testing:

1. Identify which events you need for your integration
2. Implement handlers that update your database/backend
3. Deploy the webhook server to your production environment
4. Configure the production webhook URL in Stripe Dashboard

