'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { MoreVertical, Edit, Trash2, MapPin, Clock, GripVertical } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { deleteItineraryItem } from '@/lib/actions/itinerary-actions'
import ItineraryForm from './itinerary-form'

interface ItineraryItemCardProps {
  item: {
    id: string
    title: string
    description: string | null
    date: string
    start_time: string | null
    end_time: string | null
    location: string | null
    category: 'transport' | 'accommodation' | 'activity' | 'food' | 'other'
    order_index: number
  }
  groupId?: string
  isDragging?: boolean
  index?: number
}

const categoryConfig = {
  transport: { emoji: '🚗', label: 'Transport', color: 'bg-blue-100 text-blue-700' },
  accommodation: { emoji: '🏨', label: 'Accommodation', color: 'bg-purple-100 text-purple-700' },
  activity: { emoji: '🎯', label: 'Activity', color: 'bg-green-100 text-green-700' },
  food: { emoji: '🍽️', label: 'Food', color: 'bg-orange-100 text-orange-700' },
  other: { emoji: '📌', label: 'Other', color: 'bg-gray-100 text-gray-700' },
}

export default function ItineraryItemCard({ item, groupId, isDragging, index }: ItineraryItemCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const category = categoryConfig[item.category]

  const handleDelete = async () => {
    if (!groupId) return
    setIsDeleting(true)
    const result = await deleteItineraryItem(item.id, groupId)

    if (result?.error) {
      toast.error(result.error)
      setIsDeleting(false)
      return
    }

    toast.success('Activity deleted')
  }

  return (
    <>
      <Card
        className={`hover:shadow-md transition-shadow ${
          isDragging ? 'opacity-50 rotate-2' : ''
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Number Badge */}
            {index && (
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold shadow-sm">
                  {index}
                </div>
              </div>
            )}

            {/* Drag Handle */}
            <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 mt-1">
              <GripVertical className="w-5 h-5" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{category.emoji}</span>
                    <Badge className={category.color}>{category.label}</Badge>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg">{item.title}</h3>
                </div>

                {/* Actions Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" disabled={isDeleting}>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleDelete}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Time */}
              {(item.start_time || item.end_time) && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Clock className="w-4 h-4" />
                  <span>
                    {item.start_time && format(new Date(`2000-01-01T${item.start_time}`), 'h:mm a')}
                    {item.start_time && item.end_time && ' - '}
                    {item.end_time && format(new Date(`2000-01-01T${item.end_time}`), 'h:mm a')}
                  </span>
                </div>
              )}

              {/* Location */}
              {item.location && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>{item.location}</span>
                </div>
              )}

              {/* Description */}
              {item.description && (
                <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {groupId && (
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Activity</DialogTitle>
            </DialogHeader>
            <ItineraryForm
              groupId={groupId}
              mode="edit"
              defaultValues={{
                title: item.title,
                description: item.description || '',
                date: item.date,
                start_time: item.start_time || '',
                end_time: item.end_time || '',
                location: item.location || '',
                category: item.category,
                group_id: groupId,
                id: item.id,
              }}
              onSuccess={() => setIsEditing(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
