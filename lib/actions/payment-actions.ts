'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import {
  createPaymentSchema,
  type CreatePaymentInput,
  updatePaymentSchema,
  type UpdatePaymentInput,
} from '@/lib/validations/payment'

export async function createPayment(data: CreatePaymentInput) {
  const supabase = await createClient()

  // 1. Get and verify user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  // 2. Validate input
  const validation = createPaymentSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  // 3. Verify user is a member of the group
  const { data: membership } = await supabase
    .from('group_members')
    .select('user_id')
    .eq('group_id', data.group_id)
    .eq('user_id', user.id)
    .single()

  if (!membership) {
    return { error: 'You are not a member of this group' }
  }

  // 4. Verify recipient is also a member of the group
  const { data: recipientMembership } = await supabase
    .from('group_members')
    .select('user_id')
    .eq('group_id', data.group_id)
    .eq('user_id', data.to_user_id)
    .single()

  if (!recipientMembership) {
    return { error: 'Recipient is not a member of this group' }
  }

  // 5. Prevent paying yourself
  if (user.id === data.to_user_id) {
    return { error: 'You cannot pay yourself' }
  }

  // 6. Create payment record
  const { data: payment, error } = await supabase
    .from('expense_payments')
    .insert({
      group_id: data.group_id,
      from_user_id: user.id,
      to_user_id: data.to_user_id,
      amount: data.amount,
      currency: data.currency,
      description: data.description || null,
      payment_date: data.payment_date || new Date().toISOString().split('T')[0],
      created_by: user.id,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating payment:', error)
    return { error: 'Failed to create payment' }
  }

  // 7. Revalidate and return
  revalidatePath(`/groups/${data.group_id}/expenses`)
  revalidatePath(`/groups/${data.group_id}/expenses/balances`)
  return { success: true, data: payment }
}

export async function updatePayment(data: UpdatePaymentInput) {
  const supabase = await createClient()

  // 1. Get and verify user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  // 2. Validate input
  const validation = updatePaymentSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  // 3. Get payment and verify ownership
  const { data: payment } = await supabase
    .from('expense_payments')
    .select('created_by, group_id')
    .eq('id', data.id)
    .single()

  if (!payment) {
    return { error: 'Payment not found' }
  }

  // Check if user is admin
  const { data: userProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = userProfile?.role === 'admin'

  if (payment.created_by !== user.id && !isAdmin) {
    return { error: 'You can only edit your own payments' }
  }

  // 4. Update payment
  const updateData: any = {}
  if (data.amount !== undefined) updateData.amount = data.amount
  if (data.description !== undefined) updateData.description = data.description || null
  if (data.payment_date !== undefined) updateData.payment_date = data.payment_date

  const { error } = await supabase
    .from('expense_payments')
    .update(updateData)
    .eq('id', data.id)

  if (error) {
    console.error('Error updating payment:', error)
    return { error: 'Failed to update payment' }
  }

  // 5. Revalidate and return
  revalidatePath(`/groups/${payment.group_id}/expenses`)
  revalidatePath(`/groups/${payment.group_id}/expenses/balances`)
  return { success: true }
}

export async function deletePayment(paymentId: string) {
  const supabase = await createClient()

  // 1. Get and verify user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  // 2. Get payment
  const { data: payment } = await supabase
    .from('expense_payments')
    .select('created_by, group_id, from_user_id')
    .eq('id', paymentId)
    .single()

  if (!payment) {
    return { error: 'Payment not found' }
  }

  // 3. Check if user is admin or group leader or payment creator
  const { data: userProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = userProfile?.role === 'admin'

  const { data: membership } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', payment.group_id)
    .eq('user_id', user.id)
    .single()

  const isLeader = membership?.role === 'leader'
  const isCreator = payment.created_by === user.id

  if (!isAdmin && !isLeader && !isCreator) {
    return { error: 'Not authorized to delete this payment' }
  }

  // 4. Delete payment
  const { error } = await supabase
    .from('expense_payments')
    .delete()
    .eq('id', paymentId)

  if (error) {
    console.error('Error deleting payment:', error)
    return { error: 'Failed to delete payment' }
  }

  // 5. Revalidate and return
  revalidatePath(`/groups/${payment.group_id}/expenses`)
  revalidatePath(`/groups/${payment.group_id}/expenses/balances`)
  return { success: true }
}

export async function getGroupPayments(groupId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Fetch payments with user details
  const { data: payments, error } = await supabase
    .from('expense_payments')
    .select(`
      *,
      from_user:users!from_user_id (
        id,
        full_name,
        avatar_url
      ),
      to_user:users!to_user_id (
        id,
        full_name,
        avatar_url
      ),
      creator:users!created_by (
        id,
        full_name
      )
    `)
    .eq('group_id', groupId)
    .order('payment_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching payments:', error)
    return { error: 'Failed to fetch payments' }
  }

  return { success: true, data: payments }
}
