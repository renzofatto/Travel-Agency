'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

import { updateProfile } from '@/lib/actions/profile-actions'
import { updateProfileSchema, type UpdateProfileInput } from '@/lib/validations/profile'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface EditProfileFormProps {
  defaultValues: {
    full_name: string
    email: string
  }
  onSuccess?: () => void
}

export default function EditProfileForm({ defaultValues, onSuccess }: EditProfileFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      full_name: defaultValues.full_name || '',
    },
  })

  async function onSubmit(data: UpdateProfileInput) {
    setIsSubmitting(true)

    const result = await updateProfile(data)

    if (result?.error) {
      toast.error(result.error)
      setIsSubmitting(false)
      return
    }

    toast.success('Profile updated successfully!')
    router.refresh()
    onSuccess?.()
    setIsSubmitting(false)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your full name"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <Label>Email</Label>
          <Input
            value={defaultValues.email}
            disabled
            className="bg-gray-50 cursor-not-allowed mt-2"
          />
          <p className="text-xs text-gray-500 mt-1">
            Email cannot be changed
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onSuccess?.()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}
