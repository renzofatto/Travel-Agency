# Code Snippets for TravelHub

Quick reference for common code patterns in the project.

## Supabase Queries

### Fetch User's Groups
\`\`\`typescript
const { data: groups, error } = await supabase
  .from('travel_groups')
  .select(`
    *,
    group_members!inner (
      role,
      users (
        id,
        full_name,
        avatar_url
      )
    )
  `)
  .eq('group_members.user_id', userId)
  .order('created_at', { ascending: false })
\`\`\`

### Fetch Group with Members
\`\`\`typescript
const { data: group, error } = await supabase
  .from('travel_groups')
  .select(`
    *,
    group_members (
      id,
      role,
      joined_at,
      users (
        id,
        full_name,
        email,
        avatar_url
      )
    )
  `)
  .eq('id', groupId)
  .single()
\`\`\`

### Check if User is Group Member
\`\`\`typescript
const { data, error } = await supabase
  .from('group_members')
  .select('role')
  .eq('group_id', groupId)
  .eq('user_id', userId)
  .single()

const isMember = !!data
const isLeader = data?.role === 'leader'
\`\`\`

### Insert with Return Data
\`\`\`typescript
const { data, error } = await supabase
  .from('travel_groups')
  .insert({
    name: 'Trip Name',
    description: 'Trip description',
    created_by: userId,
  })
  .select()
  .single()
\`\`\`

### Update with Optimistic UI
\`\`\`typescript
const { error } = await supabase
  .from('travel_groups')
  .update({ name: newName })
  .eq('id', groupId)

if (error) {
  // Revert optimistic update
  console.error(error)
}
\`\`\`

### Delete with Cascade
\`\`\`typescript
// Foreign keys with ON DELETE CASCADE handle related records
const { error } = await supabase
  .from('travel_groups')
  .delete()
  .eq('id', groupId)
\`\`\`

## Server Actions

### Basic Server Action
\`\`\`typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createGroup(formData: FormData) {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Insert group
  const { data, error } = await supabase
    .from('travel_groups')
    .insert({
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Add creator as leader
  await supabase.from('group_members').insert({
    group_id: data.id,
    user_id: user.id,
    role: 'leader',
  })

  revalidatePath('/dashboard')
  return { data }
}
\`\`\`

### Server Action with Type Safety
\`\`\`typescript
'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const schema = z.object({
  name: z.string().min(2),
  destination: z.string().optional(),
})

export async function updateGroup(
  groupId: string,
  values: z.infer<typeof schema>
) {
  // Validate input
  const validated = schema.parse(values)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  // Update
  const { error } = await supabase
    .from('travel_groups')
    .update(validated)
    .eq('id', groupId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath(\`/groups/\${groupId}\`)
}
\`\`\`

## React Hook Form + Zod

### Form with Validation
\`\`\`typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  destination: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function GroupForm({ onSubmit }: { onSubmit: (data: FormData) => Promise<void> }) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      destination: '',
    },
  })

  const handleSubmit = async (data: FormData) => {
    try {
      await onSubmit(data)
      toast.success('Group created successfully!')
      form.reset()
    } catch (error) {
      toast.error('Failed to create group')
      console.error(error)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      {/* Form fields */}
    </form>
  )
}
\`\`\`

## TanStack Query

### Query Hook
\`\`\`typescript
'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { TravelGroup } from '@/lib/types/database.types'

export function useGroups() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('travel_groups')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as TravelGroup[]
    },
  })
}
\`\`\`

### Mutation Hook
\`\`\`typescript
'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function useCreateGroup() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('Not authenticated')

      const { data: group, error } = await supabase
        .from('travel_groups')
        .insert({
          ...data,
          created_by: user.user.id,
        })
        .select()
        .single()

      if (error) throw error
      return group
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
      toast.success('Group created!')
    },
    onError: (error) => {
      toast.error('Failed to create group')
      console.error(error)
    },
  })
}
\`\`\`

## File Upload to Supabase Storage

### Upload Image
\`\`\`typescript
'use client'

import { createClient } from '@/lib/supabase/client'

export async function uploadGroupCover(file: File, groupId: string) {
  const supabase = createClient()

  // Generate unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = \`\${groupId}/\${Date.now()}.\${fileExt}\`

  // Upload to storage
  const { data, error } = await supabase.storage
    .from('group-covers')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) throw error

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('group-covers')
    .getPublicUrl(fileName)

  return publicUrl
}
\`\`\`

### Delete from Storage
\`\`\`typescript
export async function deleteGroupCover(fileUrl: string) {
  const supabase = createClient()

  // Extract file path from URL
  const path = fileUrl.split('/storage/v1/object/public/group-covers/')[1]

  const { error } = await supabase.storage
    .from('group-covers')
    .remove([path])

  if (error) throw error
}
\`\`\`

## Permission Checks

### Check Admin Role
\`\`\`typescript
export async function isAdmin(userId: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single()

  return data?.role === 'admin'
}
\`\`\`

### Check Group Leader
\`\`\`typescript
export async function isGroupLeader(userId: string, groupId: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('group_members')
    .select('role')
    .eq('user_id', userId)
    .eq('group_id', groupId)
    .single()

  return data?.role === 'leader'
}
\`\`\`

## Loading States

### Page Loading Skeleton
\`\`\`typescript
export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 bg-muted animate-pulse rounded" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    </div>
  )
}
\`\`\`

### Component Loading State
\`\`\`typescript
import { Loader2 } from 'lucide-react'

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}
\`\`\`

## Error Handling

### Error Boundary
\`\`\`typescript
'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <h2 className="text-2xl font-bold">Something went wrong!</h2>
      <p className="text-muted-foreground">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
\`\`\`

## Utility Functions

### Format Date
\`\`\`typescript
import { format, formatDistance } from 'date-fns'
import { es } from 'date-fns/locale'

export function formatDate(date: string | Date) {
  return format(new Date(date), 'PPP', { locale: es })
}

export function formatRelativeDate(date: string | Date) {
  return formatDistance(new Date(date), new Date(), {
    addSuffix: true,
    locale: es,
  })
}
\`\`\`

### Currency Formatter
\`\`\`typescript
export function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('es', {
    style: 'currency',
    currency,
  }).format(amount)
}
\`\`\`

### Get User Initials
\`\`\`typescript
export function getInitials(name: string | null) {
  if (!name) return '??'

  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
\`\`\`

## Responsive Design Patterns

### Grid Layout
\`\`\`tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => (
    <Card key={item.id}>
      {/* Card content */}
    </Card>
  ))}
</div>
\`\`\`

### Flex Layout
\`\`\`tsx
<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
  <h1 className="text-2xl font-bold">Title</h1>
  <Button>Action</Button>
</div>
\`\`\`

### Container
\`\`\`tsx
<div className="container mx-auto px-4 py-8 max-w-7xl">
  {/* Content */}
</div>
\`\`\`

## Common UI Patterns

### Empty State
\`\`\`tsx
import { FileX } from 'lucide-react'

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <FileX className="h-12 w-12 text-muted-foreground mb-4" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  )
}
\`\`\`

### Confirmation Dialog
\`\`\`tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

<AlertDialog open={open} onOpenChange={setOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleConfirm}>
        Continue
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
\`\`\`
