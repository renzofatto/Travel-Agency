'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Trash2,
  Calendar,
  User,
  Loader2,
  MessageCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { deletePhoto } from '@/lib/actions/photo-actions'
import PhotoComments from './photo-comments'

interface Photo {
  id: string
  file_url: string
  caption: string | null
  uploaded_at: string
  uploaded_by: string
  uploader?: {
    full_name: string
    avatar_url?: string
  }
  comments?: Array<{
    id: string
    comment: string
    created_at: string
    user: {
      id: string
      full_name: string
      avatar_url?: string
    }
  }>
}

interface PhotoModalProps {
  photos: Photo[]
  initialIndex: number
  groupId: string
  currentUserId: string
  isAdmin: boolean
  onClose: () => void
}

export default function PhotoModal({
  photos,
  initialIndex,
  groupId,
  currentUserId,
  isAdmin,
  onClose,
}: PhotoModalProps) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showComments, setShowComments] = useState(false)

  const currentPhoto = photos[currentIndex]
  const isOwner = currentPhoto.uploaded_by === currentUserId
  const canDelete = isOwner || isAdmin

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1))
    setShowComments(false)
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0))
    setShowComments(false)
  }

  const handleDownload = () => {
    window.open(currentPhoto.file_url, '_blank')
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this photo?')) {
      return
    }

    setIsDeleting(true)

    const result = await deletePhoto(currentPhoto.id, groupId)

    setIsDeleting(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Photo deleted successfully')

      // If this was the last photo, close modal
      if (photos.length === 1) {
        onClose()
      } else {
        // Move to next photo or previous if at end
        if (currentIndex >= photos.length - 1) {
          setCurrentIndex(Math.max(0, currentIndex - 1))
        }
      }

      router.refresh()
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
    if (e.key === 'ArrowLeft') handlePrevious()
    if (e.key === 'ArrowRight') handleNext()
  }

  // Add keyboard listeners
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeyDown as any)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full transition-colors z-50"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Navigation Buttons */}
      {photos.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-4 p-2 text-white hover:bg-white/10 rounded-full transition-colors z-50"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 p-2 text-white hover:bg-white/10 rounded-full transition-colors z-50"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </>
      )}

      {/* Counter */}
      {photos.length > 1 && (
        <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 text-white rounded-full text-sm z-50">
          {currentIndex + 1} / {photos.length}
        </div>
      )}

      {/* Main Content */}
      <div className="w-full h-full flex flex-col lg:flex-row">
        {/* Image Section */}
        <div className="flex-1 flex items-center justify-center p-4">
          <img
            src={currentPhoto.file_url}
            alt={currentPhoto.caption || 'Photo'}
            className="max-w-full max-h-full object-contain"
          />
        </div>

        {/* Info Section */}
        <div className="lg:w-96 bg-white p-6 overflow-y-auto">
          {/* Header */}
          <div className="space-y-4 mb-6">
            {/* Uploader */}
            {currentPhoto.uploader && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="font-medium">{currentPhoto.uploader.full_name}</span>
              </div>
            )}

            {/* Date */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(currentPhoto.uploaded_at)}</span>
            </div>

            {/* Caption */}
            {currentPhoto.caption && (
              <p className="text-gray-700">{currentPhoto.caption}</p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowComments(!showComments)}
                className={showComments ? 'bg-blue-50' : ''}
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                Comments ({currentPhoto.comments?.length || 0})
              </Button>

              {canDelete && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Comments Section */}
          {showComments && (
            <PhotoComments
              photoId={currentPhoto.id}
              comments={currentPhoto.comments || []}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
            />
          )}
        </div>
      </div>
    </div>
  )
}
