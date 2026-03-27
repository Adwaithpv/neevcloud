import { describe, expect, it } from 'vitest'
import { buildCustomSplits, buildEqualSplits, buildSplits } from '../split'

describe('split helpers', () => {
  it('splits equally with cent-level precision', () => {
    const splits = buildEqualSplits(100, ['a', 'b', 'c'])
    expect(splits).toEqual([
      { memberId: 'a', amount: 33.34 },
      { memberId: 'b', amount: 33.33 },
      { memberId: 'c', amount: 33.33 },
    ])
  })

  it('validates custom split sum', () => {
    expect(() =>
      buildCustomSplits(50, ['a', 'b'], {
        a: 20,
        b: 20,
      })
    ).toThrow('Custom split totals must match expense amount.')
  })

  it('routes through buildSplits based on mode', () => {
    const result = buildSplits({
      amount: 60,
      participantIds: ['a', 'b'],
      splitMode: 'custom',
      customSplits: { a: 40, b: 20 },
    })
    expect(result).toEqual([
      { memberId: 'a', amount: 40 },
      { memberId: 'b', amount: 20 },
    ])
  })
})
