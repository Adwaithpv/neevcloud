import type { ExpenseSplit, SplitMode } from '../types/expense'

const toCents = (amount: number): number => Math.round(amount * 100)
const fromCents = (cents: number): number => cents / 100

export const roundToTwo = (amount: number): number => Math.round(amount * 100) / 100

const unique = (ids: string[]): string[] => Array.from(new Set(ids))

export const buildEqualSplits = (amount: number, participantIds: string[]): ExpenseSplit[] => {
  const members = unique(participantIds)
  if (members.length === 0) {
    throw new Error('At least one participant is required.')
  }
  if (amount <= 0) {
    throw new Error('Amount must be greater than zero.')
  }

  const totalCents = toCents(amount)
  const base = Math.floor(totalCents / members.length)
  const remainder = totalCents % members.length

  return members.map((memberId, index) => ({
    memberId,
    amount: fromCents(base + (index < remainder ? 1 : 0)),
  }))
}

export const buildCustomSplits = (
  amount: number,
  participantIds: string[],
  customSplits: Record<string, number>
): ExpenseSplit[] => {
  const members = unique(participantIds)
  if (members.length === 0) {
    throw new Error('At least one participant is required.')
  }
  if (amount <= 0) {
    throw new Error('Amount must be greater than zero.')
  }

  const splits = members.map((memberId) => {
    const split = customSplits[memberId]
    if (typeof split !== 'number' || Number.isNaN(split) || split < 0) {
      throw new Error('Each participant must have a valid custom split amount.')
    }
    return { memberId, amount: roundToTwo(split) }
  })

  const splitTotal = roundToTwo(splits.reduce((acc, split) => acc + split.amount, 0))
  if (roundToTwo(amount) !== splitTotal) {
    throw new Error('Custom split totals must match expense amount.')
  }

  return splits
}

export const buildSplits = (params: {
  amount: number
  participantIds: string[]
  splitMode: SplitMode
  customSplits?: Record<string, number>
}): ExpenseSplit[] => {
  const { amount, participantIds, splitMode, customSplits } = params
  if (splitMode === 'equal') {
    return buildEqualSplits(amount, participantIds)
  }
  return buildCustomSplits(amount, participantIds, customSplits ?? {})
}
