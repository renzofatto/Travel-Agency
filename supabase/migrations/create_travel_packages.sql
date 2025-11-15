-- ============================================
-- MIGRATION: Travel Packages System
-- Date: 2025-11-15
-- Description: Permite a los admins crear paquetes de viaje predefinidos
--              con itinerarios que pueden ser asignados a grupos.
--              Cuando se asigna un paquete a un grupo, se copia el itinerario
--              de forma independiente.
-- ============================================

-- ============================================
-- 1. TRAVEL PACKAGES TABLE
-- ============================================
-- Paquetes maestros creados por admins
CREATE TABLE IF NOT EXISTS public.travel_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  destination VARCHAR(200) NOT NULL,
  duration_days INTEGER NOT NULL CHECK (duration_days > 0),
  cover_image TEXT,
  price_estimate DECIMAL(10, 2), -- Precio estimado (opcional)
  difficulty_level VARCHAR(50) CHECK (difficulty_level IN ('easy', 'moderate', 'challenging')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true -- Para archivar paquetes sin eliminarlos
);

-- Índices para búsquedas comunes
CREATE INDEX idx_travel_packages_active ON public.travel_packages(is_active) WHERE is_active = true;
CREATE INDEX idx_travel_packages_destination ON public.travel_packages(destination);
CREATE INDEX idx_travel_packages_created_by ON public.travel_packages(created_by);

-- ============================================
-- 2. PACKAGE ITINERARY ITEMS TABLE
-- ============================================
-- Items de itinerario para los paquetes maestros
CREATE TABLE IF NOT EXISTS public.package_itinerary_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id UUID NOT NULL REFERENCES public.travel_packages(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL CHECK (day_number > 0), -- Día del paquete (1, 2, 3, etc.)
  title VARCHAR(200) NOT NULL,
  description TEXT,
  start_time TIME,
  end_time TIME,
  location VARCHAR(200),
  category VARCHAR(50) NOT NULL CHECK (category IN ('transport', 'accommodation', 'activity', 'food', 'other')),
  order_index INTEGER DEFAULT 0, -- Orden dentro del mismo día
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Validación: end_time debe ser después de start_time
  CONSTRAINT valid_time_range CHECK (
    (start_time IS NULL OR end_time IS NULL) OR
    (end_time > start_time)
  )
);

-- Índices
CREATE INDEX idx_package_itinerary_package_id ON public.package_itinerary_items(package_id);
CREATE INDEX idx_package_itinerary_day ON public.package_itinerary_items(package_id, day_number);

-- ============================================
-- 3. ADD PACKAGE REFERENCE TO GROUPS
-- ============================================
-- Agregar columna opcional para rastrear el paquete original
ALTER TABLE public.travel_groups
ADD COLUMN IF NOT EXISTS source_package_id UUID REFERENCES public.travel_packages(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_travel_groups_source_package ON public.travel_groups(source_package_id);

-- ============================================
-- 4. RLS POLICIES FOR TRAVEL_PACKAGES
-- ============================================
ALTER TABLE public.travel_packages ENABLE ROW LEVEL SECURITY;

-- Todos pueden ver paquetes activos
CREATE POLICY "Anyone can view active packages"
  ON public.travel_packages FOR SELECT
  USING (is_active = true OR is_admin(auth.uid()));

-- Solo admins pueden crear paquetes
CREATE POLICY "Only admins can create packages"
  ON public.travel_packages FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

-- Solo admins pueden actualizar paquetes
CREATE POLICY "Only admins can update packages"
  ON public.travel_packages FOR UPDATE
  USING (is_admin(auth.uid()));

-- Solo admins pueden eliminar paquetes
CREATE POLICY "Only admins can delete packages"
  ON public.travel_packages FOR DELETE
  USING (is_admin(auth.uid()));

-- ============================================
-- 5. RLS POLICIES FOR PACKAGE_ITINERARY_ITEMS
-- ============================================
ALTER TABLE public.package_itinerary_items ENABLE ROW LEVEL SECURITY;

-- Todos pueden ver items de paquetes activos
CREATE POLICY "Anyone can view package items"
  ON public.package_itinerary_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.travel_packages
      WHERE travel_packages.id = package_id
      AND (travel_packages.is_active = true OR is_admin(auth.uid()))
    )
  );

-- Solo admins pueden crear items de paquete
CREATE POLICY "Only admins can create package items"
  ON public.package_itinerary_items FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

-- Solo admins pueden actualizar items de paquete
CREATE POLICY "Only admins can update package items"
  ON public.package_itinerary_items FOR UPDATE
  USING (is_admin(auth.uid()));

-- Solo admins pueden eliminar items de paquete
CREATE POLICY "Only admins can delete package items"
  ON public.package_itinerary_items FOR DELETE
  USING (is_admin(auth.uid()));

-- ============================================
-- 6. TRIGGER FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_travel_packages_updated_at
  BEFORE UPDATE ON public.travel_packages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_package_itinerary_items_updated_at
  BEFORE UPDATE ON public.package_itinerary_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- NOTAS DE IMPLEMENTACIÓN
-- ============================================
--
-- FLUJO DE ASIGNACIÓN DE PAQUETE A GRUPO:
-- 1. Admin crea paquete en travel_packages
-- 2. Admin crea items de itinerario en package_itinerary_items
-- 3. Admin asigna paquete a grupo:
--    a. Se copia el itinerario del paquete a itinerary_items del grupo
--    b. Se ajustan las fechas según start_date del grupo
--    c. Se guarda source_package_id en el grupo (solo referencia)
-- 4. Grupo puede editar su itinerario libremente (NO afecta al paquete)
-- 5. Admin puede editar el paquete maestro (NO afecta a grupos existentes)
--
