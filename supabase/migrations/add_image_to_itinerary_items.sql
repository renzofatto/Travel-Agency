-- Migration: Add image support to package_itinerary_items
-- Date: 2025-11-15
-- Description: Adds image_url field for itinerary item images

-- Add image_url column to package_itinerary_items
ALTER TABLE public.package_itinerary_items
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add comment
COMMENT ON COLUMN public.package_itinerary_items.image_url IS 'URL of the image for this itinerary item';

-- Create index for image queries
CREATE INDEX IF NOT EXISTS idx_package_itinerary_images
ON public.package_itinerary_items(image_url)
WHERE image_url IS NOT NULL;
