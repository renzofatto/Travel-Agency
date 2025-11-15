'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Clock, MapPin, Pencil, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { deletePackageItineraryItem } from '@/lib/actions/package-actions'
import PackageItineraryForm from './package-itinerary-form'

const categoryEmojis: Record<string, string> = {
  transport: '🚗',
  accommodation: '🏨',
  activity: '🎯',
  food: '🍽️',
  other: '📌',
}

const categoryLabels: Record<string, string> = {
  transport: 'Transport',
  accommodation: 'Accommodation',
  activity: 'Activity',
  food: 'Food',
  other: 'Other',
}

interface PackageItineraryItem {
  id: string
  day_number: number
  title: string
  description: string | null
  start_time: string | null
  end_time: string | null
  location: string | null
  category: 'transport' | 'accommodation' | 'activity' | 'food' | 'other'
  order_index: number
}

interface PackageItineraryListProps {
  packageId: string
  items: PackageItineraryItem[]
  maxDays: number
}

export default function PackageItineraryList({
  packageId,
  items,
  maxDays,
}: PackageItineraryListProps) {
  const router = useRouter()
  const [editingItem, setEditingItem] = useState<PackageItineraryItem | null>(null)

  // Group items by day
  const itemsByDay: Record<number, PackageItineraryItem[]> = {}
  items.forEach((item) => {
    if (!itemsByDay[item.day_number]) {
      itemsByDay[item.day_number] = []
    }
    itemsByDay[item.day_number].push(item)
  })

  // Sort items within each day by order_index
  Object.keys(itemsByDay).forEach((day) => {
    itemsByDay[parseInt(day)].sort((a, b) => a.order_index - b.order_index)
  })

  async function handleDelete(itemId: string) {
    const result = await deletePackageItineraryItem(itemId)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Item deleted successfully')
      router.refresh()
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground">
          No itinerary items yet. Add your first activity above.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {Object.keys(itemsByDay)
        .map(Number)
        .sort((a, b) => a - b)
        .map((day) => (
          <div key={day}>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm">
                {day}
              </span>
              Day {day}
            </h3>

            <div className="space-y-3">
              {itemsByDay[day].map((item) => (
                <Card key={item.id}>
                  {editingItem?.id === item.id ? (
                    <CardContent className="pt-6">
                      <PackageItineraryForm
                        packageId={packageId}
                        mode="edit"
                        defaultValues={{
                          ...item,
                          description: item.description || undefined,
                          start_time: item.start_time || undefined,
                          end_time: item.end_time || undefined,
                          location: item.location || undefined,
                        }}
                        maxDays={maxDays}
                        onSuccess={() => setEditingItem(null)}
                        onCancel={() => setEditingItem(null)}
                      />
                    </CardContent>
                  ) : (
                    <>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-2xl">
                                {categoryEmojis[item.category]}
                              </span>
                              <Badge variant="secondary">
                                {categoryLabels[item.category]}
                              </Badge>
                            </div>
                            <CardTitle className="text-lg">{item.title}</CardTitle>
                          </div>

                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingItem(item)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Item?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete &quot;{item.title}&quot;?
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(item.id)}
                                    className="bg-destructive hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardHeader>

                      {(item.description || item.location || item.start_time) && (
                        <CardContent className="pt-0 space-y-2">
                          {item.description && (
                            <p className="text-sm text-muted-foreground">
                              {item.description}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            {item.start_time && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>
                                  {item.start_time}
                                  {item.end_time && ` - ${item.end_time}`}
                                </span>
                              </div>
                            )}

                            {item.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{item.location}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      )}
                    </>
                  )}
                </Card>
              ))}
            </div>
          </div>
        ))}
    </div>
  )
}
