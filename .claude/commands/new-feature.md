# Create New Feature

You are helping to create a new feature for the TravelHub project.

## Instructions

When the user requests a new feature, follow this process:

1. **Understand Requirements**
   - Ask clarifying questions if needed
   - Identify which part of the app this affects (dashboard, groups, expenses, etc.)
   - Determine user roles that need access

2. **Check Database**
   - Review if current schema supports the feature
   - If not, suggest schema changes with migration SQL
   - Update TypeScript types if schema changes

3. **Plan Implementation**
   - List all files that need to be created/modified
   - Outline component structure
   - Identify reusable components

4. **Security Check**
   - Define RLS policies needed
   - Identify permission checks required
   - Consider edge cases (non-members, different roles)

5. **Create Files**
   - Follow existing patterns (especially from auth pages)
   - Use Server Components by default
   - Add 'use client' only when needed (forms, interactions)
   - Implement proper loading and error states

6. **Add Styling**
   - Use Tailwind CSS
   - Follow responsive design patterns
   - Use existing color variables from globals.css

7. **Testing Checklist**
   - Provide a checklist for testing with different roles
   - Suggest test scenarios

8. **Update Documentation**
   - Suggest updates to ROADMAP.md or RESUMEN.md if significant

## Example Usage

User: "I need to create the dashboard page with a list of groups"

Response:
1. I'll create the dashboard with group listings. This will require:
   - `/app/dashboard/page.tsx` - Main dashboard (Server Component)
   - `/app/dashboard/layout.tsx` - Dashboard layout with sidebar
   - `/components/shared/navbar.tsx` - Top navigation
   - `/components/shared/sidebar.tsx` - Side navigation
   - `/components/groups/group-card.tsx` - Group card component

2. Database query will fetch groups where user is member
3. No schema changes needed
4. RLS policies already handle group access
5. Let me create these files...

## Remember

- Always check existing code patterns
- Maintain type safety with TypeScript
- Consider mobile responsiveness
- Implement proper error handling
- Use Sonner for user feedback
- Follow security best practices
