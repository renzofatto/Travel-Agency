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

export async function uploadPhotos(formData: FormData) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  // Extract form data
  const group_id = formData.get('group_id') as string
  const caption = formData.get('caption') as string
  const files = formData.getAll('files') as File[]

  if (!group_id || files.length === 0) {
    return { error: 'Missing required fields' }
  }

  // Check if user is member of the group
  const membership = await checkGroupMembership(user.id, group_id)
  if (!membership) {
    return { error: 'You are not a member of this group' }
  }

  const uploadedPhotos = []
  const errors = []

  // Upload each file
  for (const file of files) {
    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      errors.push(`${file.name}: File size must be less than 10MB`)
      continue
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      errors.push(`${file.name}: File must be an image (JPG, PNG, WEBP)`)
      continue
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${group_id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Error uploading file:', uploadError)
      errors.push(`${file.name}: Failed to upload`)
      continue
    }

    // Get file URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('photos').getPublicUrl(fileName)

    // Create photo record in database
    const { data: photo, error: dbError } = await supabase
      .from('photos')
      .insert({
        group_id,
        file_url: publicUrl,
        caption: caption || null,
        uploaded_by: user.id,
      })
      .select()
      .single()

    if (dbError) {
      console.error('Error creating photo record:', dbError)
      // Try to delete the uploaded file
      await supabase.storage.from('photos').remove([fileName])
      errors.push(`${file.name}: Failed to save photo information`)
      continue
    }

    uploadedPhotos.push(photo)
  }

  revalidatePath(`/groups/${group_id}/photos`)

  if (uploadedPhotos.length === 0) {
    return { error: errors.join(', ') || 'Failed to upload photos' }
  }

  return {
    success: true,
    data: uploadedPhotos,
    partialErrors: errors.length > 0 ? errors : undefined,
  }
}

export async function deletePhoto(photoId: string, groupId: string) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  // Get photo to check ownership
  const { data: photo } = await supabase
    .from('photos')
    .select('uploaded_by, file_url')
    .eq('id', photoId)
    .eq('group_id', groupId)
    .single()

  if (!photo) {
    return { error: 'Photo not found' }
  }

  // Check if user is photo owner or admin
  const { data: userProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const isOwner = photo.uploaded_by === user.id
  const isAdmin = userProfile?.role === 'admin'

  if (!isOwner && !isAdmin) {
    return { error: 'You do not have permission to delete this photo' }
  }

  // Extract filename from URL
  const url = new URL(photo.file_url)
  const pathParts = url.pathname.split('/')
  const fileName = pathParts.slice(pathParts.indexOf('photos') + 1).join('/')

  // Delete file from storage
  const { error: storageError } = await supabase.storage
    .from('photos')
    .remove([fileName])

  if (storageError) {
    console.error('Error deleting file from storage:', storageError)
    // Continue anyway to delete DB record
  }

  // Delete photo record from database (will cascade delete comments)
  const { error: dbError } = await supabase
    .from('photos')
    .delete()
    .eq('id', photoId)
    .eq('group_id', groupId)

  if (dbError) {
    console.error('Error deleting photo record:', dbError)
    return { error: 'Failed to delete photo. Please try again.' }
  }

  revalidatePath(`/groups/${groupId}/photos`)
  return { success: true }
}

export async function addComment(photoId: string, comment: string) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  if (!comment || comment.trim().length === 0) {
    return { error: 'Comment cannot be empty' }
  }

  if (comment.length > 500) {
    return { error: 'Comment must be less than 500 characters' }
  }

  // Get photo to check group membership
  const { data: photo } = await supabase
    .from('photos')
    .select('group_id')
    .eq('id', photoId)
    .single()

  if (!photo) {
    return { error: 'Photo not found' }
  }

  // Check if user is member of the group
  const membership = await checkGroupMembership(user.id, photo.group_id)
  if (!membership) {
    return { error: 'You are not a member of this group' }
  }

  // Create comment
  const { data: newComment, error: dbError } = await supabase
    .from('photo_comments')
    .insert({
      photo_id: photoId,
      user_id: user.id,
      comment: comment.trim(),
    })
    .select(`
      *,
      user:users!user_id (
        id,
        full_name,
        avatar_url
      )
    `)
    .single()

  if (dbError) {
    console.error('Error creating comment:', dbError)
    return { error: 'Failed to add comment. Please try again.' }
  }

  revalidatePath(`/groups/${photo.group_id}/photos`)
  return { success: true, data: newComment }
}

export async function deleteComment(commentId: string, photoId: string) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  // Get comment to check ownership
  const { data: comment } = await supabase
    .from('photo_comments')
    .select('user_id, photo:photos!photo_id(group_id)')
    .eq('id', commentId)
    .eq('photo_id', photoId)
    .single()

  if (!comment) {
    return { error: 'Comment not found' }
  }

  // Check if user is comment owner or admin
  const { data: userProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const isOwner = comment.user_id === user.id
  const isAdmin = userProfile?.role === 'admin'

  if (!isOwner && !isAdmin) {
    return { error: 'You do not have permission to delete this comment' }
  }

  // Delete comment
  const { error: dbError } = await supabase
    .from('photo_comments')
    .delete()
    .eq('id', commentId)
    .eq('photo_id', photoId)

  if (dbError) {
    console.error('Error deleting comment:', dbError)
    return { error: 'Failed to delete comment. Please try again.' }
  }

  // @ts-expect-error - photo is a nested object from the select query
  const groupId = comment.photo?.group_id
  if (groupId) {
    revalidatePath(`/groups/${groupId}/photos`)
  }

  return { success: true }
}

export async function getPhotos(groupId: string) {
  const supabase = await createClient()

  const { data: photos, error } = await supabase
    .from('photos')
    .select(`
      *,
      uploader:users!uploaded_by (
        id,
        full_name,
        avatar_url
      ),
      comments:photo_comments (
        id,
        comment,
        created_at,
        user:users!user_id (
          id,
          full_name,
          avatar_url
        )
      )
    `)
    .eq('group_id', groupId)
    .order('uploaded_at', { ascending: false })

  if (error) {
    console.error('Error fetching photos:', error)
    return { error: 'Failed to load photos' }
  }

  return { success: true, data: photos }
}
