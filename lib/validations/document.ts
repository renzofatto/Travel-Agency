import { z } from 'zod'

export const documentTypeEnum = z.enum([
  'flight',
  'bus',
  'train',
  'hotel',
  'activity',
  'other',
])

export type DocumentType = z.infer<typeof documentTypeEnum>

export const uploadDocumentSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be less than 200 characters'),
  document_type: documentTypeEnum,
  group_id: z.string().uuid(),
  file: z.instanceof(File).refine(
    (file) => file.size <= 10 * 1024 * 1024, // 10MB
    'File size must be less than 10MB'
  ).refine(
    (file) => {
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ]
      return allowedTypes.includes(file.type)
    },
    'File must be PDF, image (JPG, PNG, WEBP), or Word document'
  ),
})

export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>

export const deleteDocumentSchema = z.object({
  document_id: z.string().uuid(),
  group_id: z.string().uuid(),
})

export type DeleteDocumentInput = z.infer<typeof deleteDocumentSchema>
