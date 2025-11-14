# Update Database Schema

Guide for modifying the TravelHub database schema safely.

## Process

When you need to add/modify database tables or columns:

1. **Plan the Change**
   - What tables/columns are affected?
   - What are the data types?
   - Are foreign keys needed?
   - What should be nullable vs required?
   - Are indexes needed for performance?

2. **Create Migration SQL**
   - Write SQL for the changes
   - Include rollback SQL (how to undo)
   - Consider existing data

3. **Update TypeScript Types**
   - Modify `lib/types/database.types.ts`
   - Update Table types (Row, Insert, Update)
   - Add/update convenience types
   - Export new types

4. **Update RLS Policies**
   - Add policies for new tables
   - Modify existing policies if needed
   - Test policies with different roles

5. **Update Documentation**
   - Add to schema.sql comments
   - Update RESUMEN.md if significant

## Migration Template

\`\`\`sql
-- Migration: [Description]
-- Date: [YYYY-MM-DD]

-- ============================================
-- ADD NEW TABLE
-- ============================================
CREATE TABLE public.new_table (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  group_id UUID REFERENCES public.travel_groups(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for performance
CREATE INDEX idx_new_table_group_id ON public.new_table(group_id);

-- Trigger for updated_at
CREATE TRIGGER update_new_table_updated_at
  BEFORE UPDATE ON public.new_table
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS POLICIES
-- ============================================
ALTER TABLE public.new_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view table"
  ON public.new_table FOR SELECT
  USING (
    is_admin(auth.uid()) OR
    is_group_member(auth.uid(), group_id)
  );

CREATE POLICY "Members can insert into table"
  ON public.new_table FOR INSERT
  WITH CHECK (
    is_admin(auth.uid()) OR
    is_group_member(auth.uid(), group_id)
  );

-- ============================================
-- ROLLBACK (if needed)
-- ============================================
-- DROP TABLE public.new_table CASCADE;
\`\`\`

## Adding a Column

\`\`\`sql
-- Add column
ALTER TABLE public.table_name
ADD COLUMN new_column TEXT;

-- Make it required (if needed, be careful with existing data)
-- ALTER TABLE public.table_name
-- ALTER COLUMN new_column SET NOT NULL;

-- Add default value
ALTER TABLE public.table_name
ALTER COLUMN new_column SET DEFAULT 'default_value';

-- Rollback
-- ALTER TABLE public.table_name DROP COLUMN new_column;
\`\`\`

## Modifying a Column

\`\`\`sql
-- Change column type
ALTER TABLE public.table_name
ALTER COLUMN column_name TYPE new_type;

-- Change to nullable
ALTER TABLE public.table_name
ALTER COLUMN column_name DROP NOT NULL;

-- Change to required
ALTER TABLE public.table_name
ALTER COLUMN column_name SET NOT NULL;

-- Rename column
ALTER TABLE public.table_name
RENAME COLUMN old_name TO new_name;
\`\`\`

## TypeScript Types Template

After database changes, update `lib/types/database.types.ts`:

\`\`\`typescript
export interface Database {
  public: {
    Tables: {
      new_table: {
        Row: {
          id: string
          name: string
          group_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          group_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          group_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      // ... other tables
    }
  }
}

// Convenience type
export type NewTable = Database['public']['Tables']['new_table']['Row']
\`\`\`

## Safety Checklist

- [ ] Backup considered (Supabase has automatic backups)
- [ ] Migration SQL tested in development
- [ ] TypeScript types updated
- [ ] RLS policies added/updated
- [ ] Foreign keys have ON DELETE behavior specified
- [ ] Indexes added for foreign keys and frequently queried columns
- [ ] Nullable vs NOT NULL carefully considered
- [ ] Default values set where appropriate
- [ ] Rollback SQL prepared
- [ ] Documentation updated

## Testing Migration

1. Apply migration in Supabase SQL Editor
2. Verify tables/columns appear in database
3. Test RLS policies with different roles:
   \`\`\`sql
   -- Test as regular user
   SET LOCAL ROLE authenticated;
   SET LOCAL request.jwt.claims.sub = 'user-uuid-here';
   SELECT * FROM new_table;
   \`\`\`
4. Update TypeScript types and verify no compilation errors
5. Test in application with actual data

## Common Patterns

### One-to-Many Relationship
\`\`\`sql
-- Child table references parent
CREATE TABLE child (
  id UUID PRIMARY KEY,
  parent_id UUID REFERENCES parent(id) ON DELETE CASCADE
);
\`\`\`

### Many-to-Many Relationship
\`\`\`sql
-- Junction table
CREATE TABLE table_a_table_b (
  table_a_id UUID REFERENCES table_a(id) ON DELETE CASCADE,
  table_b_id UUID REFERENCES table_b(id) ON DELETE CASCADE,
  PRIMARY KEY (table_a_id, table_b_id)
);
\`\`\`

### Soft Delete
\`\`\`sql
ALTER TABLE table_name
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;

-- Update RLS to exclude deleted
CREATE POLICY "Only non-deleted visible"
  ON table_name FOR SELECT
  USING (deleted_at IS NULL);
\`\`\`

## Remember

- Always test migrations in development first
- Consider impact on existing data
- Update all related TypeScript types
- Add appropriate RLS policies
- Document significant schema changes
- Keep rollback SQL handy
