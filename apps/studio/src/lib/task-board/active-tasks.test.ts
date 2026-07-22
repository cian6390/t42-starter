import { describe, expect, it } from 'vitest'
import type { Task } from '@/schemas/task'
import { applyReorderToTasks, buildColumnIds } from './active-tasks'

function task(overrides: Partial<Task> & Pick<Task, 'id' | 'status'>): Task {
  return {
    title: 'Task',
    description: null,
    position: 0,
    createdByUserId: 'user-1',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    deletedAt: null,
    ...overrides
  }
}

describe('buildColumnIds', () => {
  it('groups tasks by status and position', () => {
    expect(
      buildColumnIds([
        task({ id: '1', status: 'done', position: 1 }),
        task({ id: '2', status: 'backlog', position: 0 }),
        task({ id: '3', status: 'backlog', position: 2 })
      ])
    ).toEqual({
      backlog: ['2', '3'],
      in_progress: [],
      done: ['1']
    })
  })
})

describe('applyReorderToTasks', () => {
  it('moves a task across columns and reindexes positions', () => {
    const tasks = [
      task({ id: 'a', status: 'backlog', position: 0 }),
      task({ id: 'b', status: 'in_progress', position: 0 }),
      task({ id: 'c', status: 'done', position: 0 })
    ]

    const next = applyReorderToTasks(tasks, {
      id: 'a',
      status: 'done',
      position: 0
    })

    expect(next.find((item) => item.id === 'a')).toMatchObject({
      status: 'done',
      position: 0
    })
    expect(next.find((item) => item.id === 'c')).toMatchObject({
      status: 'done',
      position: 1
    })
  })
})
