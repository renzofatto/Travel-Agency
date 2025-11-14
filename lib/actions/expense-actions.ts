'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import {
  createExpenseSchema,
  editExpenseSchema,
  settleExpenseSchema,
} from '@/lib/validations/expense'
import type {
  CreateExpenseInput,
  EditExpenseInput,
  SettleExpenseInput,
} from '@/lib/validations/expense'
import { calculateSplits } from '@/lib/utils/expense-calculator'

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

export async function createExpense(data: CreateExpenseInput) {
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
  const validation = createExpenseSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  // Check if user is member of the group
  const membership = await checkGroupMembership(user.id, data.group_id)
  if (!membership) {
    return { error: 'You are not a member of this group' }
  }

  // Calculate splits
  const calculatedSplits = calculateSplits(
    data.amount,
    data.split_type,
    data.splits
  )

  // Create expense
  const { data: expense, error: expenseError } = await supabase
    .from('expenses')
    .insert({
      group_id: data.group_id,
      description: data.description,
      amount: data.amount,
      currency: data.currency,
      category: data.category,
      paid_by: data.paid_by,
      split_type: data.split_type,
    })
    .select()
    .single()

  if (expenseError) {
    console.error('Error creating expense:', expenseError)
    return { error: 'Failed to create expense. Please try again.' }
  }

  // Create splits
  const splitsToInsert = calculatedSplits.map((split) => ({
    expense_id: expense.id,
    user_id: split.user_id,
    amount_owed: split.amount_owed,
    percentage: split.percentage,
    is_settled: split.user_id === data.paid_by, // Person who paid is already settled
  }))

  const { error: splitsError } = await supabase
    .from('expense_splits')
    .insert(splitsToInsert)

  if (splitsError) {
    console.error('Error creating splits:', splitsError)
    // Rollback: delete the expense
    await supabase.from('expenses').delete().eq('id', expense.id)
    return { error: 'Failed to create expense splits. Please try again.' }
  }

  revalidatePath(`/groups/${data.group_id}/expenses`)
  return { success: true, data: expense }
}

export async function updateExpense(data: EditExpenseInput) {
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
  const validation = editExpenseSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  // Check if user is member of the group
  const membership = await checkGroupMembership(user.id, data.group_id)
  if (!membership) {
    return { error: 'You are not a member of this group' }
  }

  // Calculate new splits
  const calculatedSplits = calculateSplits(
    data.amount,
    data.split_type,
    data.splits
  )

  // Update expense
  const { error: updateError } = await supabase
    .from('expenses')
    .update({
      description: data.description,
      amount: data.amount,
      currency: data.currency,
      category: data.category,
      paid_by: data.paid_by,
      split_type: data.split_type,
    })
    .eq('id', data.id)
    .eq('group_id', data.group_id)

  if (updateError) {
    console.error('Error updating expense:', updateError)
    return { error: 'Failed to update expense. Please try again.' }
  }

  // Delete old splits
  await supabase.from('expense_splits').delete().eq('expense_id', data.id)

  // Create new splits
  const splitsToInsert = calculatedSplits.map((split) => ({
    expense_id: data.id,
    user_id: split.user_id,
    amount_owed: split.amount_owed,
    percentage: split.percentage,
    is_settled: split.user_id === data.paid_by,
  }))

  const { error: splitsError } = await supabase
    .from('expense_splits')
    .insert(splitsToInsert)

  if (splitsError) {
    console.error('Error updating splits:', splitsError)
    return { error: 'Failed to update expense splits. Please try again.' }
  }

  revalidatePath(`/groups/${data.group_id}/expenses`)
  return { success: true }
}

export async function deleteExpense(expenseId: string, groupId: string) {
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

  // Delete expense (cascade will delete splits)
  const { error: deleteError } = await supabase
    .from('expenses')
    .delete()
    .eq('id', expenseId)
    .eq('group_id', groupId)

  if (deleteError) {
    console.error('Error deleting expense:', deleteError)
    return { error: 'Failed to delete expense. Please try again.' }
  }

  revalidatePath(`/groups/${groupId}/expenses`)
  return { success: true }
}

export async function settleExpenseSplit(data: SettleExpenseInput) {
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
  const validation = settleExpenseSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  // Get expense to find group_id
  const { data: expense } = await supabase
    .from('expenses')
    .select('group_id')
    .eq('id', data.expense_id)
    .single()

  if (!expense) {
    return { error: 'Expense not found' }
  }

  // Check if user is member
  const membership = await checkGroupMembership(user.id, expense.group_id)
  if (!membership) {
    return { error: 'You are not a member of this group' }
  }

  // Mark split as settled
  const { error: settleError } = await supabase
    .from('expense_splits')
    .update({ is_settled: true })
    .eq('expense_id', data.expense_id)
    .eq('user_id', data.user_id)

  if (settleError) {
    console.error('Error settling expense:', settleError)
    return { error: 'Failed to mark as settled. Please try again.' }
  }

  revalidatePath(`/groups/${expense.group_id}/expenses`)
  return { success: true }
}
