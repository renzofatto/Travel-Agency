-- ============================================
-- TRAVELHUB DATABASE SCHEMA
-- Complete consolidated schema with all migrations
-- Last updated: 2025-11-16
-- ============================================
--
-- This file contains the complete database schema for TravelHub,
-- including all base tables and migrations. It can be executed
-- on an empty database to create the entire structure.
--
-- ============================================

-- ============================================
-- EXTENSIONS
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CUSTOM TYPES
-- ============================================

CREATE TYPE user_role AS ENUM ('admin', 'user');
CREATE TYPE group_member_role AS ENUM ('leader', 'member');
CREATE TYPE itinerary_category AS ENUM ('transport', 'accommodation', 'activity', 'food', 'other');
CREATE TYPE document_type AS ENUM ('flight', 'bus', 'train', 'hotel', 'activity', 'other');
CREATE TYPE expense_split_type AS ENUM ('equal', 'percentage', 'custom');
CREATE TYPE expense_category AS ENUM ('transport', 'accommodation', 'food', 'activity', 'shopping', 'other');

-- ============================================
-- TABLE: users
-- Extends auth.users with custom profile data
-- ============================================

CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.users IS 'User profiles extending Supabase Auth users';
COMMENT ON COLUMN public.users.role IS 'User role: admin or regular user';

-- ============================================
-- TABLE: travel_packages
-- Master travel packages created by admins
-- ============================================

CREATE TABLE public.travel_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  is_featured BOOLEAN DEFAULT false
);

COMMENT ON TABLE public.travel_packages IS 'Master travel packages created by admins that can be assigned to groups';
COMMENT ON COLUMN public.travel_packages.is_featured IS 'Whether this package should be displayed on the landing page';
COMMENT ON COLUMN public.travel_packages.is_active IS 'Active packages can be viewed and assigned; inactive are archived';
COMMENT ON COLUMN public.travel_packages.price_estimate IS 'Estimated total price for the package';

-- ============================================
-- TABLE: package_itinerary_items
-- Template itinerary items for packages
-- ============================================

CREATE TABLE public.package_itinerary_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES public.travel_packages(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL CHECK (day_number > 0),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  start_time TIME,
  end_time TIME,
  location VARCHAR(200),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  category VARCHAR(50) NOT NULL CHECK (category IN ('transport', 'accommodation', 'activity', 'food', 'other')),
  order_index INTEGER DEFAULT 0,
  image_url TEXT,
  show_in_landing BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT valid_time_range CHECK (
    (start_time IS NULL OR end_time IS NULL) OR (end_time > start_time)
  ),
  CONSTRAINT valid_latitude_range CHECK (
    latitude IS NULL OR (latitude >= -90 AND latitude <= 90)
  ),
  CONSTRAINT valid_longitude_range CHECK (
    longitude IS NULL OR (longitude >= -180 AND longitude <= 180)
  )
);

COMMENT ON TABLE public.package_itinerary_items IS 'Itinerary template items for travel packages';
COMMENT ON COLUMN public.package_itinerary_items.day_number IS 'Day number within the package (1, 2, 3, etc.)';
COMMENT ON COLUMN public.package_itinerary_items.latitude IS 'Latitude coordinate for map display (-90 to 90)';
COMMENT ON COLUMN public.package_itinerary_items.longitude IS 'Longitude coordinate for map display (-180 to 180)';
COMMENT ON COLUMN public.package_itinerary_items.image_url IS 'URL of the image for this itinerary item';
COMMENT ON COLUMN public.package_itinerary_items.show_in_landing IS 'Whether this itinerary item should be shown on the landing page preview';

-- ============================================
-- TABLE: package_included_items
-- Items included in the travel package
-- ============================================

CREATE TABLE public.package_included_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES public.travel_packages(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) >= 3 AND char_length(title) <= 200),
  description TEXT CHECK (char_length(description) <= 500),
  icon TEXT CHECK (char_length(icon) <= 10),
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.package_included_items IS 'Items that are included in the travel package (admin-editable)';
COMMENT ON COLUMN public.package_included_items.icon IS 'Emoji or icon identifier (e.g., 🏨, 🚗, 🍽️)';
COMMENT ON COLUMN public.package_included_items.order_index IS 'Display order (lower numbers appear first)';

