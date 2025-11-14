-- ============================================
-- UPDATE RLS POLICIES - Run this in Supabase SQL Editor
-- ============================================

-- 1. Drop old policies that need to be updated
DROP POLICY IF EXISTS "Admins can create groups" ON public.travel_groups;
DROP POLICY IF EXISTS "Members can view group notes" ON public.group_notes;
DROP POLICY IF EXISTS "Members can update group notes" ON public.group_notes;

-- 2. Create/Replace the updated policies

-- ============================================
-- TRAVEL GROUPS - Allow any authenticated user to create groups
-- ============================================
CREATE POLICY "Authenticated users can create groups"
  ON public.travel_groups FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- GROUP NOTES - Add missing INSERT and DELETE policies
-- ============================================

-- Members can view group notes
CREATE POLICY "Members can view group notes"
  ON public.group_notes FOR SELECT
  USING (
    is_admin(auth.uid()) OR
    is_group_member(auth.uid(), group_id)
  );

-- Members can create group notes (NEW - was missing)
CREATE POLICY "Members can create group notes"
  ON public.group_notes FOR INSERT
  WITH CHECK (
    is_admin(auth.uid()) OR
    is_group_member(auth.uid(), group_id)
  );

-- Members can update group notes
CREATE POLICY "Members can update group notes"
  ON public.group_notes FOR UPDATE
  USING (
    is_admin(auth.uid()) OR
    is_group_member(auth.uid(), group_id)
  );

-- Leaders and admins can delete group notes (NEW - was missing)
CREATE POLICY "Leaders can delete group notes"
  ON public.group_notes FOR DELETE
  USING (
    is_admin(auth.uid()) OR
    is_group_leader(auth.uid(), group_id)
  );

-- ============================================
-- USERS - Allow authenticated users to insert their own profile
-- ============================================
-- This policy allows the app to auto-create user profiles
CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);
