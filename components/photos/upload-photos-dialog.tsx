'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Upload, Loader2, X, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { uploadPhotos } from '@/lib/actions/photo-actions'

interface UploadPhotosDialogProps {
  groupId: string
}

export default function UploadPhotosDialog({ groupId }: UploadPhotosDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [caption, setCaption] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length === 0) return

    // Validate each file
    const validFiles: File[] = []
    const newPreviews: string[] = []

    for (const file of selectedFiles) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name}: File must be an image (JPG, PNG, WEBP)`)
        continue
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name}: File size must be less than 10MB`)
        continue
      }

      validFiles.push(file)
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        newPreviews.push(reader.result as string)
        if (newPreviews.length === validFiles.length) {
          setPreviews((prev) => [...prev, ...newPreviews])
        }
      }
      reader.readAsDataURL(file)
    }

    setFiles((prev) => [...prev, ...validFiles])
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (files.length === 0) {
      toast.error('Please select at least one photo')
      return
    }

    setIsUploading(true)

    const formData = new FormData()
    formData.append('group_id', groupId)
    formData.append('caption', caption)

    files.forEach((file) => {
      formData.append('files', file)
    })

    const result = await uploadPhotos(formData)

    setIsUploading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      const uploadedCount = result.data?.length || 0
      toast.success(`${uploadedCount} photo${uploadedCount > 1 ? 's' : ''} uploaded successfully`)

      if (result.partialErrors) {
        result.partialErrors.forEach((error) => toast.error(error))
      }

      setOpen(false)
      setCaption('')
      setFiles([])
      setPreviews([])
      router.refresh()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="w-4 h-4 mr-2" />
          Upload Photos
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Photos</DialogTitle>
          <DialogDescription>
            Share your trip memories with your group
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="files">Photos *</Label>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('files')?.click()}
                className="w-full"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Select Photos
              </Button>
              <input
                id="files"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileChange}
                multiple
                className="hidden"
              />
            </div>
            <p className="text-xs text-gray-500">
              Accepted: JPG, PNG, WEBP (Max 10MB each)
            </p>
          </div>

          {/* Preview Grid */}
          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {previews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <div className="absolute bottom-1 left-1 right-1 bg-black/50 text-white text-xs px-1 py-0.5 rounded truncate">
                    {files[index].name}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Caption */}
          <div className="space-y-2">
            <Label htmlFor="caption">Caption (Optional)</Label>
            <Textarea
              id="caption"
              placeholder="Add a caption for these photos..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={500}
              rows={3}
            />
            <p className="text-xs text-gray-500">
              {caption.length}/500 characters
            </p>
          </div>

          {/* Selected Count */}
          {files.length > 0 && (
            <div className="text-sm text-gray-600">
              {files.length} photo{files.length > 1 ? 's' : ''} selected (
              {(files.reduce((acc, f) => acc + f.size, 0) / 1024 / 1024).toFixed(2)} MB total)
            </div>
          )}

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
            <Button type="submit" disabled={isUploading || files.length === 0} className="flex-1">
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload {files.length > 0 && `(${files.length})`}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
