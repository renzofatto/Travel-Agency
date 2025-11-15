import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import GroupForm from '@/components/groups/group-form'
import * as groupActions from '@/lib/actions/group-actions'

// Mock the modules
vi.mock('sonner')
vi.mock('@/lib/actions/group-actions', () => ({
  createGroup: vi.fn(),
  updateGroup: vi.fn(),
  uploadGroupCover: vi.fn(),
}))

// Mock next/navigation
const mockBack = vi.fn()
const mockRefresh = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    back: mockBack,
    refresh: mockRefresh,
  }),
}))

describe('GroupForm Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Create Mode', () => {
    it('should render all form fields in create mode', () => {
      render(<GroupForm mode="create" />)

      expect(screen.getByLabelText(/group name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/destination/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/start date/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/end date/i)).toBeInTheDocument()
      expect(screen.getByText(/cover image/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create group/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })

    it('should show validation errors for empty required fields', async () => {
      const user = userEvent.setup()
      render(<GroupForm mode="create" />)

      const submitButton = screen.getByRole('button', { name: /create group/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/group name must be at least 3 characters/i)).toBeInTheDocument()
        expect(screen.getByText(/destination must be at least 2 characters/i)).toBeInTheDocument()
        expect(screen.getByText(/start date is required/i)).toBeInTheDocument()
        expect(screen.getByText(/end date is required/i)).toBeInTheDocument()
      })
    })

    it('should show validation error for short group name', async () => {
      const user = userEvent.setup()
      render(<GroupForm mode="create" />)

      const nameInput = screen.getByLabelText(/group name/i)
      await user.type(nameInput, 'AB')
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText(/group name must be at least 3 characters/i)).toBeInTheDocument()
      })
    })

    it('should show validation error for short destination', async () => {
      const user = userEvent.setup()
      render(<GroupForm mode="create" />)

      const destinationInput = screen.getByLabelText(/destination/i)
      await user.type(destinationInput, 'A')
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText(/destination must be at least 2 characters/i)).toBeInTheDocument()
      })
    })

    it('should submit form with valid data', async () => {
      const user = userEvent.setup()
      const mockCreateGroup = vi.mocked(groupActions.createGroup)
      mockCreateGroup.mockResolvedValue({ success: true })

      render(<GroupForm mode="create" />)

      // Fill in form
      await user.type(screen.getByLabelText(/group name/i), 'Summer Europe Trip')
      await user.type(screen.getByLabelText(/destination/i), 'Paris, France')
      await user.type(screen.getByLabelText(/description/i), 'A wonderful summer vacation')
      await user.type(screen.getByLabelText(/start date/i), '2024-07-01')
      await user.type(screen.getByLabelText(/end date/i), '2024-07-15')

      // Submit form
      const submitButton = screen.getByRole('button', { name: /create group/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockCreateGroup).toHaveBeenCalledWith({
          name: 'Summer Europe Trip',
          destination: 'Paris, France',
          description: 'A wonderful summer vacation',
          start_date: '2024-07-01',
          end_date: '2024-07-15',
          cover_image: '',
        })
      })
    })

    it('should show error toast on create failure', async () => {
      const user = userEvent.setup()
      const mockCreateGroup = vi.mocked(groupActions.createGroup)
      const mockToastError = vi.mocked(toast.error)
      mockCreateGroup.mockResolvedValue({ error: 'Failed to create group' })

      render(<GroupForm mode="create" />)

      // Fill in form with valid data
      await user.type(screen.getByLabelText(/group name/i), 'Summer Europe Trip')
      await user.type(screen.getByLabelText(/destination/i), 'Paris, France')
      await user.type(screen.getByLabelText(/start date/i), '2024-07-01')
      await user.type(screen.getByLabelText(/end date/i), '2024-07-15')

      // Submit form
      const submitButton = screen.getByRole('button', { name: /create group/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Failed to create group')
      })
    })

    it('should disable submit button while submitting', async () => {
      const user = userEvent.setup()
      const mockCreateGroup = vi.mocked(groupActions.createGroup)
      mockCreateGroup.mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100)))

      render(<GroupForm mode="create" />)

      // Fill in form with valid data
      await user.type(screen.getByLabelText(/group name/i), 'Summer Europe Trip')
      await user.type(screen.getByLabelText(/destination/i), 'Paris, France')
      await user.type(screen.getByLabelText(/start date/i), '2024-07-01')
      await user.type(screen.getByLabelText(/end date/i), '2024-07-15')

      // Submit form
      const submitButton = screen.getByRole('button', { name: /create group/i })
      await user.click(submitButton)

      // Button should be disabled
      expect(submitButton).toBeDisabled()
      expect(screen.getByText(/creating/i)).toBeInTheDocument()
    })

    it('should call router.back when cancel is clicked', async () => {
      const user = userEvent.setup()
      render(<GroupForm mode="create" />)

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      expect(mockBack).toHaveBeenCalled()
    })
  })

  describe('Edit Mode', () => {
    const defaultValues = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Existing Group',
      destination: 'Barcelona, Spain',
      description: 'Existing description',
      start_date: '2024-08-01',
      end_date: '2024-08-10',
      cover_image: 'https://example.com/image.jpg',
    }

    it('should render with pre-filled values in edit mode', () => {
      render(<GroupForm mode="edit" defaultValues={defaultValues} />)

      expect(screen.getByDisplayValue('Existing Group')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Barcelona, Spain')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Existing description')).toBeInTheDocument()
      expect(screen.getByDisplayValue('2024-08-01')).toBeInTheDocument()
      expect(screen.getByDisplayValue('2024-08-10')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /update group/i })).toBeInTheDocument()
    })

    it('should display existing cover image', () => {
      render(<GroupForm mode="edit" defaultValues={defaultValues} />)

      const coverImage = screen.getByAltText(/cover preview/i)
      expect(coverImage).toBeInTheDocument()
      expect(coverImage).toHaveAttribute('src', 'https://example.com/image.jpg')
    })

    it('should submit updated data', async () => {
      const user = userEvent.setup()
      const mockUpdateGroup = vi.mocked(groupActions.updateGroup)
      const mockToastSuccess = vi.mocked(toast.success)
      mockUpdateGroup.mockResolvedValue({ success: true })

      render(<GroupForm mode="edit" defaultValues={defaultValues} />)

      // Update name
      const nameInput = screen.getByLabelText(/group name/i)
      await user.clear(nameInput)
      await user.type(nameInput, 'Updated Group Name')

      // Submit form
      const submitButton = screen.getByRole('button', { name: /update group/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockUpdateGroup).toHaveBeenCalledWith({
          id: defaultValues.id,
          name: 'Updated Group Name',
          destination: 'Barcelona, Spain',
          description: 'Existing description',
          start_date: '2024-08-01',
          end_date: '2024-08-10',
          cover_image: 'https://example.com/image.jpg',
        })
        expect(mockToastSuccess).toHaveBeenCalledWith('Group updated successfully')
        expect(mockRefresh).toHaveBeenCalled()
      })
    })

    it('should show error toast on update failure', async () => {
      const user = userEvent.setup()
      const mockUpdateGroup = vi.mocked(groupActions.updateGroup)
      const mockToastError = vi.mocked(toast.error)
      mockUpdateGroup.mockResolvedValue({ error: 'Failed to update group' })

      render(<GroupForm mode="edit" defaultValues={defaultValues} />)

      // Submit form
      const submitButton = screen.getByRole('button', { name: /update group/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Failed to update group')
      })
    })
  })

  describe('Image Upload', () => {
    it('should show error for non-image file', async () => {
      const user = userEvent.setup()
      const mockToastError = vi.mocked(toast.error)
      const { container } = render(<GroupForm mode="create" />)

      // Create a non-image file
      const file = new File(['content'], 'document.pdf', { type: 'application/pdf' })
      const input = container.querySelector('input[type="file"]')!

      await user.upload(input, file)

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Please select an image file')
      })
    })

    it('should show error for file larger than 5MB', async () => {
      const user = userEvent.setup()
      const mockToastError = vi.mocked(toast.error)
      const { container } = render(<GroupForm mode="create" />)

      // Create a large file (6MB)
      const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' })
      const input = container.querySelector('input[type="file"]')!

      await user.upload(input, largeFile)

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Image must be less than 5MB')
      })
    })

    it('should preview and upload valid image', async () => {
      const user = userEvent.setup()
      const mockUploadGroupCover = vi.mocked(groupActions.uploadGroupCover)
      const mockCreateGroup = vi.mocked(groupActions.createGroup)
      mockUploadGroupCover.mockResolvedValue({ url: 'https://example.com/uploaded.jpg' })
      mockCreateGroup.mockResolvedValue({ success: true })

      const { container } = render(<GroupForm mode="create" />)

      // Create valid image file
      const file = new File(['image content'], 'test.jpg', { type: 'image/jpeg' })
      const input = container.querySelector('input[type="file"]')!

      await user.upload(input, file)

      // Fill in required fields
      await user.type(screen.getByLabelText(/group name/i), 'Test Group')
      await user.type(screen.getByLabelText(/destination/i), 'Test Destination')
      await user.type(screen.getByLabelText(/start date/i), '2024-07-01')
      await user.type(screen.getByLabelText(/end date/i), '2024-07-15')

      // Submit form
      const submitButton = screen.getByRole('button', { name: /create group/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockUploadGroupCover).toHaveBeenCalledWith(file)
        expect(mockCreateGroup).toHaveBeenCalledWith(
          expect.objectContaining({
            cover_image: 'https://example.com/uploaded.jpg',
          })
        )
      })
    })

    it('should remove cover image when X button is clicked', async () => {
      const user = userEvent.setup()
      const defaultValues = {
        name: 'Test',
        destination: 'Test',
        start_date: '2024-07-01',
        end_date: '2024-07-15',
        cover_image: 'https://example.com/image.jpg',
      }

      render(<GroupForm mode="edit" defaultValues={defaultValues} />)

      // Cover image should be visible
      expect(screen.getByAltText(/cover preview/i)).toBeInTheDocument()

      // Click remove button
      const removeButton = screen.getByRole('button', { name: '' }) // X button has no accessible name
      await user.click(removeButton)

      // Cover image should be removed
      await waitFor(() => {
        expect(screen.queryByAltText(/cover preview/i)).not.toBeInTheDocument()
        expect(screen.getByText(/click to upload/i)).toBeInTheDocument()
      })
    })

    it('should show error toast on upload failure', async () => {
      const user = userEvent.setup()
      const mockUploadGroupCover = vi.mocked(groupActions.uploadGroupCover)
      const mockToastError = vi.mocked(toast.error)
      mockUploadGroupCover.mockResolvedValue({ error: 'Upload failed' })

      const { container } = render(<GroupForm mode="create" />)

      // Upload valid file
      const file = new File(['image content'], 'test.jpg', { type: 'image/jpeg' })
      const input = container.querySelector('input[type="file"]')!
      await user.upload(input, file)

      // Fill in required fields
      await user.type(screen.getByLabelText(/group name/i), 'Test Group')
      await user.type(screen.getByLabelText(/destination/i), 'Test Destination')
      await user.type(screen.getByLabelText(/start date/i), '2024-07-01')
      await user.type(screen.getByLabelText(/end date/i), '2024-07-15')

      // Submit form
      const submitButton = screen.getByRole('button', { name: /create group/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Upload failed')
      })
    })
  })
})
