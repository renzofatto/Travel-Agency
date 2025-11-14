'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Edit,
  Trash2,
  User,
  Calendar,
  Loader2,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { deleteNote } from '@/lib/actions/note-actions'
import NoteEditor from './note-editor'

interface NoteCardProps {
  note: {
    id: string
    title: string
    content: string
    created_at: string
    updated_at: string
    created_by: string
    last_edited_by: string
    creator?: {
      full_name: string
      avatar_url?: string
    }
    editor?: {
      full_name: string
      avatar_url?: string
    }
  }
  groupId: string
  currentUserId: string
  isAdmin: boolean
}

export default function NoteCard({
  note,
  groupId,
  currentUserId,
  isAdmin,
}: NoteCardProps) {
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const isCreator = note.created_by === currentUserId
  const canDelete = isCreator || isAdmin

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this note?')) {
      return
    }

    setIsDeleting(true)

    const result = await deleteNote(note.id, groupId)

    setIsDeleting(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Note deleted successfully')
      router.refresh()
    }
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

  const getPreview = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  if (isEditing) {
    return (
      <NoteEditor
        groupId={groupId}
        note={note}
        mode="edit"
        onCancel={() => setIsEditing(false)}
        onSave={() => setIsEditing(false)}
      />
    )
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-semibold text-gray-900 mb-2 break-words">
              {note.title}
            </h3>

            {/* Meta Info */}
            <div className="flex flex-wrap gap-3 text-sm text-gray-600">
              {note.creator && (
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>Created by {note.creator.full_name}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(note.created_at)}</span>
              </div>
            </div>

            {/* Last Edited Info */}
            {note.updated_at !== note.created_at && note.editor && (
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                <Edit className="w-3 h-3" />
                <span>
                  Last edited by {note.editor.full_name} on{' '}
                  {formatDate(note.updated_at)}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="w-4 h-4" />
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

        {/* Content Preview/Full */}
        <div className="space-y-2">
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap break-words font-mono text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
              {isExpanded ? note.content : getPreview(note.content)}
            </div>
          </div>

          {/* Expand/Collapse Button */}
          {note.content.length > 150 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" />
                  Show More
                </>
              )}
            </Button>
          )}
        </div>

        {/* Word Count */}
        <div className="flex items-center gap-2 mt-4 text-xs text-gray-500 border-t pt-3">
          <FileText className="w-3 h-3" />
          <span>
            {note.content.split(/\s+/).filter((word) => word.length > 0).length} words
            · {note.content.length.toLocaleString()} characters
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
