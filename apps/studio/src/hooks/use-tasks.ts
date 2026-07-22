'use client'

import { reportClientError } from '@t42/observability/client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { applyReorderToTasks } from '@/lib/task-board/active-tasks'
import {
  adjustCount,
  findTaskInLists,
  restoreTaskLists,
  snapshotTaskLists,
  type TaskListCache,
  tasksQueryKey
} from '@/lib/task-board/cache-updates'
import type {
  CreateTaskInput,
  KanbanTaskStatus,
  Task,
  TaskView,
  UpdateTaskInput
} from '@/schemas/task'
import { taskListResponseSchema, taskSchema } from '@/schemas/task'

type OptimisticContext = {
  snapshot: Partial<Record<TaskView, Task[]>>
}

async function readApiError(res: Response, fallback: string) {
  try {
    const body = (await res.json()) as { error?: string }
    if (typeof body.error === 'string') {
      return body.error
    }
  } catch {
    // ignore
  }
  return fallback
}

async function fetchTasks(view: TaskView = 'active'): Promise<TaskListCache> {
  const params = new URLSearchParams()
  if (view !== 'active') {
    params.set('view', view)
  }
  const query = params.toString()
  const res = await fetch(`/api/tasks${query ? `?${query}` : ''}`)
  if (res.status === 401) {
    throw new Error('Unauthorized')
  }
  if (!res.ok) {
    throw new Error(await readApiError(res, 'Failed to load tasks'))
  }
  const parsed = taskListResponseSchema.safeParse(await res.json())
  if (!parsed.success) {
    throw new Error('Invalid task list response')
  }
  return parsed.data
}

function invalidateAllTasks(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['tasks'] })
}

function createListCacheAdapter(
  queryClient: ReturnType<typeof useQueryClient>
) {
  const get = (view: TaskView) =>
    queryClient.getQueryData<TaskListCache>(tasksQueryKey(view))

  const setTasks = (view: TaskView, tasks: Task[]) => {
    const current = get(view)
    if (!current) {
      return
    }
    queryClient.setQueryData(tasksQueryKey(view), { ...current, tasks })
  }

  const setList = (view: TaskView, data: TaskListCache) => {
    queryClient.setQueryData(tasksQueryKey(view), data)
  }

  return { get, setTasks, setList }
}

async function prepareOptimisticUpdate(
  queryClient: ReturnType<typeof useQueryClient>,
  apply: () => void
): Promise<OptimisticContext> {
  await queryClient.cancelQueries({ queryKey: ['tasks'] })
  const cache = createListCacheAdapter(queryClient)
  const snapshot = snapshotTaskLists(cache.get)
  apply()
  return { snapshot }
}

function reportMutationError(error: unknown, operation: string) {
  reportClientError(error, { feature: 'task-board', operation })
}

export function useTasks(view: TaskView = 'active') {
  return useQuery({
    queryKey: tasksQueryKey(view),
    queryFn: () => fetchTasks(view)
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      })
      if (!res.ok) {
        throw new Error(await readApiError(res, 'Failed to create task'))
      }
      const parsed = taskSchema.safeParse(await res.json())
      if (!parsed.success) {
        throw new Error('Invalid task response')
      }
      return parsed.data
    },
    onError: (error) => reportMutationError(error, 'create'),
    onSuccess: () => invalidateAllTasks(queryClient)
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateTaskInput & { id: string }) => {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      })
      if (!res.ok) {
        throw new Error(await readApiError(res, 'Failed to update task'))
      }
      const parsed = taskSchema.safeParse(await res.json())
      if (!parsed.success) {
        throw new Error('Invalid task response')
      }
      return parsed.data
    },
    onError: (error) => reportMutationError(error, 'update'),
    onSuccess: () => invalidateAllTasks(queryClient)
  })
}

