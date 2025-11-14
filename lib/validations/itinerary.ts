import { z } from 'zod'

export const itineraryCategoryEnum = z.enum([
  'transport',
  'accommodation',
  'activity',
  'food',
  'other',
])

export type ItineraryCategory = z.infer<typeof itineraryCategoryEnum>

export const createItineraryItemSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be less than 200 characters'),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  date: z.string().min(1, 'Date is required'),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  location: z
    .string()
    .max(200, 'Location must be less than 200 characters')
    .optional(),
  category: itineraryCategoryEnum,
  group_id: z.string().uuid(),
}).refine(
  (data) => {
    if (data.start_time && data.end_time) {
      return data.end_time >= data.start_time
    }
    return true
  },
  {
    message: 'End time must be after start time',
    path: ['end_time'],
  }
)

export type CreateItineraryItemInput = z.infer<typeof createItineraryItemSchema>

export const editItineraryItemSchema = createItineraryItemSchema.extend({
  id: z.string().uuid(),
})

export type EditItineraryItemInput = z.infer<typeof editItineraryItemSchema>

export const reorderItineraryItemsSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().uuid(),
      order_index: z.number(),
    })
  ),
})

export type ReorderItineraryItemsInput = z.infer<typeof reorderItineraryItemsSchema>
