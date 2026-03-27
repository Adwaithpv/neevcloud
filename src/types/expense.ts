export type ExpenseCategory =
  | 'food'
  | 'travel'
  | 'rent'
  | 'utilities'
  | 'shopping'
  | 'entertainment'
  | 'health'
  | 'other'

export type SplitMode = 'equal' | 'custom'

export interface Member {
  id: string
  name: string
}

export interface Group {
  id: string
  name: string
  members: Member[]
}

export interface ExpenseSplit {
  memberId: string
  amount: number
}

export interface Expense {
  id: string
  groupId: string
  description: string
  amount: number
  payerId: string
  participantIds: string[]
  splitMode: SplitMode
  splits: ExpenseSplit[]
  category: ExpenseCategory
  createdAt: string
}

export interface Settlement {
  id: string
  groupId: string
  fromMemberId: string
  toMemberId: string
  amount: number
  createdAt: string
}

export interface DebtTransfer {
  fromMemberId: string
  toMemberId: string
  amount: number
}

export interface ExpenseInput {
  description: string
  amount: number
  payerId: string
  participantIds: string[]
  splitMode: SplitMode
  customSplits?: Record<string, number>
  category: ExpenseCategory
}
