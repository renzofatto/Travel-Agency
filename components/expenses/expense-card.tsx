'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { MoreVertical, Edit, Trash2, Users, CheckCircle2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { deleteExpense } from '@/lib/actions/expense-actions'
import ExpenseForm from './expense-form'
import SettleButton from './settle-button'

interface ExpenseSplit {
  id: string
  user_id: string
  amount_owed: number
  percentage: number | null
  is_settled: boolean
  users: {
    id: string
    full_name: string
    avatar_url: string | null
  }
}

interface ExpenseCardProps {
  expense: {
    id: string
    description: string
    amount: number
    currency: string
    category: 'transport' | 'accommodation' | 'food' | 'activity' | 'shopping' | 'other'
    paid_by: string
    split_type: 'equal' | 'percentage' | 'custom'
    created_at: string
    expense_splits: ExpenseSplit[]
    paid_by_user: {
      id: string
      full_name: string
      avatar_url: string | null
    }
  }
  groupId: string
  members: Array<{ id: string; full_name: string; avatar_url: string | null }>
  currentUserId: string
}

const categoryConfig = {
  transport: { emoji: '🚗', label: 'Transport', color: 'bg-blue-100 text-blue-700' },
  accommodation: { emoji: '🏨', label: 'Accommodation', color: 'bg-purple-100 text-purple-700' },
  food: { emoji: '🍽️', label: 'Food', color: 'bg-orange-100 text-orange-700' },
  activity: { emoji: '🎯', label: 'Activity', color: 'bg-green-100 text-green-700' },
  shopping: { emoji: '🛍️', label: 'Shopping', color: 'bg-pink-100 text-pink-700' },
  other: { emoji: '📌', label: 'Other', color: 'bg-gray-100 text-gray-700' },
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

export default function ExpenseCard({ expense, groupId, members, currentUserId }: ExpenseCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showSplits, setShowSplits] = useState(false)

  const category = categoryConfig[expense.category]
  const currencySymbol = currencySymbols[expense.currency] || expense.currency

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this expense?')) return

    setIsDeleting(true)
    const result = await deleteExpense(expense.id, groupId)

    if (result?.error) {
      toast.error(result.error)
      setIsDeleting(false)
      return
    }

    toast.success('Expense deleted')
  }

  // Check if current user is involved
  const userSplit = expense.expense_splits.find((s) => s.user_id === currentUserId)
  const userIsPayer = expense.paid_by === currentUserId

  // Calculate settled count
  const settledCount = expense.expense_splits.filter((s) => s.is_settled).length
  const totalSplits = expense.expense_splits.length
  const allSettled = settledCount === totalSplits

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Category Icon */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-2xl">
                {category.emoji}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={category.color}>{category.label}</Badge>
                    {allSettled && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Settled
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900">{expense.description}</h3>
                </div>

                {/* Amount */}
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    {currencySymbol}
                    {expense.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">{expense.currency}</p>
                </div>
              </div>

              {/* Paid By */}
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={expense.paid_by_user.avatar_url || ''} />
                  <AvatarFallback>
                    {expense.paid_by_user.full_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm text-gray-600">
                  Paid by <span className="font-medium">{expense.paid_by_user.full_name}</span>
                  {userIsPayer && <span className="text-green-600"> (you)</span>}
                </p>
              </div>

              {/* User's Share */}
              {userSplit && !userIsPayer && (
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm">
                    Your share:{' '}
                    <span className="font-semibold text-orange-600">
                      {currencySymbol}
                      {userSplit.amount_owed.toFixed(2)}
                    </span>
                    {userSplit.is_settled ? (
                      <span className="text-green-600 ml-2">✓ Settled</span>
                    ) : (
                      <span className="text-orange-600 ml-2">• Pending</span>
                    )}
                  </p>
                  <SettleButton
                    expenseId={expense.id}
                    userId={currentUserId}
                    isSettled={userSplit.is_settled}
                  />
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <button
                    onClick={() => setShowSplits(!showSplits)}
                    className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                  >
                    <Users className="w-4 h-4" />
                    {totalSplits} {totalSplits === 1 ? 'person' : 'people'}
                  </button>
                  <span>•</span>
                  <span>{format(new Date(expense.created_at), 'MMM d, yyyy')}</span>
                  <span>•</span>
                  <span className="capitalize">{expense.split_type} split</span>
                </div>

                {/* Actions Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" disabled={isDeleting}>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleDelete}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Splits Detail */}
              {showSplits && (
                <div className="mt-3 pt-3 border-t space-y-2">
                  <p className="text-xs font-medium text-gray-700 mb-2">Split Details:</p>
                  {expense.expense_splits.map((split) => (
                    <div key={split.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={split.users.avatar_url || ''} />
                          <AvatarFallback>
                            {split.users.full_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-gray-700">
                          {split.users.full_name}
                          {split.user_id === currentUserId && ' (you)'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {currencySymbol}
                          {split.amount_owed.toFixed(2)}
                        </span>
                        {split.percentage !== null && (
                          <span className="text-xs text-gray-500">({split.percentage}%)</span>
                        )}
                        {split.is_settled ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>
          <ExpenseForm
            groupId={groupId}
            members={members}
            mode="edit"
            defaultValues={{
              description: expense.description,
              amount: expense.amount,
              currency: expense.currency as 'USD' | 'EUR' | 'GBP' | 'JPY' | 'ARS' | 'BRL' | 'MXN',
              category: expense.category,
              paid_by: expense.paid_by,
              split_type: expense.split_type,
              group_id: groupId,
              splits: expense.expense_splits.map((s) => ({
                user_id: s.user_id,
                amount_owed: s.amount_owed,
                percentage: s.percentage || 0,
              })),
              id: expense.id,
            }}
            onSuccess={() => setIsEditing(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
