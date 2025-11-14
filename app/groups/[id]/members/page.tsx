import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import AddMemberDialog from '@/components/groups/add-member-dialog'
import MemberListItem from '@/components/groups/member-list-item'
import { Users } from 'lucide-react'

export default async function GroupMembersPage({
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

  // Check if user is admin or leader
  const { data: userProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = userProfile?.role === 'admin'
  const isLeader = membership.role === 'leader'
  const canManage = isAdmin || isLeader

  // Fetch all members
  const { data: members } = await supabase
    .from('group_members')
    .select(`
      user_id,
      role,
      joined_at,
      user:users (
        full_name,
        email,
        avatar_url
      )
    `)
    .eq('group_id', id)
    .order('role', { ascending: false }) // Leaders first
    .order('joined_at', { ascending: true })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Members</h2>
          <p className="text-gray-600 mt-1">
            {members?.length || 0} {members?.length === 1 ? 'member' : 'members'}
          </p>
        </div>
        {canManage && <AddMemberDialog groupId={id} />}
      </div>

      {/* Members List */}
      {members && members.length > 0 ? (
        <div className="space-y-2">
          {members.map((member: any) => (
            <MemberListItem
              key={member.user_id}
              member={member}
              groupId={id}
              canManage={canManage}
              currentUserId={user.id}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No members yet</h3>
          <p className="text-gray-600">
            {canManage
              ? 'Start by adding members to your group'
              : 'This group has no members yet'}
          </p>
        </div>
      )}
    </div>
  )
}
