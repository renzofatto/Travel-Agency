-- ============================================
-- MIGRATION: Add created_by column to group_notes
-- This allows tracking who created each note, not just who edited it last
-- ============================================

-- Add created_by column
ALTER TABLE public.group_notes
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- Set created_by for existing notes to last_edited_by (if any exist)
UPDATE public.group_notes
SET created_by = last_edited_by
WHERE created_by IS NULL AND last_edited_by IS NOT NULL;

-- Remove the UNIQUE constraint on group_id to allow multiple notes per group
ALTER TABLE public.group_notes
DROP CONSTRAINT IF EXISTS group_notes_group_id_key;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_group_notes_created_by ON public.group_notes(created_by);
CREATE INDEX IF NOT EXISTS idx_group_notes_group_id ON public.group_notes(group_id);

-- Update the title default to something more generic
ALTER TABLE public.group_notes
ALTER COLUMN title SET DEFAULT 'Untitled Note';
