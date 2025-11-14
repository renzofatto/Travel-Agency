'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createExpenseSchema, type CreateExpenseInput } from '@/lib/validations/expense'
import { createExpense, updateExpense } from '@/lib/actions/expense-actions'

interface ExpenseFormProps {
  groupId: string
  members: Array<{ id: string; full_name: string; avatar_url: string | null }>
  mode: 'create' | 'edit'
  defaultValues?: CreateExpenseInput & { id?: string }
  onSuccess?: () => void
}

const categoryLabels = {
  transport: '🚗 Transport',
  accommodation: '🏨 Accommodation',
  food: '🍽️ Food',
  activity: '🎯 Activity',
  shopping: '🛍️ Shopping',
  other: '📌 Other',
}

const currencies = [
  { value: 'USD', label: '$ USD', symbol: '$' },
  { value: 'EUR', label: '€ EUR', symbol: '€' },
  { value: 'GBP', label: '£ GBP', symbol: '£' },
  { value: 'JPY', label: '¥ JPY', symbol: '¥' },
  { value: 'ARS', label: '$ ARS', symbol: '$' },
  { value: 'BRL', label: 'R$ BRL', symbol: 'R$' },
  { value: 'MXN', label: '$ MXN', symbol: '$' },
]

export default function ExpenseForm({
  groupId,
  members,
  mode,
  defaultValues,
  onSuccess,
}: ExpenseFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CreateExpenseInput>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: defaultValues || {
      description: '',
      amount: 0,
      currency: 'USD',
      category: 'other',
      paid_by: '',
      split_type: 'equal',
      group_id: groupId,
      splits: members.map((member) => ({
        user_id: member.id,
        percentage: undefined,
        amount_owed: undefined,
      })),
    },
  })

  const { fields } = useFieldArray({
    control: form.control,
    name: 'splits',
  })

  const splitType = form.watch('split_type')
  const amount = form.watch('amount')
  const currency = form.watch('currency')

  // Auto-calculate splits based on type
  useEffect(() => {
    const splits = form.getValues('splits')

    if (splitType === 'equal') {
      if (amount > 0) {
        const equalAmount = amount / members.length
        splits.forEach((_, index) => {
          form.setValue(`splits.${index}.amount_owed`, Math.round(equalAmount * 100) / 100)
          form.setValue(`splits.${index}.percentage`, undefined)
        })
      } else {
        // Reset to undefined when amount is 0
        splits.forEach((_, index) => {
          form.setValue(`splits.${index}.amount_owed`, 0)
          form.setValue(`splits.${index}.percentage`, undefined)
        })
      }
    } else if (splitType === 'percentage') {
      if (amount > 0) {
        splits.forEach((split, index) => {
          const percentage = split.percentage || 0
          const calculatedAmount = (amount * percentage) / 100
          form.setValue(`splits.${index}.amount_owed`, Math.round(calculatedAmount * 100) / 100)
        })
      } else {
        // Reset amounts when total is 0
        splits.forEach((_, index) => {
          form.setValue(`splits.${index}.amount_owed`, 0)
        })
      }
    } else if (splitType === 'custom') {
      // For custom, set percentage to undefined
      splits.forEach((_, index) => {
        form.setValue(`splits.${index}.percentage`, undefined)
        // Keep amount_owed as is, or set to 0 if undefined
        const currentAmount = form.getValues(`splits.${index}.amount_owed`)
        if (currentAmount === undefined) {
          form.setValue(`splits.${index}.amount_owed`, 0)
        }
      })
    }
  }, [splitType, amount, members.length, form])

  // Calculate percentage when amount_owed changes in percentage mode
  const handlePercentageChange = (index: number, percentage: number) => {
    form.setValue(`splits.${index}.percentage`, percentage)
    if (amount > 0) {
      const calculatedAmount = (amount * percentage) / 100
      form.setValue(`splits.${index}.amount_owed`, Math.round(calculatedAmount * 100) / 100)
    }
  }

  async function onSubmit(data: CreateExpenseInput) {
    setIsSubmitting(true)

    try {
      if (mode === 'create') {
        const result = await createExpense(data)
        if (result?.error) {
          toast.error(result.error)
          setIsSubmitting(false)
          return
        }
        toast.success('Expense added successfully')
      } else {
        const result = await updateExpense({ ...data, id: defaultValues?.id! })
        if (result?.error) {
          toast.error(result.error)
          setIsSubmitting(false)
          return
        }
        toast.success('Expense updated successfully')
      }

      router.refresh()
      onSuccess?.()
      if (mode === 'create') {
        form.reset()
      }
      setIsSubmitting(false)
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error('Something went wrong. Please try again.')
      setIsSubmitting(false)
    }
  }

  const currencySymbol = currencies.find((c) => c.value === currency)?.symbol || '$'

  // Calculate totals for validation feedback
  const calculateTotals = () => {
    const splits = form.watch('splits')
    if (splitType === 'percentage') {
      const totalPercentage = splits.reduce((sum, split) => sum + (split.percentage || 0), 0)
      return { totalPercentage, isValid: Math.abs(totalPercentage - 100) < 0.01 }
    } else if (splitType === 'custom') {
      const totalAmount = splits.reduce((sum, split) => sum + (split.amount_owed || 0), 0)
      return { totalAmount, isValid: Math.abs(totalAmount - amount) < 0.01 }
    }
    return { isValid: true }
  }

  const totals = calculateTotals()

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Dinner at restaurant" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Amount and Currency */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                <FormLabel>Currency *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {currencies.map((curr) => (
                      <SelectItem key={curr.value} value={curr.value}>
                        {curr.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Category and Paid By */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
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
            name="paid_by"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Paid By *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select member" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Split Type */}
        <FormField
          control={form.control}
          name="split_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Split Type *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="equal">⚖️ Equal Split</SelectItem>
                  <SelectItem value="percentage">📊 By Percentage</SelectItem>
                  <SelectItem value="custom">✏️ Custom Amounts</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                {splitType === 'equal' && 'Split equally among all members'}
                {splitType === 'percentage' && 'Split by percentage (must total 100%)'}
                {splitType === 'custom' && 'Specify exact amount for each person'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Splits Configuration */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Split Details</h3>
            {splitType === 'percentage' && (
              <span
                className={`text-sm ${
                  totals.isValid ? 'text-green-600' : 'text-red-600'
                }`}
              >
                Total: {totals.totalPercentage?.toFixed(1)}%
              </span>
            )}
            {splitType === 'custom' && (
              <span
                className={`text-sm ${
                  totals.isValid ? 'text-green-600' : 'text-red-600'
                }`}
              >
                Total: {currencySymbol}
                {totals.totalAmount?.toFixed(2)}
              </span>
            )}
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto border rounded-lg p-4">
            {fields.map((field, index) => {
              const member = members[index]
              return (
                <div key={field.id} className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{member.full_name}</p>
                  </div>

                  {splitType === 'equal' && (
                    <div className="text-sm text-gray-600">
                      {currencySymbol}
                      {form.watch(`splits.${index}.amount_owed`)?.toFixed(2) || '0.00'}
                    </div>
                  )}

                  {splitType === 'percentage' && (
                    <div className="flex items-center gap-2">
                      <FormField
                        control={form.control}
                        name={`splits.${index}.percentage`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0"
                                className="w-20"
                                {...field}
                                value={field.value || 0}
                                onChange={(e) =>
                                  handlePercentageChange(index, parseFloat(e.target.value) || 0)
                                }
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <span className="text-sm text-gray-600">%</span>
                      <span className="text-sm text-gray-600 w-20 text-right">
                        {currencySymbol}
                        {form.watch(`splits.${index}.amount_owed`)?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  )}

                  {splitType === 'custom' && (
                    <FormField
                      control={form.control}
                      name={`splits.${index}.amount_owed`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">{currencySymbol}</span>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className="w-24"
                                {...field}
                                value={field.value || 0}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              )
            })}
          </div>

          {!totals.isValid && (
            <p className="text-sm text-red-600">
              {splitType === 'percentage'
                ? 'Percentages must add up to 100%'
                : 'Custom amounts must equal the total expense amount'}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex gap-2 justify-end pt-4">
          {mode === 'edit' && (
            <Button
              type="button"
              variant="outline"
              onClick={() => onSuccess?.()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === 'create' ? 'Adding...' : 'Updating...'}
              </>
            ) : mode === 'create' ? (
              'Add Expense'
            ) : (
              'Update Expense'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
