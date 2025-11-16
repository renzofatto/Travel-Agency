import { z } from 'zod'

// Package categories
export const packageCategoryEnum = z.enum([
  'adventure',
  'culture',
  'luxury',
  'relaxation',
  'nature',
  'beach',
  'city',
  'family'
])

export type PackageCategory = z.infer<typeof packageCategoryEnum>

// Category for package itinerary items (same as regular itinerary)
export const packageItemCategoryEnum = z.enum([
  'transport',
  'accommodation',
  'activity',
  'food',
  'other',
])

export type PackageItemCategory = z.infer<typeof packageItemCategoryEnum>

// ============================================
// PACKAGE ITINERARY ITEM SCHEMAS
// ============================================

export const packageItineraryItemBaseSchema = z
  .object({
    day_number: z.number().int().min(1, 'Day number must be at least 1'),
    title: z
      .string()
      .min(3, 'Title must be at least 3 characters')
      .max(200, 'Title must be less than 200 characters'),
    description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
    start_time: z.string().optional(), // Format: "HH:MM"
    end_time: z.string().optional(), // Format: "HH:MM"
    location: z.string().max(200, 'Location must be less than 200 characters').optional(),
    latitude: z.number().min(-90).max(90).optional(), // Latitude coordinate
    longitude: z.number().min(-180).max(180).optional(), // Longitude coordinate
    image_url: z.string().url().optional().or(z.literal('')), // Image URL
    category: packageItemCategoryEnum,
    order_index: z.number().int().min(0).default(0),
    show_in_landing: z.boolean().optional().default(true), // Show in landing page
  })
  .refine(
    (data) => {
      if (data.start_time && data.end_time) {
        return data.end_time > data.start_time
      }
      return true
    },
    {
      message: 'End time must be after start time',
      path: ['end_time'],
    }
  )

export const createPackageItineraryItemSchema = packageItineraryItemBaseSchema.merge(
  z.object({
    package_id: z.string().uuid('Invalid package ID'),
  })
)

export type CreatePackageItineraryItemInput = z.infer<typeof createPackageItineraryItemSchema>

export const updatePackageItineraryItemSchema = packageItineraryItemBaseSchema.merge(
  z.object({
    id: z.string().uuid('Invalid item ID'),
    package_id: z.string().uuid('Invalid package ID'),
  })
)

export type UpdatePackageItineraryItemInput = z.infer<typeof updatePackageItineraryItemSchema>

// Alias for backward compatibility
export const packageItineraryItemSchema = packageItineraryItemBaseSchema
export type PackageItineraryItemInput = z.infer<typeof packageItineraryItemBaseSchema>

export const editPackageItineraryItemSchema = updatePackageItineraryItemSchema
export type EditPackageItineraryItemInput = z.infer<typeof updatePackageItineraryItemSchema>

// ============================================
// TRAVEL PACKAGE SCHEMAS
// ============================================

export const createPackageSchema = z.object({
  name: z
    .string()
    .min(3, 'Package name must be at least 3 characters')
    .max(200, 'Package name must be less than 200 characters'),
  description: z.string().max(2000, 'Description must be less than 2000 characters').optional(),
  destination: z
    .string()
    .min(2, 'Destination is required')
    .max(200, 'Destination must be less than 200 characters'),
  duration_days: z.number().int().min(1, 'Duration must be at least 1 day').max(365, 'Duration must be less than 365 days'),
  cover_image: z.string().url().optional().or(z.literal('')),
  price_estimate: z.number().min(0, 'Price must be positive').optional(),
  category: packageCategoryEnum.optional(),
  is_active: z.boolean().optional().default(true),
  is_featured: z.boolean().optional().default(false), // Show on landing page
  show_in_scroll: z.boolean().optional().default(false), // Show in infinite scroll section
  show_in_hero: z.boolean().optional().default(false), // Show in hero section
  display_order: z.number().int().min(0).optional().default(0), // Display order
  short_description: z.string().max(500, 'Short description must be less than 500 characters').optional(), // Short description for cards
  continent: z.string().max(50, 'Continent must be less than 50 characters').optional(), // Continent for grouping
  gradient_colors: z.string().max(100, 'Gradient colors must be less than 100 characters').optional(), // Tailwind gradient classes
})

export type CreatePackageInput = z.infer<typeof createPackageSchema>

export const editPackageSchema = createPackageSchema.merge(
  z.object({
    id: z.string().uuid(),
  })
)

export type EditPackageInput = z.infer<typeof editPackageSchema>

// ============================================
// ASSIGN PACKAGE TO GROUP SCHEMA
// ============================================

export const assignPackageToGroupSchema = z.object({
  package_id: z.string().uuid('Invalid package ID'),
  group_id: z.string().uuid('Invalid group ID'),
  start_date: z.string().refine(
    (date) => {
      const selectedDate = new Date(date)
      return !isNaN(selectedDate.getTime())
    },
    'Invalid start date'
  ),
})

export type AssignPackageToGroupInput = z.infer<typeof assignPackageToGroupSchema>

// ============================================
// PACKAGE INCLUDED/EXCLUDED ITEMS SCHEMAS
// ============================================

// Base schema for included items
export const packageIncludedItemBaseSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be less than 200 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  icon: z.string().max(10, 'Icon must be less than 10 characters').optional(), // Emoji
  order_index: z.number().int().min(0).default(0),
})

export type PackageIncludedItemInput = z.infer<typeof packageIncludedItemBaseSchema>

// Create schema for included items
export const createPackageIncludedItemSchema = packageIncludedItemBaseSchema.merge(
  z.object({
    package_id: z.string().uuid('Invalid package ID'),
  })
)

export type CreatePackageIncludedItemInput = z.infer<typeof createPackageIncludedItemSchema>

// Update schema for included items
export const updatePackageIncludedItemSchema = packageIncludedItemBaseSchema.merge(
  z.object({
    id: z.string().uuid('Invalid item ID'),
    package_id: z.string().uuid('Invalid package ID'),
  })
)

export type UpdatePackageIncludedItemInput = z.infer<typeof updatePackageIncludedItemSchema>

// Base schema for excluded items
export const packageExcludedItemBaseSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be less than 200 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  icon: z.string().max(10, 'Icon must be less than 10 characters').optional(), // Emoji
  order_index: z.number().int().min(0).default(0),
})

export type PackageExcludedItemInput = z.infer<typeof packageExcludedItemBaseSchema>

// Create schema for excluded items
export const createPackageExcludedItemSchema = packageExcludedItemBaseSchema.merge(
  z.object({
    package_id: z.string().uuid('Invalid package ID'),
  })
)

export type CreatePackageExcludedItemInput = z.infer<typeof createPackageExcludedItemSchema>

// Update schema for excluded items
export const updatePackageExcludedItemSchema = packageExcludedItemBaseSchema.merge(
  z.object({
    id: z.string().uuid('Invalid item ID'),
    package_id: z.string().uuid('Invalid package ID'),
  })
)

export type UpdatePackageExcludedItemInput = z.infer<typeof updatePackageExcludedItemSchema>
