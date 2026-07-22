import { z } from 'zod'

export const kanbanTaskStatusSchema = z.enum(['backlog', 'in_progress', 'done'])

export const taskStatusSchema = z.enum([
  'backlog',
  'in_progress',
  'done',
  'archived'
])

export const taskViewSchema = z.enum(['active', 'archived', 'trash'])

export const taskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(5000).nullable(),
  status: taskStatusSchema,
  position: z.number().int(),
  createdByUserId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable()
})

export const taskViewCountsSchema = z.object({
  active: z.number().int().min(0),
  archived: z.number().int().min(0),
  trash: z.number().int().min(0)
})

export const taskListResponseSchema = z.object({
  tasks: z.array(taskSchema),
  counts: taskViewCountsSchema
})

export const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().max(5000).optional(),
  status: kanbanTaskStatusSchema.optional()
})

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().max(5000).optional()
  })
  .refine(
    (data) => data.title !== undefined || data.description !== undefined,
    {
      message: 'At least one field is required'
    }
  )

export const updateTaskStatusSchema = z.object({
  status: taskStatusSchema
})

export const updateTaskPositionSchema = z.object({
  status: kanbanTaskStatusSchema,
  position: z.number().int().min(0)
})

export const taskListQuerySchema = z.object({
  status: kanbanTaskStatusSchema.optional(),
  view: taskViewSchema.optional()
})

export type Task = z.infer<typeof taskSchema>
export type KanbanTaskStatus = z.infer<typeof kanbanTaskStatusSchema>
export type TaskView = z.infer<typeof taskViewSchema>
export type TaskViewCounts = z.infer<typeof taskViewCountsSchema>
export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>
export type UpdateTaskPositionInput = z.infer<typeof updateTaskPositionSchema>
