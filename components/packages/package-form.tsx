'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createPackageSchema, type CreatePackageInput } from '@/lib/validations/package'
import { createPackage, updatePackage } from '@/lib/actions/package-actions'

interface PackageFormProps {
  mode: 'create' | 'edit'
  defaultValues?: Partial<CreatePackageInput> & { id?: string }
  onSuccess?: () => void
}

export default function PackageForm({ mode, defaultValues, onSuccess }: PackageFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    resolver: zodResolver(createPackageSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      description: defaultValues?.description || '',
      destination: defaultValues?.destination || '',
      duration_days: defaultValues?.duration_days || 1,
      cover_image: defaultValues?.cover_image || '',
      price_estimate: defaultValues?.price_estimate || undefined,
      difficulty_level: defaultValues?.difficulty_level || undefined,
      is_active: defaultValues?.is_active !== undefined ? defaultValues.is_active : true,
      is_featured: defaultValues?.is_featured !== undefined ? defaultValues.is_featured : false,
    },
  })

  async function onSubmit(data: CreatePackageInput) {
    setIsSubmitting(true)

    try {
      let result

      if (mode === 'create') {
        result = await createPackage(data)
      } else {
        if (!defaultValues?.id) {
          toast.error('Package ID is required for update')
          setIsSubmitting(false)
          return
        }
        result = await updatePackage({ ...data, id: defaultValues.id })
      }

      if (result?.error) {
        toast.error(result.error)
        setIsSubmitting(false)
        return
      }

      toast.success(
        mode === 'create'
          ? 'Package created successfully! Now add itinerary items.'
          : 'Package updated successfully'
      )

      if (mode === 'create' && result?.success && 'data' in result && result.data) {
        // Redirect to edit page to add itinerary items
        const packageData = result.data as { id: string }
        router.push(`/admin/packages/${packageData.id}/edit`)
      } else {
        router.refresh()
        onSuccess?.()
      }
    } catch (error) {
      console.error('Form submission error:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Package Name *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Patagonia Adventure" {...field} />
              </FormControl>
              <FormDescription>
                A clear, descriptive name for this travel package
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe what makes this package special..."
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Optional detailed description (max 2000 characters)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Destination */}
        <FormField
          control={form.control}
          name="destination"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Destination *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Patagonia, Argentina" {...field} />
              </FormControl>
              <FormDescription>
                Main destination or region for this trip
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Duration and Difficulty */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Duration Days */}
          <FormField
            control={form.control}
            name="duration_days"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (days) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    max="365"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                  />
                </FormControl>
                <FormDescription>
                  Total number of days (1-365)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Difficulty Level */}
          <FormField
            control={form.control}
            name="difficulty_level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Difficulty Level</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || undefined}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="challenging">Challenging</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Physical difficulty level (optional)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Price and Cover Image */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Price Estimate */}
          <FormField
            control={form.control}
            name="price_estimate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price Estimate (USD)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => {
                      const value = e.target.value
                      field.onChange(value ? parseFloat(value) : undefined)
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Estimated price per person (optional)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Cover Image */}
          <FormField
            control={form.control}
            name="cover_image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cover Image URL</FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Optional image URL for the package
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Is Active (only show in edit mode) */}
        {mode === 'edit' && (
          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Active Package</FormLabel>
                  <FormDescription>
                    Inactive packages are hidden from users
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        )}

        {/* Is Featured - Show on Landing Page */}
        <FormField
          control={form.control}
          name="is_featured"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="h-4 w-4 rounded border-gray-300"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>⭐ Featured on Landing Page</FormLabel>
                <FormDescription>
                  Display this package on the public landing page
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {mode === 'create' ? 'Creating...' : 'Saving...'}
              </>
            ) : (
              <>{mode === 'create' ? 'Create Package' : 'Save Changes'}</>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}
