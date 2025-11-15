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
import {
  createPackageItineraryItemSchema,
  type CreatePackageItineraryItemInput,
} from '@/lib/validations/package'
import {
  createPackageItineraryItem,
  updatePackageItineraryItem,
} from '@/lib/actions/package-actions'

const categoryEmojis: Record<string, string> = {
  transport: '🚗',
  accommodation: '🏨',
  activity: '🎯',
  food: '🍽️',
  other: '📌',
}

interface PackageItineraryFormProps {
  packageId: string
  mode: 'create' | 'edit'
  defaultValues?: Partial<CreatePackageItineraryItemInput> & { id?: string }
  onSuccess?: () => void
  onCancel?: () => void
  maxDays: number
}

export default function PackageItineraryForm({
  packageId,
  mode,
  defaultValues,
  onSuccess,
  onCancel,
  maxDays,
}: PackageItineraryFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    resolver: zodResolver(createPackageItineraryItemSchema),
    defaultValues: {
      package_id: packageId,
      day_number: defaultValues?.day_number || 1,
      title: defaultValues?.title || '',
      description: defaultValues?.description || '',
      start_time: defaultValues?.start_time || undefined,
      end_time: defaultValues?.end_time || undefined,
      location: defaultValues?.location || '',
      category: defaultValues?.category || 'activity',
      order_index: defaultValues?.order_index || 0,
      show_in_landing: defaultValues?.show_in_landing !== undefined ? defaultValues.show_in_landing : true,
    },
  })

  async function onSubmit(data: CreatePackageItineraryItemInput) {
    setIsSubmitting(true)

    try {
      let result

      if (mode === 'create') {
        result = await createPackageItineraryItem(data)
      } else {
        if (!defaultValues?.id) {
          toast.error('Item ID is required for update')
          setIsSubmitting(false)
          return
        }
        result = await updatePackageItineraryItem({
          ...data,
          id: defaultValues.id,
        })
      }

      if (result?.error) {
        toast.error(result.error)
        setIsSubmitting(false)
        return
      }

      toast.success(
        mode === 'create'
          ? 'Itinerary item added successfully'
          : 'Itinerary item updated successfully'
      )

      router.refresh()
      form.reset()
      onSuccess?.()
    } catch (error) {
      console.error('Form submission error:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Day Number and Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Day Number */}
          <FormField
            control={form.control}
            name="day_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Day Number *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    max={maxDays}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                  />
                </FormControl>
                <FormDescription>
                  Which day of the trip (1-{maxDays})
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Category */}
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="transport">
                      {categoryEmojis.transport} Transport
                    </SelectItem>
                    <SelectItem value="accommodation">
                      {categoryEmojis.accommodation} Accommodation
                    </SelectItem>
                    <SelectItem value="activity">
                      {categoryEmojis.activity} Activity
                    </SelectItem>
                    <SelectItem value="food">
                      {categoryEmojis.food} Food
                    </SelectItem>
                    <SelectItem value="other">
                      {categoryEmojis.other} Other
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>Type of activity</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Hiking in Torres del Paine" {...field} />
              </FormControl>
              <FormDescription>Brief title for this activity</FormDescription>
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
                  placeholder="Add details about this activity..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormDescription>Optional details</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Location */}
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Torres del Paine National Park" {...field} />
              </FormControl>
              <FormDescription>Optional location</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Start Time and End Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start Time */}
          <FormField
            control={form.control}
            name="start_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} value={field.value || ''} />
                </FormControl>
                <FormDescription>Optional start time</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* End Time */}
          <FormField
            control={form.control}
            name="end_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} value={field.value || ''} />
                </FormControl>
                <FormDescription>Optional end time</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Show in Landing Page */}
        <FormField
          control={form.control}
          name="show_in_landing"
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
                <FormLabel>🌐 Show on Landing Page</FormLabel>
                <FormDescription className="text-xs">
                  Display this activity in the landing page preview
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        {/* Submit Buttons */}
        <div className="flex gap-2 pt-2">
          <Button type="submit" disabled={isSubmitting} size="sm">
            {isSubmitting ? (
              <>
                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                {mode === 'create' ? 'Adding...' : 'Saving...'}
              </>
            ) : (
              <>{mode === 'create' ? 'Add Item' : 'Save Changes'}</>
            )}
          </Button>

          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              size="sm"
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}
