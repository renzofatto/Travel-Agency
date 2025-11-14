'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function checkGroupMembership(userId: string, groupId: string) {
  const supabase = await createClient()

  const { data: membership } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .single()

  return membership
}

export async function createNote(
  groupId: string,
  title: string,
  content: string
) {
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
  if (!title || title.trim().length === 0) {
    return { error: 'Title is required' }
  }

  if (!content || content.trim().length === 0) {
    return { error: 'Content is required' }
  }

  if (title.length > 200) {
    return { error: 'Title must be less than 200 characters' }
  }

  if (content.length > 50000) {
    return { error: 'Content must be less than 50,000 characters' }
  }

  // Check if user is member of the group
  const membership = await checkGroupMembership(user.id, groupId)
  if (!membership) {
    return { error: 'You are not a member of this group' }
  }

  // Create note
  const { data: note, error: dbError } = await supabase
    .from('group_notes')
    .insert({
      group_id: groupId,
      title: title.trim(),
      content: content.trim(),
      created_by: user.id,
      last_edited_by: user.id,
    })
    .select(`
      *,
      creator:users!created_by (
        id,
        full_name,
        avatar_url
      ),
      editor:users!last_edited_by (
        id,
        full_name,
        avatar_url
      )
    `)
    .single()

  if (dbError) {
    console.error('Error creating note:', dbError)
    return { error: 'Failed to create note. Please try again.' }
  }

  revalidatePath(`/groups/${groupId}/notes`)
  return { success: true, data: note }
}

export async function updateNote(
  noteId: string,
  groupId: string,
  title: string,
  content: string
) {
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
  if (!title || title.trim().length === 0) {
    return { error: 'Title is required' }
  }

  if (!content || content.trim().length === 0) {
    return { error: 'Content is required' }
  }

  if (title.length > 200) {
    return { error: 'Title must be less than 200 characters' }
  }

  if (content.length > 50000) {
    return { error: 'Content must be less than 50,000 characters' }
  }

  // Check if note exists and user is member
  const { data: note } = await supabase
    .from('group_notes')
    .select('group_id')
    .eq('id', noteId)
    .eq('group_id', groupId)
    .single()

  if (!note) {
    return { error: 'Note not found' }
  }

  const membership = await checkGroupMembership(user.id, groupId)
  if (!membership) {
    return { error: 'You are not a member of this group' }
  }

  // Update note
  const { data: updatedNote, error: dbError } = await supabase
    .from('group_notes')
    .update({
      title: title.trim(),
      content: content.trim(),
      last_edited_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', noteId)
    .eq('group_id', groupId)
    .select(`
      *,
      creator:users!created_by (
        id,
        full_name,
        avatar_url
      ),
      editor:users!last_edited_by (
        id,
        full_name,
        avatar_url
      )
    `)
    .single()

  if (dbError) {
    console.error('Error updating note:', dbError)
    return { error: 'Failed to update note. Please try again.' }
  }

  revalidatePath(`/groups/${groupId}/notes`)
  return { success: true, data: updatedNote }
}

export async function deleteNote(noteId: string, groupId: string) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  // Get note to check ownership
  const { data: note } = await supabase
    .from('group_notes')
    .select('created_by')
    .eq('id', noteId)
    .eq('group_id', groupId)
    .single()

  if (!note) {
    return { error: 'Note not found' }
  }

  // Check if user is note creator or admin
  const { data: userProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const isCreator = note.created_by === user.id
  const isAdmin = userProfile?.role === 'admin'

  if (!isCreator && !isAdmin) {
    return { error: 'You do not have permission to delete this note' }
  }

  // Delete note
  const { error: dbError } = await supabase
    .from('group_notes')
    .delete()
    .eq('id', noteId)
    .eq('group_id', groupId)

  if (dbError) {
    console.error('Error deleting note:', dbError)
    return { error: 'Failed to delete note. Please try again.' }
  }

  revalidatePath(`/groups/${groupId}/notes`)
  return { success: true }
}

export async function getNotes(groupId: string) {
  const supabase = await createClient()

  const { data: notes, error } = await supabase
    .from('group_notes')
    .select(`
      *,
      creator:users!created_by (
        id,
        full_name,
        avatar_url
      ),
      editor:users!last_edited_by (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('group_id', groupId)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching notes:', error)
    return { error: 'Failed to load notes' }
  }

  return { success: true, data: notes }
}
