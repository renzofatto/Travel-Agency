'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Upload, Loader2, File } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { uploadDocument } from '@/lib/actions/document-actions'
import type { DocumentType } from '@/lib/validations/document'

interface UploadDocumentDialogProps {
  groupId: string
}

const documentTypes: { value: DocumentType; label: string; icon: string }[] = [
  { value: 'flight', label: 'Flight Ticket', icon: '✈️' },
  { value: 'bus', label: 'Bus Ticket', icon: '🚌' },
  { value: 'train', label: 'Train Ticket', icon: '🚂' },
  { value: 'hotel', label: 'Hotel Reservation', icon: '🏨' },
  { value: 'activity', label: 'Activity Booking', icon: '🎫' },
  { value: 'other', label: 'Other Document', icon: '📄' },
]

export default function UploadDocumentDialog({ groupId }: UploadDocumentDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [title, setTitle] = useState('')
  const [documentType, setDocumentType] = useState<DocumentType>('other')
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]

    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error('File must be PDF, image (JPG, PNG, WEBP), or Word document')
      return
    }

    // Validate file size (10MB max)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }

    setFile(selectedFile)
    // Auto-fill title if empty
    if (!title) {
      setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      toast.error('Please select a file')
      return
    }

    if (!title) {
      toast.error('Please enter a title')
      return
    }

    setIsUploading(true)

    const formData = new FormData()
    formData.append('title', title)
    formData.append('document_type', documentType)
    formData.append('group_id', groupId)
    formData.append('file', file)

    const result = await uploadDocument(formData)

    setIsUploading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Document uploaded successfully')
      setOpen(false)
      setTitle('')
      setFile(null)
      setDocumentType('other')
      router.refresh()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Travel Document</DialogTitle>
          <DialogDescription>
            Upload tickets, reservations, or other travel-related documents
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file">Document File *</Label>
            <div className="flex items-center gap-4">
              <Input
                id="file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                onChange={handleFileChange}
                required
                className="flex-1"
              />
            </div>
            {file && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <File className="w-4 h-4" />
                <span>{file.name}</span>
                <span className="text-gray-400">
                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
            )}
            <p className="text-xs text-gray-500">
              Accepted: PDF, JPG, PNG, WEBP, Word (Max 10MB)
            </p>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Flight to Paris"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={200}
            />
          </div>

          {/* Document Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Document Type *</Label>
            <Select value={documentType} onValueChange={(value) => setDocumentType(value as DocumentType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isUploading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading || !file} className="flex-1">
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
