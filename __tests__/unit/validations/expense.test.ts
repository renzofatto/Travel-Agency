import { describe, it, expect } from 'vitest'
import { createExpenseSchema } from '@/lib/validations/expense'

describe('Expense Validation Schema', () => {
  describe('createExpenseSchema', () => {
    it('should validate a valid expense with equal split', () => {
      const validExpense = {
        description: 'Dinner at restaurant',
        amount: 100,
        currency: 'USD',
        category: 'food',
        paid_by: '123e4567-e89b-12d3-a456-426614174000',
        split_type: 'equal',
        group_id: '123e4567-e89b-12d3-a456-426614174001',
        splits: [
          { user_id: '123e4567-e89b-12d3-a456-426614174000' },
          { user_id: '123e4567-e89b-12d3-a456-426614174002' },
        ],
      }

      const result = createExpenseSchema.safeParse(validExpense)
      expect(result.success).toBe(true)
    })

    it('should validate expense with percentage split', () => {
      const validExpense = {
        description: 'Hotel',
        amount: 200,
        currency: 'USD',
        category: 'accommodation',
        paid_by: '123e4567-e89b-12d3-a456-426614174000',
        split_type: 'percentage',
        group_id: '123e4567-e89b-12d3-a456-426614174001',
        splits: [
          { user_id: '123e4567-e89b-12d3-a456-426614174000', percentage: 60, amount_owed: 120 },
          { user_id: '123e4567-e89b-12d3-a456-426614174002', percentage: 40, amount_owed: 80 },
        ],
      }

      const result = createExpenseSchema.safeParse(validExpense)
      expect(result.success).toBe(true)
    })

    it('should validate expense with custom split', () => {
      const validExpense = {
        description: 'Taxi',
        amount: 50,
        currency: 'EUR',
        category: 'transport',
        paid_by: '123e4567-e89b-12d3-a456-426614174000',
        split_type: 'custom',
        group_id: '123e4567-e89b-12d3-a456-426614174001',
        splits: [
          { user_id: '123e4567-e89b-12d3-a456-426614174000', amount_owed: 30 },
          { user_id: '123e4567-e89b-12d3-a456-426614174002', amount_owed: 20 },
        ],
      }

      const result = createExpenseSchema.safeParse(validExpense)
      expect(result.success).toBe(true)
    })

    it('should reject negative amount', () => {
      const invalidExpense = {
        description: 'Invalid',
        amount: -10,
        currency: 'USD',
        category: 'food',
        paid_by: '123e4567-e89b-12d3-a456-426614174000',
        split_type: 'equal',
        group_id: '123e4567-e89b-12d3-a456-426614174001',
        splits: [
          { user_id: '123e4567-e89b-12d3-a456-426614174000' },
        ],
      }

      const result = createExpenseSchema.safeParse(invalidExpense)
      expect(result.success).toBe(false)
    })

    it('should reject empty description', () => {
      const invalidExpense = {
        description: '',
        amount: 100,
        currency: 'USD',
        category: 'food',
        paid_by: '123e4567-e89b-12d3-a456-426614174000',
        split_type: 'equal',
        group_id: '123e4567-e89b-12d3-a456-426614174001',
        splits: [
          { user_id: '123e4567-e89b-12d3-a456-426614174000' },
        ],
      }

      const result = createExpenseSchema.safeParse(invalidExpense)
      expect(result.success).toBe(false)
    })

    it('should reject description shorter than 3 characters', () => {
      const invalidExpense = {
        description: 'AB',
        amount: 100,
        currency: 'USD',
        category: 'food',
        paid_by: '123e4567-e89b-12d3-a456-426614174000',
        split_type: 'equal',
        group_id: '123e4567-e89b-12d3-a456-426614174001',
        splits: [
          { user_id: '123e4567-e89b-12d3-a456-426614174000' },
        ],
      }

      const result = createExpenseSchema.safeParse(invalidExpense)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Description must be at least 3 characters')
      }
    })

    it('should reject invalid category', () => {
      const invalidExpense = {
        description: 'Test',
        amount: 100,
        currency: 'USD',
        category: 'invalid_category',
        paid_by: '123e4567-e89b-12d3-a456-426614174000',
        split_type: 'equal',
        group_id: '123e4567-e89b-12d3-a456-426614174001',
        splits: [
          { user_id: '123e4567-e89b-12d3-a456-426614174000' },
        ],
      }

      const result = createExpenseSchema.safeParse(invalidExpense)
      expect(result.success).toBe(false)
    })

    it('should accept all valid categories', () => {
      const categories = ['transport', 'accommodation', 'food', 'activity', 'shopping', 'other']

      categories.forEach((category) => {
        const validExpense = {
          description: 'Test Expense',
          amount: 100,
          currency: 'USD',
          category,
          paid_by: '123e4567-e89b-12d3-a456-426614174000',
          split_type: 'equal',
          group_id: '123e4567-e89b-12d3-a456-426614174001',
          splits: [
            { user_id: '123e4567-e89b-12d3-a456-426614174000' },
            { user_id: '123e4567-e89b-12d3-a456-426614174002' },
          ],
        }

        const result = createExpenseSchema.safeParse(validExpense)
        expect(result.success).toBe(true)
      })
    })

    it('should accept all valid currencies', () => {
      const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'ARS', 'BRL', 'MXN']

      currencies.forEach((currency) => {
        const validExpense = {
          description: 'Test Expense',
          amount: 100,
          currency,
          category: 'food',
          paid_by: '123e4567-e89b-12d3-a456-426614174000',
          split_type: 'equal',
          group_id: '123e4567-e89b-12d3-a456-426614174001',
          splits: [
            { user_id: '123e4567-e89b-12d3-a456-426614174000' },
            { user_id: '123e4567-e89b-12d3-a456-426614174002' },
          ],
        }

        const result = createExpenseSchema.safeParse(validExpense)
        expect(result.success).toBe(true)
      })
    })

    it('should reject empty splits array', () => {
      const invalidExpense = {
        description: 'Test',
        amount: 100,
        currency: 'USD',
        category: 'food',
        paid_by: '123e4567-e89b-12d3-a456-426614174000',
        split_type: 'equal',
        group_id: '123e4567-e89b-12d3-a456-426614174001',
        splits: [],
      }

      const result = createExpenseSchema.safeParse(invalidExpense)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('At least one split is required')
      }
    })

    it('should reject percentage split that does not sum to 100', () => {
      const invalidExpense = {
        description: 'Hotel',
        amount: 200,
        currency: 'USD',
        category: 'accommodation',
        paid_by: '123e4567-e89b-12d3-a456-426614174000',
        split_type: 'percentage',
        group_id: '123e4567-e89b-12d3-a456-426614174001',
        splits: [
          { user_id: '123e4567-e89b-12d3-a456-426614174000', percentage: 50, amount_owed: 100 },
          { user_id: '123e4567-e89b-12d3-a456-426614174002', percentage: 30, amount_owed: 60 },
        ],
      }

      const result = createExpenseSchema.safeParse(invalidExpense)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Percentages must add up to 100%')
      }
    })

    it('should reject custom split that does not sum to total amount', () => {
      const invalidExpense = {
        description: 'Taxi',
        amount: 50,
        currency: 'EUR',
        category: 'transport',
        paid_by: '123e4567-e89b-12d3-a456-426614174000',
        split_type: 'custom',
        group_id: '123e4567-e89b-12d3-a456-426614174001',
        splits: [
          { user_id: '123e4567-e89b-12d3-a456-426614174000', amount_owed: 30 },
          { user_id: '123e4567-e89b-12d3-a456-426614174002', amount_owed: 10 },
        ],
      }

      const result = createExpenseSchema.safeParse(invalidExpense)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Custom split amounts must add up to total amount')
      }
    })
  })
})
