import type { Task, TaskView } from '@/schemas/task'

export const TASK_VIEWS: TaskView[] = ['active', 'archived', 'trash']

export type TaskListCache = {
  tasks: Task[]
  counts: Record<TaskView, number>
}

export function tasksQueryKey(view: TaskView) {
  return ['tasks', view] as const
}

export function adjustCount(
  counts: Record<TaskView, number>,
  view: TaskView,
  delta: number
): Record<TaskView, number> {
  return {
    ...counts,
    [view]: Math.max(0, counts[view] + delta)
  }
}

export function snapshotTaskLists(
  get: (view: TaskView) => TaskListCache | undefined
): Partial<Record<TaskView, Task[]>> {
  const snapshot: Partial<Record<TaskView, Task[]>> = {}
  for (const view of TASK_VIEWS) {
    snapshot[view] = get(view)?.tasks
  }
  return snapshot
}

export function restoreTaskLists(
  setTasks: (view: TaskView, tasks: Task[]) => void,
  snapshot: Partial<Record<TaskView, Task[]>>
) {
  for (const view of TASK_VIEWS) {
    if (snapshot[view] !== undefined) {
      setTasks(view, snapshot[view]!)
    }
  }
}

export function findTaskInLists(
  get: (view: TaskView) => TaskListCache | undefined,
  id: string
): { task: Task; view: TaskView } | null {
  for (const view of TASK_VIEWS) {
    const task = get(view)?.tasks.find((item) => item.id === id)
    if (task) {
      return { task, view }
    }
  }
  return null
}
