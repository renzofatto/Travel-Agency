import { describe, it, expect } from 'vitest'
import {
  createItineraryItemSchema,
  editItineraryItemSchema,
  reorderItineraryItemsSchema,
} from '@/lib/validations/itinerary'

describe('Itinerary Validation Schemas', () => {
  describe('createItineraryItemSchema', () => {
    it('should validate a complete itinerary item', () => {
      const validItem = {
        title: 'Visit Eiffel Tower',
        description: 'Morning visit to the iconic landmark',
        date: '2024-07-15',
        start_time: '09:00',
        end_time: '12:00',
        location: 'Eiffel Tower, Paris',
        category: 'activity',
        group_id: '123e4567-e89b-12d3-a456-426614174000',
      }

      const result = createItineraryItemSchema.safeParse(validItem)
      expect(result.success).toBe(true)
    })

    it('should validate item with only required fields', () => {
      const minimalItem = {
        title: 'Flight to Paris',
        date: '2024-07-15',
        category: 'transport',
        group_id: '123e4567-e89b-12d3-a456-426614174000',
      }

      const result = createItineraryItemSchema.safeParse(minimalItem)
      expect(result.success).toBe(true)
    })

    it('should reject title shorter than 3 characters', () => {
      const invalidItem = {
        title: 'AB',
        date: '2024-07-15',
        category: 'activity',
        group_id: '123e4567-e89b-12d3-a456-426614174000',
      }

      const result = createItineraryItemSchema.safeParse(invalidItem)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Title must be at least 3 characters')
      }
    })

    it('should reject title longer than 200 characters', () => {
      const invalidItem = {
        title: 'A'.repeat(201),
        date: '2024-07-15',
        category: 'activity',
        group_id: '123e4567-e89b-12d3-a456-426614174000',
      }

      const result = createItineraryItemSchema.safeParse(invalidItem)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Title must be less than 200 characters')
      }
    })

    it('should reject description longer than 1000 characters', () => {
      const invalidItem = {
        title: 'Visit Museum',
        description: 'A'.repeat(1001),
        date: '2024-07-15',
        category: 'activity',
        group_id: '123e4567-e89b-12d3-a456-426614174000',
      }

      const result = createItineraryItemSchema.safeParse(invalidItem)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Description must be less than 1000 characters')
      }
    })

    it('should reject empty date', () => {
      const invalidItem = {
        title: 'Visit Museum',
        date: '',
        category: 'activity',
        group_id: '123e4567-e89b-12d3-a456-426614174000',
      }

      const result = createItineraryItemSchema.safeParse(invalidItem)
      expect(result.success).toBe(false)
    })

    it('should reject end_time before start_time', () => {
      const invalidItem = {
        title: 'Dinner',
        date: '2024-07-15',
        start_time: '20:00',
        end_time: '18:00',
        category: 'food',
        group_id: '123e4567-e89b-12d3-a456-426614174000',
      }

      const result = createItineraryItemSchema.safeParse(invalidItem)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('End time must be after start time')
      }
    })

    it('should accept equal start_time and end_time', () => {
      const validItem = {
        title: 'Quick Stop',
        date: '2024-07-15',
        start_time: '15:00',
        end_time: '15:00',
        category: 'other',
        group_id: '123e4567-e89b-12d3-a456-426614174000',
      }

      const result = createItineraryItemSchema.safeParse(validItem)
      expect(result.success).toBe(true)
    })

    it('should accept all valid categories', () => {
      const categories = ['transport', 'accommodation', 'activity', 'food', 'other']

      categories.forEach((category) => {
        const validItem = {
          title: 'Test Item',
          date: '2024-07-15',
          category,
          group_id: '123e4567-e89b-12d3-a456-426614174000',
        }

        const result = createItineraryItemSchema.safeParse(validItem)
        expect(result.success).toBe(true)
      })
    })

    it('should reject invalid category', () => {
      const invalidItem = {
        title: 'Test Item',
        date: '2024-07-15',
        category: 'invalid_category',
        group_id: '123e4567-e89b-12d3-a456-426614174000',
      }

      const result = createItineraryItemSchema.safeParse(invalidItem)
      expect(result.success).toBe(false)
    })

    it('should reject invalid UUID for group_id', () => {
      const invalidItem = {
        title: 'Test Item',
        date: '2024-07-15',
        category: 'activity',
        group_id: 'not-a-uuid',
      }

      const result = createItineraryItemSchema.safeParse(invalidItem)
      expect(result.success).toBe(false)
    })

    it('should reject location longer than 200 characters', () => {
      const invalidItem = {
        title: 'Visit Museum',
        date: '2024-07-15',
        location: 'A'.repeat(201),
        category: 'activity',
        group_id: '123e4567-e89b-12d3-a456-426614174000',
      }

      const result = createItineraryItemSchema.safeParse(invalidItem)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Location must be less than 200 characters')
      }
    })
  })

  describe('editItineraryItemSchema', () => {
    it('should validate edit with id field', () => {
      const validEdit = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Updated Visit',
        date: '2024-07-16',
        category: 'activity',
        group_id: '123e4567-e89b-12d3-a456-426614174001',
      }

      const result = editItineraryItemSchema.safeParse(validEdit)
      expect(result.success).toBe(true)
    })

    it('should reject edit without id', () => {
      const invalidEdit = {
        title: 'Updated Visit',
        date: '2024-07-16',
        category: 'activity',
        group_id: '123e4567-e89b-12d3-a456-426614174000',
      }

      const result = editItineraryItemSchema.safeParse(invalidEdit)
      expect(result.success).toBe(false)
    })

    it('should reject invalid UUID for id', () => {
      const invalidEdit = {
        id: 'not-a-uuid',
        title: 'Updated Visit',
        date: '2024-07-16',
        category: 'activity',
        group_id: '123e4567-e89b-12d3-a456-426614174000',
      }

      const result = editItineraryItemSchema.safeParse(invalidEdit)
      expect(result.success).toBe(false)
    })
  })

  describe('reorderItineraryItemsSchema', () => {
    it('should validate reorder with valid items array', () => {
      const validReorder = {
        items: [
          { id: '123e4567-e89b-12d3-a456-426614174000', order_index: 0 },
          { id: '123e4567-e89b-12d3-a456-426614174001', order_index: 1 },
          { id: '123e4567-e89b-12d3-a456-426614174002', order_index: 2 },
        ],
      }

      const result = reorderItineraryItemsSchema.safeParse(validReorder)
      expect(result.success).toBe(true)
    })

    it('should accept empty items array', () => {
      const validReorder = {
        items: [],
      }

      const result = reorderItineraryItemsSchema.safeParse(validReorder)
      expect(result.success).toBe(true)
    })

    it('should reject items with invalid UUID', () => {
      const invalidReorder = {
        items: [
          { id: 'not-a-uuid', order_index: 0 },
        ],
      }

      const result = reorderItineraryItemsSchema.safeParse(invalidReorder)
      expect(result.success).toBe(false)
    })

    it('should reject items with non-number order_index', () => {
      const invalidReorder = {
        items: [
          { id: '123e4567-e89b-12d3-a456-426614174000', order_index: '0' },
        ],
      }

      const result = reorderItineraryItemsSchema.safeParse(invalidReorder)
      expect(result.success).toBe(false)
    })
  })
})
