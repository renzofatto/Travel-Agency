# TravelHub Development Agent

You are a specialized development agent for the **TravelHub** project - a comprehensive web platform for managing group travel.

## Project Overview

TravelHub is a Next.js 14+ application that allows users to organize group trips with friends, family, or strangers. It provides tools for:
- Trip itinerary planning with drag & drop
- Expense splitting (Splitwise-style)
- Document management (tickets, reservations)
- Shared photo gallery
- Collaborative notes
- Role-based access control (admin, leader, member)

## Tech Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, Shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation
- **UI Libraries**: Lucide React (icons), Sonner (toasts), Recharts (charts), @dnd-kit (drag & drop)

## Project Structure

```
travel-agency/
├── app/                        # Next.js App Router
│   ├── auth/                   # ✅ Authentication pages
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── dashboard/              # ✅ IMPLEMENTED - User dashboard
│   │   ├── page.tsx            # Main dashboard page
│   │   ├── layout.tsx          # Dashboard layout with navbar & sidebar
│   │   ├── loading.tsx         # Loading states
│   │   ├── error.tsx           # Error handling
│   │   └── groups/new/page.tsx # Create group page
│   ├── groups/[id]/            # ✅ IMPLEMENTED - Group pages
│   │   ├── layout.tsx          # Group layout with tabs
│   │   ├── page.tsx            # Group overview
│   │   ├── members/page.tsx    # Member management
│   │   ├── settings/page.tsx   # Group settings
│   │   ├── itinerary/page.tsx  # Itinerary page
│   │   ├── expenses/
│   │   │   ├── page.tsx        # Expenses list
│   │   │   └── balances/page.tsx # Balance dashboard
│   │   ├── documents/page.tsx  # ✅ IMPLEMENTED - Documents page
│   │   └── photos/page.tsx     # ✅ IMPLEMENTED - Photos page
│   ├── admin/                  # Admin panel (TO BE IMPLEMENTED)
│   ├── layout.tsx
│   ├── page.tsx                # Landing page
│   └── globals.css
├── components/
│   ├── ui/                     # Shadcn/ui components (14 installed)
│   ├── layout/                 # ✅ Layout components
│   │   ├── navbar.tsx          # Top navigation with user menu
│   │   └── sidebar.tsx         # Side navigation (responsive)
│   ├── groups/                 # ✅ Group components
│   │   ├── group-card.tsx
│   │   ├── group-list.tsx
│   │   ├── group-form.tsx
│   │   ├── add-member-dialog.tsx
│   │   └── member-card.tsx
│   ├── itinerary/              # ✅ Itinerary components
│   │   ├── itinerary-form.tsx
│   │   ├── itinerary-item-card.tsx
│   │   └── add-itinerary-dialog.tsx
│   ├── expenses/               # ✅ Expense components
│   │   ├── expense-form.tsx
│   │   ├── expense-card.tsx
│   │   ├── add-expense-dialog.tsx
│   │   ├── balance-dashboard.tsx
│   │   └── settle-button.tsx
│   ├── documents/              # ✅ Document components
│   │   ├── upload-document-dialog.tsx
│   │   └── document-card.tsx
│   └── photos/                 # ✅ Photo components
│       ├── upload-photos-dialog.tsx
│       ├── photo-grid.tsx
│       ├── photo-modal.tsx
│       └── photo-comments.tsx
├── lib/
│   ├── supabase/               # Supabase clients
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── types/
│   │   └── database.types.ts
│   ├── actions/                # ✅ Server actions
│   │   ├── group-actions.ts
│   │   ├── member-actions.ts
│   │   ├── itinerary-actions.ts
│   │   ├── expense-actions.ts
│   │   ├── document-actions.ts
│   │   └── photo-actions.ts
│   ├── validations/            # ✅ Zod schemas
│   │   ├── group.ts
│   │   ├── itinerary.ts
│   │   ├── expense.ts
│   │   ├── document.ts
│   │   └── photo.ts
│   ├── utils/
│   │   └── expense-calculator.ts # ✅ Balance calculations
│   └── utils.ts
├── hooks/                      # Custom React hooks
├── supabase/
│   ├── schema.sql              # Complete database schema
│   └── rls-policies.sql        # Security policies
└── middleware.ts               # Next.js middleware
```

## Database Schema

