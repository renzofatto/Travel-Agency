# Debug Issue

Help debug an issue in the TravelHub project.

## Debugging Process

1. **Understand the Problem**
   - What is the expected behavior?
   - What is the actual behavior?
   - When does it occur? (specific pages, actions, user roles)
   - Any error messages in console or terminal?

2. **Gather Information**
   - Check browser console for errors
   - Check terminal for server errors
   - Review Network tab for failed requests
   - Check Supabase logs if database-related

3. **Common Issues by Category**

### Authentication Issues
- **Problem**: User not redirected after login
  - Check middleware.ts is working
  - Verify cookies are being set
  - Check NEXT_PUBLIC_SUPABASE_URL is correct

- **Problem**: Session expires immediately
  - Check Supabase Auth settings
  - Verify cookie settings in server.ts and middleware.ts

### Database Issues
- **Problem**: "Row Level Security policy violation"
  - User may not have proper role
  - RLS policy may be missing or incorrect
  - Check if user is member of the group they're accessing

- **Problem**: Data not appearing
  - Check RLS policies allow SELECT
  - Verify foreign key relationships
  - Check if data exists in Supabase dashboard

### Build/Compilation Issues
- **Problem**: TypeScript errors
  - Check imports are correct
  - Verify types match database.types.ts
  - Run `npm run build` to see all errors

- **Problem**: Tailwind classes not working
  - Check class names are correct
  - Verify tailwind.config.ts includes the file
  - Try `npm run dev` to regenerate

### UI/Rendering Issues
- **Problem**: Component not rendering
  - Check 'use client' directive if using hooks/state
  - Verify data is being fetched correctly
  - Check for JavaScript errors in console

- **Problem**: Styles not applying
  - Check Tailwind class names
  - Verify CSS variables in globals.css
  - Inspect element in browser DevTools

### Supabase Issues
- **Problem**: Queries failing
  - Check Supabase connection in .env.local
  - Verify RLS policies
  - Check table/column names match schema

- **Problem**: File upload failing
  - Verify Storage bucket exists
  - Check bucket policies
  - Verify file size limits

4. **Testing Steps**
   - Try in incognito/private mode (rules out cache)
   - Test with different user roles
   - Check Supabase dashboard directly
   - Review relevant RLS policies

5. **Solution Approach**
   - Provide clear explanation of the issue
   - Give specific code fix with file path
   - Explain why the issue occurred
   - Suggest prevention for future

## Example

User: "I'm getting 'Row Level Security policy violation' when trying to view a group"

Response:
1. This error means the RLS policy is blocking access
2. Let's check:
   - Are you logged in? Check `supabase.auth.getUser()`
   - Are you a member of this group? Check `group_members` table
   - Is the RLS policy correct? Review `rls-policies.sql`

3. Most likely causes:
   - User not added as group member
   - RLS policy missing or incorrect
   - Using wrong Supabase client (browser vs server)

4. To fix:
   [Provide specific solution based on investigation]
