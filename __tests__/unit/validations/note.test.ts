import { describe, it, expect } from 'vitest'
import {
  createNoteSchema,
  updateNoteSchema,
  deleteNoteSchema,
} from '@/lib/validations/note'

describe('Note Validation Schemas', () => {
  describe('createNoteSchema', () => {
    it('should validate a valid note', () => {
      const validNote = {
        group_id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Packing List',
        content: 'Remember to bring: passport, camera, sunscreen...',
      }

      const result = createNoteSchema.safeParse(validNote)
      expect(result.success).toBe(true)
    })

    it('should validate note with maximum content length', () => {
      const validNote = {
        group_id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Long Note',
        content: 'A'.repeat(50000),
      }

      const result = createNoteSchema.safeParse(validNote)
      expect(result.success).toBe(true)
    })

    it('should validate note with maximum title length', () => {
      const validNote = {
        group_id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'A'.repeat(200),
        content: 'Some content',
      }

      const result = createNoteSchema.safeParse(validNote)
      expect(result.success).toBe(true)
    })

    it('should reject empty title', () => {
      const invalidNote = {
        group_id: '123e4567-e89b-12d3-a456-426614174000',
        title: '',
        content: 'Some content',
      }

      const result = createNoteSchema.safeParse(invalidNote)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Title is required')
      }
    })

    it('should reject title longer than 200 characters', () => {
      const invalidNote = {
        group_id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'A'.repeat(201),
        content: 'Some content',
      }

      const result = createNoteSchema.safeParse(invalidNote)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Title must be less than 200 characters')
      }
    })

    it('should reject empty content', () => {
      const invalidNote = {
        group_id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test Note',
        content: '',
      }

      const result = createNoteSchema.safeParse(invalidNote)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Content is required')
      }
    })

    it('should reject content longer than 50,000 characters', () => {
      const invalidNote = {
        group_id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test Note',
        content: 'A'.repeat(50001),
      }

      const result = createNoteSchema.safeParse(invalidNote)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Content must be less than 50,000 characters')
      }
    })

    it('should reject invalid UUID for group_id', () => {
      const invalidNote = {
        group_id: 'not-a-uuid',
        title: 'Test Note',
        content: 'Some content',
      }

      const result = createNoteSchema.safeParse(invalidNote)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid group ID')
      }
    })

    it('should reject missing group_id', () => {
      const invalidNote = {
        title: 'Test Note',
        content: 'Some content',
      }

      const result = createNoteSchema.safeParse(invalidNote)
      expect(result.success).toBe(false)
    })
  })

  describe('updateNoteSchema', () => {
    it('should validate a valid update', () => {
      const validUpdate = {
        note_id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Updated Packing List',
        content: 'Updated content...',
      }

      const result = updateNoteSchema.safeParse(validUpdate)
      expect(result.success).toBe(true)
    })

    it('should reject missing note_id', () => {
      const invalidUpdate = {
        title: 'Updated Title',
        content: 'Updated content',
      }

      const result = updateNoteSchema.safeParse(invalidUpdate)
      expect(result.success).toBe(false)
    })

    it('should reject invalid UUID for note_id', () => {
      const invalidUpdate = {
        note_id: 'not-a-uuid',
        title: 'Updated Title',
        content: 'Updated content',
      }

      const result = updateNoteSchema.safeParse(invalidUpdate)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid note ID')
      }
    })

    it('should reject empty title', () => {
      const invalidUpdate = {
        note_id: '123e4567-e89b-12d3-a456-426614174000',
        title: '',
        content: 'Updated content',
      }

      const result = updateNoteSchema.safeParse(invalidUpdate)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Title is required')
      }
    })

    it('should reject empty content', () => {
      const invalidUpdate = {
        note_id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Updated Title',
        content: '',
      }

      const result = updateNoteSchema.safeParse(invalidUpdate)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Content is required')
      }
    })

    it('should validate update with maximum lengths', () => {
      const validUpdate = {
        note_id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'A'.repeat(200),
        content: 'B'.repeat(50000),
      }

      const result = updateNoteSchema.safeParse(validUpdate)
      expect(result.success).toBe(true)
    })
  })

  describe('deleteNoteSchema', () => {
    it('should validate a valid deletion', () => {
      const validDelete = {
        note_id: '123e4567-e89b-12d3-a456-426614174000',
        group_id: '123e4567-e89b-12d3-a456-426614174001',
      }

      const result = deleteNoteSchema.safeParse(validDelete)
      expect(result.success).toBe(true)
    })

    it('should reject missing note_id', () => {
      const invalidDelete = {
        group_id: '123e4567-e89b-12d3-a456-426614174000',
      }

      const result = deleteNoteSchema.safeParse(invalidDelete)
      expect(result.success).toBe(false)
    })

    it('should reject missing group_id', () => {
      const invalidDelete = {
        note_id: '123e4567-e89b-12d3-a456-426614174000',
      }

      const result = deleteNoteSchema.safeParse(invalidDelete)
      expect(result.success).toBe(false)
    })

    it('should reject invalid UUID for note_id', () => {
      const invalidDelete = {
        note_id: 'not-a-uuid',
        group_id: '123e4567-e89b-12d3-a456-426614174000',
      }

      const result = deleteNoteSchema.safeParse(invalidDelete)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid note ID')
      }
    })

    it('should reject invalid UUID for group_id', () => {
      const invalidDelete = {
        note_id: '123e4567-e89b-12d3-a456-426614174000',
        group_id: 'not-a-uuid',
      }

      const result = deleteNoteSchema.safeParse(invalidDelete)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid group ID')
      }
    })
  })
})
