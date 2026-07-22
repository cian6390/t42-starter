import { describe, expect, it } from 'vitest'
import { insertAtPosition, reindexPositions } from './task-reorder'

describe('insertAtPosition', () => {
  const rows = [
    { id: 'a', position: 0 },
    { id: 'b', position: 1 },
    { id: 'c', position: 2 }
  ]

  it('inserts at the requested index', () => {
    expect(insertAtPosition(rows, 'c', 0).map((row) => row.id)).toEqual([
      'c',
      'a',
      'b'
    ])
  })

  it('clamps position to column length', () => {
    expect(insertAtPosition(rows, 'a', 99).map((row) => row.id)).toEqual([
      'b',
      'c',
      'a'
    ])
  })

  it('returns original rows when id is missing', () => {
    expect(insertAtPosition(rows, 'missing', 0)).toEqual(rows)
  })
})

describe('reindexPositions', () => {
  it('assigns contiguous positions', () => {
    expect(
      reindexPositions([
        { id: 'a', position: 9 },
        { id: 'b', position: 2 }
      ])
    ).toEqual([
      { id: 'a', position: 0 },
      { id: 'b', position: 1 }
    ])
  })
})
