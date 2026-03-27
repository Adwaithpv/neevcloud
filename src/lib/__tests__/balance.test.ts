import { describe, expect, it } from 'vitest'
import { calculateBalances, simplifyDebts } from '../balance'
import type { Expense, Group, Settlement } from '../../types/expense'

const group: Group = {
  id: 'g1',
  name: 'Trip',
  members: [
    { id: 'alice', name: 'Alice' },
    { id: 'bob', name: 'Bob' },
    { id: 'cara', name: 'Cara' },
  ],
}

const expenses: Expense[] = [
  {
    id: 'e1',
    groupId: 'g1',
    description: 'Dinner',
    amount: 90,
    payerId: 'alice',
    participantIds: ['alice', 'bob', 'cara'],
    splitMode: 'equal',
    splits: [
      { memberId: 'alice', amount: 30 },
      { memberId: 'bob', amount: 30 },
      { memberId: 'cara', amount: 30 },
    ],
    category: 'food',
    createdAt: new Date().toISOString(),
  },
]

describe('balance calculation', () => {
  it('calculates balances correctly after expenses', () => {
    const balances = calculateBalances(group, expenses, [])
    expect(balances).toEqual({
      alice: 60,
      bob: -30,
      cara: -30,
    })
  })

  it('accounts for settlements', () => {
    const settlements: Settlement[] = [
      {
        id: 's1',
        groupId: 'g1',
        fromMemberId: 'bob',
        toMemberId: 'alice',
        amount: 10,
        createdAt: new Date().toISOString(),
      },
    ]
    const balances = calculateBalances(group, expenses, settlements)
    expect(balances).toEqual({
      alice: 50,
      bob: -20,
      cara: -30,
    })
  })

  it('simplifies debts from balances', () => {
    const transfers = simplifyDebts({
      alice: 50,
      bob: -20,
      cara: -30,
    })
    expect(transfers).toEqual([
      { fromMemberId: 'cara', toMemberId: 'alice', amount: 30 },
      { fromMemberId: 'bob', toMemberId: 'alice', amount: 20 },
    ])
  })
})
