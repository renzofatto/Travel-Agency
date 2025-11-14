import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import UploadDocumentDialog from '@/components/documents/upload-document-dialog'
import DocumentCard from '@/components/documents/document-card'
import { FileText, FolderOpen } from 'lucide-react'

export default async function GroupDocumentsPage({
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

  // Fetch documents
  const { data: documents, error } = await supabase
    .from('travel_documents')
    .select(`
      *,
      uploader:users!uploaded_by (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('group_id', groupId)
    .order('uploaded_at', { ascending: false })

  if (error) {
    console.error('Error fetching documents:', error)
  }

  // Group documents by type
  type DocumentWithUploader = NonNullable<typeof documents>[number]
  const documentsByType = (documents || []).reduce(
    (acc, doc) => {
      const type = doc.document_type
      if (!acc[type]) {
        acc[type] = []
      }
      acc[type].push(doc)
      return acc
    },
    {} as Record<string, DocumentWithUploader[]>
  )

  const typeLabels: Record<string, string> = {
    flight: '✈️ Flight Tickets',
    bus: '🚌 Bus Tickets',
    train: '🚂 Train Tickets',
    hotel: '🏨 Hotel Reservations',
    activity: '🎫 Activity Bookings',
    other: '📄 Other Documents',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Travel Documents</h1>
          <p className="text-gray-600 mt-1">
            Store and manage all your trip-related documents
          </p>
        </div>
        <UploadDocumentDialog groupId={groupId} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Documents</p>
              <p className="text-2xl font-bold text-gray-900">
                {documents?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <FolderOpen className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-gray-900">
                {Object.keys(documentsByType).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Storage Used</p>
              <p className="text-2xl font-bold text-gray-900">
                {((documents?.length || 0) * 0.5).toFixed(1)} MB
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Documents by Type */}
      {documents && documents.length > 0 ? (
        <div className="space-y-8">
          {(Object.entries(documentsByType) as [string, DocumentWithUploader[]][]).map(([type, docs]) => (
            <div key={type}>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {typeLabels[type]} ({docs.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {docs.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    groupId={groupId}
                    currentUserId={user.id}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No documents yet
          </h3>
          <p className="text-gray-600 mb-6">
            Upload your first travel document to get started
          </p>
          <UploadDocumentDialog groupId={groupId} />
        </div>
      )}
    </div>
  )
}
