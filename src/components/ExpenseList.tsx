import type { Expense, Group } from '../types/expense'

interface ExpenseListProps {
  expenses: Expense[]
  group: Group
}

const formatDate = (isoDate: string): string => new Date(isoDate).toLocaleString()

export const ExpenseList = ({ expenses, group }: ExpenseListProps) => {
  const getMemberName = (memberId: string): string =>
    group.members.find((member) => member.id === memberId)?.name ?? memberId

  return (
    <section className="card">
      <h2>Expense History</h2>
      {expenses.length === 0 ? (
        <p className="muted-text">No expenses added yet.</p>
      ) : (
        <ul className="expense-list">
          {expenses.map((expense) => (
            <li key={expense.id} className="expense-item">
              <div className="expense-head">
                <strong>{expense.description}</strong>
                <span>{expense.amount.toFixed(2)}</span>
              </div>
              <p className="muted-text">
                Paid by {getMemberName(expense.payerId)} | {expense.category} | {formatDate(expense.createdAt)}
              </p>
              <p className="muted-text">
                Split: {expense.splits.map((split) => `${getMemberName(split.memberId)} ${split.amount.toFixed(2)}`).join(', ')}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
