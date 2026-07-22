/**
 * Pure helpers for Kanban column ordering.
 * Server `reorderTask` and client optimistic updates share this logic.
 */

export function insertAtPosition<T extends { id: string }>(
  rows: T[],
  movedId: string,
  position: number
): T[] {
  const moved = rows.find((row) => row.id === movedId)
  if (!moved) {
    return rows
  }

  const without = rows.filter((row) => row.id !== movedId)
  const clamped = Math.max(0, Math.min(position, without.length))
  without.splice(clamped, 0, moved)
  return without
}

export function reindexPositions<T extends { id: string; position: number }>(
  rows: T[],
  start = 0
): Array<T & { position: number }> {
  return rows.map((row, index) => ({
    ...row,
    position: start + index
  }))
}
