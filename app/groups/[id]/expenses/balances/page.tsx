import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import BalanceDashboard from '@/components/expenses/balance-dashboard'

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

  // Fetch all group members
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
            See who owes what and get settlement suggestions
          </p>
        </div>
      </div>

      {/* Balance Dashboard */}
      <BalanceDashboard
        expenses={expensesList}
        members={membersList}
        currentUserId={user.id}
      />
    </div>
  )
}
