'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Send, Trash2, User, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { addComment, deleteComment } from '@/lib/actions/photo-actions'

interface Comment {
  id: string
  comment: string
  created_at: string
  user: {
    id: string
    full_name: string
    avatar_url?: string
  }
}

interface PhotoCommentsProps {
  photoId: string
  comments: Comment[]
  currentUserId: string
  isAdmin: boolean
}

export default function PhotoComments({
  photoId,
  comments,
  currentUserId,
  isAdmin,
}: PhotoCommentsProps) {
  const router = useRouter()
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newComment.trim()) {
      toast.error('Comment cannot be empty')
      return
    }

    setIsSubmitting(true)

    const result = await addComment(photoId, newComment)

    setIsSubmitting(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Comment added')
      setNewComment('')
      router.refresh()
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return
    }

    setDeletingId(commentId)

    const result = await deleteComment(commentId, photoId)

    setDeletingId(null)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Comment deleted')
      router.refresh()
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-4 border-t pt-4">
      <h3 className="font-semibold text-lg">Comments</h3>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          maxLength={500}
          rows={2}
          disabled={isSubmitting}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {newComment.length}/500 characters
          </span>
          <Button type="submit" size="sm" disabled={isSubmitting || !newComment.trim()}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-1" />
                Post
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {comments.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No comments yet</p>
        ) : (
          comments.map((comment) => {
            const isOwner = comment.user.id === currentUserId
            const canDelete = isOwner || isAdmin

            return (
              <div
                key={comment.id}
                className="p-3 bg-gray-50 rounded-lg space-y-2"
              >
                {/* User and Date */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {comment.user.full_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(comment.created_at)}
                      </p>
                    </div>
                  </div>

                  {canDelete && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(comment.id)}
                      disabled={deletingId === comment.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {deletingId === comment.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </div>

                {/* Comment Text */}
                <p className="text-gray-700 text-sm">{comment.comment}</p>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
