-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itinerary_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_notes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT role = 'admin' FROM public.users WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Check if user is member of group
CREATE OR REPLACE FUNCTION is_group_member(user_id UUID, group_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_members.user_id = $1 AND group_members.group_id = $2
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Check if user is leader of group
CREATE OR REPLACE FUNCTION is_group_leader(user_id UUID, group_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_members.user_id = $1
    AND group_members.group_id = $2
    AND group_members.role = 'leader'
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Users can view all users
CREATE POLICY "Users can view all users"
  ON public.users FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Admins can do anything
CREATE POLICY "Admins can do everything on users"
  ON public.users FOR ALL
  USING (is_admin(auth.uid()));

-- ============================================
-- TRAVEL GROUPS TABLE POLICIES
-- ============================================

-- Users can view groups they are members of
CREATE POLICY "Users can view their groups"
  ON public.travel_groups FOR SELECT
  USING (
    is_admin(auth.uid()) OR
    is_group_member(auth.uid(), id)
  );

-- Any authenticated user can create groups
CREATE POLICY "Authenticated users can create groups"
  ON public.travel_groups FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Admins and group leaders can update groups
CREATE POLICY "Admins and leaders can update groups"
  ON public.travel_groups FOR UPDATE
  USING (
    is_admin(auth.uid()) OR
    is_group_leader(auth.uid(), id)
  );

-- Only admins can delete groups
CREATE POLICY "Admins can delete groups"
  ON public.travel_groups FOR DELETE
  USING (is_admin(auth.uid()));

-- ============================================
-- GROUP MEMBERS TABLE POLICIES
-- ============================================

-- Users can view members of their groups
CREATE POLICY "Users can view members of their groups"
  ON public.group_members FOR SELECT
  USING (
    is_admin(auth.uid()) OR
    is_group_member(auth.uid(), group_id)
  );

-- Admins and leaders can add members
CREATE POLICY "Admins and leaders can add members"
  ON public.group_members FOR INSERT
  WITH CHECK (
    is_admin(auth.uid()) OR
    is_group_leader(auth.uid(), group_id)
  );

-- Admins and leaders can update member roles
CREATE POLICY "Admins and leaders can update members"
  ON public.group_members FOR UPDATE
  USING (
    is_admin(auth.uid()) OR
    is_group_leader(auth.uid(), group_id)
  );

-- Admins and leaders can remove members
CREATE POLICY "Admins and leaders can remove members"
  ON public.group_members FOR DELETE
  USING (
    is_admin(auth.uid()) OR
    is_group_leader(auth.uid(), group_id)
  );

-- ============================================
-- ITINERARY ITEMS TABLE POLICIES
-- ============================================

-- Members can view itinerary items of their groups
CREATE POLICY "Members can view group itinerary"
  ON public.itinerary_items FOR SELECT
  USING (
    is_admin(auth.uid()) OR
    is_group_member(auth.uid(), group_id)
  );

-- Members can create itinerary items
CREATE POLICY "Members can create itinerary items"
  ON public.itinerary_items FOR INSERT
  WITH CHECK (
    is_admin(auth.uid()) OR
    is_group_member(auth.uid(), group_id)
  );

-- Members can update itinerary items
CREATE POLICY "Members can update itinerary items"
  ON public.itinerary_items FOR UPDATE
  USING (
    is_admin(auth.uid()) OR
    is_group_member(auth.uid(), group_id)
  );

-- Leaders and admins can delete itinerary items
CREATE POLICY "Leaders can delete itinerary items"
  ON public.itinerary_items FOR DELETE
  USING (
    is_admin(auth.uid()) OR
    is_group_leader(auth.uid(), group_id)
  );

-- ============================================
-- TRAVEL DOCUMENTS TABLE POLICIES
-- ============================================

-- Members can view documents of their groups
CREATE POLICY "Members can view group documents"
  ON public.travel_documents FOR SELECT
  USING (
    is_admin(auth.uid()) OR
    is_group_member(auth.uid(), group_id)
  );

-- Members can upload documents
CREATE POLICY "Members can upload documents"
  ON public.travel_documents FOR INSERT
  WITH CHECK (
    is_admin(auth.uid()) OR
    is_group_member(auth.uid(), group_id)
  );

-- Admins and uploaders can delete documents
CREATE POLICY "Admins and uploaders can delete documents"
  ON public.travel_documents FOR DELETE
  USING (
    is_admin(auth.uid()) OR
    uploaded_by = auth.uid()
  );

-- ============================================
-- PHOTOS TABLE POLICIES
-- ============================================

-- Members can view photos of their groups
CREATE POLICY "Members can view group photos"
  ON public.photos FOR SELECT
  USING (
    is_admin(auth.uid()) OR
    is_group_member(auth.uid(), group_id)
  );

-- Members can upload photos
CREATE POLICY "Members can upload photos"
  ON public.photos FOR INSERT
  WITH CHECK (
    is_admin(auth.uid()) OR
    is_group_member(auth.uid(), group_id)
  );

-- Users can update their own photos
CREATE POLICY "Users can update own photos"
  ON public.photos FOR UPDATE
  USING (
    is_admin(auth.uid()) OR
    uploaded_by = auth.uid()
  );

-- Users can delete their own photos
CREATE POLICY "Users can delete own photos"
  ON public.photos FOR DELETE
  USING (
    is_admin(auth.uid()) OR
    uploaded_by = auth.uid()
  );

-- ============================================
-- PHOTO COMMENTS TABLE POLICIES
-- ============================================

-- Members can view comments on group photos
CREATE POLICY "Members can view photo comments"
  ON public.photo_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.photos
      WHERE photos.id = photo_id
      AND (is_admin(auth.uid()) OR is_group_member(auth.uid(), photos.group_id))
    )
  );

