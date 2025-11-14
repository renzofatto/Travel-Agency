'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function checkIsAdmin(userId: string) {
  const supabase = await createClient()

  const { data: userProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single()

  return userProfile?.role === 'admin'
}

export async function getAllUsers() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  // Check if user is admin
  const isAdmin = await checkIsAdmin(user.id)
  if (!isAdmin) {
    return { error: 'Unauthorized. Admin access required.' }
  }

  // Fetch all users with their group counts
  const { data: users, error } = await supabase
    .from('users')
    .select(`
      *,
      group_members (
        group_id
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching users:', error)
    return { error: 'Failed to load users' }
  }

  return { success: true, data: users }
}

export async function updateUserRole(userId: string, newRole: 'admin' | 'user') {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  // Check if user is admin
  const isAdmin = await checkIsAdmin(user.id)
  if (!isAdmin) {
    return { error: 'Unauthorized. Admin access required.' }
  }

  // Prevent admin from demoting themselves
  if (user.id === userId && newRole === 'user') {
    return { error: 'You cannot remove your own admin privileges' }
  }

  // Update user role
  const { error: updateError } = await supabase
    .from('users')
    .update({ role: newRole })
    .eq('id', userId)

  if (updateError) {
    console.error('Error updating user role:', updateError)
    return { error: 'Failed to update user role' }
  }

  revalidatePath('/admin/users')
  return { success: true }
}

export async function getAllGroups() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  // Check if user is admin
  const isAdmin = await checkIsAdmin(user.id)
  if (!isAdmin) {
    return { error: 'Unauthorized. Admin access required.' }
  }

  // Fetch all groups with member counts and creator info
  const { data: groups, error } = await supabase
    .from('travel_groups')
    .select(`
      *,
      creator:users!created_by (
        id,
        full_name,
        email
      ),
      group_members (
        user_id,
        role
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching groups:', error)
    return { error: 'Failed to load groups' }
  }

  return { success: true, data: groups }
}

export async function getAdminStats() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  // Check if user is admin
  const isAdmin = await checkIsAdmin(user.id)
  if (!isAdmin) {
    return { error: 'Unauthorized. Admin access required.' }
  }

  // Get total users count
  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })

  // Get total groups count
  const { count: totalGroups } = await supabase
    .from('travel_groups')
    .select('*', { count: 'exact', head: true })

  // Get active groups (with end_date in future or null)
  const { count: activeGroups } = await supabase
    .from('travel_groups')
    .select('*', { count: 'exact', head: true })
    .or(`end_date.is.null,end_date.gte.${new Date().toISOString()}`)

  // Get total expenses
  const { data: expenses } = await supabase
    .from('expenses')
    .select('amount, currency')

  // Calculate total in USD (simplified - all currencies counted equally)
  const totalExpenses = expenses?.reduce((acc, exp) => acc + exp.amount, 0) || 0

  // Get total photos
  const { count: totalPhotos } = await supabase
    .from('photos')
    .select('*', { count: 'exact', head: true })

  // Get total documents
  const { count: totalDocuments } = await supabase
    .from('travel_documents')
    .select('*', { count: 'exact', head: true })

  // Get total notes
  const { count: totalNotes } = await supabase
    .from('group_notes')
    .select('*', { count: 'exact', head: true })

  return {
    success: true,
    data: {
      totalUsers: totalUsers || 0,
      totalGroups: totalGroups || 0,
      activeGroups: activeGroups || 0,
      totalExpenses,
      totalPhotos: totalPhotos || 0,
      totalDocuments: totalDocuments || 0,
      totalNotes: totalNotes || 0,
    },
  }
}

export async function deleteUser(userId: string) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  // Check if user is admin
  const isAdmin = await checkIsAdmin(user.id)
  if (!isAdmin) {
    return { error: 'Unauthorized. Admin access required.' }
  }

  // Prevent admin from deleting themselves
  if (user.id === userId) {
    return { error: 'You cannot delete your own account' }
  }

  // Delete user (cascade will handle related records via DB constraints)
  const { error: deleteError } = await supabase
    .from('users')
    .delete()
    .eq('id', userId)

  if (deleteError) {
    console.error('Error deleting user:', deleteError)
    return { error: 'Failed to delete user' }
  }

  revalidatePath('/admin/users')
  return { success: true }
}
