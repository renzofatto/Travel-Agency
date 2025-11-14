# Group Notes Migration Guide

## Problem

The `group_notes` table was missing the `created_by` column, which is needed to track who created each note. The original schema only had `last_edited_by` and a `UNIQUE(group_id)` constraint that limited each group to one note.

## Solution

We need to update the database schema to:
1. Add `created_by` column
2. Remove the `UNIQUE(group_id)` constraint to allow multiple notes per group
3. Update the RLS policy to allow note creators to delete their own notes

## How to Apply the Migration

### Option 1: Run the Migration Script (Recommended)

1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase/migrations/add_notes_created_by.sql`
4. Click **Run**

### Option 2: Manual Steps via SQL Editor

Run these SQL commands in order:

```sql
-- Step 1: Add created_by column
ALTER TABLE public.group_notes
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- Step 2: Set created_by for existing notes
UPDATE public.group_notes
SET created_by = last_edited_by
WHERE created_by IS NULL AND last_edited_by IS NOT NULL;

-- Step 3: Remove UNIQUE constraint on group_id
ALTER TABLE public.group_notes
DROP CONSTRAINT IF EXISTS group_notes_group_id_key;

-- Step 4: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_group_notes_created_by ON public.group_notes(created_by);
CREATE INDEX IF NOT EXISTS idx_group_notes_group_id ON public.group_notes(group_id);

-- Step 5: Update title default
ALTER TABLE public.group_notes
ALTER COLUMN title SET DEFAULT 'Untitled Note';

-- Step 6: Update RLS policy for deletion
DROP POLICY IF EXISTS "Leaders can delete group notes" ON public.group_notes;

CREATE POLICY "Note creators and leaders can delete notes"
  ON public.group_notes FOR DELETE
  USING (
    is_admin(auth.uid()) OR
    is_group_leader(auth.uid(), group_id) OR
    created_by = auth.uid()
  );
```

## Verification

After running the migration, verify it worked:

```sql
-- Check the table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'group_notes'
ORDER BY ordinal_position;

-- You should see these columns:
-- - id (uuid)
-- - group_id (uuid)
-- - title (text)
-- - content (text)
-- - created_by (uuid)  ← NEW
-- - last_edited_by (uuid)
-- - created_at (timestamp with time zone)
-- - updated_at (timestamp with time zone)

-- Check that the UNIQUE constraint was removed
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'group_notes';

-- You should NOT see a unique constraint on group_id
```

## What Changed

### Before
- One note per group only (UNIQUE constraint)
- No `created_by` field
- Only leaders/admins could delete notes

### After
- Multiple notes per group allowed
- `created_by` field tracks note creator
- Note creators can also delete their own notes
- Leaders and admins can still delete any note

## Schema Files Updated

The following files have been updated to reflect these changes:

1. **supabase/schema.sql** - Main schema definition
2. **supabase/rls-policies.sql** - Updated DELETE policy
3. **supabase/migrations/add_notes_created_by.sql** - Migration script

## Features

With these changes, the Notes feature now supports:

✅ Multiple notes per group
✅ Track who created each note
✅ Track who last edited each note
✅ Creators can delete their own notes
✅ Leaders can delete any note in their group
✅ Admins can delete any note
✅ All group members can create and edit notes

## Testing

After applying the migration, test the notes feature:

1. Navigate to a group
2. Click on the **Notes** tab
3. Create a new note
4. Verify you can edit your note
5. Verify you can delete your note
6. Have another member create a note
7. Verify you can edit it but not delete it (unless you're a leader)

## Troubleshooting

### Error: "relation already exists"
This means the column or index already exists. You can safely ignore this error or modify the script to use `IF NOT EXISTS` clauses.

### Error: "constraint does not exist"
This means the UNIQUE constraint was already removed or never existed. You can safely ignore this error.

### Still getting "Could not find a relationship" error
Make sure you've run all the SQL commands and refresh your browser. You may also need to restart your Next.js development server.
