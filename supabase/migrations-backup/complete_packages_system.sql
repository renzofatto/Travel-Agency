-- ============================================
-- MIGRATION: Complete Travel Packages System
-- Date: 2025-11-15
-- Description: Script combinado y seguro que verifica qué existe
--              y solo agrega lo que falta. Puedes correr este
--              script múltiples veces sin errores.
-- ============================================

-- ============================================
-- PARTE 1: VERIFICAR Y CREAR TABLAS BASE
-- ============================================

-- 1.1 Tabla travel_packages
CREATE TABLE IF NOT EXISTS public.travel_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  destination VARCHAR(200) NOT NULL,
  duration_days INTEGER NOT NULL CHECK (duration_days > 0),
  cover_image TEXT,
  price_estimate DECIMAL(10, 2),
  difficulty_level VARCHAR(50) CHECK (difficulty_level IN ('easy', 'moderate', 'challenging')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false -- Para landing page
);

-- 1.2 Tabla package_itinerary_items
CREATE TABLE IF NOT EXISTS public.package_itinerary_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id UUID NOT NULL REFERENCES public.travel_packages(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL CHECK (day_number > 0),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  start_time TIME,
  end_time TIME,
  location VARCHAR(200),
  category VARCHAR(50) NOT NULL CHECK (category IN ('transport', 'accommodation', 'activity', 'food', 'other')),
  order_index INTEGER DEFAULT 0,
  show_in_landing BOOLEAN DEFAULT true, -- Para landing page
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_time_range CHECK (
    (start_time IS NULL OR end_time IS NULL) OR (end_time > start_time)
  )
);

-- 1.3 Agregar columna a travel_groups (si no existe)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'travel_groups' AND column_name = 'source_package_id'
  ) THEN
    ALTER TABLE public.travel_groups
    ADD COLUMN source_package_id UUID REFERENCES public.travel_packages(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================
-- PARTE 2: CREAR ÍNDICES (IF NOT EXISTS)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_travel_packages_active
  ON public.travel_packages(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_travel_packages_featured
  ON public.travel_packages(is_featured, is_active)
  WHERE is_featured = true AND is_active = true;

CREATE INDEX IF NOT EXISTS idx_travel_packages_destination
  ON public.travel_packages(destination);

CREATE INDEX IF NOT EXISTS idx_travel_packages_created_by
  ON public.travel_packages(created_by);

CREATE INDEX IF NOT EXISTS idx_package_itinerary_package_id
  ON public.package_itinerary_items(package_id);

CREATE INDEX IF NOT EXISTS idx_package_itinerary_day
  ON public.package_itinerary_items(package_id, day_number);

CREATE INDEX IF NOT EXISTS idx_package_itinerary_items_landing
  ON public.package_itinerary_items(package_id, show_in_landing)
  WHERE show_in_landing = true;

CREATE INDEX IF NOT EXISTS idx_travel_groups_source_package
  ON public.travel_groups(source_package_id);

-- ============================================
-- PARTE 3: RLS POLICIES PARA TRAVEL_PACKAGES
-- ============================================

ALTER TABLE public.travel_packages ENABLE ROW LEVEL SECURITY;

-- Eliminar policies antiguas si existen
DROP POLICY IF EXISTS "Anyone can view active packages" ON public.travel_packages;
DROP POLICY IF EXISTS "Public can view featured packages" ON public.travel_packages;
DROP POLICY IF EXISTS "Only admins can create packages" ON public.travel_packages;
DROP POLICY IF EXISTS "Only admins can update packages" ON public.travel_packages;
DROP POLICY IF EXISTS "Only admins can delete packages" ON public.travel_packages;

-- Crear policies nuevas
CREATE POLICY "Anyone can view active packages"
  ON public.travel_packages FOR SELECT
  USING (is_active = true OR is_admin(auth.uid()));

CREATE POLICY "Public can view featured packages"
  ON public.travel_packages FOR SELECT
  TO anon, authenticated
  USING (is_featured = true AND is_active = true);

CREATE POLICY "Only admins can create packages"
  ON public.travel_packages FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Only admins can update packages"
  ON public.travel_packages FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "Only admins can delete packages"
  ON public.travel_packages FOR DELETE
  USING (is_admin(auth.uid()));

-- ============================================
-- PARTE 4: RLS POLICIES PARA PACKAGE_ITINERARY_ITEMS
-- ============================================

ALTER TABLE public.package_itinerary_items ENABLE ROW LEVEL SECURITY;

-- Eliminar policies antiguas si existen
DROP POLICY IF EXISTS "Anyone can view package items" ON public.package_itinerary_items;
DROP POLICY IF EXISTS "Public can view package itinerary items" ON public.package_itinerary_items;
DROP POLICY IF EXISTS "Only admins can create package items" ON public.package_itinerary_items;
DROP POLICY IF EXISTS "Only admins can update package items" ON public.package_itinerary_items;
DROP POLICY IF EXISTS "Only admins can delete package items" ON public.package_itinerary_items;

-- Crear policies nuevas
CREATE POLICY "Anyone can view package items"
  ON public.package_itinerary_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.travel_packages
      WHERE travel_packages.id = package_id
      AND (travel_packages.is_active = true OR is_admin(auth.uid()))
    )
  );

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

CREATE POLICY "Only admins can create package items"
  ON public.package_itinerary_items FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Only admins can update package items"
  ON public.package_itinerary_items FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "Only admins can delete package items"
  ON public.package_itinerary_items FOR DELETE
  USING (is_admin(auth.uid()));

-- ============================================
-- PARTE 5: RLS POLICY PARA TRAVEL_GROUPS
-- ============================================

-- Solo actualizar la policy de creación de grupos (admins only)
DROP POLICY IF EXISTS "Authenticated users can create groups" ON public.travel_groups;
DROP POLICY IF EXISTS "Only admins can create groups" ON public.travel_groups;

CREATE POLICY "Only admins can create groups"
  ON public.travel_groups FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

-- ============================================
-- PARTE 6: TRIGGERS PARA UPDATED_AT
-- ============================================

-- Crear función si no existe
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop triggers si existen y recrearlos
DROP TRIGGER IF EXISTS update_travel_packages_updated_at ON public.travel_packages;
CREATE TRIGGER update_travel_packages_updated_at
  BEFORE UPDATE ON public.travel_packages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_package_itinerary_items_updated_at ON public.package_itinerary_items;
CREATE TRIGGER update_package_itinerary_items_updated_at
  BEFORE UPDATE ON public.package_itinerary_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PARTE 7: COMENTARIOS EN COLUMNAS
-- ============================================

COMMENT ON COLUMN public.travel_packages.is_featured IS 'Whether this package should be displayed on the landing page';
COMMENT ON COLUMN public.package_itinerary_items.show_in_landing IS 'Whether this itinerary item should be shown on the landing page preview';
COMMENT ON TABLE public.travel_packages IS 'Master travel packages created by admins that can be assigned to groups';
COMMENT ON TABLE public.package_itinerary_items IS 'Itinerary template items for travel packages';

-- ============================================
-- FINALIZADO
-- ============================================

-- Este script es idempotente - puedes correrlo múltiples veces sin problemas
