'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addMember(groupId: string, email: string) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  // Check if user is admin or leader
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
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single()

    if (!membership || membership.role !== 'leader') {
      return { error: 'You do not have permission to add members' }
    }
  }

  // Find user by email
  const { data: newUser, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('email', email.toLowerCase().trim())
    .single()

  if (userError || !newUser) {
    return { error: 'User not found. They must have an account first.' }
  }

  // Check if already a member
  const { data: existing } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', groupId)
    .eq('user_id', newUser.id)
    .single()

  if (existing) {
    return { error: 'User is already a member of this group' }
  }

  // Add member
  const { error: addError } = await supabase.from('group_members').insert({
    group_id: groupId,
    user_id: newUser.id,
    role: 'member',
  })

  if (addError) {
    console.error('Error adding member:', addError)
    return { error: 'Failed to add member. Please try again.' }
  }

  revalidatePath(`/groups/${groupId}/members`)
  return { success: true }
}

export async function removeMember(groupId: string, userId: string) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  // Check if user is admin or leader
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
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single()

    if (!membership || membership.role !== 'leader') {
      return { error: 'You do not have permission to remove members' }
    }
  }

  // Cannot remove yourself if you're the only leader
  if (userId === user.id) {
    const { count } = await supabase
      .from('group_members')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', groupId)
      .eq('role', 'leader')

    if (count === 1) {
      return { error: 'Cannot remove yourself as the only leader' }
    }
  }

  // Remove member
  const { error: removeError } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', userId)

  if (removeError) {
    console.error('Error removing member:', removeError)
    return { error: 'Failed to remove member. Please try again.' }
  }

  revalidatePath(`/groups/${groupId}/members`)
  return { success: true }
}

export async function toggleLeaderRole(groupId: string, userId: string, currentRole: 'leader' | 'member') {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  // Check if user is admin or leader
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
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single()

    if (!membership || membership.role !== 'leader') {
      return { error: 'You do not have permission to manage roles' }
    }
  }

  const newRole = currentRole === 'leader' ? 'member' : 'leader'

  // If removing leader role, ensure there's at least one other leader
  if (newRole === 'member') {
    const { count } = await supabase
      .from('group_members')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', groupId)
      .eq('role', 'leader')

    if (count === 1) {
      return { error: 'Cannot remove the only leader. Assign another leader first.' }
    }
  }

  // Update role
  const { error: updateError } = await supabase
    .from('group_members')
    .update({ role: newRole })
    .eq('group_id', groupId)
    .eq('user_id', userId)

  if (updateError) {
    console.error('Error updating role:', updateError)
    return { error: 'Failed to update role. Please try again.' }
  }

  revalidatePath(`/groups/${groupId}/members`)
  return { success: true }
}
