import { useEffect, useMemo, useState } from 'react'
import { calculateBalances, simplifyDebts } from '../lib/balance'
import { buildSplits } from '../lib/split'
import { loadFromStorage, saveToStorage } from '../lib/storage'
import type {
  Expense,
  ExpenseInput,
  Group,
  Member,
  Settlement,
  SplitMode,
} from '../types/expense'

interface StoreData {
  groups: Group[]
  activeGroupId: string | null
  expenses: Expense[]
  settlements: Settlement[]
}

const initialState: StoreData = {
  groups: [],
  activeGroupId: null,
  expenses: [],
  settlements: [],
}

const createId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

export const useExpenseStore = () => {
  const [state, setState] = useState<StoreData>(() => loadFromStorage(initialState))

  useEffect(() => {
    saveToStorage(state)
  }, [state])

  const activeGroup = useMemo(
    () => state.groups.find((group) => group.id === state.activeGroupId) ?? null,
    [state.groups, state.activeGroupId]
  )

  const groupExpenses = useMemo(
    () => state.expenses.filter((expense) => expense.groupId === state.activeGroupId),
    [state.expenses, state.activeGroupId]
  )

  const groupSettlements = useMemo(
    () => state.settlements.filter((settlement) => settlement.groupId === state.activeGroupId),
    [state.settlements, state.activeGroupId]
  )

  const balances = useMemo(
    () => (activeGroup ? calculateBalances(activeGroup, groupExpenses, groupSettlements) : {}),
    [activeGroup, groupExpenses, groupSettlements]
  )

  const transfers = useMemo(() => simplifyDebts(balances), [balances])

  const createGroup = (name: string): void => {
    const trimmed = name.trim()
    if (!trimmed) {
      return
    }

    const group: Group = {
      id: createId(),
      name: trimmed,
      members: [],
    }

    setState((prev) => ({
      ...prev,
      groups: [...prev.groups, group],
      activeGroupId: prev.activeGroupId ?? group.id,
    }))
  }

  const setActiveGroup = (groupId: string): void => {
    setState((prev) => ({ ...prev, activeGroupId: groupId }))
  }

  const addMember = (groupId: string, memberName: string): void => {
    const trimmed = memberName.trim()
    if (!trimmed) {
      return
    }

    const member: Member = {
      id: createId(),
      name: trimmed,
    }

    setState((prev) => ({
      ...prev,
      groups: prev.groups.map((group) =>
        group.id === groupId ? { ...group, members: [...group.members, member] } : group
      ),
    }))
  }

  const addExpense = (groupId: string, input: ExpenseInput): void => {
    const splits = buildSplits({
      amount: input.amount,
      participantIds: input.participantIds,
      splitMode: input.splitMode as SplitMode,
      customSplits: input.customSplits,
    })

    const expense: Expense = {
      id: createId(),
      groupId,
      description: input.description.trim(),
      amount: input.amount,
      payerId: input.payerId,
      participantIds: input.participantIds,
      splitMode: input.splitMode,
      splits,
      category: input.category,
      createdAt: new Date().toISOString(),
    }

    setState((prev) => ({
      ...prev,
      expenses: [expense, ...prev.expenses],
    }))
  }

  const addSettlement = (
    groupId: string,
    fromMemberId: string,
    toMemberId: string,
    amount: number
  ): void => {
    if (fromMemberId === toMemberId || amount <= 0) {
      return
    }

    const settlement: Settlement = {
      id: createId(),
      groupId,
      fromMemberId,
      toMemberId,
      amount,
      createdAt: new Date().toISOString(),
    }

    setState((prev) => ({
      ...prev,
      settlements: [settlement, ...prev.settlements],
    }))
  }

  const clearAll = (): void => setState(initialState)

  return {
    ...state,
    activeGroup,
    groupExpenses,
    groupSettlements,
    balances,
    transfers,
    createGroup,
    setActiveGroup,
    addMember,
    addExpense,
    addSettlement,
    clearAll,
  }
}