### Tables (10 total):
1. **users** - User profiles (extends auth.users)
   - Columns: id, email, full_name, avatar_url, role
   - Roles: 'admin', 'user'

2. **travel_groups** - Travel groups
   - Columns: id, name, description, destination, start_date, end_date, cover_image, created_by

3. **group_members** - Group membership with roles
   - Columns: id, group_id, user_id, role, joined_at
   - Roles: 'leader', 'member'

4. **itinerary_items** - Daily activities
   - Columns: id, group_id, title, description, date, start_time, end_time, location, category, order_index
   - Categories: transport, accommodation, activity, food, other

5. **travel_documents** - Trip documents
   - Columns: id, group_id, title, file_url, document_type, uploaded_by
   - Types: flight, bus, train, hotel, activity, other

6. **photos** - Trip photos
   - Columns: id, group_id, file_url, caption, uploaded_by, uploaded_at

7. **photo_comments** - Comments on photos
   - Columns: id, photo_id, user_id, comment

8. **expenses** - Group expenses
   - Columns: id, group_id, description, amount, currency, category, paid_by, split_type
   - Split types: equal, percentage, custom
   - Categories: transport, accommodation, food, activity, shopping, other

9. **expense_splits** - How expenses are divided
   - Columns: id, expense_id, user_id, amount_owed, percentage, is_settled

10. **group_notes** - Collaborative notes
    - Columns: id, group_id, title, content, last_edited_by

### Key Relationships:
- Users create groups (travel_groups.created_by → users.id)
- Groups have members (group_members: many-to-many)
- All content belongs to groups (foreign keys to travel_groups)

## Security Model (RLS Policies)

### Helper Functions:
- `is_admin(user_id)` - Check if user is admin
- `is_group_member(user_id, group_id)` - Check group membership
- `is_group_leader(user_id, group_id)` - Check if user is group leader

### Permission Rules:
- **Admins**: Can do everything
- **Leaders**: Can manage their groups, add/remove members, assign leaders
- **Members**: Can view and contribute content, but not manage group settings

### RLS Policies Applied:
- Users can only see groups they're members of
- Only group members can view group content
- Only leaders/admins can modify group settings
- Users can delete their own uploaded content

## Current Implementation Status

### ✅ COMPLETED (Phase 1 - Infrastructure):
- Project setup and configuration
- Database schema and RLS policies
- TypeScript types for all tables
- Supabase integration (client, server, middleware)
- Authentication system (login, register)
- Landing page with features
- 14 Shadcn/ui components installed
- Build passing successfully

### ✅ COMPLETED (Phase 2 - Dashboard):
- **Dashboard Layout** (implemented 2025-11-14)
  - Responsive layout with navbar and sidebar
  - User profile menu with avatar
  - Mobile-friendly collapsible sidebar
  - Admin badge for admin users
- **Group Listings** (implemented 2025-11-14)
  - Fetch groups with RLS policies
  - Group cards with cover images, dates, destination
  - Status badges (upcoming, active, past)
  - Role badges (leader, member)
  - Member count display
  - Statistics cards (total, upcoming, active)
  - Filter tabs (all, upcoming, active, past)
- **Navigation Components** (implemented 2025-11-14)
  - Top navbar with user dropdown
  - Sidebar with main navigation links
  - Responsive mobile menu
- **Empty States** (implemented 2025-11-14)
  - No groups placeholder with CTA
  - Create group button

### ✅ COMPLETED (Phase 3 - Group Management):
- **CRUD Operations** (implemented 2025-11-14)
  - Create group with validation (lib/actions/group-actions.ts)
  - Edit group (only leaders/admins)
  - Delete group (only admins)
  - Image upload to Supabase Storage
  - Server actions with RLS enforcement
- **Group Pages** (implemented 2025-11-14)
  - Group detail layout with tabs (app/groups/[id]/layout.tsx)
  - Overview page (app/groups/[id]/page.tsx)
  - Settings page (app/groups/[id]/settings/page.tsx)
  - Tab navigation (Overview, Members, Itinerary, Expenses, Documents, Photos, Settings)
- **Member Management** (implemented 2025-11-14)
  - Add members by email (lib/actions/member-actions.ts)
  - Remove members
  - Assign/revoke leader role
  - Member list with avatars and roles (app/groups/[id]/members/page.tsx)
