'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Save, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { createNote, updateNote } from '@/lib/actions/note-actions'

interface NoteEditorProps {
  groupId: string
  note?: {
    id: string
    title: string
    content: string
  }
  mode: 'create' | 'edit'
  onCancel?: () => void
  onSave?: () => void
}

export default function NoteEditor({
  groupId,
  note,
  mode,
  onCancel,
  onSave,
}: NoteEditorProps) {
  const router = useRouter()
  const [title, setTitle] = useState(note?.title || '')
  const [content, setContent] = useState(note?.content || '')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title')
      return
    }

    if (!content.trim()) {
      toast.error('Please enter some content')
      return
    }

    setIsSaving(true)

    let result
    if (mode === 'create') {
      result = await createNote(groupId, title, content)
    } else {
      result = await updateNote(note!.id, groupId, title, content)
    }

    setIsSaving(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(mode === 'create' ? 'Note created' : 'Note updated')

      if (mode === 'create') {
        setTitle('')
        setContent('')
      }

      router.refresh()
      onSave?.()
    }
  }

  const handleCancel = () => {
    if (mode === 'create') {
      setTitle('')
      setContent('')
    }
    onCancel?.()
  }

  return (
    <div className="space-y-4 bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          placeholder="Note title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          disabled={isSaving}
        />
        <p className="text-xs text-gray-500">{title.length}/200 characters</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content *</Label>
        <Textarea
          id="content"
          placeholder="Start writing your note..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={12}
          maxLength={50000}
          disabled={isSaving}
          className="resize-none font-mono text-sm"
        />
        <p className="text-xs text-gray-500">
          {content.length.toLocaleString()}/50,000 characters
        </p>
      </div>

      <div className="flex gap-2 justify-end pt-4 border-t">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
          >
            <X className="w-4 h-4 mr-1" />
            Cancel
          </Button>
        )}
        <Button onClick={handleSave} disabled={isSaving || !title.trim() || !content.trim()}>
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-1" />
              {mode === 'create' ? 'Create Note' : 'Save Changes'}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
