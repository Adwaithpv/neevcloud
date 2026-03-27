import type { Expense } from '../types/expense'
import { buildInsightSummary } from '../lib/insights'

interface InsightsPanelProps {
  expenses: Expense[]
  insights: string[]
  isLoading: boolean
}

export const InsightsPanel = ({ expenses, insights, isLoading }: InsightsPanelProps) => {
  const summary = buildInsightSummary(expenses)

  return (
    <section className="card">
      <h2>Smart Insights</h2>
      <p className="muted-text">Total spend: {summary.totalSpend.toFixed(2)}</p>

      <div className="insight-categories">
        {summary.categoryBreakdown.map((item) => (
          <div key={item.category} className="chip">
            {item.category}: {item.total.toFixed(2)} ({item.percentage}%)
          </div>
        ))}
      </div>

      <h3>AI Highlights</h3>
      {isLoading ? (
        <p className="muted-text">Generating insights...</p>
      ) : (
        <ul className="insight-list">
          {insights.map((insight, index) => (
            <li key={`${insight}-${index}`}>{insight}</li>
          ))}
        </ul>
      )}
    </section>
  )
}