- **Components** (implemented 2025-11-14)
  - GroupForm - Reusable create/edit form
  - AddMemberDialog - Add member modal
  - MemberCard - Member display with actions

### ✅ COMPLETED (Phase 4 - Itinerary System):
- **CRUD Operations** (implemented 2025-11-14)
  - Create/edit/delete activities (lib/actions/itinerary-actions.ts)
  - 5 categories with emojis (transport, accommodation, activity, food, other)
  - Date, time, location fields
  - Order index for sorting
- **Itinerary Page** (implemented 2025-11-14)
  - Date-grouped view (app/groups/[id]/itinerary/page.tsx)
  - Activities sorted by date and order
  - Expandable activity cards
- **Components** (implemented 2025-11-14)
  - ItineraryForm - Create/edit form with validation
  - ItineraryItemCard - Activity card with actions
  - AddItineraryDialog - Modal for adding activities
- **Validation** (implemented 2025-11-14)
  - Zod schemas (lib/validations/itinerary.ts)
  - Time validation (end after start)
  - Required fields

### ✅ COMPLETED (Phase 5 - Expense System):
- **Expense Tracking** (implemented 2025-11-14)
  - Create/edit/delete expenses (lib/actions/expense-actions.ts)
  - 3 split types: equal, percentage, custom
  - 7 currencies: USD, EUR, GBP, JPY, ARS, BRL, MXN
  - 6 categories: transport, accommodation, food, activity, shopping, other
  - Automatic split calculation (lib/utils/expense-calculator.ts)
- **Balance Calculations** (implemented 2025-11-14)
  - Real-time balance calculation per member
  - Settlement suggestions (minimize transactions)
  - Greedy algorithm for optimal settlements
  - Who owes whom breakdown
- **Settle Up** (implemented 2025-11-14)
  - Mark individual splits as settled
  - Visual status (settled/pending)
  - Per-user settle button
- **Pages** (implemented 2025-11-14)
  - Expenses list (app/groups/[id]/expenses/page.tsx)
  - Balance dashboard (app/groups/[id]/expenses/balances/page.tsx)
- **Components** (implemented 2025-11-14)
  - ExpenseForm - Multi-split form with real-time validation
  - ExpenseCard - Expandable expense card
  - BalanceDashboard - Balance and settlement view
  - SettleButton - Mark as settled button
  - AddExpenseDialog - Create expense modal
- **Validation** (implemented 2025-11-14)
  - Zod schemas (lib/validations/expense.ts)
  - Percentage sum validation (must equal 100%)
  - Custom amounts validation (must equal total)

### ✅ COMPLETED (Phase 6 - Documents & Photos):
- **Document Management** (implemented 2025-11-14)
  - Upload documents (PDF, images, Word) (lib/actions/document-actions.ts)
  - 6 document types: flight, bus, train, hotel, activity, other
  - File validation (type and size 10MB max)
  - Download documents
  - Delete documents (owner/admin only)
  - Group by document type
  - Stats dashboard (total, categories, storage used)
- **Photo Gallery** (implemented 2025-11-14)
  - Multi-photo upload with preview (lib/actions/photo-actions.ts)
  - Image validation (JPG, PNG, WEBP, 10MB max)
  - Optional caption for photos
  - Responsive grid layout (2-4 columns)
  - Lightbox modal with navigation (keyboard & arrows)
  - Delete photos (owner/admin only)
  - Stats dashboard (total photos, comments, contributors)
- **Photo Comments** (implemented 2025-11-14)
  - Add comments on photos
  - Delete comments (owner/admin only)
  - Relative timestamps (e.g., "2h ago")
  - Real-time comment count
- **Pages** (implemented 2025-11-14)
  - Documents page (app/groups/[id]/documents/page.tsx)
  - Photos page (app/groups/[id]/photos/page.tsx)
- **Components** (implemented 2025-11-14)
  - UploadDocumentDialog - Single file upload modal
  - DocumentCard - Document display with actions
  - UploadPhotosDialog - Multi-file upload with preview
  - PhotoGrid - Responsive photo grid with hover overlay
  - PhotoModal - Lightbox with navigation and info sidebar
  - PhotoComments - Comment list and form
- **Storage** (implemented 2025-11-14)
  - Supabase Storage buckets: 'travel-documents' (private), 'photos' (public)
  - RLS policies for storage (supabase/storage-setup.sql)
  - Owner and admin deletion permissions
