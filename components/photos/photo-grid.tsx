'use client'

import { useState } from 'react'
import { MessageCircle, User, Heart } from 'lucide-react'
import PhotoModal from './photo-modal'

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

interface PhotoGridProps {
  photos: Photo[]
  groupId: string
  currentUserId: string
  isAdmin: boolean
}

export default function PhotoGrid({
  photos,
  groupId,
  currentUserId,
  isAdmin,
}: PhotoGridProps) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null)

  const handlePhotoClick = (index: number) => {
    setSelectedPhotoIndex(index)
  }

  const handleCloseModal = () => {
    setSelectedPhotoIndex(null)
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
            onClick={() => handlePhotoClick(index)}
          >
            {/* Photo */}
            <img
              src={photo.file_url}
              alt={photo.caption || 'Photo'}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />

            {/* Overlay on Hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200">
              <div className="absolute inset-0 p-3 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {/* Top: Uploader */}
                {photo.uploader && (
                  <div className="flex items-center gap-2 text-white">
                    <div className="w-6 h-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <User className="w-3 h-3" />
                    </div>
                    <span className="text-sm font-medium truncate">
                      {photo.uploader.full_name}
                    </span>
                  </div>
                )}

                {/* Bottom: Caption and Comments */}
                <div className="space-y-2">
                  {photo.caption && (
                    <p className="text-white text-sm line-clamp-2">
                      {photo.caption}
                    </p>
                  )}
                  {photo.comments && photo.comments.length > 0 && (
                    <div className="flex items-center gap-1 text-white">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">{photo.comments.length}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Photo Modal */}
      {selectedPhotoIndex !== null && (
        <PhotoModal
          photos={photos}
          initialIndex={selectedPhotoIndex}
          groupId={groupId}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          onClose={handleCloseModal}
        />
      )}
    </>
  )
}
