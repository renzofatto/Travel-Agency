import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, MapPin, Users, Settings as SettingsIcon } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

export default async function GroupLayout({
  children,
  params,
}: {
  children: React.ReactNode
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

  // Fetch group details
  const { data: group, error } = await supabase
    .from('travel_groups')
    .select(`
      *,
      group_members!inner (
        role,
        user_id
      )
    `)
    .eq('id', id)
    .eq('group_members.user_id', user.id)
    .single()

  if (error || !group) {
    notFound()
  }

  // Get member count
  const { count: memberCount } = await supabase
    .from('group_members')
    .select('*', { count: 'exact', head: true })
    .eq('group_id', id)

  // Get user's role in this group
  const userMembership = group.group_members.find(
    (m: any) => m.user_id === user.id
  )
  const userRole = userMembership?.role as 'leader' | 'member'

  // Check if user is admin
  const { data: userProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = userProfile?.role === 'admin'
  const isLeader = userRole === 'leader'
  const canManage = isAdmin || isLeader

  const startDate = new Date(group.start_date)
  const endDate = new Date(group.end_date)
  const isUpcoming = startDate > new Date()
  const isPast = endDate < new Date()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar placeholder - uses main layout navbar */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumbs */}
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </Link>

        {/* Group Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          {/* Cover Image */}
          <div className="relative h-64 bg-gradient-to-r from-blue-500 to-indigo-600">
            {group.cover_image ? (
              <img
                src={group.cover_image}
                alt={group.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <MapPin className="w-24 h-24 text-white/30" />
              </div>
            )}
            {/* Status Badge */}
            <div className="absolute top-4 right-4">
              {isUpcoming && (
                <Badge className="bg-green-500 hover:bg-green-600">Upcoming</Badge>
              )}
              {isPast && (
                <Badge variant="secondary" className="bg-gray-500 hover:bg-gray-600 text-white">
                  Past
                </Badge>
              )}
              {!isUpcoming && !isPast && (
                <Badge className="bg-blue-500 hover:bg-blue-600">Active</Badge>
              )}
            </div>
          </div>

          {/* Group Info */}
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{group.name}</h1>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{group.destination}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{memberCount} members</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {isLeader && (
                  <Badge className="bg-purple-500 hover:bg-purple-600">Leader</Badge>
                )}
                {isAdmin && (
                  <Badge className="bg-red-500 hover:bg-red-600">Admin</Badge>
                )}
              </div>
            </div>

            {group.description && (
              <p className="text-gray-700 mb-4">{group.description}</p>
            )}

            {/* Tabs Navigation */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full justify-start">
                <Link href={`/groups/${id}`}>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                </Link>
                <Link href={`/groups/${id}/members`}>
                  <TabsTrigger value="members">Members</TabsTrigger>
                </Link>
                <Link href={`/groups/${id}/itinerary`}>
                  <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
                </Link>
                <Link href={`/groups/${id}/expenses`}>
                  <TabsTrigger value="expenses">Expenses</TabsTrigger>
                </Link>
                <Link href={`/groups/${id}/documents`}>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                </Link>
                <Link href={`/groups/${id}/photos`}>
                  <TabsTrigger value="photos">Photos</TabsTrigger>
                </Link>
                <Link href={`/groups/${id}/notes`}>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                </Link>
                {canManage && (
                  <Link href={`/groups/${id}/settings`}>
                    <TabsTrigger value="settings">
                      <SettingsIcon className="w-4 h-4 mr-1" />
                      Settings
                    </TabsTrigger>
                  </Link>
                )}
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Page Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
