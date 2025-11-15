'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {
  createPackageSchema,
  editPackageSchema,
  createPackageItineraryItemSchema,
  updatePackageItineraryItemSchema,
  assignPackageToGroupSchema,
  createPackageIncludedItemSchema,
  updatePackageIncludedItemSchema,
  createPackageExcludedItemSchema,
  updatePackageExcludedItemSchema,
  type CreatePackageInput,
  type EditPackageInput,
  type CreatePackageItineraryItemInput,
  type UpdatePackageItineraryItemInput,
  type AssignPackageToGroupInput,
  type CreatePackageIncludedItemInput,
  type UpdatePackageIncludedItemInput,
  type CreatePackageExcludedItemInput,
  type UpdatePackageExcludedItemInput,
} from '@/lib/validations/package'

// ============================================
// HELPER: CHECK IF USER IS ADMIN
// ============================================
async function checkIsAdmin() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Unauthorized', user: null }
  }

  const { data: userProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userProfile?.role !== 'admin') {
    return { error: 'Only administrators can manage packages', user: null }
  }

  return { user, error: null }
}

// ============================================
// PACKAGE CRUD OPERATIONS
// ============================================

export async function createPackage(data: CreatePackageInput) {
  const { user, error: adminError } = await checkIsAdmin()
  if (adminError) return { error: adminError }

  // Validate input
  const validation = createPackageSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  const supabase = await createClient()

  // Create package
  const { data: package_, error: packageError } = await supabase
    .from('travel_packages')
    .insert({
      name: data.name,
      description: data.description || null,
      destination: data.destination,
      duration_days: data.duration_days,
      cover_image: data.cover_image || null,
      price_estimate: data.price_estimate || null,
      category: data.category || null,
      is_active: data.is_active,
      is_featured: data.is_featured || false,
      created_by: user!.id,
    })
    .select()
    .single()

  if (packageError) {
    console.error('Error creating package:', packageError)
    return { error: 'Failed to create package. Please try again.' }
  }

  revalidatePath('/admin/packages')
  return { success: true, data: package_ }
}

export async function updatePackage(data: EditPackageInput) {
  const { error: adminError } = await checkIsAdmin()
  if (adminError) return { error: adminError }

  // Validate input
  const validation = editPackageSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  const supabase = await createClient()

  // Update package
  const { error: updateError } = await supabase
    .from('travel_packages')
    .update({
      name: data.name,
      description: data.description || null,
      destination: data.destination,
      duration_days: data.duration_days,
      cover_image: data.cover_image || null,
      price_estimate: data.price_estimate || null,
      category: data.category || null,
      is_active: data.is_active,
      is_featured: data.is_featured || false,
    })
    .eq('id', data.id)

  if (updateError) {
    console.error('Error updating package:', updateError)
    return { error: 'Failed to update package. Please try again.' }
  }

  revalidatePath('/admin/packages')
  revalidatePath(`/admin/packages/${data.id}`)
  return { success: true }
}

export async function deletePackage(packageId: string) {
  const { error: adminError } = await checkIsAdmin()
  if (adminError) return { error: adminError }

  const supabase = await createClient()

  // Delete package (cascade will delete related itinerary items)
  const { error: deleteError } = await supabase
    .from('travel_packages')
    .delete()
    .eq('id', packageId)

  if (deleteError) {
    console.error('Error deleting package:', deleteError)
    return { error: 'Failed to delete package. Please try again.' }
  }

  revalidatePath('/admin/packages')
  return { success: true }
}

export async function togglePackageActive(packageId: string, isActive: boolean) {
  const { error: adminError } = await checkIsAdmin()
  if (adminError) return { error: adminError }

  const supabase = await createClient()

  const { error: updateError } = await supabase
    .from('travel_packages')
    .update({ is_active: isActive })
    .eq('id', packageId)

  if (updateError) {
    console.error('Error toggling package status:', updateError)
    return { error: 'Failed to update package status. Please try again.' }
  }

  revalidatePath('/admin/packages')
  revalidatePath(`/admin/packages/${packageId}`)
  return { success: true }
}

