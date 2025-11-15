-- ============================================
-- MIGRATION: Change difficulty_level to category
-- Date: 2025-11-16
-- Description: Replace difficulty_level column with category column in travel_packages
-- ============================================

-- Step 1: Add new category column (optional, allows NULL initially)
ALTER TABLE public.travel_packages
ADD COLUMN IF NOT EXISTS category VARCHAR(50) CHECK (category IN ('adventure', 'culture', 'luxury', 'relaxation', 'nature', 'beach', 'city', 'family'));

-- Step 2: Migrate existing data (optional mapping from difficulty to category)
-- This is optional - you can skip this if you want to set categories manually
UPDATE public.travel_packages
SET category = CASE
  WHEN difficulty_level = 'easy' THEN 'relaxation'
  WHEN difficulty_level = 'moderate' THEN 'nature'
  WHEN difficulty_level = 'challenging' THEN 'adventure'
  ELSE NULL
END
WHERE difficulty_level IS NOT NULL AND category IS NULL;

-- Step 3: Drop old difficulty_level column
ALTER TABLE public.travel_packages
DROP COLUMN IF EXISTS difficulty_level;

-- Step 4: Add comment to new column
COMMENT ON COLUMN public.travel_packages.category IS 'Package category: adventure, culture, luxury, relaxation, nature, beach, city, family';

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Notes:
-- - The migration maps old difficulty levels to new categories:
--   * easy -> relaxation
--   * moderate -> nature
--   * challenging -> adventure
-- - You may want to manually review and adjust categories after migration
-- - The category field remains optional (NULL allowed)
