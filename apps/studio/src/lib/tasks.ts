import { and, asc, count, eq, inArray, isNotNull, isNull } from 'drizzle-orm'
import { db } from '@/db/client'
import type { ActiveTaskStatus, TaskStatus } from '@/db/schema'
import { activeTaskStatuses, task } from '@/db/schema'
import { insertAtPosition } from '@/lib/task-reorder'
import type { Task, TaskView, TaskViewCounts } from '@/schemas/task'

export function toTaskDto(row: typeof task.$inferSelect): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    position: row.position,
    createdByUserId: row.createdByUserId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    deletedAt: row.deletedAt?.toISOString() ?? null
  }
}

const activeStatusOrder: Record<ActiveTaskStatus, number> = {
  backlog: 0,
  in_progress: 1,
  done: 2
}

function sortActiveTasks(rows: (typeof task.$inferSelect)[]) {
  return [...rows].sort((a, b) => {
    const statusDiff =
      activeStatusOrder[a.status as ActiveTaskStatus] -
      activeStatusOrder[b.status as ActiveTaskStatus]
    if (statusDiff !== 0) {
      return statusDiff
    }
    return a.position - b.position
  })
}

export async function getTaskViewCounts(): Promise<TaskViewCounts> {
  const [activeRow, archivedRow, trashRow] = await Promise.all([
    db
      .select({ count: count() })
      .from(task)
      .where(
        and(
          isNull(task.deletedAt),
          inArray(task.status, [...activeTaskStatuses])
        )
      ),
    db
      .select({ count: count() })
      .from(task)
      .where(and(isNull(task.deletedAt), eq(task.status, 'archived'))),
    db.select({ count: count() }).from(task).where(isNotNull(task.deletedAt))
  ])

  return {
    active: Number(activeRow[0]?.count ?? 0),
    archived: Number(archivedRow[0]?.count ?? 0),
    trash: Number(trashRow[0]?.count ?? 0)
  }
}

export async function listTasks(options?: {
  view?: TaskView
  status?: ActiveTaskStatus
}) {
  const view = options?.view ?? 'active'

  if (view === 'trash') {
    const rows = await db.query.task.findMany({
      where: isNotNull(task.deletedAt),
      orderBy: (fields, { desc: descFn }) => [descFn(fields.deletedAt)]
    })
    return rows.map(toTaskDto)
  }

  if (view === 'archived') {
    const rows = await db.query.task.findMany({
      where: and(isNull(task.deletedAt), eq(task.status, 'archived')),
      orderBy: (fields, { desc: descFn }) => [descFn(fields.updatedAt)]
    })
    return rows.map(toTaskDto)
  }

  const activeWhere = and(
    isNull(task.deletedAt),
    inArray(task.status, [...activeTaskStatuses]),
    options?.status ? eq(task.status, options.status) : undefined
  )

  const rows = await db.query.task.findMany({
    where: activeWhere,
    orderBy: (fields, { asc: ascFn }) => [
      ascFn(fields.status),
      ascFn(fields.position)
    ]
  })

  return sortActiveTasks(rows).map(toTaskDto)
}

export async function getTaskRow(id: string) {
  return db.query.task.findFirst({ where: eq(task.id, id) })
}

export async function getNextPosition(status: TaskStatus) {
  const rows = await db.query.task.findMany({
    where: and(eq(task.status, status), isNull(task.deletedAt)),
    orderBy: (fields, { desc: descFn }) => [descFn(fields.position)],
    limit: 1
  })
  return rows[0] ? rows[0].position + 1 : 0
}

export async function createTask(input: {
  title: string
  description?: string
  status: ActiveTaskStatus
  createdByUserId: string
}) {
  const position = await getNextPosition(input.status)
  const [row] = await db
    .insert(task)
    .values({
      title: input.title,
      description: input.description ?? null,
      status: input.status,
      position,
      createdByUserId: input.createdByUserId
    })
    .returning()
  if (!row) {
    throw new Error('Failed to create task')
  }
  return toTaskDto(row)
}

