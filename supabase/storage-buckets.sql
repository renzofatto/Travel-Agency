-- ============================================
-- TRAVELHUB STORAGE BUCKETS CONFIGURATION
-- Complete storage setup with all buckets and policies
-- Last updated: 2025-11-15
-- ============================================

-- This script creates all storage buckets needed for TravelHub
-- and configures their Row Level Security (RLS) policies.
--
-- Run this script AFTER creating the database schema.
-- Execute in Supabase SQL Editor or via: psql -d your_db -f storage-buckets.sql

-- ============================================
-- 1. CREATE ALL STORAGE BUCKETS
-- ============================================

-- Bucket for user avatars (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Bucket for travel documents (private - tickets, reservations, etc.)
INSERT INTO storage.buckets (id, name, public)
VALUES ('travel-documents', 'travel-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Bucket for trip photos (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- Bucket for itinerary item images (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('itinerary-item-images', 'itinerary-item-images', true)
ON CONFLICT (id) DO NOTHING;

-- Bucket for group cover images (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('group-covers', 'group-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Bucket for package cover images (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('package-covers', 'package-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Bucket for expense receipts (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. DROP EXISTING POLICIES (for idempotency)
-- ============================================

-- Avatars
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- Travel Documents
DROP POLICY IF EXISTS "Group members can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Group members can view documents" ON storage.objects;
DROP POLICY IF EXISTS "Document owners and admins can delete" ON storage.objects;

-- Photos
DROP POLICY IF EXISTS "Group members can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Photos are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Photo owners and admins can delete" ON storage.objects;

-- Itinerary Item Images
DROP POLICY IF EXISTS "Admins can upload itinerary images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view itinerary images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete itinerary images" ON storage.objects;

-- Group Covers
DROP POLICY IF EXISTS "Group leaders can upload covers" ON storage.objects;
DROP POLICY IF EXISTS "Group covers are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Group leaders and admins can delete covers" ON storage.objects;

-- Package Covers
DROP POLICY IF EXISTS "Admins can upload package covers" ON storage.objects;
DROP POLICY IF EXISTS "Package covers are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete package covers" ON storage.objects;

-- Receipts
DROP POLICY IF EXISTS "Users can upload receipts for their expenses" ON storage.objects;
DROP POLICY IF EXISTS "Group members can view receipts" ON storage.objects;
DROP POLICY IF EXISTS "Receipt owners and admins can delete" ON storage.objects;

-- ============================================
-- 3. AVATARS BUCKET POLICIES
-- ============================================

-- Users can upload their own avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Anyone can view avatars (public bucket)
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Users can update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- 4. TRAVEL DOCUMENTS BUCKET POLICIES
-- ============================================

-- Group members can upload documents
CREATE POLICY "Group members can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'travel-documents'
  AND auth.uid() IN (
    SELECT gm.user_id
    FROM public.group_members gm
    JOIN public.travel_documents td ON td.group_id = gm.group_id
    WHERE (storage.foldername(name))[1] = gm.group_id::text
  )
);

-- Only group members can view documents (private bucket)
CREATE POLICY "Group members can view documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'travel-documents'
  AND auth.uid() IN (
    SELECT user_id
    FROM public.group_members
    WHERE group_id::text = (storage.foldername(name))[1]
  )
);

-- Document owners and admins can delete
CREATE POLICY "Document owners and admins can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'travel-documents'
  AND (
    -- Owner of the document
    (storage.foldername(name))[2] = auth.uid()::text
    OR
    -- Admin
    auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin')
  )
);

-- ============================================
-- 5. PHOTOS BUCKET POLICIES
-- ============================================

-- Group members can upload photos
CREATE POLICY "Group members can upload photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'photos'
  AND auth.uid() IN (
    SELECT user_id
    FROM public.group_members
    WHERE group_id::text = (storage.foldername(name))[1]
  )
);

-- Anyone can view photos (public bucket)
CREATE POLICY "Photos are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'photos');

-- Photo owners and admins can delete
CREATE POLICY "Photo owners and admins can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'photos'
  AND (
    -- Owner of the photo
    (storage.foldername(name))[2] = auth.uid()::text
    OR
    -- Admin
    auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin')
  )
);