-- Members can create comments
CREATE POLICY "Members can create comments"
  ON public.photo_comments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.photos
      WHERE photos.id = photo_id
      AND (is_admin(auth.uid()) OR is_group_member(auth.uid(), photos.group_id))
    )
  );

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments"
  ON public.photo_comments FOR DELETE
  USING (
    is_admin(auth.uid()) OR
    user_id = auth.uid()
  );

-- ============================================
-- EXPENSES TABLE POLICIES
-- ============================================

-- Members can view expenses of their groups
CREATE POLICY "Members can view group expenses"
  ON public.expenses FOR SELECT
  USING (
    is_admin(auth.uid()) OR
    is_group_member(auth.uid(), group_id)
  );

-- Members can create expenses
CREATE POLICY "Members can create expenses"
  ON public.expenses FOR INSERT
  WITH CHECK (
    is_admin(auth.uid()) OR
    is_group_member(auth.uid(), group_id)
  );

-- Members can update expenses
CREATE POLICY "Members can update expenses"
  ON public.expenses FOR UPDATE
  USING (
    is_admin(auth.uid()) OR
    is_group_member(auth.uid(), group_id)
  );

-- Creators and admins can delete expenses
CREATE POLICY "Creators and admins can delete expenses"
  ON public.expenses FOR DELETE
  USING (
    is_admin(auth.uid()) OR
    paid_by = auth.uid()
  );

-- ============================================
-- EXPENSE SPLITS TABLE POLICIES
-- ============================================

-- Users can view splits for expenses in their groups
CREATE POLICY "Users can view expense splits"
  ON public.expense_splits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.expenses
      WHERE expenses.id = expense_id
      AND (is_admin(auth.uid()) OR is_group_member(auth.uid(), expenses.group_id))
    )
  );

-- Members can create splits
CREATE POLICY "Members can create splits"
  ON public.expense_splits FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.expenses
      WHERE expenses.id = expense_id
      AND (is_admin(auth.uid()) OR is_group_member(auth.uid(), expenses.group_id))
    )
  );

-- Members can update splits (for settling)
CREATE POLICY "Members can update splits"
  ON public.expense_splits FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.expenses
      WHERE expenses.id = expense_id
      AND (is_admin(auth.uid()) OR is_group_member(auth.uid(), expenses.group_id))
    )
  );

-- Admins can delete splits
CREATE POLICY "Admins can delete splits"
  ON public.expense_splits FOR DELETE
  USING (is_admin(auth.uid()));

-- ============================================
-- GROUP NOTES TABLE POLICIES
-- ============================================

-- Members can view group notes
CREATE POLICY "Members can view group notes"
  ON public.group_notes FOR SELECT
  USING (
    is_admin(auth.uid()) OR
    is_group_member(auth.uid(), group_id)
  );

-- Members can create group notes
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

-- Leaders and admins can delete group notes
CREATE POLICY "Leaders can delete group notes"
  ON public.group_notes FOR DELETE
  USING (
    is_admin(auth.uid()) OR
    is_group_leader(auth.uid(), group_id)
  );
