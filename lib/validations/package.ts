import { z } from 'zod'

// Difficulty levels for packages
export const difficultyLevelEnum = z.enum(['easy', 'moderate', 'challenging'])

export type DifficultyLevel = z.infer<typeof difficultyLevelEnum>

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
    category: packageItemCategoryEnum,
    order_index: z.number().int().min(0).default(0),
    show_in_landing: z.boolean().optional().default(true), // NEW: Show in landing page
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
  difficulty_level: difficultyLevelEnum.optional(),
  is_active: z.boolean().optional().default(true),
  is_featured: z.boolean().optional().default(false), // NEW: Show on landing page
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
