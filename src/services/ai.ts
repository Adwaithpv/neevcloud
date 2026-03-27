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
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models'

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

const hasAiConfig = (): boolean => Boolean(import.meta.env.VITE_GEMINI_API_KEY)

interface GeminiGenerateContentResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>
    }
  }>
}

const getGeminiText = (data: GeminiGenerateContentResponse): string =>
  data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('\n') ?? ''

const callGemini = async (prompt: string): Promise<string | null> => {
  const apiKey = import.meta.env.GEMINI_API_KEY as string | undefined
  if (!apiKey) {
    return null
  }

  const model = (import.meta.env.VITE_GEMINI_MODEL as string | undefined) ?? 'gemini-1.5-flash'
  const endpoint = `${GEMINI_BASE_URL}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
    }),
  })

  if (!response.ok) {
    return null
  }

  const data = (await response.json()) as GeminiGenerateContentResponse
  const text = getGeminiText(data).trim()
  return text || null
}

export const categorizeExpense = async (description: string): Promise<ExpenseCategory> => {
  if (!hasAiConfig()) {
    return fallbackCategory(description)
  }

  try {
    const text = await callGemini(
      [
        'Classify this expense description into exactly one category.',
        'Allowed categories: food, travel, rent, utilities, shopping, entertainment, health, other.',
        'Reply with one lowercase word only.',
        `Description: ${description}`,
      ].join('\n')
    )
    if (!text) {
      return fallbackCategory(description)
    }
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
    const text = await callGemini(
      [
        'You are an expense analyst.',
        'Return exactly 3 concise insights as numbered lines.',
        'Each line must be fewer than 16 words.',
        `Data: ${JSON.stringify(summary)}`,
      ].join('\n')
    )
    if (!text) {
      return fallback
    }
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
