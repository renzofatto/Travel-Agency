'use client'

import { TrendingUp, TrendingDown, DollarSign, Users } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface Balance {
  user_id: string
  balance: number
  paid: number
  owed: number
}

interface Member {
  id: string
  full_name: string
  avatar_url?: string
}

interface PersonalBalanceCardProps {
  balance: Balance
  allBalances: Record<string, Balance>
  members: Member[]
  currency?: string
}

export default function PersonalBalanceCard({
  balance,
  allBalances,
  members,
  currency = 'USD',
}: PersonalBalanceCardProps) {
  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    ARS: '$',
    BRL: 'R$',
    MXN: '$',
  }

  const getCurrencySymbol = (curr: string) => {
    return currencySymbols[curr] || curr
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const isPositive = balance.balance > 0.01
  const isNegative = balance.balance < -0.01
  const isSettled = Math.abs(balance.balance) <= 0.01

  // Calculate who owes the user or who the user owes
  const debts: Array<{ member: Member; amount: number; type: 'owed' | 'owes' }> = []

  if (isPositive) {
    // User is owed money - find who has negative balances
    Object.entries(allBalances).forEach(([userId, userBalance]) => {
      if (userId !== balance.user_id && userBalance.balance < -0.01) {
        const member = members.find((m) => m.id === userId)
        if (member) {
          // Simplified: assume they owe proportionally
          debts.push({
            member,
            amount: Math.abs(userBalance.balance),
            type: 'owed',
          })
        }
      }
    })
  } else if (isNegative) {
    // User owes money - find who has positive balances
    Object.entries(allBalances).forEach(([userId, userBalance]) => {
      if (userId !== balance.user_id && userBalance.balance > 0.01) {
        const member = members.find((m) => m.id === userId)
        if (member) {
          debts.push({
            member,
            amount: userBalance.balance,
            type: 'owes',
          })
        }
      }
    })
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Your Balance</h3>
        <DollarSign className="w-5 h-5 text-gray-400" />
      </div>

      {/* Main Balance */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          {isSettled && (
            <div className="flex items-center gap-2 text-green-600">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              <span className="text-sm font-medium">All settled!</span>
            </div>
          )}
          {isPositive && (
            <div className="flex items-center gap-2 text-green-600">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-medium">You are owed</span>
            </div>
          )}
          {isNegative && (
            <div className="flex items-center gap-2 text-red-600">
              <TrendingDown className="w-5 h-5" />
              <span className="text-sm font-medium">You owe</span>
            </div>
          )}
        </div>

        <div
          className={`text-4xl font-bold ${
            isSettled
              ? 'text-green-600'
              : isPositive
              ? 'text-green-600'
              : isNegative
              ? 'text-red-600'
              : 'text-gray-900'
          }`}
        >
          {getCurrencySymbol(currency)}
          {Math.abs(balance.balance).toFixed(2)}
        </div>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t">
        <div>
          <p className="text-xs text-gray-500 mb-1">Total Paid</p>
          <p className="text-lg font-semibold text-gray-900">
            {getCurrencySymbol(currency)}
            {balance.paid.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Total Owed</p>
          <p className="text-lg font-semibold text-gray-900">
            {getCurrencySymbol(currency)}
            {balance.owed.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Who owes/is owed */}
      {debts.length > 0 && (
        <div className="pt-4 border-t">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-gray-500" />
            <p className="text-sm font-medium text-gray-700">
              {debts[0].type === 'owed' ? 'Who owes you' : 'Who you owe'}
            </p>
          </div>
          <div className="space-y-2">
            {debts.slice(0, 3).map((debt, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={debt.member.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {getInitials(debt.member.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-gray-700">{debt.member.full_name}</span>
                </div>
                <span
                  className={`font-medium ${
                    debt.type === 'owed' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {getCurrencySymbol(currency)}
                  {debt.amount.toFixed(2)}
                </span>
              </div>
            ))}
            {debts.length > 3 && (
              <p className="text-xs text-gray-500 text-center pt-2">
                +{debts.length - 3} more
              </p>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}
