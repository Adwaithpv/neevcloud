import type { Expense, ExpenseCategory } from '../types/expense'
import { roundToTwo } from './split'

export interface CategorySpend {
  category: ExpenseCategory
  total: number
  percentage: number
}

export interface InsightSummary {
  categoryBreakdown: CategorySpend[]
  totalSpend: number
  currentWeekSpend: number
  previousWeekSpend: number
  deltaPercentage: number
  topCategory?: ExpenseCategory
}

const allCategories: ExpenseCategory[] = [
  'food',
  'travel',
  'rent',
  'utilities',
  'shopping',
  'entertainment',
  'health',
  'other',
]

const isWithinDays = (dateValue: string, days: number, now: Date): boolean => {
  const expenseDate = new Date(dateValue)
  const delta = now.getTime() - expenseDate.getTime()
  return delta >= 0 && delta <= days * 24 * 60 * 60 * 1000
}

export const buildInsightSummary = (expenses: Expense[], now = new Date()): InsightSummary => {
  const totalSpend = roundToTwo(expenses.reduce((acc, expense) => acc + expense.amount, 0))

  const categoryTotals = allCategories.reduce<Record<ExpenseCategory, number>>(
    (acc, category) => {
      acc[category] = 0
      return acc
    },
    {} as Record<ExpenseCategory, number>
  )

  for (const expense of expenses) {
    categoryTotals[expense.category] = roundToTwo(categoryTotals[expense.category] + expense.amount)
  }

  const categoryBreakdown: CategorySpend[] = allCategories
    .map((category) => ({
      category,
      total: categoryTotals[category],
      percentage: totalSpend > 0 ? roundToTwo((categoryTotals[category] / totalSpend) * 100) : 0,
    }))
    .filter((entry) => entry.total > 0)
    .sort((a, b) => b.total - a.total)

  const currentWeekSpend = roundToTwo(
    expenses
      .filter((expense) => isWithinDays(expense.createdAt, 7, now))
      .reduce((acc, expense) => acc + expense.amount, 0)
  )

  const previousWeekSpend = roundToTwo(
    expenses
      .filter((expense) => {
        const date = new Date(expense.createdAt)
        const delta = now.getTime() - date.getTime()
        return delta > 7 * 24 * 60 * 60 * 1000 && delta <= 14 * 24 * 60 * 60 * 1000
      })
      .reduce((acc, expense) => acc + expense.amount, 0)
  )

  const deltaPercentage =
    previousWeekSpend > 0
      ? roundToTwo(((currentWeekSpend - previousWeekSpend) / previousWeekSpend) * 100)
      : currentWeekSpend > 0
        ? 100
        : 0

  return {
    categoryBreakdown,
    totalSpend,
    currentWeekSpend,
    previousWeekSpend,
    deltaPercentage,
    topCategory: categoryBreakdown[0]?.category,
  }
}

export const buildFallbackInsights = (expenses: Expense[]): string[] => {
  if (expenses.length === 0) {
    return ['No expenses yet. Add your first expense to start receiving insights.']
  }

  const summary = buildInsightSummary(expenses)
  const insights: string[] = []

  if (summary.topCategory) {
    const top = summary.categoryBreakdown[0]
    insights.push(
      `${top.category.toUpperCase()} is your top category at ${top.percentage}% of total spend.`
    )
  }

  if (summary.previousWeekSpend > 0) {
    const trend = summary.deltaPercentage >= 0 ? 'higher' : 'lower'
    insights.push(
      `Weekly spend is ${Math.abs(summary.deltaPercentage)}% ${trend} than the previous week.`
    )
  } else if (summary.currentWeekSpend > 0) {
    insights.push('This is your first tracked week of expenses. Keep going for trend comparisons.')
  }

  insights.push(`Total tracked spend is ${summary.totalSpend.toFixed(2)}.`)
  return insights
}
