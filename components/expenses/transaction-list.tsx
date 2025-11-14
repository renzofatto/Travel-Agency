'use client'

import { format } from 'date-fns'
import { Calendar, DollarSign, User, ArrowRight, Receipt } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

type Expense = {
  id: string
  description: string
  amount: number
  currency: string
  category: string
  paid_by: string
  created_at: string
  payer: {
    id: string
    full_name: string
    avatar_url?: string
  }
}

type Payment = {
  id: string
  from_user_id: string
  to_user_id: string
  amount: number
  currency: string
  description: string | null
  payment_date: string
  from_user: {
    id: string
    full_name: string
    avatar_url?: string
  }
  to_user: {
    id: string
    full_name: string
    avatar_url?: string
  }
}

type Transaction =
  | { type: 'expense'; data: Expense; date: string }
  | { type: 'payment'; data: Payment; date: string }

interface TransactionListProps {
  expenses: Expense[]
  payments: Payment[]
  currentUserId: string
}

const categoryIcons: Record<string, string> = {
  transport: '🚗',
  accommodation: '🏨',
  food: '🍽️',
  activity: '🎯',
  shopping: '🛍️',
  other: '📌',
}

const currencySymbols: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  ARS: '$',
  BRL: 'R$',
  MXN: '$',
}

export default function TransactionList({
  expenses,
  payments,
  currentUserId,
}: TransactionListProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getCurrencySymbol = (currency: string) => {
    return currencySymbols[currency] || currency
  }

  // Combine expenses and payments into unified transaction list
  const transactions: Transaction[] = [
    ...expenses.map((expense) => ({
      type: 'expense' as const,
      data: expense,
      date: expense.created_at,
    })),
    ...payments.map((payment) => ({
      type: 'payment' as const,
      data: payment,
      date: payment.payment_date,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 font-medium">No transactions yet</p>
        <p className="text-gray-500 text-sm mt-1">
          Add an expense or record a payment to get started
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => {
        if (transaction.type === 'expense') {
          const expense = transaction.data
          const isUserPayer = expense.paid_by === currentUserId

          return (
            <div
              key={`expense-${expense.id}`}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Category Icon */}
                  <div className="text-2xl flex-shrink-0">
                    {categoryIcons[expense.category]}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Description */}
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900 truncate">
                        {expense.description}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        Expense
                      </Badge>
                    </div>

                    {/* Payer */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <User className="w-3 h-3" />
                      <span>
                        Paid by {isUserPayer ? 'You' : expense.payer.full_name}
                      </span>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{format(new Date(expense.created_at), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </div>

                {/* Amount */}
                <div className="text-right flex-shrink-0">
                  <div className={`text-xl font-bold ${isUserPayer ? 'text-green-600' : 'text-gray-900'}`}>
                    {getCurrencySymbol(expense.currency)}
                    {expense.amount.toFixed(2)}
                  </div>
                  {isUserPayer && (
                    <p className="text-xs text-green-600 mt-1">You paid</p>
                  )}
                </div>
              </div>
            </div>
          )
        } else {
          // Payment
          const payment = transaction.data
          const isUserSender = payment.from_user_id === currentUserId
          const isUserReceiver = payment.to_user_id === currentUserId

          return (
            <div
              key={`payment-${payment.id}`}
              className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Payment Icon */}
                  <div className="flex-shrink-0 mt-1">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Badge */}
                    <Badge className="mb-2 bg-blue-600">Payment</Badge>

                    {/* From/To Users */}
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={payment.from_user.avatar_url} />
                        <AvatarFallback className="text-xs">
                          {getInitials(payment.from_user.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-gray-900 text-sm">
                        {isUserSender ? 'You' : payment.from_user.full_name}
                      </span>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={payment.to_user.avatar_url} />
                        <AvatarFallback className="text-xs">
                          {getInitials(payment.to_user.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-gray-900 text-sm">
                        {isUserReceiver ? 'You' : payment.to_user.full_name}
                      </span>
                    </div>

                    {/* Description */}
                    {payment.description && (
                      <p className="text-sm text-gray-600 mb-2">{payment.description}</p>
                    )}

                    {/* Date */}
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{format(new Date(payment.payment_date), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </div>

                {/* Amount */}
                <div className="text-right flex-shrink-0">
                  <div className="text-xl font-bold text-blue-600">
                    {getCurrencySymbol(payment.currency)}
                    {payment.amount.toFixed(2)}
                  </div>
                  {isUserSender && (
                    <p className="text-xs text-blue-600 mt-1">You paid</p>
                  )}
                  {isUserReceiver && (
                    <p className="text-xs text-blue-600 mt-1">You received</p>
                  )}
                </div>
              </div>
            </div>
          )
        }
      })}
    </div>
  )
}
