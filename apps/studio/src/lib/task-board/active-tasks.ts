import type { KanbanTaskStatus, Task } from '@/schemas/task'

export const KANBAN_STATUSES: KanbanTaskStatus[] = [
  'backlog',
  'in_progress',
  'done'
]

export type ColumnIds = Record<KanbanTaskStatus, string[]>

export function insertIdAtPosition(
  ids: string[],
  id: string,
  position: number
): string[] {
  const without = ids.filter((item) => item !== id)
  const clamped = Math.max(0, Math.min(position, without.length))
  without.splice(clamped, 0, id)
  return without
}

export function buildColumnIds(tasks: Task[]): ColumnIds {
  const columns: ColumnIds = {
    backlog: [],
    in_progress: [],
    done: []
  }

  for (const status of KANBAN_STATUSES) {
    columns[status] = tasks
      .filter((task) => task.status === status)
      .sort((a, b) => a.position - b.position)
      .map((task) => task.id)
  }

  return columns
}

export function applyReorderToTasks(
  tasks: Task[],
  input: { id: string; status: KanbanTaskStatus; position: number }
): Task[] {
  const moved = tasks.find((task) => task.id === input.id)
  if (!moved) {
    return tasks
  }

  const now = new Date().toISOString()
  const others = tasks.filter((task) => task.id !== input.id)
  const columns: ColumnIds = buildColumnIds(others)

  const targetIds = columns[input.status]
  const nextTargetIds = insertIdAtPosition(targetIds, input.id, input.position)
  columns[input.status] = nextTargetIds

  const orderById = new Map<
    string,
    { status: KanbanTaskStatus; position: number }
  >()
  for (const status of KANBAN_STATUSES) {
    columns[status].forEach((id, index) => {
      orderById.set(id, { status, position: index })
    })
  }

  return tasks.map((task) => {
    if (task.id === input.id) {
      return {
        ...task,
        status: input.status,
        position: orderById.get(task.id)?.position ?? input.position,
        updatedAt: now
      }
    }

    const next = orderById.get(task.id)
    if (!next) {
      return task
    }

    if (task.status === next.status && task.position === next.position) {
      return task
    }

    return {
      ...task,
      status: next.status,
      position: next.position,
      updatedAt: now
    }
  })
}
