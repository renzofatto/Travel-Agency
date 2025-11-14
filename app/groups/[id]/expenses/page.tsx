import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Plus, BarChart3, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import AddExpenseDialog from '@/components/expenses/add-expense-dialog'
import RecordPaymentDialog from '@/components/expenses/record-payment-dialog'
import TransactionList from '@/components/expenses/transaction-list'
import PersonalBalanceCard from '@/components/expenses/personal-balance-card'
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

  // Fetch all group members
  const { data: members } = await supabase
    .from('group_members')
    .select(`
      user_id,
      users!inner (
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

  const membersForDialog = members?.map((m: any) => ({
    user_id: m.user_id,
    users: {
      id: m.users.id,
      full_name: m.users.full_name,
      avatar_url: m.users.avatar_url,
    },
  })) || []

  // Fetch expenses with payer details
  const { data: expenses } = await supabase
    .from('expenses')
    .select(`
      id,
      description,
      amount,
      currency,
      category,
      paid_by,
      created_at,
      payer:users!expenses_paid_by_fkey (
        id,
        full_name,
        avatar_url
      ),
      expense_splits (
        user_id,
        amount_owed,
        is_settled
      )
    `)
    .eq('group_id', id)
    .order('created_at', { ascending: false })

  const expensesList = expenses?.map((exp: any) => ({
    id: exp.id,
    description: exp.description,
    amount: exp.amount,
    currency: exp.currency,
    category: exp.category,
    paid_by: exp.paid_by,
    created_at: exp.created_at,
    payer: {
      id: exp.payer.id,
      full_name: exp.payer.full_name,
      avatar_url: exp.payer.avatar_url,
    },
  })) || []

  // Fetch payments
  const { data: payments } = await supabase
    .from('expense_payments')
    .select(`
      id,
      from_user_id,
      to_user_id,
      amount,
      currency,
      description,
      payment_date,
      from_user:users!from_user_id (
        id,
        full_name,
        avatar_url
      ),
      to_user:users!to_user_id (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('group_id', id)
    .order('payment_date', { ascending: false })

  const paymentsList = payments?.map((p: any) => ({
    id: p.id,
    from_user_id: p.from_user_id,
    to_user_id: p.to_user_id,
    amount: p.amount,
    currency: p.currency,
    description: p.description,
    payment_date: p.payment_date,
    from_user: {
      id: p.from_user.id,
      full_name: p.from_user.full_name,
      avatar_url: p.from_user.avatar_url,
    },
    to_user: {
      id: p.to_user.id,
      full_name: p.to_user.full_name,
      avatar_url: p.to_user.avatar_url,
    },
  })) || []

  // Calculate balances (including payments)
  const memberIds = membersList.map((m) => m.id)
  const expensesForCalc = expenses?.map((exp: any) => ({
    id: exp.id,
    amount: exp.amount,
    paid_by: exp.paid_by,
    expense_splits: exp.expense_splits.map((s: any) => ({
      user_id: s.user_id,
      amount_owed: s.amount_owed,
      is_settled: s.is_settled,
    })),
  })) || []

  const paymentsForCalc = paymentsList.map((p) => ({
    from_user_id: p.from_user_id,
    to_user_id: p.to_user_id,
    amount: p.amount,
  }))

  const balances = calculateBalances(expensesForCalc, memberIds, paymentsForCalc)

  // Get current user's balance
  const userBalance = balances[user.id]

  // Calculate total spent
  const totalSpent = expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0
  const totalPayments = paymentsList.reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Expenses & Payments</h2>
          <p className="text-gray-600 mt-1">
            Track expenses and record payments to settle debts
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/groups/${id}/expenses/balances`}>
            <Button variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              View All Balances
            </Button>
          </Link>
          <RecordPaymentDialog
            groupId={id}
            members={membersForDialog}
            currentUserId={user.id}
          />
          <AddExpenseDialog groupId={id} members={membersList} />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Total Expenses</p>
          <p className="text-2xl font-bold text-gray-900">
            ${totalSpent.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {expenses?.length || 0} expense{expenses?.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Total Payments</p>
          <p className="text-2xl font-bold text-blue-600">
            ${totalPayments.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {paymentsList.length} payment{paymentsList.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Transactions</p>
          <p className="text-2xl font-bold text-gray-900">
            {(expenses?.length || 0) + paymentsList.length}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Combined expenses and payments
          </p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Personal Balance Card */}
        <div className="lg:col-span-1">
          {userBalance && (
            <PersonalBalanceCard
              balance={userBalance}
              allBalances={balances}
              members={membersList}
              currency="USD"
            />
          )}
        </div>

        {/* Right: Transaction List */}
        <div className="lg:col-span-2">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">All Transactions</h3>
            <p className="text-sm text-gray-600">
              Expenses and payments sorted by date
            </p>
          </div>
          <TransactionList
            expenses={expensesList}
            payments={paymentsList}
            currentUserId={user.id}
          />
        </div>
      </div>
    </div>
  )
}