- **Validation** (implemented 2025-11-14)
  - Zod schemas (lib/validations/document.ts, lib/validations/photo.ts)
  - Client-side and server-side validation
  - File type and size validation

### 🚧 TO BE IMPLEMENTED (Phase 7+):
- Collaborative notes
- Admin panel
- Drag & drop for itinerary reordering
- Notifications system
- Email invitations

## Development Guidelines

### File Organization:
1. **Pages**: Use Server Components by default, add 'use client' only when needed
2. **Components**: Create in `components/shared/` or feature-specific folders
3. **Hooks**: Custom hooks in `hooks/` directory
4. **Utils**: Helper functions in `lib/utils.ts` or feature-specific files

### Supabase Usage:
```typescript
// Browser components
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()

// Server components/actions
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()
```

### Styling:
- Use Tailwind utility classes
- Use CSS variables from globals.css for colors
- Follow Shadcn/ui patterns for consistency
- Use `cn()` utility for conditional classes

### Forms:
- Use React Hook Form + Zod for validation
- Follow pattern from auth pages (login/register)
- Show loading states during submission
- Use Sonner for success/error toasts

### Data Fetching:
- Use TanStack Query for client-side data fetching
- Use Server Components for initial data
- Implement optimistic updates where appropriate

## Common Patterns

### Creating a New Page:
1. Create in appropriate `app/` directory
2. Use Server Component for initial data
3. Pass data to Client Components as needed
4. Implement loading.tsx and error.tsx

### Adding a New Feature:
1. Check if DB schema supports it (or add table/columns)
2. Update TypeScript types if needed
3. Create necessary components
4. Implement API/actions
5. Add RLS policies for security
6. Test with different roles

### Working with Groups:
1. Always verify user is member/leader
2. Check permissions before mutations
3. Use group_id in all queries
4. Filter by group membership in RLS

### Dashboard Pattern (Implemented):
Example of fetching groups with member counts and roles:
```typescript
// Server Component - app/dashboard/page.tsx
const { data: groups } = await supabase
  .from('travel_groups')
  .select(`
    id, name, description, destination, start_date, end_date, cover_image,
    group_members!inner (role, user_id)
  `)
  .eq('group_members.user_id', user.id)
  .order('start_date', { ascending: false })

// Get member counts
const groupsWithCounts = await Promise.all(
  groups.map(async (group) => {
    const { count } = await supabase
      .from('group_members')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', group.id)

    const userMembership = group.group_members.find(m => m.user_id === user.id)

    return { ...group, member_count: count, user_role: userMembership?.role }
  })
)
```

### Layout Pattern (Implemented):
Structure for authenticated pages with navigation:
```typescript
// app/dashboard/layout.tsx
- Check authentication (redirect if not logged in)
- Fetch user profile
- Render Navbar (with user data)
- Render Sidebar
- Render children in main content area
```

## Environment Variables

Required in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Supabase Storage Buckets

✅ **Configured** (via supabase/storage-setup.sql):
- `travel-documents` (private) - Trip documents with RLS policies
- `photos` (public) - Trip photos with RLS policies

**To be created:**
- `avatars` (public) - User avatars
- `group-covers` (public) - Group cover images
- `receipts` (private) - Expense receipts

## Installed Shadcn/ui Components

Available for use:
- button, card, input, label, form
- select, textarea, dialog, dropdown-menu
- avatar, badge, tabs, table, sonner

To add more: `npx shadcn@latest add [component-name]`

## Key Development Principles

1. **Security First**: Always implement RLS policies before adding features
2. **Type Safety**: Use TypeScript types from database.types.ts
3. **Responsive Design**: Mobile-first approach
4. **User Experience**: Loading states, error handling, success feedback
5. **Code Quality**: Clean, readable, well-commented code
6. **Documentation**: Update relevant docs when adding features

## Testing Checklist

When implementing features, test:
- [ ] Works for admin role
- [ ] Works for group leader
- [ ] Works for group member
- [ ] Non-members cannot access
- [ ] Proper error messages
- [ ] Loading states work
- [ ] Mobile responsive
- [ ] Success toasts appear

## Reference Documentation

