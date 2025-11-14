import { z } from 'zod'

export const createGroupSchema = z.object({
  name: z
    .string()
    .min(3, 'Group name must be at least 3 characters')
    .max(100, 'Group name must be less than 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  destination: z
    .string()
    .min(2, 'Destination is required')
    .max(100, 'Destination must be less than 100 characters'),
  start_date: z.string().refine((date) => {
    const selectedDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return selectedDate >= today
  }, 'Start date must be today or in the future'),
  end_date: z.string(),
  cover_image: z.string().url().optional().or(z.literal('')),
}).refine(
  (data) => {
    const start = new Date(data.start_date)
    const end = new Date(data.end_date)
    return end >= start
  },
  {
    message: 'End date must be after or equal to start date',
    path: ['end_date'],
  }
)

export type CreateGroupInput = z.infer<typeof createGroupSchema>

export const editGroupSchema = createGroupSchema.merge(
  z.object({
    id: z.string().uuid(),
  })
)

export type EditGroupInput = z.infer<typeof editGroupSchema>
