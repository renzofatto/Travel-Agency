'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { calculateBalances, calculateSettlements } from '@/lib/utils/expense-calculator'

interface Member {
  id: string
  full_name: string
  avatar_url: string | null
}

interface Expense {
  id: string
  amount: number
  paid_by: string
  expense_splits: Array<{
    user_id: string
    amount_owed: number
    is_settled: boolean
  }>
}

interface BalanceDashboardProps {
  expenses: Expense[]
  members: Member[]
  currentUserId: string
}

const currencySymbol = '$'

export default function BalanceDashboard({
  expenses,
  members,
  currentUserId,
}: BalanceDashboardProps) {
  const memberIds = members.map((m) => m.id)
  const balances = calculateBalances(expenses, memberIds)
  const settlements = calculateSettlements(balances)

  // Get member info by ID
  const getMember = (userId: string) => {
    return members.find((m) => m.id === userId)
  }

  // Sort balances by amount (highest creditors first, then debtors)
  const sortedBalances = Object.values(balances).sort((a, b) => b.balance - a.balance)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Member Balances */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Member Balances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedBalances.map((balance) => {
              const member = getMember(balance.user_id)
              if (!member) return null

              const isCurrentUser = balance.user_id === currentUserId

              return (
                <div
                  key={balance.user_id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    isCurrentUser ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.avatar_url || ''} />
                      <AvatarFallback>
                        {member.full_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900">
                        {member.full_name}
                        {isCurrentUser && (
                          <span className="text-xs text-blue-600 ml-2">(you)</span>
                        )}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span>Paid: {currencySymbol}{balance.paid.toFixed(2)}</span>
                        <span>•</span>
                        <span>Owes: {currencySymbol}{balance.owed.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    {balance.balance > 0.01 ? (
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="font-semibold text-green-600">
                          +{currencySymbol}
                          {balance.balance.toFixed(2)}
                        </span>
                      </div>
                    ) : balance.balance < -0.01 ? (
                      <div className="flex items-center gap-1">
                        <TrendingDown className="w-4 h-4 text-orange-600" />
                        <span className="font-semibold text-orange-600">
                          {currencySymbol}
                          {Math.abs(balance.balance).toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Settled
                      </Badge>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {sortedBalances.length === 0 && (
            <p className="text-center text-gray-500 py-8">No expenses yet</p>
          )}
        </CardContent>
      </Card>

      {/* Suggested Settlements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="w-5 h-5" />
            Suggested Settlements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {settlements.length > 0 ? (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  Simplified transactions to settle all balances:
                </p>
                {settlements.map((settlement, index) => {
                  const fromMember = getMember(settlement.from)
                  const toMember = getMember(settlement.to)

                  if (!fromMember || !toMember) return null

                  const isCurrentUserInvolved =
                    settlement.from === currentUserId || settlement.to === currentUserId

                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-2 ${
                        isCurrentUserInvolved
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={fromMember.avatar_url || ''} />
                            <AvatarFallback>
                              {fromMember.full_name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">
                              {fromMember.full_name}
                              {settlement.from === currentUserId && (
                                <span className="text-xs text-blue-600 ml-2">(you)</span>
                              )}
                            </p>
                            {settlement.from === currentUserId && (
                              <p className="text-xs text-gray-600">You need to pay</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <ArrowRight className="w-5 h-5 text-gray-400" />
                          <div className="text-center px-3 py-1 bg-white rounded-md border border-gray-300">
                            <p className="text-lg font-bold text-orange-600">
                              {currencySymbol}
                              {settlement.amount.toFixed(2)}
                            </p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-gray-400" />
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-medium text-gray-900">
                              {toMember.full_name}
                              {settlement.to === currentUserId && (
                                <span className="text-xs text-blue-600 ml-2">(you)</span>
                              )}
                            </p>
                            {settlement.to === currentUserId && (
                              <p className="text-xs text-gray-600">You'll receive</p>
                            )}
                          </div>
                          <Avatar>
                            <AvatarImage src={toMember.avatar_url || ''} />
                            <AvatarFallback>
                              {toMember.full_name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </div>
                    </div>
                  )
                })}

                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800 text-center">
                    {settlements.length} {settlements.length === 1 ? 'transaction' : 'transactions'} needed to settle all balances
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Badge variant="outline" className="text-green-600 border-green-600 mb-2">
                  All Settled!
                </Badge>
                <p className="text-sm text-gray-600">
                  No outstanding balances to settle
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
