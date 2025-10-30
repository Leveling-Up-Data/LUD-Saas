# Trial Usage Collection Setup

The `trial_usage` collection is now used for all plans (Free Trial, Starter, and Pro).

## Collection Structure

**Collection Name**: `trial_usage`

### Fields:

| Field Name | Type | Settings | Description |
|------------|------|----------|-------------|
| `user_id` | Relation | Required | Relation to `users` collection - the user who has this plan |
| `name` | Text | Required | Plan name: "Free Trial", "Starter", or "Pro" |
| `total_request_count` | Number | Optional, Default: 0 | Current number of requests used |
| `total_request_limit` | Number | Required | Maximum number of requests allowed (50 for Free Trial, 1000 for Starter, 10000 for Pro) |
| `trial_start_date` | Date | Required | Plan start date |
| `trial_end_date` | Date | Required | Plan end date |
| `stripeSubscriptionId` | Text | Optional | Stripe Subscription ID (for paid plans) |

### Access Rules:

- **List rule**: `user_id = @request.auth.id` (users can only see their own records)
- **View rule**: `user_id = @request.auth.id` (users can only view their own records)
- **Create rule**: `user_id = @request.auth.id` (users can create their own records)
- **Update rule**: `user_id = @request.auth.id` (users can update their own records)
- **Delete rule**: `user_id = @request.auth.id OR @request.auth.id != ""` (users can delete their own records, or admin)

## Sample Records

### Free Trial
```json
{
  "user_id": "USER_ID_HERE",
  "name": "Free Trial",
  "total_request_count": 0,
  "total_request_limit": 50,
  "trial_start_date": "2024-01-01T00:00:00.000Z",
  "trial_end_date": "2024-01-03T00:00:00.000Z"
}
```

### Starter Plan
```json
{
  "user_id": "USER_ID_HERE",
  "name": "Starter",
  "total_request_count": 0,
  "total_request_limit": 1000,
  "trial_start_date": "2024-01-01T00:00:00.000Z",
  "trial_end_date": "2024-01-31T00:00:00.000Z",
  "stripeSubscriptionId": "sub_xxxxxxxxxxxxx"
}
```

### Pro Plan
```json
{
  "user_id": "USER_ID_HERE",
  "name": "Pro",
  "total_request_count": 0,
  "total_request_limit": 10000,
  "trial_start_date": "2024-01-01T00:00:00.000Z",
  "trial_end_date": "2024-01-31T00:00:00.000Z",
  "stripeSubscriptionId": "sub_xxxxxxxxxxxxx"
}
```

## Setup Instructions

1. **Add `name` field to existing `trial_usage` collection**:
   - Go to PocketBase Admin: `https://pb.levelingupdata.com/_/`
   - Navigate to Collections → `trial_usage`
   - Click "Add new field"
   - Field name: `name`
   - Type: Text
   - Required: Yes
   - Save

2. **Optional: Add `stripeSubscriptionId` field**:
   - Field name: `stripeSubscriptionId`
   - Type: Text
   - Required: No
   - Save

3. **Update existing records** (if any):
   - For existing Free Trial records, set `name` to "Free Trial"
   - For paid plan records, set `name` to "Starter" or "Pro" based on the plan

## Request Limits by Plan

- **Free Trial**: 50 requests, 2 days
- **Starter**: 1,000 requests, 30 days (monthly billing)
- **Pro**: 10,000 requests, 30 days (monthly billing)

## Notes

- The `name` field is now **required** to distinguish between different plan types
- All plans use the same collection structure
- The PocketBase hook (`trial-usage-defaults.js`) automatically sets limits and dates based on the plan name
- When a user successfully pays for Starter or Pro, a `trial_usage` record is created with the appropriate plan name and limits

