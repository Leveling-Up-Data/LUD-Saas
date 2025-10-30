# Code Updates Summary

## Changes Made

### 1. Removed Separate Collections
- ❌ Deleted `POCKETBASE_PLANS_SETUP.md` (no longer needed)
- ✅ Removed all references to `starter_plans` and `pro_plans` collections
- ✅ Updated all code to use `trial_usage` collection for all plans

### 2. Updated `trial_usage` Collection Usage
- ✅ Added `name` field support to store plan name ("Free Trial", "Starter", "Pro")
- ✅ Updated code to create/update `trial_usage` records with plan name
- ✅ Updated dashboard to read and display plan name from `trial_usage`

### 3. Files Updated

#### `client/src/pages/pricing.tsx`
- Removed fetching from `starter_plans` and `pro_plans` collections
- Now only fetches from `products` collection
- Updated `startFreeTrial()` to include `name: 'Free Trial'` field

#### `client/src/pages/checkout.tsx`
- Removed references to separate plan collections
- Updated payment success redirect to include plan name parameter
- Simplified product fetching to only use `products` collection

#### `client/src/pages/dashboard.tsx`
- Removed references to separate plan collections
- Updated to read `name` field from `trial_usage` records
- Added logic to create/update `trial_usage` record when payment succeeds
- Updated display to show plan name from `trial_usage` when no subscription exists

#### `pocketbase-hooks/trial-usage-defaults.js`
- Updated to handle `name` field
- Sets request limits based on plan name:
  - Free Trial: 50 requests
  - Starter: 1,000 requests
  - Pro: 10,000 requests
- Sets end dates based on plan (2 days for Free Trial, 30 days for paid plans)

### 4. Created New Files

#### `TRIAL_USAGE_SETUP.md`
- Documentation for the updated `trial_usage` collection structure
- Includes field descriptions, sample records, and setup instructions

## Collection Structure

### `trial_usage` Collection Fields:
- `user_id` (Relation) - Links to users collection
- `name` (Text, Required) - Plan name: "Free Trial", "Starter", or "Pro"
- `total_request_count` (Number) - Current requests used
- `total_request_limit` (Number) - Max requests (50/1000/10000 based on plan)
- `trial_start_date` (Date) - Plan start date
- `trial_end_date` (Date) - Plan end date
- `stripeSubscriptionId` (Text, Optional) - For paid plans

## Next Steps

1. **Update PocketBase Collection**:
   - Add `name` field to `trial_usage` collection (Text, Required)
   - Optionally add `stripeSubscriptionId` field (Text, Optional)

2. **Update Existing Records**:
   - Set `name` to "Free Trial" for existing trial records
   - Update any paid plan records with appropriate plan names

3. **Test**:
   - Test Free Trial creation
   - Test payment flow (Starter/Pro)
   - Verify `trial_usage` records are created with correct plan names
   - Check dashboard displays plan name correctly

