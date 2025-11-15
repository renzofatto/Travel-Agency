-- Storage Setup for Itinerary Item Images
-- Date: 2025-11-15
-- Description: Creates storage bucket and RLS policies for itinerary item images

-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('itinerary-item-images', 'itinerary-item-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can upload itinerary images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view itinerary images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete itinerary images" ON storage.objects;

-- Allow admins to upload images
CREATE POLICY "Admins can upload itinerary images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'itinerary-item-images'
  AND auth.uid() IN (
    SELECT id FROM public.users WHERE role = 'admin'
  )
);

-- Allow anyone to view images (public bucket)
CREATE POLICY "Public can view itinerary images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'itinerary-item-images');

-- Allow admins to delete images
CREATE POLICY "Admins can delete itinerary images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'itinerary-item-images'
  AND auth.uid() IN (
    SELECT id FROM public.users WHERE role = 'admin'
  )
);
