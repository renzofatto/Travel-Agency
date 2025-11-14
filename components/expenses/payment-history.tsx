'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Trash2, Calendar, User, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'

import { deletePayment } from '@/lib/actions/payment-actions'

import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

type Payment = {
  id: string
  from_user_id: string
  to_user_id: string
  amount: number
  currency: string
  description: string | null
  payment_date: string
  created_by: string
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

interface PaymentHistoryProps {
  payments: Payment[]
  currentUserId: string
  isAdmin: boolean
  isLeader: boolean
}

export default function PaymentHistory({
  payments,
  currentUserId,
  isAdmin,
  isLeader,
}: PaymentHistoryProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      ARS: '$',
      BRL: 'R$',
      MXN: '$',
    }
    return symbols[currency] || currency
  }

  const canDelete = (payment: Payment) => {
    return isAdmin || isLeader || payment.created_by === currentUserId
  }

  const handleDelete = async () => {
    if (!deletingId) return

    setIsDeleting(true)

    const result = await deletePayment(deletingId)

    if (result?.error) {
      toast.error(result.error)
      setIsDeleting(false)
      return
    }

    toast.success('Payment deleted successfully')
    router.refresh()
    setDeletingId(null)
    setIsDeleting(false)
  }

  if (payments.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-600">No payments recorded yet</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {payments.map((payment) => (
          <div
            key={payment.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              {/* Payment Info */}
              <div className="flex-1 min-w-0">
                {/* Users */}
                <div className="flex items-center gap-3 mb-2">
                  {/* From User */}
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={payment.from_user.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {getInitials(payment.from_user.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-gray-900 truncate">
                      {payment.from_user_id === currentUserId
                        ? 'You'
                        : payment.from_user.full_name}
                    </span>
                  </div>

                  <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />

                  {/* To User */}
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={payment.to_user.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {getInitials(payment.to_user.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-gray-900 truncate">
                      {payment.to_user_id === currentUserId
                        ? 'You'
                        : payment.to_user.full_name}
                    </span>
                  </div>
                </div>

                {/* Amount */}
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {getCurrencySymbol(payment.currency)}
                  {payment.amount.toFixed(2)}
                </div>

                {/* Description */}
                {payment.description && (
                  <p className="text-sm text-gray-600 mb-2">{payment.description}</p>
                )}

                {/* Date */}
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {format(new Date(payment.payment_date), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>

              {/* Actions */}
              {canDelete(payment) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeletingId(payment.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this payment record? This will affect
              the balance calculations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
