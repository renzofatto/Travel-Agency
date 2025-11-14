'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  File,
  FileText,
  Image,
  Download,
  Trash2,
  Loader2,
  Calendar,
  User,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { deleteDocument } from '@/lib/actions/document-actions'
import type { DocumentType } from '@/lib/validations/document'

interface DocumentCardProps {
  document: {
    id: string
    title: string
    document_type: DocumentType
    file_url: string
    uploaded_at: string
    uploaded_by: string
    uploader?: {
      full_name: string
      avatar_url?: string
    }
  }
  groupId: string
  currentUserId: string
  isAdmin: boolean
}

const documentTypeConfig: Record<DocumentType, { label: string; icon: string; color: string }> = {
  flight: { label: 'Flight', icon: '✈️', color: 'bg-blue-100 text-blue-700' },
  bus: { label: 'Bus', icon: '🚌', color: 'bg-green-100 text-green-700' },
  train: { label: 'Train', icon: '🚂', color: 'bg-purple-100 text-purple-700' },
  hotel: { label: 'Hotel', icon: '🏨', color: 'bg-orange-100 text-orange-700' },
  activity: { label: 'Activity', icon: '🎫', color: 'bg-pink-100 text-pink-700' },
  other: { label: 'Other', icon: '📄', color: 'bg-gray-100 text-gray-700' },
}

function getFileIcon(fileUrl: string) {
  const ext = fileUrl.split('.').pop()?.toLowerCase()
  if (['jpg', 'jpeg', 'png', 'webp'].includes(ext || '')) {
    return <Image className="w-8 h-8 text-blue-500" />
  }
  if (ext === 'pdf') {
    return <FileText className="w-8 h-8 text-red-500" />
  }
  return <File className="w-8 h-8 text-gray-500" />
}

export default function DocumentCard({
  document,
  groupId,
  currentUserId,
  isAdmin,
}: DocumentCardProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const typeConfig = documentTypeConfig[document.document_type]
  const isOwner = document.uploaded_by === currentUserId
  const canDelete = isOwner || isAdmin

  const handleDownload = () => {
    window.open(document.file_url, '_blank')
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return
    }

    setIsDeleting(true)

    const result = await deleteDocument(document.id, groupId)

    setIsDeleting(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Document deleted successfully')
      router.refresh()
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* File Icon */}
          <div className="flex-shrink-0">
            {getFileIcon(document.file_url)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title and Type */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {document.title}
                </h3>
                <Badge className={`${typeConfig.color} mt-1`} variant="secondary">
                  {typeConfig.icon} {typeConfig.label}
                </Badge>
              </div>
            </div>

            {/* Meta Info */}
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(document.uploaded_at)}</span>
              </div>
              {document.uploader && (
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{document.uploader.full_name}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownload}
              >
                <Download className="w-4 h-4 mr-1" />
                Download
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
                    <>
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
