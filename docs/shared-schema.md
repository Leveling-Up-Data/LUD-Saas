## Shared Schema and Types

These types are defined in `shared/schema.ts` and shared across server and client.

### Tables
- `users`
  - `id: string` (pk)
  - `username: string` (unique)
  - `email: string` (unique)
  - `password: string`
  - `name: string`
  - `stripeCustomerId?: string | null`
  - `stripeSubscriptionId?: string | null`
  - `createdAt?: Date | null`

- `subscriptions`
  - `id: string` (pk)
  - `userId: string` (fk users.id)
  - `plan: string` (e.g. "starter", "professional", "enterprise")
  - `stripeSubscriptionId: string` (unique)
  - `status: string` (e.g. "active", "cancelled", "past_due", "trialing")
  - `currentPeriodEnd: Date`
  - `amount: number` (cents)
  - `trialEnd?: Date | null`
  - `createdAt?: Date | null`
  - `updatedAt?: Date | null`

- `products`
  - `id: string` (pk)
  - `name: string`
  - `price: number` (cents)
  - `stripePriceId: string` (unique)
  - `features: string[]`
  - `maxUsers?: number | null`
  - `storage?: string | null`
  - `priority?: number | null`

### Insert schemas (zod)
- `insertUserSchema`
  - Extends users insert with validations:
    - `password: string` min 8
    - `email: string` valid email
    - `name: string` min 1
- `insertSubscriptionSchema`
- `insertProductSchema`

### Exported Types
- `User`, `InsertUser`
- `Subscription`, `InsertSubscription`
- `Product`, `InsertProduct`

### Example: validating a user payload
```ts
import { insertUserSchema } from "@shared/schema";

const parsed = insertUserSchema.parse({
  username: "alice",
  email: "alice@example.com",
  password: "hunter2hunter2",
  name: "Alice",
});
```