- `README.md` - Project overview and setup
- `QUICK_START.md` - 5-minute setup guide
- `SETUP_SUPABASE.md` - Detailed Supabase configuration
- `ROADMAP.md` - Complete development roadmap
- `RESUMEN.md` - Current project status
- `supabase/schema.sql` - Database structure
- `supabase/rls-policies.sql` - Security policies

## Common Patterns Implemented

### Server Actions Pattern
All mutations follow this pattern (see lib/actions/):
```typescript
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createItem(data: ItemInput) {
  const supabase = await createClient()

  // 1. Get and verify user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Unauthorized' }

  // 2. Validate input with Zod
  const validation = schema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  // 3. Check permissions (RLS + manual check)
  const membership = await checkGroupMembership(user.id, data.group_id)
  if (!membership) return { error: 'Not authorized' }

  // 4. Perform database operation
  const { data: item, error } = await supabase
    .from('table')
    .insert(data)
    .select()
    .single()

  if (error) return { error: 'Failed to create' }

  // 5. Revalidate and return
  revalidatePath('/path')
  return { success: true, data: item }
}
```

### Form Component Pattern
All forms follow this pattern (see components/):
```typescript
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

export default function ItemForm({ mode, defaultValues, onSuccess }) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  })

  async function onSubmit(data) {
    setIsSubmitting(true)
    const result = await createItem(data)

    if (result?.error) {
      toast.error(result.error)
      setIsSubmitting(false)
      return
    }

    toast.success('Success!')
    router.refresh()
    onSuccess?()
    setIsSubmitting(false)
  }

  return <Form {...form}>...</Form>
}
```

### Page with Data Fetching Pattern
Server components fetch data directly (see app/groups/[id]/):
```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'

export default async function Page({ params }) {
  const supabase = await createClient()
  const { id } = await params // Next.js 15+ requires await

  // Check auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Check membership (RLS will also enforce)
  const { data: membership } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', id)
    .eq('user_id', user.id)
    .single()

  if (!membership) notFound()

  // Fetch data with RLS
  const { data: items } = await supabase
    .from('table')
    .select('*')
    .eq('group_id', id)

  return <div>...</div>
}
```

### File Upload Pattern (Implemented)
Documents and photos use Supabase Storage (see lib/actions/document-actions.ts, photo-actions.ts):
```typescript
'use server'
export async function uploadFile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // 1. Extract and validate file
  const file = formData.get('file') as File
  if (file.size > 10 * 1024 * 1024) {
    return { error: 'File too large' }
  }

  // 2. Generate unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}/${groupId}/${Date.now()}.${fileExt}`

  // 3. Upload to storage
  const { error: uploadError } = await supabase.storage
    .from('bucket-name')
    .upload(fileName, file, { cacheControl: '3600', upsert: false })

  if (uploadError) return { error: 'Upload failed' }

  // 4. Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('bucket-name')
    .getPublicUrl(fileName)

  // 5. Save record to database
  const { data, error } = await supabase
    .from('table')
    .insert({ file_url: publicUrl, ...otherData })
    .select()
    .single()

  if (error) {
    // Rollback: delete uploaded file
    await supabase.storage.from('bucket-name').remove([fileName])
    return { error: 'Database error' }
  }

  revalidatePath('/path')
  return { success: true, data }
}
```

### Multi-file Upload Pattern (Implemented)
Photos support multiple uploads (see lib/actions/photo-actions.ts):
```typescript
export async function uploadPhotos(formData: FormData) {
  const files = formData.getAll('files') as File[]
  const uploadedPhotos = []
  const errors = []

  for (const file of files) {
    // Validate each file
    if (file.size > 10 * 1024 * 1024) {
      errors.push(`${file.name}: File too large`)
      continue
    }

    // Upload and save each file
    // ... (same pattern as single upload)

    uploadedPhotos.push(photo)
  }

  if (uploadedPhotos.length === 0) {
    return { error: errors.join(', ') }
  }

  return {
    success: true,
    data: uploadedPhotos,
    partialErrors: errors.length > 0 ? errors : undefined
  }
}
```

## Next Steps (Phase 7)

Immediate priorities:
1. Collaborative notes system
2. Admin panel for user management
3. Drag & drop for itinerary reordering
4. Notifications system
5. Email invitations for members

Refer to `ROADMAP.md` and `RESUMEN.md` for complete feature list and current status.

---

## Agent Instructions

When assisting with this project:

1. **Understand Context**: You have full knowledge of the project structure, database schema, and implementation status
2. **Check Existing Code**: Review relevant files before creating new ones
3. **Follow Patterns**: Match existing code style and patterns (especially auth pages)
4. **Security Aware**: Always consider RLS policies and permissions
5. **Type Safe**: Use types from database.types.ts
6. **Document Changes**: Suggest updating relevant docs when adding features
7. **Test Thoroughly**: Remind about testing with different user roles
8. **Reference Docs**: Point to relevant documentation files when helpful

You should be proactive in:
- Suggesting best practices
- Identifying potential security issues
- Recommending performance optimizations
- Ensuring responsive design
- Following Next.js 14+ App Router patterns

You have deep knowledge of:
- The complete database schema and relationships
- RLS policies and permission model
- Project structure and file organization
- Installed dependencies and their usage
- Current implementation status
- Next development priorities

## 🔄 SELF-UPDATE PROTOCOL (CRITICAL)

**IMPORTANT**: You MUST update your knowledge base after implementing significant changes.

### When to Update

Update `.claude/claude.md` when you:
- ✅ Create new database tables or columns
- ✅ Add new pages or major routes (dashboard, admin panel, etc.)
- ✅ Implement new features (itinerary, expenses, etc.)
- ✅ Add RLS policies or security rules
- ✅ Create new reusable patterns or utilities
- ✅ Install new important dependencies
- ✅ Change project structure significantly

### What to Update

#### 1. Update "Project Structure" section
If you create new directories or major files:
```markdown
├── app/
│   ├── dashboard/              # ✅ IMPLEMENTED - User dashboard
```
Change `# TO BE IMPLEMENTED` to `# ✅ IMPLEMENTED` with brief description.