-- ============================================
-- TABLE: package_excluded_items
-- Items NOT included in the travel package
-- ============================================

CREATE TABLE public.package_excluded_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES public.travel_packages(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) >= 3 AND char_length(title) <= 200),
  description TEXT CHECK (char_length(description) <= 500),
  icon TEXT CHECK (char_length(icon) <= 10),
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.package_excluded_items IS 'Items that are NOT included in the travel package (admin-editable)';
COMMENT ON COLUMN public.package_excluded_items.icon IS 'Emoji or icon identifier (e.g., ✈️, 🍺, 💰)';
COMMENT ON COLUMN public.package_excluded_items.order_index IS 'Display order (lower numbers appear first)';

-- ============================================
-- TABLE: travel_groups
-- Travel groups created from packages or custom
-- ============================================

CREATE TABLE public.travel_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  destination TEXT,
  start_date DATE,
  end_date DATE,
  cover_image TEXT,
  source_package_id UUID REFERENCES public.travel_packages(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.travel_groups IS 'Travel groups for organizing trips with members';
COMMENT ON COLUMN public.travel_groups.source_package_id IS 'Reference to the package this group was created from (optional)';

-- ============================================
-- TABLE: group_members
-- Members of travel groups with roles
-- ============================================

CREATE TABLE public.group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES public.travel_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  role group_member_role DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

COMMENT ON TABLE public.group_members IS 'Membership table for users in travel groups';
COMMENT ON COLUMN public.group_members.role IS 'Member role: leader (can manage) or member (can participate)';

-- ============================================
-- TABLE: itinerary_items
-- Daily activities for travel groups
-- ============================================

CREATE TABLE public.itinerary_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES public.travel_groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location TEXT,
  category itinerary_category DEFAULT 'activity',
  order_index INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.itinerary_items IS 'Itinerary items (activities) for travel groups';
COMMENT ON COLUMN public.itinerary_items.order_index IS 'Order within the same day';

-- ============================================
-- TABLE: travel_documents
-- Documents for travel groups
-- ============================================

CREATE TABLE public.travel_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES public.travel_groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_size BIGINT,
  document_type document_type DEFAULT 'other',
  uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.travel_documents IS 'Travel documents (tickets, reservations, etc.) for groups';

-- ============================================
-- TABLE: photos
-- Photos uploaded by group members
-- ============================================

CREATE TABLE public.photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES public.travel_groups(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  taken_at TIMESTAMP WITH TIME ZONE,
  uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.photos IS 'Photos uploaded by group members during trips';

-- ============================================
-- TABLE: photo_comments
-- Comments on photos
-- ============================================

CREATE TABLE public.photo_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  photo_id UUID REFERENCES public.photos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.photo_comments IS 'Comments on photos';

-- ============================================
-- TABLE: expenses
-- Group expenses for splitting costs
-- ============================================

CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES public.travel_groups(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  category expense_category DEFAULT 'other',
  paid_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  split_type expense_split_type DEFAULT 'equal',
  receipt_url TEXT,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.expenses IS 'Expenses incurred by group members';
COMMENT ON COLUMN public.expenses.split_type IS 'How the expense is split: equal, percentage, or custom';

-- ============================================
-- TABLE: expense_splits
-- How expenses are divided among members
-- ============================================

CREATE TABLE public.expense_splits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expense_id UUID REFERENCES public.expenses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  amount_owed DECIMAL(10, 2) NOT NULL,
  percentage DECIMAL(5, 2),
  is_settled BOOLEAN DEFAULT FALSE,
  settled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(expense_id, user_id)
);

COMMENT ON TABLE public.expense_splits IS 'How expenses are divided among group members';

-- ============================================
-- TABLE: expense_payments
-- Payments between members to settle debts
-- ============================================

CREATE TABLE public.expense_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES public.travel_groups(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  description TEXT,
  payment_date DATE DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT different_users CHECK (from_user_id != to_user_id),
  CONSTRAINT positive_amount CHECK (amount > 0)
);

COMMENT ON TABLE public.expense_payments IS 'Records payments between group members to settle debts';
COMMENT ON COLUMN public.expense_payments.from_user_id IS 'User who is making the payment';
COMMENT ON COLUMN public.expense_payments.to_user_id IS 'User who is receiving the payment';
COMMENT ON COLUMN public.expense_payments.amount IS 'Amount paid';
COMMENT ON COLUMN public.expense_payments.description IS 'Optional note about the payment';

-- ============================================
-- TABLE: group_notes
-- Collaborative notes for groups
-- ============================================

CREATE TABLE public.group_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES public.travel_groups(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'Untitled Note',
  content TEXT,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  last_edited_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.group_notes IS 'Collaborative notes for travel groups';

-- ============================================
-- INDEXES
-- Indexes for better query performance
-- ============================================

-- Users indexes
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_email ON public.users(email);

-- Travel packages indexes
CREATE INDEX idx_travel_packages_active ON public.travel_packages(is_active) WHERE is_active = true;
CREATE INDEX idx_travel_packages_featured ON public.travel_packages(is_featured, is_active) WHERE is_featured = true AND is_active = true;
CREATE INDEX idx_travel_packages_destination ON public.travel_packages(destination);
CREATE INDEX idx_travel_packages_created_by ON public.travel_packages(created_by);

-- Package itinerary items indexes
CREATE INDEX idx_package_itinerary_package_id ON public.package_itinerary_items(package_id);
CREATE INDEX idx_package_itinerary_day ON public.package_itinerary_items(package_id, day_number);
CREATE INDEX idx_package_itinerary_coordinates ON public.package_itinerary_items(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX idx_package_itinerary_images ON public.package_itinerary_items(image_url) WHERE image_url IS NOT NULL;
CREATE INDEX idx_package_itinerary_items_landing ON public.package_itinerary_items(package_id, show_in_landing) WHERE show_in_landing = true;

-- Package included/excluded items indexes
CREATE INDEX idx_package_included_items_package_id ON public.package_included_items(package_id);
CREATE INDEX idx_package_included_items_order ON public.package_included_items(package_id, order_index);
CREATE INDEX idx_package_excluded_items_package_id ON public.package_excluded_items(package_id);
CREATE INDEX idx_package_excluded_items_order ON public.package_excluded_items(package_id, order_index);

-- Travel groups indexes
CREATE INDEX idx_travel_groups_created_by ON public.travel_groups(created_by);
CREATE INDEX idx_travel_groups_source_package ON public.travel_groups(source_package_id);
CREATE INDEX idx_travel_groups_dates ON public.travel_groups(start_date, end_date);

-- Group members indexes
CREATE INDEX idx_group_members_group_id ON public.group_members(group_id);
CREATE INDEX idx_group_members_user_id ON public.group_members(user_id);
CREATE INDEX idx_group_members_role ON public.group_members(group_id, role);

-- Itinerary items indexes
CREATE INDEX idx_itinerary_items_group_id ON public.itinerary_items(group_id);
CREATE INDEX idx_itinerary_items_date ON public.itinerary_items(date);
CREATE INDEX idx_itinerary_items_group_date ON public.itinerary_items(group_id, date);

-- Travel documents indexes
CREATE INDEX idx_travel_documents_group_id ON public.travel_documents(group_id);
CREATE INDEX idx_travel_documents_type ON public.travel_documents(group_id, document_type);

-- Photos indexes
CREATE INDEX idx_photos_group_id ON public.photos(group_id);
CREATE INDEX idx_photos_uploaded_by ON public.photos(uploaded_by);

-- Photo comments indexes
CREATE INDEX idx_photo_comments_photo_id ON public.photo_comments(photo_id);
CREATE INDEX idx_photo_comments_user_id ON public.photo_comments(user_id);

-- Expenses indexes
CREATE INDEX idx_expenses_group_id ON public.expenses(group_id);
CREATE INDEX idx_expenses_paid_by ON public.expenses(paid_by);
CREATE INDEX idx_expenses_date ON public.expenses(date);

-- Expense splits indexes
CREATE INDEX idx_expense_splits_expense_id ON public.expense_splits(expense_id);
CREATE INDEX idx_expense_splits_user_id ON public.expense_splits(user_id);
CREATE INDEX idx_expense_splits_settled ON public.expense_splits(user_id, is_settled);

-- Expense payments indexes
CREATE INDEX idx_expense_payments_group_id ON public.expense_payments(group_id);
CREATE INDEX idx_expense_payments_from_user ON public.expense_payments(from_user_id);
CREATE INDEX idx_expense_payments_to_user ON public.expense_payments(to_user_id);
CREATE INDEX idx_expense_payments_date ON public.expense_payments(payment_date);

-- Group notes indexes
CREATE INDEX idx_group_notes_group_id ON public.group_notes(group_id);
CREATE INDEX idx_group_notes_created_by ON public.group_notes(created_by);

-- ============================================
-- FUNCTIONS
-- Helper functions for RLS and automation
-- ============================================

-- Function: Check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT role = 'admin' FROM public.users WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER;

COMMENT ON FUNCTION is_admin(UUID) IS 'Check if a user has admin role';

-- Function: Check if user is member of group
CREATE OR REPLACE FUNCTION is_group_member(user_id UUID, group_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_members.user_id = $1 AND group_members.group_id = $2
  );
$$ LANGUAGE SQL SECURITY DEFINER;

COMMENT ON FUNCTION is_group_member(UUID, UUID) IS 'Check if user is a member of a group';

-- Function: Check if user is leader of group
CREATE OR REPLACE FUNCTION is_group_leader(user_id UUID, group_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_members.user_id = $1
    AND group_members.group_id = $2
    AND group_members.role = 'leader'
  );
$$ LANGUAGE SQL SECURITY DEFINER;

COMMENT ON FUNCTION is_group_leader(UUID, UUID) IS 'Check if user is a leader of a group';

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column() IS 'Automatically update updated_at timestamp on row update';

-- Function: Create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically create user profile when new auth user is created';

-- ============================================
-- TRIGGERS
-- Automated actions on data changes
-- ============================================

-- Trigger: Create user profile on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: Update updated_at on users
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on travel_packages
CREATE TRIGGER update_travel_packages_updated_at
  BEFORE UPDATE ON public.travel_packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on package_itinerary_items
CREATE TRIGGER update_package_itinerary_items_updated_at
  BEFORE UPDATE ON public.package_itinerary_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on package_included_items
CREATE TRIGGER update_package_included_items_updated_at
  BEFORE UPDATE ON public.package_included_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on package_excluded_items
CREATE TRIGGER update_package_excluded_items_updated_at
  BEFORE UPDATE ON public.package_excluded_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on travel_groups
CREATE TRIGGER update_travel_groups_updated_at
  BEFORE UPDATE ON public.travel_groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on itinerary_items
CREATE TRIGGER update_itinerary_items_updated_at
  BEFORE UPDATE ON public.itinerary_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on expenses
CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on expense_payments
CREATE TRIGGER update_expense_payments_updated_at
  BEFORE UPDATE ON public.expense_payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on group_notes
CREATE TRIGGER update_group_notes_updated_at
  BEFORE UPDATE ON public.group_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- Enable RLS on all tables
-- ============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_itinerary_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_included_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_excluded_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itinerary_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_notes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES: users
-- ============================================

CREATE POLICY "Users can view all users"
  ON public.users FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can do everything on users"
  ON public.users FOR ALL
  USING (is_admin(auth.uid()));

-- ============================================
-- RLS POLICIES: travel_packages
-- ============================================

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
-- RLS POLICIES: package_itinerary_items
-- ============================================

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
-- RLS POLICIES: package_included_items
-- ============================================

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

-- ============================================
-- RLS POLICIES: package_excluded_items
-- ============================================

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
-- RLS POLICIES: travel_groups
-- ============================================

CREATE POLICY "Users can view their groups"
  ON public.travel_groups FOR SELECT
  USING (
    is_admin(auth.uid()) OR
    is_group_member(auth.uid(), id)
  );

CREATE POLICY "Only admins can create groups"
  ON public.travel_groups FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins and leaders can update groups"
  ON public.travel_groups FOR UPDATE
  USING (
    is_admin(auth.uid()) OR
    is_group_leader(auth.uid(), id)
  );

CREATE POLICY "Admins can delete groups"
  ON public.travel_groups FOR DELETE
  USING (is_admin(auth.uid()));

-- ============================================
-- RLS POLICIES: group_members
-- ============================================

CREATE POLICY "Users can view members of their groups"
  ON public.group_members FOR SELECT
  USING (
    is_admin(auth.uid()) OR
    is_group_member(auth.uid(), group_id)
  );

CREATE POLICY "Admins and leaders can add members"
  ON public.group_members FOR INSERT
  WITH CHECK (
    is_admin(auth.uid()) OR
    is_group_leader(auth.uid(), group_id)
  );

CREATE POLICY "Admins and leaders can update members"
  ON public.group_members FOR UPDATE
  USING (
    is_admin(auth.uid()) OR
    is_group_leader(auth.uid(), group_id)
  );

CREATE POLICY "Admins and leaders can remove members"
  ON public.group_members FOR DELETE
  USING (
    is_admin(auth.uid()) OR
    is_group_leader(auth.uid(), group_id)
  );

-- ============================================
-- RLS POLICIES: itinerary_items
-- ============================================

CREATE POLICY "Members can view group itinerary"
  ON public.itinerary_items FOR SELECT
  USING (
    is_admin(auth.uid()) OR
    is_group_member(auth.uid(), group_id)
  );

CREATE POLICY "Members can create itinerary items"
  ON public.itinerary_items FOR INSERT
  WITH CHECK (
    is_admin(auth.uid()) OR
    is_group_member(auth.uid(), group_id)
  );

CREATE POLICY "Members can update itinerary items"
  ON public.itinerary_items FOR UPDATE
  USING (
    is_admin(auth.uid()) OR
    is_group_member(auth.uid(), group_id)
  );

CREATE POLICY "Leaders can delete itinerary items"
  ON public.itinerary_items FOR DELETE
  USING (
    is_admin(auth.uid()) OR
    is_group_leader(auth.uid(), group_id)
  );

-- ============================================
-- RLS POLICIES: travel_documents
-- ============================================

CREATE POLICY "Members can view group documents"
  ON public.travel_documents FOR SELECT
  USING (
    is_admin(auth.uid()) OR
    is_group_member(auth.uid(), group_id)
  );

CREATE POLICY "Members can upload documents"
  ON public.travel_documents FOR INSERT
  WITH CHECK (
    is_admin(auth.uid()) OR
    is_group_member(auth.uid(), group_id)
  );

CREATE POLICY "Admins and uploaders can delete documents"
  ON public.travel_documents FOR DELETE
  USING (
    is_admin(auth.uid()) OR
    uploaded_by = auth.uid()
  );

-- ============================================
-- RLS POLICIES: photos
-- ============================================

CREATE POLICY "Members can view group photos"
  ON public.photos FOR SELECT
  USING (
    is_admin(auth.uid()) OR
    is_group_member(auth.uid(), group_id)
  );

CREATE POLICY "Members can upload photos"
  ON public.photos FOR INSERT
  WITH CHECK (
    is_admin(auth.uid()) OR
    is_group_member(auth.uid(), group_id)
  );

CREATE POLICY "Users can update own photos"
  ON public.photos FOR UPDATE
  USING (
    is_admin(auth.uid()) OR
    uploaded_by = auth.uid()
  );

CREATE POLICY "Users can delete own photos"
  ON public.photos FOR DELETE
  USING (
    is_admin(auth.uid()) OR
    uploaded_by = auth.uid()
  );

-- ============================================
-- RLS POLICIES: photo_comments
-- ============================================

CREATE POLICY "Members can view photo comments"
  ON public.photo_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.photos
      WHERE photos.id = photo_id
      AND (is_admin(auth.uid()) OR is_group_member(auth.uid(), photos.group_id))
    )
  );

CREATE POLICY "Members can create comments"
  ON public.photo_comments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.photos
      WHERE photos.id = photo_id
      AND (is_admin(auth.uid()) OR is_group_member(auth.uid(), photos.group_id))
    )
  );

