import { useState } from 'react'
import type { DebtTransfer, Group } from '../types/expense'

interface BalanceSummaryProps {
  group: Group
  balances: Record<string, number>
  transfers: DebtTransfer[]
  onAddSettlement: (fromMemberId: string, toMemberId: string, amount: number) => void
}

const toMoney = (value: number): string => value.toFixed(2)

export const BalanceSummary = ({
  group,
  balances,
  transfers,
  onAddSettlement,
}: BalanceSummaryProps) => {
  const [fromMemberId, setFromMemberId] = useState(group.members[0]?.id ?? '')
  const [toMemberId, setToMemberId] = useState(group.members[1]?.id ?? group.members[0]?.id ?? '')
  const [amount, setAmount] = useState('')

  const getMemberName = (memberId: string): string =>
    group.members.find((member) => member.id === memberId)?.name ?? memberId

  return (
    <section className="card">
      <h2>Balances</h2>
      <ul className="balance-list">
        {group.members.map((member) => {
          const balance = balances[member.id] ?? 0
          const className = balance > 0 ? 'positive' : balance < 0 ? 'negative' : ''
          return (
            <li key={member.id}>
              <span>{member.name}</span>
              <strong className={className}>{toMoney(balance)}</strong>
            </li>
          )
        })}
      </ul>

      <h3>Who owes whom</h3>
      {transfers.length === 0 ? (
        <p className="muted-text">All settled up.</p>
      ) : (
        <ul className="transfer-list">
          {transfers.map((transfer) => (
            <li key={`${transfer.fromMemberId}-${transfer.toMemberId}-${transfer.amount}`}>
              {getMemberName(transfer.fromMemberId)} owes {getMemberName(transfer.toMemberId)}{' '}
              {toMoney(transfer.amount)}
            </li>
          ))}
        </ul>
      )}

      <h3>Record settlement</h3>
      <form
        className="stack-form"
        onSubmit={(event) => {
          event.preventDefault()
          onAddSettlement(fromMemberId, toMemberId, Number.parseFloat(amount || '0'))
          setAmount('')
        }}
      >
        <label>
          From
          <select value={fromMemberId} onChange={(event) => setFromMemberId(event.target.value)}>
            {group.members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          To
          <select value={toMemberId} onChange={(event) => setToMemberId(event.target.value)}>
            {group.members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Amount
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="Settlement amount"
          />
        </label>
        <button type="submit">Add Settlement</button>
      </form>
    </section>
  )
}
