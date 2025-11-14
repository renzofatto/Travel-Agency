'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createGroupSchema, editGroupSchema } from '@/lib/validations/group'
import type { CreateGroupInput, EditGroupInput } from '@/lib/validations/group'

export async function createGroup(data: CreateGroupInput) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  // Validate input
  const validation = createGroupSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  // Ensure user profile exists
  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select('id')
    .eq('id', user.id)
    .single()

  if (profileError || !userProfile) {
    // Create user profile if it doesn't exist
    const { error: createProfileError } = await supabase.from('users').insert({
      id: user.id,
      email: user.email!,
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
      role: 'user',
    })

    if (createProfileError) {
      console.error('Error creating user profile:', createProfileError)
      return { error: 'Failed to create user profile. Please try again.' }
    }
  }

  // Create group
  const { data: group, error: groupError } = await supabase
    .from('travel_groups')
    .insert({
      name: data.name,
      description: data.description || null,
      destination: data.destination,
      start_date: data.start_date,
      end_date: data.end_date,
      cover_image: data.cover_image || null,
      created_by: user.id,
    })
    .select()
    .single()

  if (groupError) {
    console.error('Error creating group:', groupError)
    return { error: `Failed to create group: ${groupError.message}` }
  }

  // Add creator as leader
  const { error: memberError } = await supabase.from('group_members').insert({
    group_id: group.id,
    user_id: user.id,
    role: 'leader',
  })

  if (memberError) {
    console.error('Error adding creator as leader:', memberError)
    // Rollback: delete the group
    await supabase.from('travel_groups').delete().eq('id', group.id)
    return { error: 'Failed to create group. Please try again.' }
  }

  revalidatePath('/dashboard')
  redirect(`/groups/${group.id}`)
}

export async function updateGroup(data: EditGroupInput) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  // Validate input
  const validation = editGroupSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  // Check if user is admin or leader of this group
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
      .eq('group_id', data.id)
      .eq('user_id', user.id)
      .single()

    if (!membership || membership.role !== 'leader') {
      return { error: 'You do not have permission to edit this group' }
    }
  }

  // Update group
  const { error: updateError } = await supabase
    .from('travel_groups')
    .update({
      name: data.name,
      description: data.description || null,
      destination: data.destination,
      start_date: data.start_date,
      end_date: data.end_date,
      cover_image: data.cover_image || null,
    })
    .eq('id', data.id)

  if (updateError) {
    console.error('Error updating group:', updateError)
    return { error: 'Failed to update group. Please try again.' }
  }

  revalidatePath(`/groups/${data.id}`)
  return { success: true }
}

export async function deleteGroup(groupId: string) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  // Only admins can delete groups
  const { data: userProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userProfile?.role !== 'admin') {
    return { error: 'Only administrators can delete groups' }
  }

  // Delete group (cascade will delete related records)
  const { error: deleteError } = await supabase
    .from('travel_groups')
    .delete()
    .eq('id', groupId)

  if (deleteError) {
    console.error('Error deleting group:', deleteError)
    return { error: 'Failed to delete group. Please try again.' }
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

export async function uploadGroupCover(file: File) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  // Generate unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}-${Date.now()}.${fileExt}`
  const filePath = `group-covers/${fileName}`

  // Upload file
  const { error: uploadError } = await supabase.storage
    .from('group-covers')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) {
    console.error('Error uploading file:', uploadError)
    return { error: 'Failed to upload image. Please try again.' }
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('group-covers').getPublicUrl(filePath)

  return { url: publicUrl }
}
