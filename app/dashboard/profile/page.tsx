import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileContent from '@/components/profile/profile-content'

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch user profile with group memberships
  const { data: profile } = await supabase
    .from('users')
    .select(`
      full_name,
      avatar_url,
      role,
      created_at,
      group_members (
        group_id,
        role,
        joined_at,
        travel_groups (
          id,
          name,
          destination,
          start_date,
          end_date
        )
      )
    `)
    .eq('id', user.id)
    .single()

  return <ProfileContent user={user} profile={profile} />
}
