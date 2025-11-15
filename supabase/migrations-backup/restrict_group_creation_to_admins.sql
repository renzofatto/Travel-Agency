-- ============================================
-- MIGRATION: Restrict Group Creation to Admins Only
-- Date: 2025-11-15
-- Description: Only administrators can create groups.
--              Admins create groups and add a user as leader.
-- ============================================

-- Drop the old policy that allows any authenticated user to create groups
DROP POLICY IF EXISTS "Authenticated users can create groups" ON public.travel_groups;

-- Create new policy: Only admins can create groups
CREATE POLICY "Only admins can create groups"
  ON public.travel_groups FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

-- The rest of the policies remain the same:
-- - Admins and leaders can update groups
-- - Only admins can delete groups
-- - Users can view groups they are members of
