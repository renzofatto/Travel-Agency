'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { settleExpenseSplit } from '@/lib/actions/expense-actions'

interface SettleButtonProps {
  expenseId: string
  userId: string
  isSettled: boolean
  size?: 'default' | 'sm' | 'lg' | 'icon'
  variant?: 'default' | 'outline' | 'ghost'
}

export default function SettleButton({
  expenseId,
  userId,
  isSettled,
  size = 'sm',
  variant = 'outline',
}: SettleButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSettle = async () => {
    if (isSettled) return

    setIsLoading(true)
    const result = await settleExpenseSplit({
      expense_id: expenseId,
      user_id: userId,
    })

    if (result?.error) {
      toast.error(result.error)
      setIsLoading(false)
      return
    }

    toast.success('Marked as settled')
    setIsLoading(false)
  }

  if (isSettled) {
    return (
      <Button size={size} variant="ghost" disabled className="text-green-600">
        <CheckCircle2 className="w-4 h-4 mr-2" />
        Settled
      </Button>
    )
  }

  return (
    <Button
      size={size}
      variant={variant}
      onClick={handleSettle}
      disabled={isLoading}
      className="text-green-600 hover:text-green-700 hover:bg-green-50"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Settling...
        </>
      ) : (
        <>
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Mark as Settled
        </>
      )}
    </Button>
  )
}
