## Server APIs

Base URL: `/`

The Express server provides a minimal set of API endpoints. Stripe-related features are available only if `STRIPE_SECRET_KEY` is configured.

### Health
- Method: GET
- Path: `/api/health`
- Response: 200 JSON
```json
{ "status": "healthy", "timestamp": "2025-01-01T12:00:00.000Z" }
```

### Products (fallback)
Returns a static list of products when PocketBase is not providing products.
- Method: GET
- Path: `/api/products`
- Response: 200 JSON (array of products)
```json
[
  {
    "id": "1",
    "name": "Starter",
    "price": 1900,
    "features": ["Up to 1,000 users", "5GB storage", "Email support", "Basic analytics", "API access"],
    "maxUsers": 1000,
    "storage": "5GB",
    "priority": 1
  }
]
```

### Stripe Webhook
- Method: POST
- Path: `/api/webhook`
- Headers: `stripe-signature: <signature>`
- Body: Raw JSON payload sent by Stripe (the server reads the raw body for signature verification)
- Response: 200 JSON `{ "received": true }` or 4xx with `{ "message": string }`
- Behavior: Updates subscription status in storage for the following events:
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`

Example (local testing with Stripe CLI):
```bash
stripe listen --forward-to localhost:8080/api/webhook
```

### Error format
Errors are returned as:
```json
{ "message": "Human-readable description" }
```

### Environment variables
- `PORT`: Server port (default 8080)
- `STRIPE_SECRET_KEY`: Enables Stripe features
- `STRIPE_WEBHOOK_SECRET`: Required to verify webhook signatures

### Development
- Health and products routes are available in all environments.
- Vite middleware is mounted only in development mode for client serving.
