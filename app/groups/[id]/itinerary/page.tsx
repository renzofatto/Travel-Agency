import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { Calendar as CalendarIcon, Map } from 'lucide-react'
import AddItineraryDialog from '@/components/itinerary/add-itinerary-dialog'
import ItineraryItemCard from '@/components/itinerary/itinerary-item-card'
import ItineraryMap from '@/components/itinerary/itinerary-map'
import { Badge } from '@/components/ui/badge'

export default async function GroupItineraryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const { id } = await params

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Check if user has access to this group
  const { data: membership } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', id)
    .eq('user_id', user.id)
    .single()

  if (!membership) {
    notFound()
  }

  // Fetch itinerary items
  const { data: items } = await supabase
    .from('itinerary_items')
    .select('*')
    .eq('group_id', id)
    .order('date', { ascending: true })
    .order('order_index', { ascending: true })

  // Group items by date
  const itemsByDate = items?.reduce((acc, item) => {
    const date = item.date
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(item)
    return acc
  }, {} as Record<string, any[]>)

  const dates = Object.keys(itemsByDate || {}).sort()

  const itemsForMap = items?.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    date: item.date,
    location: item.location,
    category: item.category,
  })) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Itinerary</h2>
          <p className="text-gray-600 mt-1">
            {items?.length || 0} {items?.length === 1 ? 'activity' : 'activities'} planned
          </p>
        </div>
        <AddItineraryDialog groupId={id} />
      </div>

      {/* Map Section */}
      {items && items.length > 0 && (
        <div className="bg-white rounded-lg p-6 border shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Map className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Trip Map</h3>
            <Badge variant="outline" className="ml-auto">
              {itemsForMap.filter((i) => i.location).length} location
              {itemsForMap.filter((i) => i.location).length !== 1 ? 's' : ''}
            </Badge>
          </div>
          <ItineraryMap items={itemsForMap} />
        </div>
      )}

      {/* Itinerary List */}
      {dates.length > 0 ? (
        <div className="space-y-8">
          {dates.map((date) => {
            const dateItems = itemsByDate[date]
            const parsedDate = parseISO(date)

            return (
              <div key={date} className="space-y-4">
                {/* Date Header */}
                <div className="flex items-center gap-3 pb-2 border-b-2 border-gray-200">
                  <CalendarIcon className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {format(parsedDate, 'EEEE, MMMM d, yyyy')}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {dateItems.length} {dateItems.length === 1 ? 'activity' : 'activities'}
                    </p>
                  </div>
                </div>

                {/* Activities for this date */}
                <div className="space-y-3 pl-0 md:pl-8">
                  {dateItems.map((item: any) => (
                    <ItineraryItemCard
                      key={item.id}
                      item={item}
                      groupId={id}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No activities yet
          </h3>
          <p className="text-gray-600 mb-4">
            Start planning your trip by adding activities to your itinerary
          </p>
          <AddItineraryDialog groupId={id} />
        </div>
      )}
    </div>
  )
}
