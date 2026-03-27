import { useMemo, useState } from 'react'
import type { ExpenseInput, Group, SplitMode } from '../types/expense'

interface ExpenseFormProps {
  group: Group
  isSubmitting: boolean
  onAddExpense: (input: Omit<ExpenseInput, 'category'>) => Promise<void>
}

const parseCurrency = (value: string): number => Number.parseFloat(value || '0')

export const ExpenseForm = ({ group, onAddExpense, isSubmitting }: ExpenseFormProps) => {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [payerId, setPayerId] = useState(group.members[0]?.id ?? '')
  const [splitMode, setSplitMode] = useState<SplitMode>('equal')
  const [participantIds, setParticipantIds] = useState<string[]>(group.members.map((m) => m.id))
  const [customSplits, setCustomSplits] = useState<Record<string, string>>({})
  const [error, setError] = useState('')

  const canSubmit = useMemo(
    () => Boolean(description.trim()) && parseCurrency(amount) > 0 && payerId && participantIds.length > 0,
    [description, amount, payerId, participantIds]
  )

  return (
    <section className="card">
      <h2>Add Expense</h2>
      <form
        className="stack-form"
        onSubmit={async (event) => {
          event.preventDefault()
          setError('')
          try {
            const custom =
              splitMode === 'custom'
                ? participantIds.reduce<Record<string, number>>((acc, memberId) => {
                    acc[memberId] = parseCurrency(customSplits[memberId] ?? '0')
                    return acc
                  }, {})
                : undefined

            await onAddExpense({
              description,
              amount: parseCurrency(amount),
              payerId,
              participantIds,
              splitMode,
              customSplits: custom,
            })

            setDescription('')
            setAmount('')
            setSplitMode('equal')
            setCustomSplits({})
          } catch (caughtError) {
            setError(caughtError instanceof Error ? caughtError.message : 'Failed to add expense.')
          }
        }}
      >
        <input
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Description (e.g. Dinner at ABC)"
        />
        <input
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          type="number"
          min="0"
          step="0.01"
          placeholder="Amount"
        />

        <label>
          Paid By
          <select value={payerId} onChange={(event) => setPayerId(event.target.value)}>
            {group.members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Split Mode
          <select
            value={splitMode}
            onChange={(event) => setSplitMode(event.target.value as SplitMode)}
          >
            <option value="equal">Equal</option>
            <option value="custom">Custom</option>
          </select>
        </label>

        <fieldset>
          <legend>Participants</legend>
          <div className="checkbox-grid">
            {group.members.map((member) => {
              const checked = participantIds.includes(member.id)
              return (
                <label key={member.id} className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(event) => {
                      if (event.target.checked) {
                        setParticipantIds((prev) => [...prev, member.id])
                      } else {
                        setParticipantIds((prev) => prev.filter((id) => id !== member.id))
                      }
                    }}
                  />
                  {member.name}
                </label>
              )
            })}
          </div>
        </fieldset>

        {splitMode === 'custom' && (
          <div className="custom-splits">
            {participantIds.map((memberId) => {
              const memberName = group.members.find((member) => member.id === memberId)?.name ?? memberId
              return (
                <label key={memberId}>
                  {memberName}
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={customSplits[memberId] ?? ''}
                    onChange={(event) =>
                      setCustomSplits((prev) => ({
                        ...prev,
                        [memberId]: event.target.value,
                      }))
                    }
                    placeholder="Amount"
                  />
                </label>
              )
            })}
          </div>
        )}

        {error && <p className="error-text">{error}</p>}
        <button type="submit" disabled={!canSubmit || isSubmitting}>
          {isSubmitting ? 'Adding with AI...' : 'Add Expense'}
        </button>
      </form>
    </section>
  )
}
