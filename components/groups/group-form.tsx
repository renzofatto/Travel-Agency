'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Upload, X } from 'lucide-react'
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
import { createGroupSchema, type CreateGroupInput } from '@/lib/validations/group'
import { createGroup, updateGroup, uploadGroupCover } from '@/lib/actions/group-actions'

interface GroupFormProps {
  mode: 'create' | 'edit'
  defaultValues?: CreateGroupInput & { id?: string }
}

export default function GroupForm({ mode, defaultValues }: GroupFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [coverImageUrl, setCoverImageUrl] = useState(defaultValues?.cover_image || '')
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null)

  const form = useForm<CreateGroupInput>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: defaultValues || {
      name: '',
      description: '',
      destination: '',
      start_date: '',
      end_date: '',
      cover_image: '',
    },
  })

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }

    setCoverImageFile(file)

    // Show preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setCoverImageUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setCoverImageUrl('')
    setCoverImageFile(null)
    form.setValue('cover_image', '')
  }

  async function onSubmit(data: CreateGroupInput) {
    setIsSubmitting(true)

    try {
      // Upload cover image if new file selected
      if (coverImageFile) {
        setIsUploading(true)
        const uploadResult = await uploadGroupCover(coverImageFile)
        setIsUploading(false)

        if (uploadResult.error) {
          toast.error(uploadResult.error)
          setIsSubmitting(false)
          return
        }

        data.cover_image = uploadResult.url
      } else if (coverImageUrl) {
        data.cover_image = coverImageUrl
      }

      // Create or update group
      if (mode === 'create') {
        const result = await createGroup(data)
        if (result?.error) {
          toast.error(result.error)
          setIsSubmitting(false)
          return
        }
        // Redirect happens in the action
      } else {
        const result = await updateGroup({ ...data, id: defaultValues?.id! })
        if (result?.error) {
          toast.error(result.error)
          setIsSubmitting(false)
          return
        }
        toast.success('Group updated successfully')
        router.refresh()
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error('Something went wrong. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Cover Image */}
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Cover Image (Optional)
          </label>
          {coverImageUrl ? (
            <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100">
              <img
                src={coverImageUrl}
                alt="Cover preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors bg-gray-50">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-10 h-10 text-gray-400 mb-3" />
                <p className="mb-2 text-sm text-gray-600">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG or WEBP (MAX. 5MB)</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          )}
        </div>

        {/* Group Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Group Name *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Summer Trip to Europe" {...field} />
              </FormControl>
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
                <Input placeholder="e.g., Paris, France" {...field} />
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
                  placeholder="Tell us about this trip..."
                  className="resize-none"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Briefly describe your trip plans (max 500 characters)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || isUploading}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isUploading
                  ? 'Uploading image...'
                  : mode === 'create'
                  ? 'Creating...'
                  : 'Updating...'}
              </>
            ) : mode === 'create' ? (
              'Create Group'
            ) : (
              'Update Group'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
