import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { DollarSign, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import AddExpenseDialog from '@/components/expenses/add-expense-dialog'
import ExpenseCard from '@/components/expenses/expense-card'
import { calculateBalances } from '@/lib/utils/expense-calculator'

export default async function GroupExpensesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const { id } = await params

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Check if user has access to this group
  const { data: membership } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', id)
    .eq('user_id', user.id)
    .single()

  if (!membership) {
    notFound()
  }

  // Fetch all group members for the form
  const { data: members } = await supabase
    .from('group_members')
    .select(`
      user_id,
      users (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('group_id', id)

  const membersList = members?.map((m: any) => ({
    id: m.users.id,
    full_name: m.users.full_name,
    avatar_url: m.users.avatar_url,
  })) || []

  // Fetch expenses with splits and user details
  const { data: expenses } = await supabase
    .from('expenses')
    .select(`
      *,
      paid_by_user:users!expenses_paid_by_fkey (
        id,
        full_name,
        avatar_url
      ),
      expense_splits (
        id,
        user_id,
        amount_owed,
        percentage,
        is_settled,
        users (
          id,
          full_name,
          avatar_url
        )
      )
    `)
    .eq('group_id', id)
    .order('created_at', { ascending: false })

  // Calculate total spent
  const totalSpent = expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0

  // Calculate balances
  const memberIds = membersList.map((m) => m.id)
  const balances = calculateBalances(
    expenses?.map((exp) => ({
      id: exp.id,
      amount: exp.amount,
      paid_by: exp.paid_by,
      expense_splits: exp.expense_splits.map((s: any) => ({
        user_id: s.user_id,
        amount_owed: s.amount_owed,
        is_settled: s.is_settled,
      })),
    })) || [],
    memberIds
  )

  // Get current user's balance
  const userBalance = balances[user.id]

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Expenses</h2>
          <div className="flex items-center gap-6 mt-2">
            <div>
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-xl font-semibold text-gray-900">
                ${totalSpent.toFixed(2)}
              </p>
            </div>
            {userBalance && (
              <div>
                <p className="text-sm text-gray-600">Your Balance</p>
                <p
                  className={`text-xl font-semibold ${
                    userBalance.balance > 0
                      ? 'text-green-600'
                      : userBalance.balance < 0
                      ? 'text-orange-600'
                      : 'text-gray-900'
                  }`}
                >
                  {userBalance.balance > 0 && '+'}
                  ${userBalance.balance.toFixed(2)}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">Total Expenses</p>
              <p className="text-xl font-semibold text-gray-900">{expenses?.length || 0}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/groups/${id}/expenses/balances`}>
            <Button variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              View Balances
            </Button>
          </Link>
          <AddExpenseDialog groupId={id} members={membersList} />
        </div>
      </div>

      {/* Balance Summary */}
      {userBalance && (userBalance.balance > 0.01 || userBalance.balance < -0.01) && (
        <div
          className={`p-4 rounded-lg border-2 ${
            userBalance.balance > 0
              ? 'bg-green-50 border-green-200'
              : 'bg-orange-50 border-orange-200'
          }`}
        >
          <p className="text-sm font-medium">
            {userBalance.balance > 0 ? (
              <>
                You are owed <span className="text-green-700 font-bold">${userBalance.balance.toFixed(2)}</span>
              </>
            ) : (
              <>
                You owe <span className="text-orange-700 font-bold">${Math.abs(userBalance.balance).toFixed(2)}</span>
              </>
            )}
          </p>
        </div>
      )}

      {/* Expenses List */}
      {expenses && expenses.length > 0 ? (
        <div className="space-y-4">
          {expenses.map((expense: any) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              groupId={id}
              members={membersList}
              currentUserId={user.id}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No expenses yet</h3>
          <p className="text-gray-600 mb-4">
            Start tracking expenses for your trip
          </p>
          <AddExpenseDialog groupId={id} members={membersList} />
        </div>
      )}
    </div>
  )
}
