-- ============================================
-- MIGRATION: Add expense payments system
-- Allows users to record partial payments between members
-- ============================================

-- Create expense_payments table
CREATE TABLE IF NOT EXISTS public.expense_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES public.travel_groups(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  description TEXT,
  payment_date DATE DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Validation: can't pay yourself
  CONSTRAINT different_users CHECK (from_user_id != to_user_id),
  -- Validation: amount must be positive
  CONSTRAINT positive_amount CHECK (amount > 0)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_expense_payments_group_id ON public.expense_payments(group_id);
CREATE INDEX IF NOT EXISTS idx_expense_payments_from_user ON public.expense_payments(from_user_id);
CREATE INDEX IF NOT EXISTS idx_expense_payments_to_user ON public.expense_payments(to_user_id);
CREATE INDEX IF NOT EXISTS idx_expense_payments_date ON public.expense_payments(payment_date);

-- Add trigger for updated_at
CREATE TRIGGER update_expense_payments_updated_at
BEFORE UPDATE ON public.expense_payments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE public.expense_payments ENABLE ROW LEVEL SECURITY;

-- Group members can view payments in their group
DROP POLICY IF EXISTS "Members can view group payments" ON public.expense_payments;
CREATE POLICY "Members can view group payments"
  ON public.expense_payments FOR SELECT
  USING (
    is_admin(auth.uid()) OR
    is_group_member(auth.uid(), group_id)
  );

-- Group members can create payments
DROP POLICY IF EXISTS "Members can create payments" ON public.expense_payments;
CREATE POLICY "Members can create payments"
  ON public.expense_payments FOR INSERT
  WITH CHECK (
    (is_admin(auth.uid()) OR is_group_member(auth.uid(), group_id))
    AND from_user_id = auth.uid()  -- Can only create payments from yourself
  );

-- Users can update their own payments
DROP POLICY IF EXISTS "Users can update own payments" ON public.expense_payments;
CREATE POLICY "Users can update own payments"
  ON public.expense_payments FOR UPDATE
  USING (
    is_admin(auth.uid()) OR
    created_by = auth.uid()
  );

-- Users can delete their own payments, leaders and admins can delete any
DROP POLICY IF EXISTS "Users and leaders can delete payments" ON public.expense_payments;
CREATE POLICY "Users and leaders can delete payments"
  ON public.expense_payments FOR DELETE
  USING (
    is_admin(auth.uid()) OR
    is_group_leader(auth.uid(), group_id) OR
    created_by = auth.uid()
  );

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE public.expense_payments IS 'Records payments between group members to settle debts';
COMMENT ON COLUMN public.expense_payments.from_user_id IS 'User who is making the payment';
COMMENT ON COLUMN public.expense_payments.to_user_id IS 'User who is receiving the payment';
COMMENT ON COLUMN public.expense_payments.amount IS 'Amount paid';
COMMENT ON COLUMN public.expense_payments.description IS 'Optional note about the payment';
