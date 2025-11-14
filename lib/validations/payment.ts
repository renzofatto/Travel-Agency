import { z } from 'zod'

export const createPaymentSchema = z.object({
  group_id: z.string().uuid('Invalid group ID'),
  to_user_id: z.string().uuid('Invalid user ID'),
  amount: z
    .number()
    .positive('Amount must be positive')
    .max(1000000, 'Amount is too large'),
  currency: z.string().min(1, 'Currency is required'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  payment_date: z.string().optional(),
})

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>

export const updatePaymentSchema = z.object({
  id: z.string().uuid('Invalid payment ID'),
  amount: z
    .number()
    .positive('Amount must be positive')
    .max(1000000, 'Amount is too large')
    .optional(),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  payment_date: z.string().optional(),
})

export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>