// ============================================
// PACKAGE ITINERARY ITEM OPERATIONS
// ============================================

// Upload itinerary item image
export async function uploadItineraryItemImage(formData: FormData) {
  const { user, error: adminError } = await checkIsAdmin()
  if (adminError) return { error: adminError }

  const supabase = await createClient()

  // Get file from formData
  const file = formData.get('file') as File
  if (!file) {
    return { error: 'No file provided' }
  }

  // Validate file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!validTypes.includes(file.type)) {
    return { error: 'Invalid file type. Please upload a JPG, PNG, or WEBP image.' }
  }

  // Validate file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return { error: 'File too large. Maximum size is 10MB.' }
  }

  // Generate unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}/${Date.now()}.${fileExt}`

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('itinerary-item-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) {
    console.error('Error uploading image:', uploadError)
    return { error: 'Failed to upload image. Please try again.' }
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('itinerary-item-images').getPublicUrl(fileName)

  return { success: true, url: publicUrl }
}

export async function createPackageItineraryItem(data: CreatePackageItineraryItemInput) {
  const { error: adminError } = await checkIsAdmin()
  if (adminError) return { error: adminError }

  // Validate input
  const validation = createPackageItineraryItemSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  const supabase = await createClient()

  // Create itinerary item
  const { data: item, error: itemError } = await supabase
    .from('package_itinerary_items')
    .insert({
      package_id: data.package_id,
      day_number: data.day_number,
      title: data.title,
      description: data.description || null,
      start_time: data.start_time || null,
      end_time: data.end_time || null,
      location: data.location || null,
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      image_url: data.image_url || null,
      category: data.category,
      order_index: data.order_index,
      show_in_landing: data.show_in_landing !== undefined ? data.show_in_landing : true,
    })
    .select()
    .single()

  if (itemError) {
    console.error('Error creating package itinerary item:', itemError)
    return { error: 'Failed to create itinerary item. Please try again.' }
  }

  revalidatePath(`/admin/packages/${data.package_id}`)
  return { success: true, data: item }
}

export async function updatePackageItineraryItem(data: UpdatePackageItineraryItemInput) {
  const { error: adminError } = await checkIsAdmin()
  if (adminError) return { error: adminError }

  // Validate input
  const validation = updatePackageItineraryItemSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  const supabase = await createClient()

  // Update itinerary item
  const { error: updateError } = await supabase
    .from('package_itinerary_items')
    .update({
      day_number: data.day_number,
      title: data.title,
      description: data.description || null,
      start_time: data.start_time || null,
      end_time: data.end_time || null,
      location: data.location || null,
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      image_url: data.image_url || null,
      category: data.category,
      order_index: data.order_index,
      show_in_landing: data.show_in_landing !== undefined ? data.show_in_landing : true,
    })
    .eq('id', data.id)

  if (updateError) {
    console.error('Error updating package itinerary item:', updateError)
    return { error: 'Failed to update itinerary item. Please try again.' }
  }

  revalidatePath(`/admin/packages/${data.package_id}`)
  return { success: true }
}

export async function deletePackageItineraryItem(itemId: string) {
  const { error: adminError } = await checkIsAdmin()
  if (adminError) return { error: adminError }

  const supabase = await createClient()

  // Get package_id for revalidation
  const { data: item } = await supabase
    .from('package_itinerary_items')
    .select('package_id')
    .eq('id', itemId)
    .single()

  // Delete itinerary item
  const { error: deleteError } = await supabase
    .from('package_itinerary_items')
    .delete()
    .eq('id', itemId)

  if (deleteError) {
    console.error('Error deleting package itinerary item:', deleteError)
    return { error: 'Failed to delete itinerary item. Please try again.' }
  }

  if (item?.package_id) {
    revalidatePath(`/admin/packages/${item.package_id}`)
  }
  return { success: true }
}

