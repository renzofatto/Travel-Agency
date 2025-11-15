import { describe, it, expect } from 'vitest'
import { calculateBalances, calculateSettlements } from '@/lib/utils/expense-calculator'

describe('Expense Calculator', () => {
  describe('calculateBalances', () => {
    it('should calculate correct balances for equal split', () => {
      const expenses = [
        {
          id: '1',
          amount: 100,
          paid_by: 'user1',
          expense_splits: [
            { user_id: 'user1', amount_owed: 50, is_settled: false },
            { user_id: 'user2', amount_owed: 50, is_settled: false },
          ],
        },
      ]

      const balances = calculateBalances(expenses as any, ['user1', 'user2'])

      expect(balances['user1'].balance).toBe(50) // Paid 100, owes 50
      expect(balances['user2'].balance).toBe(-50) // Owes 50
    })

    it('should handle multiple expenses correctly', () => {
      const expenses = [
        {
          id: '1',
          amount: 100,
          paid_by: 'user1',
          expense_splits: [
            { user_id: 'user1', amount_owed: 50, is_settled: false },
            { user_id: 'user2', amount_owed: 50, is_settled: false },
          ],
        },
        {
          id: '2',
          amount: 60,
          paid_by: 'user2',
          expense_splits: [
            { user_id: 'user1', amount_owed: 30, is_settled: false },
            { user_id: 'user2', amount_owed: 30, is_settled: false },
          ],
        },
      ]

      const balances = calculateBalances(expenses as any, ['user1', 'user2'])

      // user1: paid 100, owes 80 (50 + 30) = balance +20
      expect(balances['user1'].balance).toBe(20)
      // user2: paid 60, owes 80 (50 + 30) = balance -20
      expect(balances['user2'].balance).toBe(-20)
    })

    it('should ignore settled expenses', () => {
      const expenses = [
        {
          id: '1',
          amount: 100,
          paid_by: 'user1',
          expense_splits: [
            { user_id: 'user1', amount_owed: 50, is_settled: true },
            { user_id: 'user2', amount_owed: 50, is_settled: true },
          ],
        },
      ]

      const balances = calculateBalances(expenses as any, ['user1', 'user2'])

      // All splits are settled, so balances should be: paid - 0
      expect(balances['user1'].balance).toBe(100) // Paid 100, owes 0
      expect(balances['user2'].balance).toBe(0) // Paid 0, owes 0
    })

    it('should handle three-way split correctly', () => {
      const expenses = [
        {
          id: '1',
          amount: 90,
          paid_by: 'user1',
          expense_splits: [
            { user_id: 'user1', amount_owed: 30, is_settled: false },
            { user_id: 'user2', amount_owed: 30, is_settled: false },
            { user_id: 'user3', amount_owed: 30, is_settled: false },
          ],
        },
      ]

      const balances = calculateBalances(expenses as any, ['user1', 'user2', 'user3'])

      expect(balances['user1'].balance).toBe(60) // Paid 90, owes 30
      expect(balances['user2'].balance).toBe(-30) // Owes 30
      expect(balances['user3'].balance).toBe(-30) // Owes 30
    })

    it('should return balances for members with no activity', () => {
      const balances = calculateBalances([], ['user1', 'user2'])

      expect(balances['user1'].balance).toBe(0)
      expect(balances['user2'].balance).toBe(0)
      expect(Object.keys(balances)).toHaveLength(2)
    })
  })

  describe('calculateSettlements', () => {
    it('should suggest optimal settlements for simple case', () => {
      const balances = {
        user1: { user_id: 'user1', balance: 50, paid: 50, owed: 0 },
        user2: { user_id: 'user2', balance: -30, paid: 0, owed: 30 },
        user3: { user_id: 'user3', balance: -20, paid: 0, owed: 20 },
      }

      const settlements = calculateSettlements(balances)

      expect(settlements).toHaveLength(2)
      expect(settlements).toContainEqual({
        from: 'user2',
        to: 'user1',
        amount: 30,
      })
      expect(settlements).toContainEqual({
        from: 'user3',
        to: 'user1',
        amount: 20,
      })
    })

    it('should return empty array for balanced accounts', () => {
      const balances = {
        user1: { user_id: 'user1', balance: 0, paid: 0, owed: 0 },
        user2: { user_id: 'user2', balance: 0, paid: 0, owed: 0 },
      }

      const settlements = calculateSettlements(balances)

      expect(settlements).toHaveLength(0)
    })

    it('should handle complex multi-person settlements', () => {
      const balances = {
        user1: { user_id: 'user1', balance: 100, paid: 100, owed: 0 },
        user2: { user_id: 'user2', balance: 50, paid: 50, owed: 0 },
        user3: { user_id: 'user3', balance: -80, paid: 0, owed: 80 },
        user4: { user_id: 'user4', balance: -70, paid: 0, owed: 70 },
      }

      const settlements = calculateSettlements(balances)

      // Verify total amounts match
      const totalOwed = settlements.reduce((sum, s) => sum + s.amount, 0)
      expect(totalOwed).toBeCloseTo(150, 2) // user3 (-80) + user4 (-70) = -150

      // Verify all debts are resolved
      const finalBalances: Record<string, number> = {
        user1: 100,
        user2: 50,
        user3: -80,
        user4: -70,
      }
      settlements.forEach((settlement) => {
        finalBalances[settlement.from] += settlement.amount
        finalBalances[settlement.to] -= settlement.amount
      })

      Object.values(finalBalances).forEach((balance) => {
        expect(Math.abs(balance)).toBeLessThan(0.01) // Should be near 0
      })
    })

    it('should minimize number of transactions', () => {
      const balances = {
        user1: { user_id: 'user1', balance: 50, paid: 50, owed: 0 },
        user2: { user_id: 'user2', balance: -25, paid: 0, owed: 25 },
        user3: { user_id: 'user3', balance: -25, paid: 0, owed: 25 },
      }

      const settlements = calculateSettlements(balances)

      // Should only need 2 transactions
      expect(settlements).toHaveLength(2)
    })

    it('should handle single creditor and debtor', () => {
      const balances = {
        user1: { user_id: 'user1', balance: 100, paid: 100, owed: 0 },
        user2: { user_id: 'user2', balance: -100, paid: 0, owed: 100 },
      }

      const settlements = calculateSettlements(balances)

      expect(settlements).toHaveLength(1)
      expect(settlements[0]).toEqual({
        from: 'user2',
        to: 'user1',
        amount: 100,
      })
    })
  })
})
