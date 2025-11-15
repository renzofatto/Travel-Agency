-- Migration: Add landing page fields
-- Date: 2025-11-15
-- Description: Add is_featured to packages and show_in_landing to itinerary items

-- ============================================
-- 1. Add is_featured to travel_packages
-- ============================================

ALTER TABLE public.travel_packages
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.travel_packages.is_featured IS 'Whether this package should be displayed on the landing page';

-- ============================================
-- 2. Add show_in_landing to package_itinerary_items
-- ============================================

ALTER TABLE public.package_itinerary_items
ADD COLUMN IF NOT EXISTS show_in_landing BOOLEAN DEFAULT true;

COMMENT ON COLUMN public.package_itinerary_items.show_in_landing IS 'Whether this itinerary item should be shown on the landing page preview';

-- ============================================
-- 3. Update RLS Policies for Public Access
-- ============================================

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Public can view featured packages" ON public.travel_packages;

-- Allow anonymous users to view featured packages
CREATE POLICY "Public can view featured packages"
ON public.travel_packages FOR SELECT
TO anon, authenticated
USING (is_featured = true AND is_active = true);

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Public can view package itinerary items" ON public.package_itinerary_items;

-- Allow anonymous users to view itinerary items of featured packages
CREATE POLICY "Public can view package itinerary items"
ON public.package_itinerary_items FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.travel_packages
    WHERE travel_packages.id = package_itinerary_items.package_id
    AND travel_packages.is_featured = true
    AND travel_packages.is_active = true
  )
);

-- ============================================
-- 4. Create Index for Performance
-- ============================================

-- Index for featured packages query
CREATE INDEX IF NOT EXISTS idx_travel_packages_featured
ON public.travel_packages(is_featured, is_active)
WHERE is_featured = true AND is_active = true;

-- Index for landing page items
CREATE INDEX IF NOT EXISTS idx_package_itinerary_items_landing
ON public.package_itinerary_items(package_id, show_in_landing)
WHERE show_in_landing = true;

-- ============================================
-- 5. Update existing data (optional)
-- ============================================

-- Mark first 3 packages as featured (if any exist)
-- You can adjust this or remove it
UPDATE public.travel_packages
SET is_featured = true
WHERE id IN (
  SELECT id FROM public.travel_packages
  WHERE is_active = true
  ORDER BY created_at DESC
  LIMIT 3
);

COMMENT ON INDEX public.idx_travel_packages_featured IS 'Optimizes landing page query for featured packages';
COMMENT ON INDEX public.idx_package_itinerary_items_landing IS 'Optimizes query for landing page itinerary items';
