# Shared Data Schema

Defined in `shared/schema.ts` using Drizzle ORM and Zod.

## Tables
- **users**
  - `id` (uuid, pk)
  - `username` (text, unique)
  - `email` (text, unique)
  - `password` (text)
  - `name` (text)
  - `stripeCustomerId?` (text)
  - `stripeSubscriptionId?` (text)
  - `createdAt` (timestamp)

- **subscriptions**
  - `id` (uuid, pk)
  - `userId` (fk -> users.id)
  - `plan` (text)
  - `stripeSubscriptionId` (text, unique)
  - `status` (text)
  - `currentPeriodEnd` (timestamp)
  - `amount` (integer)
  - `trialEnd?` (timestamp)
  - `createdAt` (timestamp)
  - `updatedAt` (timestamp)

- **products**
  - `id` (uuid, pk)
  - `name` (text)
  - `price` (integer, cents)
  - `stripePriceId` (text, unique)
  - `features` (json array)
  - `maxUsers?` (integer)
  - `storage?` (text)
  - `priority` (integer, default 0)

## Insert Schemas
- `insertUserSchema`: validates user creation; enforces password length, email format, and non-empty name.
- `insertSubscriptionSchema`: validates subscription creation.
- `insertProductSchema`: validates product creation.

## Types
- `User`, `InsertUser`, `Subscription`, `InsertSubscription`, `Product`, `InsertProduct`.

## Example Usage
```ts
import { insertUserSchema, type InsertUser, products, type Product } from '@shared/schema'

// Validate before insert
const newUser: InsertUser = insertUserSchema.parse({
  email: 'jane@example.com',
  username: 'jane',
  password: 'password123',
  name: 'Jane Doe',
})

// Query example (Drizzle)
// db.insert(users).values(newUser)

// Product typing
function formatPrice(product: Product) {
  return `$${(product.price / 100).toFixed(2)}`
}
```
