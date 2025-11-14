# Expense Payment System Setup Guide

## Overview

The payment system allows group members to record partial payments to settle debts. This provides a more realistic way to track who has paid whom, beyond just marking expenses as "settled".

## Features Implemented

✅ **Record Payments**
- Members can record payments they've made to other members
- Specify amount, currency, date, and optional description
- Payments are validated (can't pay yourself, must be positive amount)

✅ **Payment History**
- View all payments made within the group
- See who paid whom, when, and for how much
- Delete payments (creator, leader, or admin)

✅ **Balance Calculation**
- Balances now consider both expenses AND payments
- More accurate representation of who owes what
- Settlement suggestions updated automatically

## Database Migration Required

Before using this feature, you MUST run the migration:

### Step 1: Run Migration SQL

1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase/migrations/add_expense_payments.sql`
4. Click **Run**

This will:
- Create the `expense_payments` table
- Add necessary indexes
- Set up RLS policies
- Add triggers for timestamps

### Step 2: Verify Migration

```sql
-- Check if table was created
SELECT * FROM expense_payments LIMIT 1;

-- Check RLS policies
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename = 'expense_payments';
```

You should see 4 policies:
1. "Members can view group payments"
2. "Members can create payments"
3. "Users can update own payments"
4. "Users and leaders can delete payments"

## How It Works

### 1. Recording a Payment

From the **Balances** page (`/groups/[id]/expenses/balances`):
1. Click **"Record Payment"** button
2. Select who you're paying
3. Enter the amount
4. Select currency (USD, EUR, GBP, JPY, ARS, BRL, MXN)
5. Enter payment date (defaults to today)
6. Optionally add a description
7. Click **"Record Payment"**

### 2. Balance Calculation

The system calculates balances in three steps:

1. **From Expenses**: Calculate who paid what and who owes what
2. **Initial Balance**: `paid - owed` for each member
3. **Apply Payments**: Adjust balances based on recorded payments
   - Payer's balance decreases (they owe less)
   - Receiver's balance increases (they are owed more)

### 3. Payment History

All payments are displayed chronologically with:
- **From** and **To** users with avatars
- **Amount** in green (positive transaction)
- **Description** (if provided)
- **Payment date**
- **Delete button** (if you have permission)

### 4. Permissions

| Action | Who Can Do It |
|--------|---------------|
| View payments | All group members |
| Create payments | Any member (only from themselves) |
| Edit payments | Payment creator or admin |
| Delete payments | Payment creator, group leader, or admin |

## Files Created

### Database & Validation
- `supabase/migrations/add_expense_payments.sql` - Database migration
- `lib/validations/payment.ts` - Zod validation schemas

### Server Actions
- `lib/actions/payment-actions.ts` - CRUD operations for payments
  - `createPayment(data)` - Record a new payment
  - `updatePayment(data)` - Edit a payment
  - `deletePayment(id)` - Delete a payment
  - `getGroupPayments(groupId)` - Get all group payments

### Components
- `components/expenses/record-payment-dialog.tsx` - Modal for recording payments
- `components/expenses/payment-history.tsx` - Display list of payments

### Updated Files
- `lib/utils/expense-calculator.ts` - Updated `calculateBalances()` to accept payments
- `components/expenses/balance-dashboard.tsx` - Now accepts and displays payment-adjusted balances
- `app/groups/[id]/expenses/balances/page.tsx` - Fetches payments and integrates everything

## Usage Example

### Scenario: Trip to Paris

**Expenses:**
- Alice paid €200 for hotel (split equally with Bob and Charlie)
  - Bob owes Alice: €66.67
  - Charlie owes Alice: €66.67

**Payment:**
- Bob pays Alice €30 cash

**Result:**
- Bob now owes Alice: €36.67 (€66.67 - €30)
- Charlie still owes Alice: €66.67
- Balance is tracked accurately!

## API Reference

### Create Payment

```typescript
import { createPayment } from '@/lib/actions/payment-actions'

const result = await createPayment({
  group_id: 'uuid',
  to_user_id: 'uuid',
  amount: 50.00,
  currency: 'USD',
  description: 'Partial payment for dinner',
  payment_date: '2025-01-15'
})
```

### Delete Payment

```typescript
import { deletePayment } from '@/lib/actions/payment-actions'

const result = await deletePayment('payment-uuid')
```

## Testing

1. **Create a test expense** in a group
2. **Go to Balances** page
3. **Record a payment** to another member
4. **Verify balance updated** correctly
5. **Check payment history** displays the payment
6. **Try deleting** the payment

## Security

✅ **RLS Policies Enforce:**
- Users can only create payments from themselves
- Can't pay yourself
- Only group members see group payments
- Only authorized users can delete

✅ **Validation:**
- Amount must be positive
- Both users must be group members
- Currency is required
- Description limited to 500 characters

## Troubleshooting

### Error: "table expense_payments does not exist"
**Solution:** Run the migration SQL from Step 1 above

### Error: "new row violates row-level security policy"
**Solution:** Verify RLS policies were created correctly

### Balances don't update after recording payment
**Solution:**
1. Check browser console for errors
2. Verify the payment was created (check payment history)
3. Try refreshing the page

### Can't delete a payment
**Solution:**
- Only payment creator, group leader, or admin can delete
- Check your role in the group

## Future Enhancements

Potential improvements for later:
- [ ] Payment notifications
- [ ] Bulk payment creation
- [ ] Payment attachments (receipts)
- [ ] Export payment history to CSV
- [ ] Payment reminders
- [ ] Currency conversion
- [ ] Payment verification/approval flow

## Database Schema

```sql
expense_payments:
  - id (UUID, PK)
  - group_id (UUID, FK to travel_groups)
  - from_user_id (UUID, FK to users)
  - to_user_id (UUID, FK to users)
  - amount (DECIMAL(10,2))
  - currency (TEXT)
  - description (TEXT, nullable)
  - payment_date (DATE)
  - created_by (UUID, FK to users)
  - created_at (TIMESTAMP)
  - updated_at (TIMESTAMP)

Constraints:
  - from_user_id != to_user_id
  - amount > 0
```

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify the migration was run successfully
3. Check Supabase logs in Dashboard → Database → Logs
4. Ensure you're authenticated and a member of the group