#### 2. Update "Current Implementation Status"
Move items from "TO BE IMPLEMENTED" to "COMPLETED":
```markdown
### ✅ COMPLETED (Phase X):
- Dashboard with group listings (implemented on YYYY-MM-DD)
- Group CRUD operations
```

#### 3. Update "Database Schema" section
If you add tables, add full documentation:
```markdown
11. **new_table** - Description
    - Columns: list all columns
    - Relationships: describe foreign keys
```

#### 4. Update "Common Patterns" section
If you create new reusable patterns:
```markdown
### Pattern Name:
Description of when and how to use it
[Code example]
```

### How to Update

After implementing a feature, add a step:
```markdown
I've implemented [feature]. Now updating agent knowledge base...
```

Then update the relevant sections in `.claude/claude.md`.

### Update `.claude/snippets.md` when you:
- Create frequently used code patterns
- Implement reusable utilities
- Develop common component structures

### Example Update Flow

```
1. User asks: "Create dashboard page"
2. You implement: /app/dashboard/page.tsx, layout, components
3. You update claude.md:
   - Project Structure: dashboard/ # ✅ IMPLEMENTED
   - Implementation Status: Move dashboard from TO BE to COMPLETED
4. You confirm: "Dashboard implemented and knowledge base updated"
```

### Self-Update Checklist

After each major implementation:
- [ ] Updated project structure if new directories created
- [ ] Updated implementation status (move from TODO to DONE)
- [ ] Added new patterns to Common Patterns section
- [ ] Updated Database Schema if tables/columns added
- [ ] Added new snippets to snippets.md if reusable code created
- [ ] Updated ROADMAP.md to reflect progress
- [ ] Updated RESUMEN.md with current state

### Priority Levels for Updates

**HIGH PRIORITY** (always update):
- New database tables or major schema changes
- New major features (dashboard, admin panel, expense system)
- New RLS policies or security changes
- Breaking changes in structure

**MEDIUM PRIORITY** (update if significant):
- New reusable components or patterns
- New utility functions frequently used
- New API endpoints or server actions
- Configuration changes

**LOW PRIORITY** (optional):
- Minor UI tweaks
- Small bug fixes
- Style adjustments
- Individual component updates

### Knowledge Continuity

By updating your knowledge base:
- ✅ You won't suggest already implemented features
- ✅ You'll reference existing patterns correctly
- ✅ You'll know what's available vs. what needs building
- ✅ You'll provide more accurate suggestions
- ✅ Future sessions will be more efficient

**Remember**: An up-to-date knowledge base = Better assistance in future sessions!
