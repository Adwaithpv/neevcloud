import type { Expense, ExpenseCategory } from '../types/expense'
import { buildFallbackInsights, buildInsightSummary } from '../lib/insights'

const categoryKeywords: Record<ExpenseCategory, string[]> = {
  food: ['food', 'dinner', 'lunch', 'breakfast', 'restaurant', 'snack', 'groceries', 'meal'],
  travel: ['travel', 'uber', 'taxi', 'flight', 'train', 'bus', 'fuel', 'petrol', 'trip'],
  rent: ['rent', 'lease', 'apartment', 'accommodation'],
  utilities: ['electricity', 'water', 'gas', 'internet', 'wifi', 'utility', 'bill'],
  shopping: ['shopping', 'clothes', 'amazon', 'market', 'purchase', 'buy'],
  entertainment: ['movie', 'concert', 'party', 'game', 'subscription', 'netflix'],
  health: ['doctor', 'medicine', 'hospital', 'pharmacy', 'health', 'gym'],
  other: [],
}

const allowedCategories: ExpenseCategory[] = [
  'food',
  'travel',
  'rent',
  'utilities',
  'shopping',
  'entertainment',
  'health',
  'other',
]

const normalize = (text: string): string => text.trim().toLowerCase()

const fallbackCategory = (description: string): ExpenseCategory => {
  const normalized = normalize(description)
  for (const [category, keywords] of Object.entries(categoryKeywords) as [
    ExpenseCategory,
    string[],
  ][]) {
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return category
    }
  }
  return 'other'
}

const hasAiConfig = (): boolean => Boolean(import.meta.env.VITE_OPENAI_API_KEY)

export const categorizeExpense = async (description: string): Promise<ExpenseCategory> => {
  if (!hasAiConfig()) {
    return fallbackCategory(description)
  }

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: import.meta.env.VITE_OPENAI_MODEL ?? 'gpt-4.1-mini',
        input: [
          {
            role: 'system',
            content:
              'Classify expense descriptions into one category: food, travel, rent, utilities, shopping, entertainment, health, other. Reply with one lowercase category only.',
          },
          { role: 'user', content: description },
        ],
      }),
    })

    if (!response.ok) {
      return fallbackCategory(description)
    }

    const data = (await response.json()) as {
      output_text?: string
      output?: Array<{ content?: Array<{ text?: string }> }>
    }

    const text =
      data.output_text ??
      data.output?.flatMap((item) => item.content ?? []).map((item) => item.text ?? '').join(' ')

    const candidate = normalize(text ?? '')
    if (allowedCategories.includes(candidate as ExpenseCategory)) {
      return candidate as ExpenseCategory
    }
  } catch {
    // Fail silently and fallback to deterministic categorization.
  }

  return fallbackCategory(description)
}

export const generateInsights = async (expenses: Expense[]): Promise<string[]> => {
  if (expenses.length === 0) {
    return buildFallbackInsights(expenses)
  }

  const fallback = buildFallbackInsights(expenses)

  if (!hasAiConfig()) {
    return fallback
  }

  try {
    const summary = buildInsightSummary(expenses)
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: import.meta.env.VITE_OPENAI_MODEL ?? 'gpt-4.1-mini',
        input: [
          {
            role: 'system',
            content:
              'You are an expense analyst. Return exactly 3 concise insights as numbered lines. Keep each line under 16 words.',
          },
          {
            role: 'user',
            content: JSON.stringify(summary),
          },
        ],
      }),
    })

    if (!response.ok) {
      return fallback
    }

    const data = (await response.json()) as {
      output_text?: string
      output?: Array<{ content?: Array<{ text?: string }> }>
    }
    const text =
      data.output_text ??
      data.output?.flatMap((item) => item.content ?? []).map((item) => item.text ?? '').join('\n')
    const lines = (text ?? '')
      .split('\n')
      .map((line) => line.replace(/^\d+[).\s-]*/, '').trim())
      .filter(Boolean)
      .slice(0, 3)

    return lines.length > 0 ? lines : fallback
  } catch {
    return fallback
  }
}