CREATE POLICY "Users can delete own comments"
  ON public.photo_comments FOR DELETE
  USING (
    is_admin(auth.uid()) OR
    user_id = auth.uid()
  );

-- ============================================
-- RLS POLICIES: expenses
-- ============================================

CREATE POLICY "Members can view group expenses"
  ON public.expenses FOR SELECT
  USING (
    is_admin(auth.uid()) OR
    is_group_member(auth.uid(), group_id)
  );

CREATE POLICY "Members can create expenses"
  ON public.expenses FOR INSERT
  WITH CHECK (
    is_admin(auth.uid()) OR
    is_group_member(auth.uid(), group_id)
  );

CREATE POLICY "Members can update expenses"
  ON public.expenses FOR UPDATE
  USING (
    is_admin(auth.uid()) OR
    is_group_member(auth.uid(), group_id)
  );

CREATE POLICY "Creators and admins can delete expenses"
  ON public.expenses FOR DELETE
  USING (
    is_admin(auth.uid()) OR
    paid_by = auth.uid()
  );

-- ============================================
-- RLS POLICIES: expense_splits
-- ============================================

CREATE POLICY "Users can view expense splits"
  ON public.expense_splits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.expenses
      WHERE expenses.id = expense_id
      AND (is_admin(auth.uid()) OR is_group_member(auth.uid(), expenses.group_id))
    )
  );

