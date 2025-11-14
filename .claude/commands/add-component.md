# Add Component

Add a new React component to the TravelHub project.

## Component Creation Process

1. **Determine Component Type**
   - UI Component (goes in `components/ui/` - use Shadcn if available)
   - Shared Component (goes in `components/shared/`)
   - Feature Component (goes in `components/[feature-name]/`)

2. **Plan Component Structure**
   - What props does it need?
   - Does it need state? (if yes, needs 'use client')
   - Will it fetch data? (consider Server Component)
   - Is it reusable or feature-specific?

3. **Choose Between Server/Client Component**
   - **Server Component** (default) - Use when:
     - No interactivity needed
     - Fetching data from database
     - No useState, useEffect, or browser APIs

   - **Client Component** (add 'use client') - Use when:
     - Uses hooks (useState, useEffect, etc.)
     - Has event handlers (onClick, onChange)
     - Uses browser APIs
     - Needs animations or interactions

4. **TypeScript Props**
   - Define interface/type for props
   - Use types from database.types.ts when relevant
   - Make optional props explicit with `?`
   - Provide JSDoc comments for complex props

5. **Styling**
   - Use Tailwind utility classes
   - Follow responsive design pattern
   - Use CSS variables for colors
   - Add proper spacing and alignment

6. **Accessibility**
   - Use semantic HTML
   - Add ARIA labels where needed
   - Ensure keyboard navigation works
   - Add alt text for images

## Component Templates

### Server Component Template
\`\`\`typescript
import { ComponentType } from './component-type'

interface ComponentNameProps {
  // Define props
  title: string
  description?: string
}

export async function ComponentName({ title, description }: ComponentNameProps) {
  // Can fetch data here

  return (
    <div>
      {/* Component JSX */}
    </div>
  )
}
\`\`\`

### Client Component Template
\`\`\`typescript
'use client'

import { useState } from 'react'

interface ComponentNameProps {
  onAction?: () => void
}

export function ComponentName({ onAction }: ComponentNameProps) {
  const [state, setState] = useState(false)

  return (
    <div>
      {/* Component JSX */}
    </div>
  )
}
\`\`\`

### Form Component Template
\`\`\`typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
})

type FormData = z.infer<typeof formSchema>

interface FormComponentProps {
  onSubmit: (data: FormData) => Promise<void>
}

export function FormComponent({ onSubmit }: FormComponentProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  })

  const handleSubmit = async (data: FormData) => {
    try {
      await onSubmit(data)
      form.reset()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          Submit
        </Button>
      </form>
    </Form>
  )
}
\`\`\`

## Best Practices

- Keep components small and focused
- Extract reusable logic to custom hooks
- Use composition over complex props
- Provide good default values
- Handle loading and error states
- Add TypeScript types for all props
- Use semantic HTML elements
- Follow existing naming conventions

## Checklist

- [ ] Component in correct directory
- [ ] Props properly typed
- [ ] Server/Client component appropriately chosen
- [ ] Responsive design implemented
- [ ] Accessibility considered
- [ ] Error handling included
- [ ] Follows project patterns
- [ ] Reusable where appropriate
