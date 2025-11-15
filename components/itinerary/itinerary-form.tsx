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
import { createItineraryItemSchema, type CreateItineraryItemInput } from '@/lib/validations/itinerary'
import { createItineraryItem, updateItineraryItem } from '@/lib/actions/itinerary-actions'
import LocationPicker from './location-picker'

interface ItineraryFormProps {
  groupId: string
  mode: 'create' | 'edit'
  defaultValues?: CreateItineraryItemInput & { id?: string }
  onSuccess?: () => void
}

const categoryLabels = {
  transport: '🚗 Transport',
  accommodation: '🏨 Accommodation',
  activity: '🎯 Activity',
  food: '🍽️ Food',
  other: '📌 Other',
}

export default function ItineraryForm({
  groupId,
  mode,
  defaultValues,
  onSuccess,
}: ItineraryFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CreateItineraryItemInput>({
    resolver: zodResolver(createItineraryItemSchema),
    defaultValues: defaultValues || {
      title: '',
      description: '',
      date: '',
      start_time: '',
      end_time: '',
      location: '',
      category: 'activity',
      group_id: groupId,
    },
  })

  async function onSubmit(data: CreateItineraryItemInput) {
    setIsSubmitting(true)

    try {
      if (mode === 'create') {
        const result = await createItineraryItem(data)
        if (result?.error) {
          toast.error(result.error)
          setIsSubmitting(false)
          return
        }
        toast.success('Activity added successfully')
      } else {
        const result = await updateItineraryItem({ ...data, id: defaultValues?.id! })
        if (result?.error) {
          toast.error(result.error)
          setIsSubmitting(false)
          return
        }
        toast.success('Activity updated successfully')
      }

      router.refresh()
      onSuccess?.()
      if (mode === 'create') {
        form.reset()
      }
      setIsSubmitting(false)
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error('Something went wrong. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Activity Title *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Visit Eiffel Tower" {...field} />
              </FormControl>
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date, Start Time, End Time */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="start_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Location with Map Picker */}
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <LocationPicker
                  value={field.value || ''}
                  onChange={(location) => field.onChange(location)}
                  label="Location"
                  placeholder="Search for a place (e.g., Eiffel Tower, Paris)"
                />
              </FormControl>
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
                  placeholder="Add notes or details about this activity..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <div className="flex gap-2 justify-end pt-4">
          {mode === 'edit' && (
            <Button
              type="button"
              variant="outline"
              onClick={() => onSuccess?.()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === 'create' ? 'Adding...' : 'Updating...'}
              </>
            ) : mode === 'create' ? (
              'Add Activity'
            ) : (
              'Update Activity'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
