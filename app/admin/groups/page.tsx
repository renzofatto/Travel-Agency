import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAllGroups } from '@/lib/actions/admin-actions'
import { Plane, Users, Calendar, MapPin, User, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default async function AdminGroupsPage() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Check if user is admin
  const { data: userProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userProfile?.role !== 'admin') {
    redirect('/dashboard')
  }

  // Get all groups
  const groupsResult = await getAllGroups()

  if (groupsResult.error || !groupsResult.data) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load groups</p>
      </div>
    )
  }

  const groups = groupsResult.data

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No date'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getGroupStatus = (startDate: string | null, endDate: string | null) => {
    if (!startDate) return { label: 'Draft', color: 'bg-gray-100 text-gray-700' }

    const now = new Date()
    const start = new Date(startDate)
    const end = endDate ? new Date(endDate) : null

    if (end && end < now) {
      return { label: 'Past', color: 'bg-gray-100 text-gray-700' }
    }

    if (start > now) {
      return { label: 'Upcoming', color: 'bg-blue-100 text-blue-700' }
    }

    return { label: 'Active', color: 'bg-green-100 text-green-700' }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Admin
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Groups</h1>
          <p className="text-gray-600 mt-1">View and monitor all travel groups</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Plane className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Groups</p>
              <p className="text-2xl font-bold text-gray-900">{groups.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Plane className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  groups.filter(
                    (g) => getGroupStatus(g.start_date, g.end_date).label === 'Active'
                  ).length
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Plane className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  groups.filter(
                    (g) => getGroupStatus(g.start_date, g.end_date).label === 'Upcoming'
                  ).length
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gray-100 rounded-lg">
              <Plane className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Past</p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  groups.filter(
                    (g) => getGroupStatus(g.start_date, g.end_date).label === 'Past'
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => {
          const status = getGroupStatus(group.start_date, group.end_date)
          const memberCount = group.group_members?.length || 0

          return (
            <Link
              key={group.id}
              href={`/groups/${group.id}`}
              className="block hover:shadow-lg transition-shadow"
            >
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-full">
                {/* Cover Image */}
                {group.cover_image ? (
                  <img
                    src={group.cover_image}
                    alt={group.name}
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Plane className="w-16 h-16 text-white opacity-50" />
                  </div>
                )}

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                      {group.name}
                    </h3>
                    <Badge className={status.color} variant="secondary">
                      {status.label}
                    </Badge>
                  </div>

                  {group.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {group.description}
                    </p>
                  )}

                  <div className="space-y-2 text-sm">
                    {group.destination && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{group.destination}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {formatDate(group.start_date)} - {formatDate(group.end_date)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{memberCount} members</span>
                    </div>

                    {group.creator && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="w-4 h-4" />
                        <span className="text-xs">
                          Created by {group.creator.full_name || group.creator.email}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {groups.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Plane className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No groups yet</h3>
          <p className="text-gray-600">Groups will appear here once users create them</p>
        </div>
      )}
    </div>
  )
}