export function useMoveTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      status
    }: {
      id: string
      status: Task['status']
    }) => {
      const res = await fetch(`/api/tasks/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (!res.ok) {
        throw new Error(await readApiError(res, 'Failed to move task'))
      }
      const parsed = taskSchema.safeParse(await res.json())
      if (!parsed.success) {
        throw new Error('Invalid task response')
      }
      return parsed.data
    },
    onMutate: async (variables) => {
      const cache = createListCacheAdapter(queryClient)
      return prepareOptimisticUpdate(queryClient, () => {
        const located = findTaskInLists(cache.get, variables.id)
        if (!located) {
          return
        }

        const now = new Date().toISOString()
        const { task, view: sourceView } = located
        const updated: Task = {
          ...task,
          status: variables.status,
          updatedAt: now
        }

        const source = cache.get(sourceView)
        if (!source) {
          return
        }

        cache.setList(sourceView, {
          ...source,
          tasks: source.tasks.filter((item) => item.id !== variables.id),
          counts: adjustCount(source.counts, sourceView, -1)
        })

        if (variables.status === 'archived') {
          const archived = cache.get('archived') ?? {
            tasks: [],
            counts: { active: 0, archived: 0, trash: 0 }
          }
          cache.setList('archived', {
            tasks: [updated, ...archived.tasks],
            counts: adjustCount(archived.counts, 'archived', 1)
          })
          return
        }

        if (
          variables.status === 'backlog' ||
          variables.status === 'in_progress' ||
          variables.status === 'done'
        ) {
          const active = cache.get('active') ?? {
            tasks: [],
            counts: { active: 0, archived: 0, trash: 0 }
          }
          const columnLength = active.tasks.filter(
            (item) => item.status === variables.status
          ).length
          cache.setList('active', {
            tasks: [...active.tasks, { ...updated, position: columnLength }],
            counts: adjustCount(active.counts, 'active', 1)
          })
        }
      })
    },
    onError: (error, _variables, context) => {
      reportMutationError(error, 'move')
      if (context?.snapshot) {
        restoreTaskLists(
          createListCacheAdapter(queryClient).setTasks,
          context.snapshot
        )
      }
    },
    onSettled: () => invalidateAllTasks(queryClient)
  })
}

export function useTrashTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/tasks/${id}/trash`, { method: 'PATCH' })
      if (!res.ok) {
        throw new Error(await readApiError(res, 'Failed to move task to trash'))
      }
      const parsed = taskSchema.safeParse(await res.json())
      if (!parsed.success) {
        throw new Error('Invalid task response')
      }
      return parsed.data
    },
    onMutate: async (id) => {
      const cache = createListCacheAdapter(queryClient)
      return prepareOptimisticUpdate(queryClient, () => {
        const located = findTaskInLists(cache.get, id)
        if (!located) {
          return
        }

        const now = new Date().toISOString()
        const { task, view: sourceView } = located
        const source = cache.get(sourceView)
        if (!source) {
          return
        }

        cache.setList(sourceView, {
          ...source,
          tasks: source.tasks.filter((item) => item.id !== id),
          counts: adjustCount(source.counts, sourceView, -1)
        })

        const trash = cache.get('trash') ?? {
          tasks: [],
          counts: { active: 0, archived: 0, trash: 0 }
        }
        cache.setList('trash', {
          tasks: [{ ...task, deletedAt: now, updatedAt: now }, ...trash.tasks],
          counts: adjustCount(trash.counts, 'trash', 1)
        })
      })
    },
    onError: (error, _variables, context) => {
      reportMutationError(error, 'trash')
      if (context?.snapshot) {
        restoreTaskLists(
          createListCacheAdapter(queryClient).setTasks,
          context.snapshot
        )
      }
    },
    onSettled: () => invalidateAllTasks(queryClient)
  })
}

export function useRestoreTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/tasks/${id}/restore`, { method: 'PATCH' })
      if (!res.ok) {
        throw new Error(await readApiError(res, 'Failed to restore task'))
      }
      const parsed = taskSchema.safeParse(await res.json())
      if (!parsed.success) {
        throw new Error('Invalid task response')
      }
      return parsed.data
    },
    onError: (error) => reportMutationError(error, 'restore'),
    onSuccess: () => invalidateAllTasks(queryClient)
  })
}

export function usePermanentDeleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        throw new Error(await readApiError(res, 'Failed to delete task'))
      }
    },
    onError: (error) => reportMutationError(error, 'permanent-delete'),
    onSuccess: () => invalidateAllTasks(queryClient)
  })
}

/** Same-column reorder only — optimistic update in React Query cache. */
export function useReorderTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      id: string
      status: KanbanTaskStatus
      position: number
    }) => {
      const res = await fetch(`/api/tasks/${input.id}/position`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: input.status,
          position: input.position
        })
      })
      if (!res.ok) {
        throw new Error(await readApiError(res, 'Failed to reorder task'))
      }
      const parsed = taskSchema.safeParse(await res.json())
      if (!parsed.success) {
        throw new Error('Invalid task response')
      }
      return parsed.data
    },
    onMutate: async (variables) => {
      const cache = createListCacheAdapter(queryClient)
      return prepareOptimisticUpdate(queryClient, () => {
        const active = cache.get('active')
        if (!active) {
          return
        }
        cache.setTasks('active', applyReorderToTasks(active.tasks, variables))
      })
    },
    onError: (error, _variables, context) => {
      reportMutationError(error, 'reorder')
      if (context?.snapshot) {
        restoreTaskLists(
          createListCacheAdapter(queryClient).setTasks,
          context.snapshot
        )
      }
    },
    onSettled: () => invalidateAllTasks(queryClient)
  })
}
