# PocketBase Setup Guide

This document outlines the PocketBase collections and configuration needed for the LUD-SaaS application.

## PocketBase URL
- **Production**: `https://pb.levelingupdata.com`
- **Admin Panel**: `https://pb.levelingupdata.com/_/`
- **Main Application**: `https://starfish.levelingupdata.com`

## Required Collections

### 1. Users Collection
**Collection Name**: `users`
**Type**: Auth collection

**Fields**:
- `email` (email, required, unique)
- `username` (text, required, unique)
- `name` (text, required)
- `password` (text, required, min: 8)
- `passwordConfirm` (text, required, min: 8)
- `stripeCustomerId` (text, optional)
- `stripeSubscriptionId` (text, optional)

**Settings**:
- Enable email verification: No
- Enable password reset: Yes
- Allow username auth: Yes
- Allow email auth: Yes

### 2. Subscriptions Collection
**Collection Name**: `subscriptions`

**Fields**:
- `userId` (relation to users, required)
- `plan` (text, required) - e.g., "starter", "professional", "enterprise"
- `stripeSubscriptionId` (text, required, unique)
- `status` (text, required) - e.g., "active", "trialing", "past_due", "canceled"
- `currentPeriodEnd` (date, required)
- `amount` (number, required) - amount in cents
- `trialEnd` (date, optional)

**Settings**:
- List rule: `userId = @request.auth.id`
- View rule: `userId = @request.auth.id`
- Create rule: `userId = @request.auth.id`
- Update rule: `userId = @request.auth.id`
- Delete rule: `userId = @request.auth.id`

### 3. Products Collection
**Collection Name**: `products`

**Fields**:
- `name` (text, required) - e.g., "Starter", "Professional", "Enterprise"
- `price` (number, required) - price in cents
- `stripePriceId` (text, required, unique) - Stripe price ID
- `features` (json, required) - array of feature strings
- `maxUsers` (number, optional) - -1 for unlimited
- `storage` (text, optional) - e.g., "5GB", "50GB", "500GB"
- `priority` (number, required) - for sorting (1, 2, 3)

**Settings**:
- List rule: `@request.auth.id != ""` (authenticated users only)
- View rule: `@request.auth.id != ""`
- Create rule: Admin only
- Update rule: Admin only
- Delete rule: Admin only

### 4. Invitations Collection
**Collection Name**: `invitations`

**Fields**:
- `email` (email, required, unique)
- `inviterId` (text, required) - stores the user ID who sent the invite
- `status` (text, required) - e.g., "pending", "accepted", "expired"
- `token` (text, required, unique) - for the invite link
- `expiresAt` (date, required) - when the invite expires
- `acceptedAt` (date, optional) - when the invite was accepted

**Settings**:
- List rule: `inviterId = @request.auth.id`
- View rule: `inviterId = @request.auth.id OR email = @request.data.email`
- Create rule: `inviterId = @request.auth.id`
- Update rule: `inviterId = @request.auth.id`
- Delete rule: `inviterId = @request.auth.id`

## Seed Data

### Products to Create:
1. **Starter**
   - name: "Starter"
   - price: 1900
   - stripePriceId: (your Stripe price ID)
   - features: ["Up to 1,000 users", "5GB storage", "Email support", "Basic analytics", "API access"]
   - maxUsers: 1000
   - storage: "5GB"
   - priority: 1

2. **Professional**
   - name: "Professional"
   - price: 4900
   - stripePriceId: (your Stripe price ID)
   - features: ["Up to 10,000 users", "50GB storage", "Priority support", "Advanced analytics", "Unlimited API access", "Custom domains", "Team collaboration"]
   - maxUsers: 10000
   - storage: "50GB"
   - priority: 2

3. **Enterprise**
   - name: "Enterprise"
   - price: 19900
   - stripePriceId: (your Stripe price ID)
   - features: ["Unlimited users", "500GB storage", "24/7 phone support", "Custom analytics", "Dedicated API", "White-label options", "Advanced security", "SLA guarantee"]
   - maxUsers: -1
   - storage: "500GB"
   - priority: 3

## Custom Routes

### 1. Subscription Creation Route
**Path**: `/api/create-subscription`
**Method**: POST
**Description**: Creates a Stripe subscription and PocketBase subscription record

**Request Body**:
```json
{
  "userId": "user_id",
  "stripePriceId": "price_xxx"
}
```

**Response**:
```json
{
  "subscriptionId": "sub_xxx",
  "clientSecret": "pi_xxx_secret_xxx",
  "status": "incomplete"
}
```

**Implementation**: Use the provided `pocketbase-hooks/create-subscription.js` file

### 2. Stripe Webhook Route
**Path**: `/api/webhook`
**Method**: POST
**Description**: Handles Stripe webhook events

**Events Handled**:
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

**Implementation**: Use the provided `pocketbase-hooks/stripe-webhook.js` file

## Environment Variables

Set these in PocketBase admin under Settings > Environment Variables:

- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Your Stripe webhook secret
- `STRIPE_STARTER_PRICE_ID` - Stripe price ID for starter plan
- `STRIPE_PROFESSIONAL_PRICE_ID` - Stripe price ID for professional plan
- `STRIPE_ENTERPRISE_PRICE_ID` - Stripe price ID for enterprise plan

## Setup Steps

1. **Create Collections**: Use the PocketBase admin panel to create the three collections with the specified fields and rules.

2. **Seed Products**: Add the three product records with your actual Stripe price IDs.

3. **Install Custom Routes**: 
   - Copy `pocketbase-hooks/create-subscription.js` to your PocketBase hooks directory
   - Copy `pocketbase-hooks/stripe-webhook.js` to your PocketBase hooks directory
   - Restart PocketBase to load the new hooks

4. **Set Environment Variables**: Add your Stripe configuration to PocketBase environment variables.

5. **Configure Stripe Webhooks**: Point your Stripe webhook URL to `https://pb.levelingupdata.com/api/webhook`

6. **Update Application URL**: The main application is deployed at `https://starfish.levelingupdata.com`

7. **Test**: Verify that user registration, login, product fetching, and subscription creation work correctly.
