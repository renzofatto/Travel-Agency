# Review Code

Review code for the TravelHub project with focus on:

## Security
- [ ] RLS policies are properly implemented
- [ ] User permissions are checked before operations
- [ ] No sensitive data exposed to client
- [ ] Input validation with Zod schemas
- [ ] SQL injection prevention (Supabase handles this)

## TypeScript
- [ ] All types from database.types.ts are used correctly
- [ ] No 'any' types unless absolutely necessary
- [ ] Props are properly typed
- [ ] Return types are explicit for functions

## Next.js Best Practices
- [ ] Server Components used by default
- [ ] 'use client' only where needed (forms, interactions)
- [ ] No unnecessary client-side rendering
- [ ] Proper use of async/await in Server Components
- [ ] Loading states with loading.tsx or Suspense
- [ ] Error handling with error.tsx

## React Patterns
- [ ] Components are properly decomposed
- [ ] Reusable components in appropriate directories
- [ ] Hooks follow naming convention (useXxx)
- [ ] No prop drilling (use context if needed)
- [ ] Proper cleanup in useEffect if needed

## Supabase Usage
- [ ] Correct client used (browser vs server)
- [ ] Queries are optimized (select only needed columns)
- [ ] Proper error handling for database operations
- [ ] Foreign key relationships respected

## Styling
- [ ] Follows Tailwind conventions
- [ ] Uses CSS variables from globals.css
- [ ] Responsive design (mobile-first)
- [ ] Consistent spacing and sizing
- [ ] Shadcn/ui components used when available

## User Experience
- [ ] Loading states visible during operations
- [ ] Error messages are user-friendly
- [ ] Success feedback with toasts
- [ ] Forms have proper validation messages
- [ ] Accessibility considerations (ARIA labels, semantic HTML)

## Performance
- [ ] No unnecessary re-renders
- [ ] Images optimized (next/image)
- [ ] Lazy loading where appropriate
- [ ] Memoization for expensive calculations

## Code Quality
- [ ] Clean and readable code
- [ ] Meaningful variable and function names
- [ ] Comments for complex logic
- [ ] No console.logs in production
- [ ] Consistent code style

Provide specific suggestions for improvement with code examples.
