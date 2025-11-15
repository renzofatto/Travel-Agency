'use client'

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { Calendar as CalendarIcon, Map, ChevronLeft, ChevronRight } from 'lucide-react'
import AddItineraryDialog from './add-itinerary-dialog'
import ItineraryItemCard from './itinerary-item-card'
import ItineraryMap from './itinerary-map'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface ItineraryItem {
  id: string
  title: string
  description: string | null
  date: string
  start_time: string | null
  end_time: string | null
  location: string | null
  category: 'transport' | 'accommodation' | 'activity' | 'food' | 'other'
  order_index: number
  group_id: string
  created_at: string
}

interface ItineraryPageClientProps {
  groupId: string
  items: ItineraryItem[]
}

export default function ItineraryPageClient({
  groupId,
  items,
}: ItineraryPageClientProps) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)

  // Group items by date
  const itemsByDate = items.reduce((acc, item) => {
    const date = item.date
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(item)
    return acc
  }, {} as Record<string, ItineraryItem[]>)

  const dates = Object.keys(itemsByDate).sort()

  // Day filter state
  const [selectedDateIndex, setSelectedDateIndex] = useState<number>(0)
  const selectedDate = dates[selectedDateIndex]

  // Get items for selected date
  const selectedDateItems = selectedDate ? itemsByDate[selectedDate] : []

  // Filter items for map based on selected date
  const itemsForMap = selectedDateItems.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    date: item.date,
    location: item.location,
    category: item.category,
  }))

  const handlePreviousDay = () => {
    if (selectedDateIndex > 0) {
      setSelectedDateIndex(selectedDateIndex - 1)
      setSelectedItemId(null) // Reset selection when changing day
    }
  }

  const handleNextDay = () => {
    if (selectedDateIndex < dates.length - 1) {
      setSelectedDateIndex(selectedDateIndex + 1)
      setSelectedItemId(null) // Reset selection when changing day
    }
  }

  const handleItemClick = (itemId: string) => {
    setSelectedItemId(itemId)
    // Scroll to map
    const mapElement = document.getElementById('trip-map')
    if (mapElement) {
      mapElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Itinerary</h2>
          <p className="text-gray-600 mt-1">
            {items.length} {items.length === 1 ? 'activity' : 'activities'} planned
            {dates.length > 0 && ` • ${dates.length} ${dates.length === 1 ? 'day' : 'days'}`}
          </p>
        </div>
        <AddItineraryDialog groupId={groupId} />
      </div>

      {/* Day Navigation */}
      {dates.length > 1 && (
        <div className="bg-white rounded-lg p-4 border shadow-sm">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousDay}
              disabled={selectedDateIndex === 0}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="text-center">
              <div className="flex items-center gap-2 justify-center mb-1">
                <CalendarIcon className="w-4 h-4 text-blue-600" />
                <p className="font-semibold text-gray-900">
                  {selectedDate && format(parseISO(selectedDate), 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
              <p className="text-sm text-gray-600">
                Day {selectedDateIndex + 1} of {dates.length}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNextDay}
              disabled={selectedDateIndex === dates.length - 1}
              className="gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Map Section */}
      {items.length > 0 && (
        <div id="trip-map" className="bg-white rounded-lg p-6 border shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Map className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Trip Map</h3>
            <Badge variant="outline" className="ml-auto">
              {itemsForMap.filter((i) => i.location).length} location
              {itemsForMap.filter((i) => i.location).length !== 1 ? 's' : ''}
            </Badge>
          </div>
          <ItineraryMap items={itemsForMap} selectedItemId={selectedItemId} />
          {selectedItemId && (
            <p className="text-sm text-gray-500 mt-3 text-center">
              Click on another activity to center it on the map
            </p>
          )}
        </div>
      )}

      {/* Itinerary List */}
      {dates.length > 0 && selectedDate ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b">
            <Badge variant="secondary" className="text-base">
              {selectedDateItems.length}{' '}
              {selectedDateItems.length === 1 ? 'activity' : 'activities'}
            </Badge>
          </div>

          <div className="space-y-3">
            {selectedDateItems.map((item, index) => (
              <div
                key={item.id}
                onClick={() => item.location && handleItemClick(item.id)}
                className={`transition-all ${
                  item.location
                    ? 'cursor-pointer hover:shadow-md'
                    : 'cursor-default'
                } ${
                  selectedItemId === item.id
                    ? 'ring-2 ring-blue-500 shadow-lg'
                    : ''
                }`}
              >
                <ItineraryItemCard item={item} groupId={groupId} index={index + 1} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No activities planned yet</p>
          <p className="text-gray-500 text-sm mt-1">
            Add your first activity to start building your itinerary
          </p>
        </div>
      )}
    </div>
  )
}
