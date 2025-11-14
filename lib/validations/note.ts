import { z } from 'zod'

export const createNoteSchema = z.object({
  group_id: z.string().uuid('Invalid group ID'),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  content: z
    .string()
    .min(1, 'Content is required')
    .max(50000, 'Content must be less than 50,000 characters'),
})

export type CreateNoteInput = z.infer<typeof createNoteSchema>

export const updateNoteSchema = z.object({
  note_id: z.string().uuid('Invalid note ID'),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  content: z
    .string()
    .min(1, 'Content is required')
    .max(50000, 'Content must be less than 50,000 characters'),
})

export type UpdateNoteInput = z.infer<typeof updateNoteSchema>

export const deleteNoteSchema = z.object({
  note_id: z.string().uuid('Invalid note ID'),
  group_id: z.string().uuid('Invalid group ID'),
})

export type DeleteNoteInput = z.infer<typeof deleteNoteSchema>