// ============================================
// ASSIGN PACKAGE TO GROUP
// ============================================

export async function assignPackageToGroup(data: AssignPackageToGroupInput) {
  const { user, error: adminError } = await checkIsAdmin()
  if (adminError) return { error: adminError }

  // Validate input
  const validation = assignPackageToGroupSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  const supabase = await createClient()

  // 1. Get package details and itinerary items
  const { data: package_, error: packageError } = await supabase
    .from('travel_packages')
    .select('*, package_itinerary_items(*)')
    .eq('id', data.package_id)
    .single()

  if (packageError || !package_) {
    return { error: 'Package not found' }
  }

  // 2. Get group details
  const { data: group, error: groupError } = await supabase
    .from('travel_groups')
    .select('id, start_date, end_date')
    .eq('id', data.group_id)
    .single()

  if (groupError || !group) {
    return { error: 'Group not found' }
  }

  // 3. Calculate dates based on start_date and package duration
  const startDate = new Date(data.start_date)
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + package_.duration_days - 1)

  // 4. Update group with package reference and dates
  const { error: updateGroupError } = await supabase
    .from('travel_groups')
    .update({
      source_package_id: data.package_id,
      start_date: data.start_date,
      end_date: endDate.toISOString().split('T')[0],
      destination: package_.destination, // Opcional: también actualizar destino
    })
    .eq('id', data.group_id)

  if (updateGroupError) {
    console.error('Error updating group:', updateGroupError)
    return { error: 'Failed to assign package to group' }
  }

  // 5. Copy itinerary items to group
  if (package_.package_itinerary_items && package_.package_itinerary_items.length > 0) {
    const itineraryItems = package_.package_itinerary_items.map((item: any) => {
      // Calculate actual date for this item
      const itemDate = new Date(startDate)
      itemDate.setDate(itemDate.getDate() + item.day_number - 1)

      return {
        group_id: data.group_id,
        title: item.title,
        description: item.description,
        date: itemDate.toISOString().split('T')[0],
        start_time: item.start_time,
        end_time: item.end_time,
        location: item.location,
        category: item.category,
        order_index: item.order_index,
      }
    })

    const { error: itineraryError } = await supabase
      .from('itinerary_items')
      .insert(itineraryItems)

    if (itineraryError) {
      console.error('Error copying itinerary:', itineraryError)
      // Rollback package assignment
      await supabase
        .from('travel_groups')
        .update({ source_package_id: null })
        .eq('id', data.group_id)
      return { error: 'Failed to copy itinerary to group' }
    }
  }

  revalidatePath('/admin/packages')
  revalidatePath('/admin/groups')
  revalidatePath(`/groups/${data.group_id}`)
  revalidatePath(`/groups/${data.group_id}/itinerary`)

  return { success: true, message: 'Package successfully assigned to group' }
}

// ============================================
// PACKAGE INCLUDED ITEMS CRUD
// ============================================

export async function createPackageIncludedItem(data: CreatePackageIncludedItemInput) {
  const { error: adminError } = await checkIsAdmin()
  if (adminError) return { error: adminError }

  // Validate input
  const validation = createPackageIncludedItemSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  const supabase = await createClient()

  // Create included item
  const { data: item, error: itemError } = await supabase
    .from('package_included_items')
    .insert({
      package_id: data.package_id,
      title: data.title,
      description: data.description || null,
      icon: data.icon || null,
      order_index: data.order_index,
    })
    .select()
    .single()

  if (itemError) {
    console.error('Error creating included item:', itemError)
    return { error: 'Failed to create included item. Please try again.' }
  }

  revalidatePath('/admin/packages')
  revalidatePath(`/admin/packages/${data.package_id}`)
  revalidatePath(`/paquetes/${data.package_id}`)
  return { success: true, data: item }
}

