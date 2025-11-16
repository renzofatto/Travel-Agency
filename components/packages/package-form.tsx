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
      category: defaultValues?.category || undefined,
      is_active: defaultValues?.is_active !== undefined ? defaultValues.is_active : true,
      is_featured: defaultValues?.is_featured !== undefined ? defaultValues.is_featured : false,
      show_in_scroll: defaultValues?.show_in_scroll !== undefined ? defaultValues.show_in_scroll : false,
      show_in_hero: defaultValues?.show_in_hero !== undefined ? defaultValues.show_in_hero : false,
      display_order: defaultValues?.display_order || 0,
      short_description: defaultValues?.short_description || '',
      continent: defaultValues?.continent || '',
      gradient_colors: defaultValues?.gradient_colors || 'from-blue-500 to-indigo-600',
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

          {/* Category */}
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || undefined}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="adventure">🏔️ Adventure</SelectItem>
                    <SelectItem value="culture">🏛️ Culture</SelectItem>
                    <SelectItem value="luxury">💎 Luxury</SelectItem>
                    <SelectItem value="relaxation">🧘 Relaxation</SelectItem>
                    <SelectItem value="nature">🌿 Nature</SelectItem>
                    <SelectItem value="beach">🏖️ Beach</SelectItem>
                    <SelectItem value="city">🏙️ City</SelectItem>
                    <SelectItem value="family">👨‍👩‍👧‍👦 Family</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Package category for filtering (optional)
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

        {/* Display Configuration Section */}
        <div className="border-t pt-6 space-y-4">
          <h3 className="text-lg font-semibold">Display Configuration</h3>
          <p className="text-sm text-gray-600">Control where this package appears on the website</p>

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

          {/* Show in Infinite Scroll */}
          <FormField
            control={form.control}
            name="show_in_scroll"
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
                  <FormLabel>📜 Show in Infinite Scroll Section</FormLabel>
                  <FormDescription>
                    Display this package in the destinations scroll section
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {/* Show in Hero */}
          <FormField
            control={form.control}
            name="show_in_hero"
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
                  <FormLabel>🎯 Show in Hero Section</FormLabel>
                  <FormDescription>
                    Display this package in the hero banner (top of page)
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {/* Display Order */}
          <FormField
            control={form.control}
            name="display_order"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Order</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                  />
                </FormControl>
                <FormDescription>
                  Lower numbers appear first (0 = highest priority)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Short Description */}
          <FormField
            control={form.control}
            name="short_description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Short Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Brief description for cards (140 chars recommended)"
                    rows={2}
                    maxLength={500}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Short description for display in cards (max 500 characters)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Continent and Gradient Colors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Continent */}
            <FormField
              control={form.control}
              name="continent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Continent</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select continent" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Europa">🇪🇺 Europa</SelectItem>
                      <SelectItem value="Asia">🌏 Asia</SelectItem>
                      <SelectItem value="América">🌎 América</SelectItem>
                      <SelectItem value="África">🌍 África</SelectItem>
                      <SelectItem value="Oceanía">🏝️ Oceanía</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Continent for geographical grouping
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Gradient Colors */}
            <FormField
              control={form.control}
              name="gradient_colors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gradient Colors</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gradient" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="from-blue-500 to-indigo-600">💙 Blue → Indigo</SelectItem>
                      <SelectItem value="from-purple-500 to-pink-600">💜 Purple → Pink</SelectItem>
                      <SelectItem value="from-pink-500 to-red-600">💗 Pink → Red</SelectItem>
                      <SelectItem value="from-orange-500 to-red-600">🧡 Orange → Red</SelectItem>
                      <SelectItem value="from-yellow-500 to-orange-600">💛 Yellow → Orange</SelectItem>
                      <SelectItem value="from-amber-500 to-yellow-600">🟡 Amber → Yellow</SelectItem>
                      <SelectItem value="from-green-500 to-emerald-600">💚 Green → Emerald</SelectItem>
                      <SelectItem value="from-cyan-500 to-blue-600">🩵 Cyan → Blue</SelectItem>
                      <SelectItem value="from-slate-500 to-gray-700">🩶 Slate → Gray</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Card gradient color theme
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

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