export async function updateTask(
  id: string,
  input: { title?: string; description?: string }
) {
  const existing = await getTaskRow(id)
  if (!existing) {
    return null
  }
  if (existing.deletedAt) {
    return 'in_trash' as const
  }

  const [row] = await db
    .update(task)
    .set({
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined
        ? { description: input.description }
        : {}),
      updatedAt: new Date()
    })
    .where(eq(task.id, id))
    .returning()
  return row ? toTaskDto(row) : null
}

export async function moveTask(id: string, status: TaskStatus) {
  const existing = await getTaskRow(id)
  if (!existing) {
    return null
  }
  if (existing.deletedAt) {
    return 'in_trash' as const
  }

  const position = await getNextPosition(status)
  const [row] = await db
    .update(task)
    .set({ status, position, updatedAt: new Date() })
    .where(eq(task.id, id))
    .returning()
  return row ? toTaskDto(row) : null
}

export async function trashTask(id: string) {
  const existing = await getTaskRow(id)
  if (!existing) {
    return null
  }
  if (existing.deletedAt) {
    return 'already_trashed' as const
  }

  const now = new Date()
  const [row] = await db
    .update(task)
    .set({ deletedAt: now, updatedAt: now })
    .where(eq(task.id, id))
    .returning()
  return row ? toTaskDto(row) : null
}

export async function restoreTask(id: string) {
  const existing = await getTaskRow(id)
  if (!existing) {
    return null
  }
  if (!existing.deletedAt) {
    return 'not_in_trash' as const
  }

  const [row] = await db
    .update(task)
    .set({ deletedAt: null, updatedAt: new Date() })
    .where(eq(task.id, id))
    .returning()
  return row ? toTaskDto(row) : null
}

export async function permanentDeleteTask(id: string) {
  const existing = await getTaskRow(id)
  if (!existing) {
    return null
  }
  if (!existing.deletedAt) {
    return 'not_in_trash' as const
  }

  const [row] = await db.delete(task).where(eq(task.id, id)).returning()
  return row ? toTaskDto(row) : null
}

async function listActiveColumnTasks(status: ActiveTaskStatus) {
  return db.query.task.findMany({
    where: and(
      eq(task.status, status),
      isNull(task.deletedAt),
      inArray(task.status, [...activeTaskStatuses])
    ),
    orderBy: [asc(task.position)]
  })
}

export async function reorderTask(
  id: string,
  input: { status: ActiveTaskStatus; position: number }
) {
  const existing = await getTaskRow(id)
  if (!existing) {
    return null
  }
  if (existing.deletedAt) {
    return 'in_trash' as const
  }
  if (
    existing.status === 'archived' ||
    !activeTaskStatuses.includes(existing.status as ActiveTaskStatus)
  ) {
    return 'not_active' as const
  }

  const sourceStatus = existing.status as ActiveTaskStatus
  const targetStatus = input.status

  const targetRows = await listActiveColumnTasks(targetStatus)
  const targetWithout = insertAtPosition(targetRows, id, input.position)

  const now = new Date()

  return db.transaction(async (tx) => {
    for (let index = 0; index < targetWithout.length; index++) {
      const row = targetWithout[index]
      if (!row) {
        continue
      }
      await tx
        .update(task)
        .set({
          status: targetStatus,
          position: index,
          updatedAt: now
        })
        .where(eq(task.id, row.id))
    }

    if (sourceStatus !== targetStatus) {
      const sourceRows = await tx.query.task.findMany({
        where: and(eq(task.status, sourceStatus), isNull(task.deletedAt)),
        orderBy: [asc(task.position)]
      })
      const sourceWithout = sourceRows.filter((row) => row.id !== id)
      for (let index = 0; index < sourceWithout.length; index++) {
        const row = sourceWithout[index]
        if (!row) {
          continue
        }
        await tx
          .update(task)
          .set({ position: index, updatedAt: now })
          .where(eq(task.id, row.id))
      }
    }

    const updated = await tx.query.task.findFirst({
      where: eq(task.id, id)
    })
    return updated ? toTaskDto(updated) : null
  })
}
