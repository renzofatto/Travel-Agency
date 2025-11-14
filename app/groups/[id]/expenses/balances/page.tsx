import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import BalanceDashboard from '@/components/expenses/balance-dashboard'
import RecordPaymentDialog from '@/components/expenses/record-payment-dialog'
import PaymentHistory from '@/components/expenses/payment-history'

export default async function GroupBalancesPage({
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

  // Check if user is admin
  const { data: userProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = userProfile?.role === 'admin'
  const isLeader = membership.role === 'leader'

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

  // Fetch expenses with splits
  const { data: expenses } = await supabase
    .from('expenses')
    .select(`
      id,
      amount,
      paid_by,
      expense_splits (
        user_id,
        amount_owed,
        is_settled
      )
    `)
    .eq('group_id', id)

  const expensesList = expenses?.map((exp) => ({
    id: exp.id,
    amount: exp.amount,
    paid_by: exp.paid_by,
    expense_splits: exp.expense_splits.map((s: any) => ({
      user_id: s.user_id,
      amount_owed: s.amount_owed,
      is_settled: s.is_settled,
    })),
  })) || []

  // Fetch payments
  const { data: payments } = await supabase
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
      )
    `)
    .eq('group_id', id)
    .order('payment_date', { ascending: false })
    .order('created_at', { ascending: false })

  const paymentsList = payments?.map((p: any) => ({
    id: p.id,
    from_user_id: p.from_user_id,
    to_user_id: p.to_user_id,
    amount: p.amount,
    currency: p.currency,
    description: p.description,
    payment_date: p.payment_date,
    created_by: p.created_by,
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href={`/groups/${id}/expenses`}>
            <Button variant="ghost" size="sm" className="mb-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Expenses
            </Button>
          </Link>
          <h2 className="text-2xl font-bold text-gray-900">Balances & Settlements</h2>
          <p className="text-gray-600 mt-1">
            See who owes what and record payments to settle debts
          </p>
        </div>
        <RecordPaymentDialog
          groupId={id}
          members={membersForDialog}
          currentUserId={user.id}
        />
      </div>

      {/* Balance Dashboard */}
      <BalanceDashboard
        expenses={expensesList}
        members={membersList}
        currentUserId={user.id}
        payments={paymentsList}
      />

      {/* Payment History */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
        </div>
        <PaymentHistory
          payments={paymentsList}
          currentUserId={user.id}
          isAdmin={isAdmin}
          isLeader={isLeader}
        />
      </div>
    </div>
  )
}
