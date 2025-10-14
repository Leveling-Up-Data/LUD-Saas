# Server API

Base URL: `/api`

## Health
- **GET** `/api/health`
  - Returns server health and timestamp.
  - Response:
    ```json
    { "status": "healthy", "timestamp": "2025-01-01T00:00:00.000Z" }
    ```

## Products
- **GET** `/api/products`
  - Returns the list of pricing products. In production, products are managed via PocketBase; the server provides a fallback list.
  - Response (example):
    ```json
    [
      { "id": "1", "name": "Starter", "price": 1900, "features": ["Up to 1,000 users", "5GB storage", "Email support", "Basic analytics", "API access"], "maxUsers": 1000, "storage": "5GB", "priority": 1 },
      { "id": "2", "name": "Professional", "price": 4900, "features": ["Up to 10,000 users", "50GB storage", "Priority support", "Advanced analytics", "Unlimited API access", "Custom domains", "Team collaboration"], "maxUsers": 10000, "storage": "50GB", "priority": 2 }
    ]
    ```

## Stripe Webhook
- **POST** `/api/webhook`
  - Expects Stripe webhook signature header `stripe-signature`.
  - Handles events:
    - `customer.subscription.updated`
    - `customer.subscription.deleted`
    - `invoice.payment_succeeded`
    - `invoice.payment_failed`
  - Behavior: Updates in-memory storage or PocketBase subscription status accordingly.
  - Response:
    ```json
    { "received": true }
    ```

### Error Responses
- `503` when Stripe is not configured for webhook route.
- `400` on invalid webhook signature or payload.

## Middleware Behavior
- JSON body parser with raw body capture for Stripe signature verification.
- Request logging for `/api/*` paths with truncated response payload.

## Example Usage
```bash
# Health
curl -s http://localhost:8080/api/health

# Products
curl -s http://localhost:8080/api/products

# Webhook (example using a Stripe CLI fixture)
stripe trigger invoice.payment_succeeded --webhook-endpoint http://localhost:8080/api/webhook
```
