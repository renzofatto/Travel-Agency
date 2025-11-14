import { createClient } from '@/lib/supabase/server'
import GroupList from '@/components/groups/group-list'
import EmptyState from '@/components/groups/empty-state'
import CreateGroupButton from '@/components/groups/create-group-button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Fetch groups where user is a member with member count and user role
  const { data: groups, error } = await supabase
    .from('travel_groups')
    .select(
      `
      id,
      name,
      description,
      destination,
      start_date,
      end_date,
      cover_image,
      created_by,
      group_members!inner (
        role,
        user_id
      )
    `
    )
    .eq('group_members.user_id', user.id)
    .order('start_date', { ascending: false })

  if (error) {
    console.error('Error fetching groups:', error)
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading groups. Please try again later.</p>
      </div>
    )
  }

  // Get member counts for each group
  const groupsWithCounts = await Promise.all(
    (groups || []).map(async (group) => {
      const { count } = await supabase
        .from('group_members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', group.id)

      // Find user's role in this group
      const userMembership = group.group_members.find(
        (m: any) => m.user_id === user.id
      )

      return {
        id: group.id,
        name: group.name,
        description: group.description,
        destination: group.destination,
        start_date: group.start_date,
        end_date: group.end_date,
        cover_image: group.cover_image,
        member_count: count || 0,
        user_role: userMembership?.role as 'leader' | 'member',
      }
    })
  )

  // Filter groups by status
  const now = new Date()
  const upcomingGroups = groupsWithCounts.filter(
    (g) => new Date(g.start_date) > now
  )
  const activeGroups = groupsWithCounts.filter(
    (g) => new Date(g.start_date) <= now && new Date(g.end_date) >= now
  )
  const pastGroups = groupsWithCounts.filter((g) => new Date(g.end_date) < now)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Travel Groups</h1>
          <p className="text-gray-600 mt-1">
            Manage your trips and collaborate with your travel buddies
          </p>
        </div>
        {groupsWithCounts.length > 0 && <CreateGroupButton />}
      </div>

      {/* Empty State */}
      {groupsWithCounts.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="text-sm font-medium text-gray-600">Total Groups</div>
              <div className="text-3xl font-bold text-gray-900 mt-2">
                {groupsWithCounts.length}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="text-sm font-medium text-gray-600">Upcoming Trips</div>
              <div className="text-3xl font-bold text-blue-600 mt-2">
                {upcomingGroups.length}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="text-sm font-medium text-gray-600">Active Trips</div>
              <div className="text-3xl font-bold text-green-600 mt-2">
                {activeGroups.length}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">
                All ({groupsWithCounts.length})
              </TabsTrigger>
              <TabsTrigger value="upcoming">
                Upcoming ({upcomingGroups.length})
              </TabsTrigger>
              <TabsTrigger value="active">
                Active ({activeGroups.length})
              </TabsTrigger>
              <TabsTrigger value="past">
                Past ({pastGroups.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <GroupList groups={groupsWithCounts} />
            </TabsContent>

            <TabsContent value="upcoming" className="mt-6">
              {upcomingGroups.length > 0 ? (
                <GroupList groups={upcomingGroups} />
              ) : (
                <div className="text-center py-12 text-gray-500">
                  No upcoming trips
                </div>
              )}
            </TabsContent>

            <TabsContent value="active" className="mt-6">
              {activeGroups.length > 0 ? (
                <GroupList groups={activeGroups} />
              ) : (
                <div className="text-center py-12 text-gray-500">
                  No active trips
                </div>
              )}
            </TabsContent>

            <TabsContent value="past" className="mt-6">
              {pastGroups.length > 0 ? (
                <GroupList groups={pastGroups} />
              ) : (
                <div className="text-center py-12 text-gray-500">
                  No past trips
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
