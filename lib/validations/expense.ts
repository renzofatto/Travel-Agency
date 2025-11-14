import { z } from 'zod'

export const expenseCategoryEnum = z.enum([
  'transport',
  'accommodation',
  'food',
  'activity',
  'shopping',
  'other',
])

export type ExpenseCategory = z.infer<typeof expenseCategoryEnum>

export const splitTypeEnum = z.enum(['equal', 'percentage', 'custom'])

export type SplitType = z.infer<typeof splitTypeEnum>

export const currencyEnum = z.enum(['USD', 'EUR', 'GBP', 'JPY', 'ARS', 'BRL', 'MXN'])

export type Currency = z.infer<typeof currencyEnum>

const expenseSplitSchema = z.object({
  user_id: z.string().uuid(),
  amount_owed: z.number().min(0).optional(),
  percentage: z.number().min(0).max(100).optional(),
})

export const createExpenseSchema = z.object({
  description: z
    .string()
    .min(3, 'Description must be at least 3 characters')
    .max(200, 'Description must be less than 200 characters'),
  amount: z
    .number()
    .positive('Amount must be greater than 0')
    .max(1000000, 'Amount is too large'),
  currency: currencyEnum,
  category: expenseCategoryEnum,
  paid_by: z.string().uuid('Invalid user'),
  split_type: splitTypeEnum,
  group_id: z.string().uuid(),
  splits: z.array(expenseSplitSchema).min(1, 'At least one split is required'),
}).refine(
  (data) => {
    if (data.split_type === 'percentage') {
      const totalPercentage = data.splits.reduce(
        (sum, split) => sum + (split.percentage || 0),
        0
      )
      return Math.abs(totalPercentage - 100) < 0.01 // Allow for floating point errors
    }
    return true
  },
  {
    message: 'Percentages must add up to 100%',
    path: ['splits'],
  }
).refine(
  (data) => {
    if (data.split_type === 'custom') {
      const totalAmount = data.splits.reduce(
        (sum, split) => sum + (split.amount_owed || 0),
        0
      )
      return Math.abs(totalAmount - data.amount) < 0.01 // Allow for floating point errors
    }
    return true
  },
  {
    message: 'Custom split amounts must add up to total amount',
    path: ['splits'],
  }
)

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>

export const editExpenseSchema = createExpenseSchema.extend({
  id: z.string().uuid(),
})

export type EditExpenseInput = z.infer<typeof editExpenseSchema>

export const settleExpenseSchema = z.object({
  expense_id: z.string().uuid(),
  user_id: z.string().uuid(),
})

export type SettleExpenseInput = z.infer<typeof settleExpenseSchema>
