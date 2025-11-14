-- ============================================
-- SUPABASE STORAGE BUCKETS CONFIGURATION
-- Execute this in Supabase SQL Editor after creating the buckets manually
-- ============================================

-- Note: Buckets must be created manually in Supabase Dashboard first:
-- 1. Go to Storage in Supabase Dashboard
-- 2. Create the following buckets:
--    - travel-documents (private)
--    - photos (public)
-- 3. Then run this SQL to configure policies

-- ============================================
-- STORAGE POLICIES FOR TRAVEL DOCUMENTS (Private Bucket)
-- ============================================

-- Allow authenticated users to upload documents to their groups
CREATE POLICY "Group members can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'travel-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow group members to view documents
CREATE POLICY "Group members can view documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'travel-documents'
  AND EXISTS (
    SELECT 1 FROM public.travel_documents td
    JOIN public.group_members gm ON gm.group_id = td.group_id
    WHERE td.file_url LIKE '%' || name || '%'
    AND gm.user_id = auth.uid()
  )
);

-- Allow document owner or admins to delete
CREATE POLICY "Document owner can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'travel-documents'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  )
);

-- ============================================
-- STORAGE POLICIES FOR PHOTOS (Public Bucket)
-- ============================================

-- Allow authenticated users to upload photos
CREATE POLICY "Group members can upload photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access to photos
CREATE POLICY "Photos are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'photos');

-- Allow photo owner or admins to delete
CREATE POLICY "Photo owner can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'photos'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  )
);

-- ============================================
-- HELPER: How to create buckets via SQL (if needed)
-- ============================================

-- Note: Usually buckets are created via Dashboard, but you can also use:
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES
--   ('travel-documents', 'travel-documents', false),
--   ('photos', 'photos', true);
