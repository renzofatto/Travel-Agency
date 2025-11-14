import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import GroupForm from '@/components/groups/group-form'
import { AlertTriangle } from 'lucide-react'
import DeleteGroupButton from '@/components/groups/delete-group-button'

export default async function GroupSettingsPage({
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

  // Fetch group
  const { data: group, error } = await supabase
    .from('travel_groups')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !group) {
    notFound()
  }

  // Check permissions
  const { data: userProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = userProfile?.role === 'admin'

  if (!isAdmin) {
    const { data: membership } = await supabase
      .from('group_members')
      .select('role')
      .eq('group_id', id)
      .eq('user_id', user.id)
      .single()

    if (!membership || membership.role !== 'leader') {
      redirect(`/groups/${id}`)
    }
  }

  return (
    <div className="max-w-3xl space-y-8">
      {/* Edit Group */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Group Settings</h2>
        <GroupForm
          mode="edit"
          defaultValues={{
            id: group.id,
            name: group.name,
            description: group.description || '',
            destination: group.destination,
            start_date: group.start_date,
            end_date: group.end_date,
            cover_image: group.cover_image || '',
          }}
        />
      </div>

      {/* Danger Zone (Admin Only) */}
      {isAdmin && (
        <div className="border-2 border-red-200 rounded-lg p-6 bg-red-50">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-1">Danger Zone</h3>
              <p className="text-sm text-red-700">
                The following actions are irreversible. Please be careful.
              </p>
            </div>
          </div>

          <div className="border-t border-red-200 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-red-900">Delete this group</h4>
                <p className="text-sm text-red-700 mt-1">
                  Once you delete a group, there is no going back. This will delete all
                  itinerary items, expenses, documents, photos, and notes associated with
                  this group.
                </p>
              </div>
              <DeleteGroupButton groupId={group.id} groupName={group.name} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
