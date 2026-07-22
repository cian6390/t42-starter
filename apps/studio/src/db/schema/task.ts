import { user } from '@t42/db/schema'
import {
  index,
  integer,
  pgSchema,
  text,
  timestamp,
  uuid
} from 'drizzle-orm/pg-core'

export const studioSchema = pgSchema('studio')

export const taskStatuses = [
  'backlog',
  'in_progress',
  'done',
  'archived'
] as const
export type TaskStatus = (typeof taskStatuses)[number]

export const activeTaskStatuses = ['backlog', 'in_progress', 'done'] as const
export type ActiveTaskStatus = (typeof activeTaskStatuses)[number]

export const task = studioSchema.table(
  'task',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: text('title').notNull(),
    description: text('description'),
    status: text('status').$type<TaskStatus>().notNull().default('backlog'),
    position: integer('position').notNull().default(0),
    createdByUserId: text('created_by_user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    deletedAt: timestamp('deleted_at')
  },
  (table) => [
    index('task_status_position_idx').on(table.status, table.position),
    index('task_deleted_at_idx').on(table.deletedAt)
  ]
)