export async function updatePackageIncludedItem(data: UpdatePackageIncludedItemInput) {
  const { error: adminError } = await checkIsAdmin()
  if (adminError) return { error: adminError }

  // Validate input
  const validation = updatePackageIncludedItemSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  const supabase = await createClient()

  // Update included item
  const { data: item, error: itemError } = await supabase
    .from('package_included_items')
    .update({
      title: data.title,
      description: data.description || null,
      icon: data.icon || null,
      order_index: data.order_index,
    })
    .eq('id', data.id)
    .select()
    .single()

  if (itemError) {
    console.error('Error updating included item:', itemError)
    return { error: 'Failed to update included item. Please try again.' }
  }

  revalidatePath('/admin/packages')
  revalidatePath(`/admin/packages/${data.package_id}`)
  revalidatePath(`/paquetes/${data.package_id}`)
  return { success: true, data: item }
}

export async function deletePackageIncludedItem(itemId: string, packageId: string) {
  const { error: adminError } = await checkIsAdmin()
  if (adminError) return { error: adminError }

  const supabase = await createClient()

  // Delete included item
  const { error: deleteError } = await supabase
    .from('package_included_items')
    .delete()
    .eq('id', itemId)

  if (deleteError) {
    console.error('Error deleting included item:', deleteError)
    return { error: 'Failed to delete included item. Please try again.' }
  }

  revalidatePath('/admin/packages')
  revalidatePath(`/admin/packages/${packageId}`)
  revalidatePath(`/paquetes/${packageId}`)
  return { success: true }
}

// ============================================
// PACKAGE EXCLUDED ITEMS CRUD
// ============================================

export async function createPackageExcludedItem(data: CreatePackageExcludedItemInput) {
  const { error: adminError } = await checkIsAdmin()
  if (adminError) return { error: adminError }

  // Validate input
  const validation = createPackageExcludedItemSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  const supabase = await createClient()

  // Create excluded item
  const { data: item, error: itemError } = await supabase
    .from('package_excluded_items')
    .insert({
      package_id: data.package_id,
      title: data.title,
      description: data.description || null,
      icon: data.icon || null,
      order_index: data.order_index,
    })
    .select()
    .single()

  if (itemError) {
    console.error('Error creating excluded item:', itemError)
    return { error: 'Failed to create excluded item. Please try again.' }
  }

  revalidatePath('/admin/packages')
  revalidatePath(`/admin/packages/${data.package_id}`)
  revalidatePath(`/paquetes/${data.package_id}`)
  return { success: true, data: item }
}

export async function updatePackageExcludedItem(data: UpdatePackageExcludedItemInput) {
  const { error: adminError } = await checkIsAdmin()
  if (adminError) return { error: adminError }

  // Validate input
  const validation = updatePackageExcludedItemSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  const supabase = await createClient()

  // Update excluded item
  const { data: item, error: itemError } = await supabase
    .from('package_excluded_items')
    .update({
      title: data.title,
      description: data.description || null,
      icon: data.icon || null,
      order_index: data.order_index,
    })
    .eq('id', data.id)
    .select()
    .single()

  if (itemError) {
    console.error('Error updating excluded item:', itemError)
    return { error: 'Failed to update excluded item. Please try again.' }
  }

  revalidatePath('/admin/packages')
  revalidatePath(`/admin/packages/${data.package_id}`)
  revalidatePath(`/paquetes/${data.package_id}`)
  return { success: true, data: item }
}

export async function deletePackageExcludedItem(itemId: string, packageId: string) {
  const { error: adminError } = await checkIsAdmin()
  if (adminError) return { error: adminError }

  const supabase = await createClient()

  // Delete excluded item
  const { error: deleteError } = await supabase
    .from('package_excluded_items')
    .delete()
    .eq('id', itemId)

  if (deleteError) {
    console.error('Error deleting excluded item:', deleteError)
    return { error: 'Failed to delete excluded item. Please try again.' }
  }

  revalidatePath('/admin/packages')
  revalidatePath(`/admin/packages/${packageId}`)
  revalidatePath(`/paquetes/${packageId}`)
  return { success: true }
}
