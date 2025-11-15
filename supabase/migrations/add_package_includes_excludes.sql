-- Migration: Add Package Includes/Excludes Tables
-- Date: 2025-11-15
-- Description: Creates tables for customizable included and excluded items for travel packages

-- ============================================
-- TABLE: package_included_items
-- ============================================
-- Items that are included in the package (admin-editable)

CREATE TABLE IF NOT EXISTS public.package_included_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES public.travel_packages(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) >= 3 AND char_length(title) <= 200),
  description TEXT CHECK (char_length(description) <= 500),
  icon TEXT CHECK (char_length(icon) <= 10), -- Emoji or icon identifier
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- TABLE: package_excluded_items
-- ============================================
-- Items that are NOT included in the package (admin-editable)

CREATE TABLE IF NOT EXISTS public.package_excluded_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES public.travel_packages(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) >= 3 AND char_length(title) <= 200),
  description TEXT CHECK (char_length(description) <= 500),
  icon TEXT CHECK (char_length(icon) <= 10), -- Emoji or icon identifier
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================

-- Indexes for efficient querying by package_id and order
CREATE INDEX IF NOT EXISTS idx_package_included_items_package_id
ON public.package_included_items(package_id);

CREATE INDEX IF NOT EXISTS idx_package_included_items_order
ON public.package_included_items(package_id, order_index);

CREATE INDEX IF NOT EXISTS idx_package_excluded_items_package_id
ON public.package_excluded_items(package_id);

CREATE INDEX IF NOT EXISTS idx_package_excluded_items_order
ON public.package_excluded_items(package_id, order_index);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE public.package_included_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_excluded_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view included items for active packages" ON public.package_included_items;
DROP POLICY IF EXISTS "Admins can manage included items" ON public.package_included_items;
DROP POLICY IF EXISTS "Anyone can view excluded items for active packages" ON public.package_excluded_items;
DROP POLICY IF EXISTS "Admins can manage excluded items" ON public.package_excluded_items;

-- PUBLIC READ: Anyone can view items for active packages
CREATE POLICY "Anyone can view included items for active packages"
ON public.package_included_items FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM public.travel_packages
    WHERE travel_packages.id = package_included_items.package_id
    AND travel_packages.is_active = true
  )
);

CREATE POLICY "Anyone can view excluded items for active packages"
ON public.package_excluded_items FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM public.travel_packages
    WHERE travel_packages.id = package_excluded_items.package_id
    AND travel_packages.is_active = true
  )
);

-- ADMIN WRITE: Only admins can insert, update, delete
CREATE POLICY "Admins can manage included items"
ON public.package_included_items FOR ALL
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM public.users WHERE role = 'admin'
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM public.users WHERE role = 'admin'
  )
);

CREATE POLICY "Admins can manage excluded items"
ON public.package_excluded_items FOR ALL
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM public.users WHERE role = 'admin'
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM public.users WHERE role = 'admin'
  )
);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for both tables
DROP TRIGGER IF EXISTS update_package_included_items_updated_at ON public.package_included_items;
CREATE TRIGGER update_package_included_items_updated_at
BEFORE UPDATE ON public.package_included_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_package_excluded_items_updated_at ON public.package_excluded_items;
CREATE TRIGGER update_package_excluded_items_updated_at
BEFORE UPDATE ON public.package_excluded_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE public.package_included_items IS 'Items that are included in the travel package (admin-editable)';
COMMENT ON TABLE public.package_excluded_items IS 'Items that are NOT included in the travel package (admin-editable)';

COMMENT ON COLUMN public.package_included_items.icon IS 'Emoji or icon identifier (e.g., 🏨, 🚗, 🍽️)';
COMMENT ON COLUMN public.package_excluded_items.icon IS 'Emoji or icon identifier (e.g., ✈️, 🍺, 💰)';
COMMENT ON COLUMN public.package_included_items.order_index IS 'Display order (lower numbers appear first)';
COMMENT ON COLUMN public.package_excluded_items.order_index IS 'Display order (lower numbers appear first)';
