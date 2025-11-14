type Split = {
  user_id: string
  amount_owed: number
  is_settled: boolean
}

type Expense = {
  id: string
  amount: number
  paid_by: string
  expense_splits: Split[]
}

type Balance = {
  user_id: string
  balance: number // positive = owed to them, negative = they owe
  paid: number
  owed: number
}

/**
 * Calculate balances for all members based on expenses
 */
export function calculateBalances(
  expenses: Expense[],
  memberIds: string[]
): Record<string, Balance> {
  const balances: Record<string, Balance> = {}

  // Initialize balances for all members
  memberIds.forEach((memberId) => {
    balances[memberId] = {
      user_id: memberId,
      balance: 0,
      paid: 0,
      owed: 0,
    }
  })

  // Calculate from expenses
  expenses.forEach((expense) => {
    // Add to paid amount for person who paid
    if (balances[expense.paid_by]) {
      balances[expense.paid_by].paid += expense.amount
    }

    // Add to owed amount for each split
    expense.expense_splits.forEach((split) => {
      if (balances[split.user_id] && !split.is_settled) {
        balances[split.user_id].owed += split.amount_owed
      }
    })
  })

  // Calculate final balance (paid - owed)
  Object.keys(balances).forEach((userId) => {
    balances[userId].balance = balances[userId].paid - balances[userId].owed
  })

  return balances
}

/**
 * Calculate who owes whom and suggest settlements
 */
export function calculateSettlements(
  balances: Record<string, Balance>
): Array<{
  from: string
  to: string
  amount: number
}> {
  // Separate into debtors and creditors
  const debtors = Object.values(balances)
    .filter((b) => b.balance < -0.01)
    .map((b) => ({ user_id: b.user_id, amount: -b.balance }))
    .sort((a, b) => b.amount - a.amount)

  const creditors = Object.values(balances)
    .filter((b) => b.balance > 0.01)
    .map((b) => ({ user_id: b.user_id, amount: b.balance }))
    .sort((a, b) => b.amount - a.amount)

  const settlements: Array<{ from: string; to: string; amount: number }> = []

  let i = 0
  let j = 0

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i]
    const creditor = creditors[j]

    const settleAmount = Math.min(debtor.amount, creditor.amount)

    if (settleAmount > 0.01) {
      // Only add if amount is significant
      settlements.push({
        from: debtor.user_id,
        to: creditor.user_id,
        amount: Math.round(settleAmount * 100) / 100, // Round to 2 decimals
      })
    }

    debtor.amount -= settleAmount
    creditor.amount -= settleAmount

    if (debtor.amount < 0.01) i++
    if (creditor.amount < 0.01) j++
  }

  return settlements
}

/**
 * Calculate splits based on split type
 */
export function calculateSplits(
  amount: number,
  splitType: 'equal' | 'percentage' | 'custom',
  members: Array<{
    user_id: string
    percentage?: number
    amount_owed?: number
  }>
): Array<{
  user_id: string
  amount_owed: number
  percentage: number | null
}> {
  if (splitType === 'equal') {
    const splitAmount = amount / members.length
    return members.map((member) => ({
      user_id: member.user_id,
      amount_owed: Math.round(splitAmount * 100) / 100,
      percentage: null,
    }))
  }

  if (splitType === 'percentage') {
    return members.map((member) => {
      const percentage = member.percentage || 0
      return {
        user_id: member.user_id,
        amount_owed: Math.round(((amount * percentage) / 100) * 100) / 100,
        percentage,
      }
    })
  }

  // custom
  return members.map((member) => ({
    user_id: member.user_id,
    amount_owed: member.amount_owed || 0,
    percentage: null,
  }))
}
