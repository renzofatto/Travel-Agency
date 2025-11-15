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
  uploadItineraryItemImage,
} from '@/lib/actions/package-actions'
import LocationPicker from './location-picker'
import Image from 'next/image'

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
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(defaultValues?.image_url || null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

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
      latitude: defaultValues?.latitude || undefined,
      longitude: defaultValues?.longitude || undefined,
      image_url: defaultValues?.image_url || '',
      category: defaultValues?.category || 'activity',
      order_index: defaultValues?.order_index || 0,
      show_in_landing: defaultValues?.show_in_landing !== undefined ? defaultValues.show_in_landing : true,
    },
  })

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a JPG, PNG, or WEBP image')
      return
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be less than 10MB')
      return
    }

    setImageFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  // Upload image before submitting
  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return imagePreview // Return existing URL if no new file

    setIsUploadingImage(true)
    const formData = new FormData()
    formData.append('file', imageFile)

    const result = await uploadItineraryItemImage(formData)
    setIsUploadingImage(false)

    if (result.error) {
      toast.error(result.error)
      return null
    }

    return result.url || null
  }

  async function onSubmit(data: CreatePackageItineraryItemInput) {
    setIsSubmitting(true)

    try {
      // Upload image first if there's a new one
      const imageUrl = await uploadImage()
      if (imageFile && !imageUrl) {
        // Image upload failed
        setIsSubmitting(false)
        return
      }

      // Include image URL in data
      const dataWithImage = {
        ...data,
        image_url: imageUrl || data.image_url,
      }

      let result

      if (mode === 'create') {
        result = await createPackageItineraryItem(dataWithImage)
      } else {
        if (!defaultValues?.id) {
          toast.error('Item ID is required for update')
          setIsSubmitting(false)
          return
        }
        result = await updatePackageItineraryItem({
          ...dataWithImage,
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

        {/* Image Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">Image</label>
          <p className="text-sm text-muted-foreground mb-2">
            Upload an image for this activity (JPG, PNG, WEBP - Max 10MB)
          </p>

          {imagePreview && (
            <div className="relative w-full h-48 mb-3 rounded-lg overflow-hidden border">
              <Image
                src={imagePreview}
                alt="Preview"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <button
                type="button"
                onClick={() => {
                  setImagePreview(null)
                  setImageFile(null)
                  form.setValue('image_url', '')
                }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition"
              >
                ✕
              </button>
            </div>
          )}

          <Input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleImageChange}
            disabled={isUploadingImage}
          />
          {isUploadingImage && (
            <p className="text-sm text-blue-600 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading image...
            </p>
          )}
        </div>

        {/* Location with Map Picker */}
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Location (with Map)
          </label>
          <p className="text-sm text-muted-foreground mb-2">
            Search for a location or click on the map to set coordinates
          </p>
          <LocationPicker
            value={form.watch('location')}
            latitude={form.watch('latitude')}
            longitude={form.watch('longitude')}
            onChange={(location, lat, lng) => {
              form.setValue('location', location)
              form.setValue('latitude', lat)
              form.setValue('longitude', lng)
            }}
          />
        </div>

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
