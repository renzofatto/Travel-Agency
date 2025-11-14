import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Calendar, MapPin, User, Clock } from 'lucide-react'
import { format } from 'date-fns'

export default async function GroupOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const { id } = await params

  // Fetch group with creator info
  const { data: group, error } = await supabase
    .from('travel_groups')
    .select(`
      *,
      creator:users!travel_groups_created_by_fkey (
        full_name,
        email
      )
    `)
    .eq('id', id)
    .single()

  if (error || !group) {
    notFound()
  }

  // Get member count and list
  const { data: members, count: memberCount } = await supabase
    .from('group_members')
    .select(`
      role,
      joined_at,
      user:users (
        full_name,
        email,
        avatar_url
      )
    `, { count: 'exact' })
    .eq('group_id', id)
    .order('joined_at', { ascending: true })
    .limit(5)

  // Get upcoming itinerary items
  const { data: upcomingItems, count: itineraryCount } = await supabase
    .from('itinerary_items')
    .select('*', { count: 'exact' })
    .eq('group_id', id)
    .gte('date', new Date().toISOString())
    .order('date', { ascending: true })
    .order('start_time', { ascending: true })
    .limit(3)

  // Get expense summary
  const { data: expenses } = await supabase
    .from('expenses')
    .select('amount, currency')
    .eq('group_id', id)

  const totalExpenses = expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0
  const currency = expenses?.[0]?.currency || 'USD'

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-sm font-medium text-blue-600">Members</div>
          <div className="text-2xl font-bold text-blue-900 mt-1">{memberCount || 0}</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-sm font-medium text-green-600">Itinerary Items</div>
          <div className="text-2xl font-bold text-green-900 mt-1">{itineraryCount || 0}</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-sm font-medium text-purple-600">Total Expenses</div>
          <div className="text-2xl font-bold text-purple-900 mt-1">
            {currency} {totalExpenses.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Trip Details */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Trip Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">Destination</div>
              <div className="text-base text-gray-900">{group.destination}</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">Duration</div>
              <div className="text-base text-gray-900">
                {format(new Date(group.start_date), 'MMM d')} - {format(new Date(group.end_date), 'MMM d, yyyy')}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">Created By</div>
              <div className="text-base text-gray-900">
                {group.creator?.full_name || group.creator?.email || 'Unknown'}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">Created</div>
              <div className="text-base text-gray-900">
                {format(new Date(group.created_at), 'MMM d, yyyy')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Members */}
      {members && members.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Members</h2>
          <div className="space-y-3">
            {members.map((member: any, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium">
                  {member.user?.full_name?.[0] || member.user?.email?.[0] || 'U'}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {member.user?.full_name || 'User'}
                  </div>
                  <div className="text-sm text-gray-600">{member.user?.email}</div>
                </div>
                {member.role === 'leader' && (
                  <div className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                    Leader
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Activities */}
      {upcomingItems && upcomingItems.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Activities</h2>
          <div className="space-y-3">
            {upcomingItems.map((item) => (
              <div key={item.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{item.title}</div>
                  <div className="text-sm text-gray-600">
                    {format(new Date(item.date), 'MMM d, yyyy')}
                    {item.start_time && ` at ${item.start_time}`}
                  </div>
                  {item.location && (
                    <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {item.location}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty States */}
      {(!upcomingItems || upcomingItems.length === 0) && (!members || members.length === 0) && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">
            <Calendar className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Getting Started</h3>
          <p className="text-gray-600 mb-4">
            Start planning your trip by adding members and creating your itinerary
          </p>
        </div>
      )}
    </div>
  )
}