CREATE POLICY "Members can create splits"
  ON public.expense_splits FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.expenses
      WHERE expenses.id = expense_id
      AND (is_admin(auth.uid()) OR is_group_member(auth.uid(), expenses.group_id))
    )
  );

CREATE POLICY "Members can update splits"
  ON public.expense_splits FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.expenses
      WHERE expenses.id = expense_id
      AND (is_admin(auth.uid()) OR is_group_member(auth.uid(), expenses.group_id))
    )
  );

CREATE POLICY "Admins can delete splits"
  ON public.expense_splits FOR DELETE
  USING (is_admin(auth.uid()));

-- ============================================
-- RLS POLICIES: expense_payments
-- ============================================

CREATE POLICY "Members can view group payments"
  ON public.expense_payments FOR SELECT
  USING (
    is_admin(auth.uid()) OR
    is_group_member(auth.uid(), group_id)
  );

CREATE POLICY "Members can create payments"
  ON public.expense_payments FOR INSERT
  WITH CHECK (
    (is_admin(auth.uid()) OR is_group_member(auth.uid(), group_id))
    AND from_user_id = auth.uid()
  );

CREATE POLICY "Users can update own payments"
  ON public.expense_payments FOR UPDATE
  USING (
    is_admin(auth.uid()) OR
    created_by = auth.uid()
  );

