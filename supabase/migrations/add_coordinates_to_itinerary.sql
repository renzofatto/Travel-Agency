-- Migration: Add geographic coordinates to package_itinerary_items
-- Date: 2025-11-15
-- Description: Adds latitude and longitude fields for map display

-- Add coordinate columns to package_itinerary_items
ALTER TABLE public.package_itinerary_items
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Add comments
COMMENT ON COLUMN public.package_itinerary_items.latitude IS 'Latitude coordinate for map display (-90 to 90)';
COMMENT ON COLUMN public.package_itinerary_items.longitude IS 'Longitude coordinate for map display (-180 to 180)';

-- Create index for coordinate queries
CREATE INDEX IF NOT EXISTS idx_package_itinerary_coordinates
ON public.package_itinerary_items(latitude, longitude)
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Add check constraints for valid coordinate ranges
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'valid_latitude_range'
  ) THEN
    ALTER TABLE public.package_itinerary_items
    ADD CONSTRAINT valid_latitude_range
    CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'valid_longitude_range'
  ) THEN
    ALTER TABLE public.package_itinerary_items
    ADD CONSTRAINT valid_longitude_range
    CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180));
  END IF;
END $$;
