import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import UploadPhotosDialog from '@/components/photos/upload-photos-dialog'
import PhotoGrid from '@/components/photos/photo-grid'
import { ImageIcon, MessageCircle, Users } from 'lucide-react'

export default async function GroupPhotosPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: groupId } = await params
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return notFound()
  }

  // Check if user is admin
  const { data: userProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = userProfile?.role === 'admin'

  // Fetch photos with uploader info and comments
  const { data: photos, error } = await supabase
    .from('photos')
    .select(`
      *,
      uploader:users!uploaded_by (
        id,
        full_name,
        avatar_url
      ),
      comments:photo_comments (
        id,
        comment,
        created_at,
        user:users!user_id (
          id,
          full_name,
          avatar_url
        )
      )
    `)
    .eq('group_id', groupId)
    .order('uploaded_at', { ascending: false })

  if (error) {
    console.error('Error fetching photos:', error)
  }

  // Calculate stats
  const totalPhotos = photos?.length || 0
  const totalComments =
    photos?.reduce((acc, photo) => acc + (photo.comments?.length || 0), 0) || 0
  const uniqueUploaders = new Set(photos?.map((photo) => photo.uploaded_by) || [])
    .size

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Photo Gallery</h1>
          <p className="text-gray-600 mt-1">
            Share and view memories from your trip
          </p>
        </div>
        <UploadPhotosDialog groupId={groupId} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <ImageIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Photos</p>
              <p className="text-2xl font-bold text-gray-900">{totalPhotos}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Comments</p>
              <p className="text-2xl font-bold text-gray-900">{totalComments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Contributors</p>
              <p className="text-2xl font-bold text-gray-900">
                {uniqueUploaders}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Grid */}
      {photos && photos.length > 0 ? (
        <PhotoGrid
          photos={photos}
          groupId={groupId}
          currentUserId={user.id}
          isAdmin={isAdmin}
        />
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No photos yet
          </h3>
          <p className="text-gray-600 mb-6">
            Start building memories by uploading your first photo
          </p>
          <UploadPhotosDialog groupId={groupId} />
        </div>
      )}
    </div>
  )
}