CREATE POLICY "Users and leaders can delete payments"
  ON public.expense_payments FOR DELETE
  USING (
    is_admin(auth.uid()) OR
    is_group_leader(auth.uid(), group_id) OR
    created_by = auth.uid()
  );

-- ============================================
-- RLS POLICIES: group_notes
-- ============================================

CREATE POLICY "Members can view group notes"
  ON public.group_notes FOR SELECT
  USING (
    is_admin(auth.uid()) OR
    is_group_member(auth.uid(), group_id)
  );

CREATE POLICY "Members can create group notes"
  ON public.group_notes FOR INSERT
  WITH CHECK (
    is_admin(auth.uid()) OR
    is_group_member(auth.uid(), group_id)
  );

CREATE POLICY "Members can update group notes"
  ON public.group_notes FOR UPDATE
  USING (
    is_admin(auth.uid()) OR
    is_group_member(auth.uid(), group_id)
  );

CREATE POLICY "Note creators and leaders can delete notes"
  ON public.group_notes FOR DELETE
  USING (
    is_admin(auth.uid()) OR
    is_group_leader(auth.uid(), group_id) OR
    created_by = auth.uid()
  );

-- ============================================
-- COMPLETE
-- Schema creation complete
-- ============================================

-- This schema can be executed on an empty PostgreSQL database
-- to create the complete TravelHub database structure.
--
-- Next steps:
-- 1. Run this schema file: psql -d your_db -f schema.sql
-- 2. Configure Supabase Storage buckets (see supabase/storage-setup.sql)
-- 3. Create first admin user via Supabase Dashboard
-- 4. Test the application
