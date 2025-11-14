'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import {
  createItineraryItemSchema,
  editItineraryItemSchema,
  reorderItineraryItemsSchema,
} from '@/lib/validations/itinerary'
import type {
  CreateItineraryItemInput,
  EditItineraryItemInput,
  ReorderItineraryItemsInput,
} from '@/lib/validations/itinerary'

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

export async function createItineraryItem(data: CreateItineraryItemInput) {
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
  const validation = createItineraryItemSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  // Check if user is member of the group
  const membership = await checkGroupMembership(user.id, data.group_id)
  if (!membership) {
    return { error: 'You are not a member of this group' }
  }

  // Get max order_index for this date
  const { data: maxOrder } = await supabase
    .from('itinerary_items')
    .select('order_index')
    .eq('group_id', data.group_id)
    .eq('date', data.date)
    .order('order_index', { ascending: false })
    .limit(1)
    .single()

  const orderIndex = (maxOrder?.order_index ?? -1) + 1

  // Create itinerary item
  const { data: item, error: itemError } = await supabase
    .from('itinerary_items')
    .insert({
      group_id: data.group_id,
      title: data.title,
      description: data.description || null,
      date: data.date,
      start_time: data.start_time || null,
      end_time: data.end_time || null,
      location: data.location || null,
      category: data.category,
      order_index: orderIndex,
    })
    .select()
    .single()

  if (itemError) {
    console.error('Error creating itinerary item:', itemError)
    return { error: 'Failed to create activity. Please try again.' }
  }

  revalidatePath(`/groups/${data.group_id}/itinerary`)
  return { success: true, data: item }
}

export async function updateItineraryItem(data: EditItineraryItemInput) {
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
  const validation = editItineraryItemSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  // Check if user is member of the group
  const membership = await checkGroupMembership(user.id, data.group_id)
  if (!membership) {
    return { error: 'You are not a member of this group' }
  }

  // Update itinerary item
  const { error: updateError } = await supabase
    .from('itinerary_items')
    .update({
      title: data.title,
      description: data.description || null,
      date: data.date,
      start_time: data.start_time || null,
      end_time: data.end_time || null,
      location: data.location || null,
      category: data.category,
    })
    .eq('id', data.id)
    .eq('group_id', data.group_id)

  if (updateError) {
    console.error('Error updating itinerary item:', updateError)
    return { error: 'Failed to update activity. Please try again.' }
  }

  revalidatePath(`/groups/${data.group_id}/itinerary`)
  return { success: true }
}

export async function deleteItineraryItem(itemId: string, groupId: string) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  // Check if user is member of the group
  const membership = await checkGroupMembership(user.id, groupId)
  if (!membership) {
    return { error: 'You are not a member of this group' }
  }

  // Delete itinerary item
  const { error: deleteError } = await supabase
    .from('itinerary_items')
    .delete()
    .eq('id', itemId)
    .eq('group_id', groupId)

  if (deleteError) {
    console.error('Error deleting itinerary item:', deleteError)
    return { error: 'Failed to delete activity. Please try again.' }
  }

  revalidatePath(`/groups/${groupId}/itinerary`)
  return { success: true }
}

export async function reorderItineraryItems(
  groupId: string,
  data: ReorderItineraryItemsInput
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
  const validation = reorderItineraryItemsSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  // Check if user is member of the group
  const membership = await checkGroupMembership(user.id, groupId)
  if (!membership) {
    return { error: 'You are not a member of this group' }
  }

  // Update order_index for each item
  const updates = data.items.map((item) =>
    supabase
      .from('itinerary_items')
      .update({ order_index: item.order_index })
      .eq('id', item.id)
      .eq('group_id', groupId)
  )

  const results = await Promise.all(updates)

  // Check if any update failed
  const errors = results.filter((r) => r.error)
  if (errors.length > 0) {
    console.error('Error reordering items:', errors)
    return { error: 'Failed to reorder activities. Please try again.' }
  }

  revalidatePath(`/groups/${groupId}/itinerary`)
  return { success: true }
}
