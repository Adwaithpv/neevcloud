import type { DebtTransfer, Expense, Group, Settlement } from '../types/expense'
import { roundToTwo } from './split'

export type BalanceByMemberId = Record<string, number>

export const calculateBalances = (
  group: Group,
  expenses: Expense[],
  settlements: Settlement[]
): BalanceByMemberId => {
  const balances: BalanceByMemberId = {}
  for (const member of group.members) {
    balances[member.id] = 0
  }

  for (const expense of expenses) {
    if (!(expense.payerId in balances)) {
      continue
    }
    balances[expense.payerId] += expense.amount

    for (const split of expense.splits) {
      if (!(split.memberId in balances)) {
        continue
      }
      balances[split.memberId] -= split.amount
    }
  }

  for (const settlement of settlements) {
    if (!(settlement.fromMemberId in balances) || !(settlement.toMemberId in balances)) {
      continue
    }
    balances[settlement.fromMemberId] += settlement.amount
    balances[settlement.toMemberId] -= settlement.amount
  }

  Object.keys(balances).forEach((memberId) => {
    balances[memberId] = roundToTwo(balances[memberId])
  })

  return balances
}

export const simplifyDebts = (balances: BalanceByMemberId): DebtTransfer[] => {
  const creditors: Array<{ memberId: string; amount: number }> = []
  const debtors: Array<{ memberId: string; amount: number }> = []

  for (const [memberId, balance] of Object.entries(balances)) {
    if (balance > 0.01) {
      creditors.push({ memberId, amount: roundToTwo(balance) })
    } else if (balance < -0.01) {
      debtors.push({ memberId, amount: roundToTwo(Math.abs(balance)) })
    }
  }

  creditors.sort((a, b) => b.amount - a.amount)
  debtors.sort((a, b) => b.amount - a.amount)

  const transfers: DebtTransfer[] = []
  let creditorIndex = 0
  let debtorIndex = 0

  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex]
    const debtor = debtors[debtorIndex]
    const amount = roundToTwo(Math.min(creditor.amount, debtor.amount))

    if (amount > 0) {
      transfers.push({
        fromMemberId: debtor.memberId,
        toMemberId: creditor.memberId,
        amount,
      })
    }

    creditor.amount = roundToTwo(creditor.amount - amount)
    debtor.amount = roundToTwo(debtor.amount - amount)

    if (creditor.amount <= 0.01) {
      creditorIndex += 1
    }
    if (debtor.amount <= 0.01) {
      debtorIndex += 1
    }
  }

  return transfers
}
