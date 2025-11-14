'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { DocumentType } from '@/lib/validations/document'

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

export async function uploadDocument(formData: FormData) {
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
  const title = formData.get('title') as string
  const document_type = formData.get('document_type') as DocumentType
  const group_id = formData.get('group_id') as string
  const file = formData.get('file') as File

  if (!title || !document_type || !group_id || !file) {
    return { error: 'Missing required fields' }
  }

  // Check if user is member of the group
  const membership = await checkGroupMembership(user.id, group_id)
  if (!membership) {
    return { error: 'You are not a member of this group' }
  }

  // Validate file size (10MB max)
  if (file.size > 10 * 1024 * 1024) {
    return { error: 'File size must be less than 10MB' }
  }

  // Generate unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}/${group_id}/${Date.now()}.${fileExt}`

  // Upload file to storage
  const { error: uploadError } = await supabase.storage
    .from('travel-documents')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) {
    console.error('Error uploading file:', uploadError)
    return { error: 'Failed to upload document. Please try again.' }
  }

  // Get file URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('travel-documents').getPublicUrl(fileName)

  // Create document record in database
  const { data: document, error: dbError } = await supabase
    .from('travel_documents')
    .insert({
      group_id,
      title,
      file_url: publicUrl,
      document_type,
      uploaded_by: user.id,
    })
    .select()
    .single()

  if (dbError) {
    console.error('Error creating document record:', dbError)
    // Try to delete the uploaded file
    await supabase.storage.from('travel-documents').remove([fileName])
    return { error: 'Failed to save document information. Please try again.' }
  }

  revalidatePath(`/groups/${group_id}/documents`)
  return { success: true, data: document }
}

export async function deleteDocument(documentId: string, groupId: string) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  // Get document to check ownership
  const { data: document } = await supabase
    .from('travel_documents')
    .select('uploaded_by, file_url')
    .eq('id', documentId)
    .eq('group_id', groupId)
    .single()

  if (!document) {
    return { error: 'Document not found' }
  }

  // Check if user is document owner or admin
  const { data: userProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const isOwner = document.uploaded_by === user.id
  const isAdmin = userProfile?.role === 'admin'

  if (!isOwner && !isAdmin) {
    return { error: 'You do not have permission to delete this document' }
  }

  // Extract filename from URL
  const url = new URL(document.file_url)
  const pathParts = url.pathname.split('/')
  const fileName = pathParts.slice(pathParts.indexOf('travel-documents') + 1).join('/')

  // Delete file from storage
  const { error: storageError } = await supabase.storage
    .from('travel-documents')
    .remove([fileName])

  if (storageError) {
    console.error('Error deleting file from storage:', storageError)
    // Continue anyway to delete DB record
  }

  // Delete document record from database
  const { error: dbError } = await supabase
    .from('travel_documents')
    .delete()
    .eq('id', documentId)
    .eq('group_id', groupId)

  if (dbError) {
    console.error('Error deleting document record:', dbError)
    return { error: 'Failed to delete document. Please try again.' }
  }

  revalidatePath(`/groups/${groupId}/documents`)
  return { success: true }
}

export async function getDocuments(groupId: string) {
  const supabase = await createClient()

  const { data: documents, error } = await supabase
    .from('travel_documents')
    .select(`
      *,
      uploader:users!uploaded_by (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('group_id', groupId)
    .order('uploaded_at', { ascending: false })

  if (error) {
    console.error('Error fetching documents:', error)
    return { error: 'Failed to load documents' }
  }

  return { success: true, data: documents }
}
