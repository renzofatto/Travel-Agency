import { z } from 'zod'

export const uploadPhotoSchema = z.object({
  group_id: z.string().uuid(),
  caption: z
    .string()
    .max(500, 'Caption must be less than 500 characters')
    .optional(),
  file: z.instanceof(File).refine(
    (file) => file.size <= 10 * 1024 * 1024, // 10MB
    'File size must be less than 10MB'
  ).refine(
    (file) => {
      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
      ]
      return allowedTypes.includes(file.type)
    },
    'File must be an image (JPG, PNG, WEBP)'
  ),
})

export type UploadPhotoInput = z.infer<typeof uploadPhotoSchema>

export const deletePhotoSchema = z.object({
  photo_id: z.string().uuid(),
  group_id: z.string().uuid(),
})

export type DeletePhotoInput = z.infer<typeof deletePhotoSchema>

export const addCommentSchema = z.object({
  photo_id: z.string().uuid(),
  comment: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(500, 'Comment must be less than 500 characters'),
})

export type AddCommentInput = z.infer<typeof addCommentSchema>

export const deleteCommentSchema = z.object({
  comment_id: z.string().uuid(),
  photo_id: z.string().uuid(),
})

export type DeleteCommentInput = z.infer<typeof deleteCommentSchema>
