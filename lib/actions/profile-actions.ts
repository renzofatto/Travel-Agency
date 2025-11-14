'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { updateProfileSchema, type UpdateProfileInput } from '@/lib/validations/profile'

export async function updateProfile(data: UpdateProfileInput) {
  const supabase = await createClient()

  // 1. Get and verify user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  // 2. Validate input
  const validation = updateProfileSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  // 3. Update profile
  const { error } = await supabase
    .from('users')
    .update({ full_name: validation.data.full_name })
    .eq('id', user.id)

  if (error) {
    return { error: 'Failed to update profile' }
  }

  // 4. Revalidate and return
  revalidatePath('/dashboard/profile')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateAvatar(formData: FormData) {
  const supabase = await createClient()

  // 1. Get and verify user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  // 2. Extract and validate file
  const file = formData.get('avatar') as File
  if (!file || file.size === 0) {
    return { error: 'No file provided' }
  }

  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
  if (!validTypes.includes(file.type)) {
    return { error: 'Invalid file type. Only JPG, PNG, and WEBP are allowed' }
  }

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    return { error: 'File size must be less than 5MB' }
  }

  // 3. Delete old avatar if exists
  const { data: profile } = await supabase
    .from('users')
    .select('avatar_url')
    .eq('id', user.id)
    .single()

  if (profile?.avatar_url) {
    // Extract filename from URL
    const oldFileName = profile.avatar_url.split('/').pop()
    if (oldFileName) {
      await supabase.storage
        .from('avatars')
        .remove([`${user.id}/${oldFileName}`])
    }
  }

  // 4. Upload new avatar
  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) {
    return { error: 'Failed to upload avatar' }
  }

  // 5. Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName)

  // 6. Update user profile with new avatar URL
  const { error: updateError } = await supabase
    .from('users')
    .update({ avatar_url: publicUrl })
    .eq('id', user.id)

  if (updateError) {
    // Rollback: delete uploaded file
    await supabase.storage.from('avatars').remove([fileName])
    return { error: 'Failed to update profile with new avatar' }
  }

  // 7. Revalidate and return
  revalidatePath('/dashboard/profile')
  revalidatePath('/dashboard')
  return { success: true, avatar_url: publicUrl }
}