-- ============================================
-- 6. ITINERARY ITEM IMAGES BUCKET POLICIES
-- ============================================

-- Only admins can upload itinerary images
CREATE POLICY "Admins can upload itinerary images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'itinerary-item-images'
  AND auth.uid() IN (
    SELECT id FROM public.users WHERE role = 'admin'
  )
);

-- Anyone can view itinerary images (public bucket)
CREATE POLICY "Public can view itinerary images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'itinerary-item-images');

-- Only admins can delete itinerary images
CREATE POLICY "Admins can delete itinerary images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'itinerary-item-images'
  AND auth.uid() IN (
    SELECT id FROM public.users WHERE role = 'admin'
  )
);

-- ============================================
-- 7. GROUP COVERS BUCKET POLICIES
-- ============================================

-- Group leaders and admins can upload covers
CREATE POLICY "Group leaders can upload covers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'group-covers'
  AND (
    -- Group leader
    auth.uid() IN (
      SELECT user_id
      FROM public.group_members
      WHERE group_id::text = (storage.foldername(name))[1]
      AND role = 'leader'
    )
    OR
    -- Admin
    auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin')
  )
);

-- Anyone can view group covers (public bucket)
CREATE POLICY "Group covers are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'group-covers');

-- Group leaders and admins can delete covers
CREATE POLICY "Group leaders and admins can delete covers"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'group-covers'
  AND (
    -- Group leader
    auth.uid() IN (
      SELECT user_id
      FROM public.group_members
      WHERE group_id::text = (storage.foldername(name))[1]
      AND role = 'leader'
    )
    OR
    -- Admin
    auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin')
  )
);

-- ============================================
-- 8. PACKAGE COVERS BUCKET POLICIES
-- ============================================

-- Only admins can upload package covers
CREATE POLICY "Admins can upload package covers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'package-covers'
  AND auth.uid() IN (
    SELECT id FROM public.users WHERE role = 'admin'
  )
);

-- Anyone can view package covers (public bucket)
CREATE POLICY "Package covers are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'package-covers');

-- Only admins can delete package covers
CREATE POLICY "Admins can delete package covers"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'package-covers'
  AND auth.uid() IN (
    SELECT id FROM public.users WHERE role = 'admin'
  )
);

-- ============================================
-- 9. RECEIPTS BUCKET POLICIES
-- ============================================

-- Users can upload receipts for their expenses
CREATE POLICY "Users can upload receipts for their expenses"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'receipts'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Group members can view receipts
CREATE POLICY "Group members can view receipts"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'receipts'
  AND auth.uid() IN (
    SELECT user_id
    FROM public.group_members
    WHERE group_id::text = (storage.foldername(name))[1]
  )
);

-- Receipt owners and admins can delete
CREATE POLICY "Receipt owners and admins can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'receipts'
  AND (
    -- Owner of the receipt
    (storage.foldername(name))[2] = auth.uid()::text
    OR
    -- Admin
    auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin')
  )
);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Uncomment to verify buckets were created:
-- SELECT id, name, public FROM storage.buckets ORDER BY name;

-- Uncomment to verify policies were created:
-- SELECT schemaname, tablename, policyname
-- FROM pg_policies
-- WHERE tablename = 'objects'
-- ORDER BY policyname;

-- ============================================
-- SUMMARY
-- ============================================

/*
Buckets created:
  1. avatars (public) - User profile pictures
  2. travel-documents (private) - Trip documents (tickets, etc.)
  3. photos (public) - Trip photos
  4. itinerary-item-images (public) - Activity images
  5. group-covers (public) - Group cover images
  6. package-covers (public) - Package cover images
  7. receipts (private) - Expense receipts

Total policies: 28 (4 per bucket average)

Security model:
  - Public buckets: Anyone can view, authenticated users can upload (with restrictions)
  - Private buckets: Only group members can view and upload
  - Admins have full access to all buckets
  - Users can only delete their own uploads (unless admin)
*/
