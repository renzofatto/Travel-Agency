'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { DollarSign, Loader2 } from 'lucide-react'

import { createPayment } from '@/lib/actions/payment-actions'
import { createPaymentSchema, type CreatePaymentInput } from '@/lib/validations/payment'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface RecordPaymentDialogProps {
  groupId: string
  members: Array<{
    user_id: string
    users: {
      id: string
      full_name: string
      avatar_url?: string
    }
  }>
  currentUserId: string
  suggestedPayment?: {
    to_user_id: string
    amount: number
  }
}

export default function RecordPaymentDialog({
  groupId,
  members,
  currentUserId,
  suggestedPayment,
}: RecordPaymentDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filter out current user from recipient options
  const recipientOptions = members.filter((m) => m.user_id !== currentUserId)

  const form = useForm<CreatePaymentInput>({
    resolver: zodResolver(createPaymentSchema),
    defaultValues: {
      group_id: groupId,
      to_user_id: suggestedPayment?.to_user_id || '',
      amount: suggestedPayment?.amount || 0,
      currency: 'USD',
      description: '',
      payment_date: new Date().toISOString().split('T')[0],
    },
  })

  async function onSubmit(data: CreatePaymentInput) {
    setIsSubmitting(true)

    const result = await createPayment(data)

    if (result?.error) {
      toast.error(result.error)
      setIsSubmitting(false)
      return
    }

    toast.success('Payment recorded successfully!')
    router.refresh()
    setOpen(false)
    form.reset()
    setIsSubmitting(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <DollarSign className="w-4 h-4 mr-2" />
          Record Payment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Register a payment you made to settle debts with another member
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="to_user_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pay To</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select member" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {recipientOptions.map((member) => (
                        <SelectItem key={member.user_id} value={member.user_id}>
                          {member.users.full_name || 'Unknown User'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="JPY">JPY (¥)</SelectItem>
                      <SelectItem value="ARS">ARS ($)</SelectItem>
                      <SelectItem value="BRL">BRL (R$)</SelectItem>
                      <SelectItem value="MXN">MXN ($)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payment_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Partial payment for dinner expenses"
                      {...field}
                      disabled={isSubmitting}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Recording...
                  </>
                ) : (
                  'Record Payment'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
