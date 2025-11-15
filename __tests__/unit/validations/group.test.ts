import { describe, it, expect } from 'vitest'
import { createGroupSchema, editGroupSchema } from '@/lib/validations/group'

describe('Group Validation Schemas', () => {
  describe('createGroupSchema', () => {
    it('should validate a valid group', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 10)
      const futureDateStr = futureDate.toISOString().split('T')[0]

      const endDate = new Date()
      endDate.setDate(endDate.getDate() + 20)
      const endDateStr = endDate.toISOString().split('T')[0]

      const validGroup = {
        name: 'Summer Europe Trip',
        description: 'A wonderful summer vacation',
        destination: 'Paris, France',
        start_date: futureDateStr,
        end_date: endDateStr,
        cover_image: '',
      }

      const result = createGroupSchema.safeParse(validGroup)
      expect(result.success).toBe(true)
    })

    it('should reject empty name', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 10)
      const futureDateStr = futureDate.toISOString().split('T')[0]

      const invalidGroup = {
        name: '',
        destination: 'Paris',
        start_date: futureDateStr,
        end_date: futureDateStr,
      }

      const result = createGroupSchema.safeParse(invalidGroup)
      expect(result.success).toBe(false)
    })

    it('should reject name shorter than 3 characters', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 10)
      const futureDateStr = futureDate.toISOString().split('T')[0]

      const invalidGroup = {
        name: 'AB',
        destination: 'Paris',
        start_date: futureDateStr,
        end_date: futureDateStr,
      }

      const result = createGroupSchema.safeParse(invalidGroup)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Group name must be at least 3 characters')
      }
    })

    it('should reject name longer than 100 characters', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 10)
      const futureDateStr = futureDate.toISOString().split('T')[0]

      const invalidGroup = {
        name: 'A'.repeat(101),
        destination: 'Paris',
        start_date: futureDateStr,
        end_date: futureDateStr,
      }

      const result = createGroupSchema.safeParse(invalidGroup)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Group name must be less than 100 characters')
      }
    })

    it('should reject empty destination', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 10)
      const futureDateStr = futureDate.toISOString().split('T')[0]

      const invalidGroup = {
        name: 'Test Group',
        destination: '',
        start_date: futureDateStr,
        end_date: futureDateStr,
      }

      const result = createGroupSchema.safeParse(invalidGroup)
      expect(result.success).toBe(false)
    })

    it('should reject destination shorter than 2 characters', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 10)
      const futureDateStr = futureDate.toISOString().split('T')[0]

      const invalidGroup = {
        name: 'Test Group',
        destination: 'A',
        start_date: futureDateStr,
        end_date: futureDateStr,
      }

      const result = createGroupSchema.safeParse(invalidGroup)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Destination is required')
      }
    })

    it('should accept optional description', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 10)
      const futureDateStr = futureDate.toISOString().split('T')[0]

      const validGroup = {
        name: 'Test Group',
        destination: 'Paris',
        start_date: futureDateStr,
        end_date: futureDateStr,
      }

      const result = createGroupSchema.safeParse(validGroup)
      expect(result.success).toBe(true)
    })

    it('should reject description longer than 500 characters', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 10)
      const futureDateStr = futureDate.toISOString().split('T')[0]

      const invalidGroup = {
        name: 'Test Group',
        description: 'A'.repeat(501),
        destination: 'Paris',
        start_date: futureDateStr,
        end_date: futureDateStr,
      }

      const result = createGroupSchema.safeParse(invalidGroup)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Description must be less than 500 characters')
      }
    })

    it('should reject end_date before start_date', () => {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() + 20)
      const startDateStr = startDate.toISOString().split('T')[0]

      const endDate = new Date()
      endDate.setDate(endDate.getDate() + 10)
      const endDateStr = endDate.toISOString().split('T')[0]

      const invalidGroup = {
        name: 'Test Group',
        destination: 'Paris',
        start_date: startDateStr,
        end_date: endDateStr,
      }

      const result = createGroupSchema.safeParse(invalidGroup)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('End date must be after or equal to start date')
      }
    })

    it('should accept equal start and end dates', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 10)
      const futureDateStr = futureDate.toISOString().split('T')[0]

      const validGroup = {
        name: 'Test Group',
        destination: 'Paris',
        start_date: futureDateStr,
        end_date: futureDateStr,
      }

      const result = createGroupSchema.safeParse(validGroup)
      expect(result.success).toBe(true)
    })

    it('should accept optional cover_image as empty string', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 10)
      const futureDateStr = futureDate.toISOString().split('T')[0]

      const validGroup = {
        name: 'Test Group',
        destination: 'Paris',
        start_date: futureDateStr,
        end_date: futureDateStr,
        cover_image: '',
      }

      const result = createGroupSchema.safeParse(validGroup)
      expect(result.success).toBe(true)
    })

    it('should accept optional cover_image as valid URL', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 10)
      const futureDateStr = futureDate.toISOString().split('T')[0]

      const validGroup = {
        name: 'Test Group',
        destination: 'Paris',
        start_date: futureDateStr,
        end_date: futureDateStr,
        cover_image: 'https://example.com/image.jpg',
      }

      const result = createGroupSchema.safeParse(validGroup)
      expect(result.success).toBe(true)
    })
  })

  describe('editGroupSchema', () => {
    it('should validate edit with id field', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 10)
      const futureDateStr = futureDate.toISOString().split('T')[0]

      const validEdit = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Updated Group',
        destination: 'Barcelona',
        start_date: futureDateStr,
        end_date: futureDateStr,
      }

      const result = editGroupSchema.safeParse(validEdit)
      expect(result.success).toBe(true)
    })

    it('should reject edit without id', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 10)
      const futureDateStr = futureDate.toISOString().split('T')[0]

      const invalidEdit = {
        name: 'Updated Group',
        destination: 'Barcelona',
        start_date: futureDateStr,
        end_date: futureDateStr,
      }

      const result = editGroupSchema.safeParse(invalidEdit)
      expect(result.success).toBe(false)
    })

    it('should reject invalid UUID for id', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 10)
      const futureDateStr = futureDate.toISOString().split('T')[0]

      const invalidEdit = {
        id: 'not-a-uuid',
        name: 'Updated Group',
        destination: 'Barcelona',
        start_date: futureDateStr,
        end_date: futureDateStr,
      }

      const result = editGroupSchema.safeParse(invalidEdit)
      expect(result.success).toBe(false)
    })
  })
})
