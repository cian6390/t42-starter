import {
  internalErrorResponse,
  parseJsonBody,
  requireApiSession
} from '@/lib/api-route'
import { logger } from '@/lib/logger'
import { createTask, getTaskViewCounts, listTasks } from '@/lib/tasks'
import {
  createTaskSchema,
  taskListQuerySchema,
  taskListResponseSchema
} from '@/schemas/task'

export async function GET(request: Request) {
  const auth = await requireApiSession()
  if (auth.response) {
    return auth.response
  }

  const url = new URL(request.url)
  const parsed = taskListQuerySchema.safeParse({
    status: url.searchParams.get('status') ?? undefined,
    view: url.searchParams.get('view') ?? undefined
  })

  if (!parsed.success) {
    return Response.json({ error: 'Invalid query' }, { status: 400 })
  }

  try {
    const [tasks, counts] = await Promise.all([
      listTasks(parsed.data),
      getTaskViewCounts()
    ])
    const body = taskListResponseSchema.parse({ tasks, counts })
    return Response.json(body)
  } catch (error) {
    return internalErrorResponse(error, {}, 'Failed to list tasks')
  }
}

export async function POST(request: Request) {
  const auth = await requireApiSession()
  if (auth.response) {
    return auth.response
  }

  const body = await parseJsonBody(request, createTaskSchema)
  if (!body.success) {
    return body.response
  }

  try {
    const task = await createTask({
      title: body.data.title,
      description: body.data.description,
      status: body.data.status ?? 'backlog',
      createdByUserId: auth.session.user.id
    })
    logger.info(
      { taskId: task.id, userId: auth.session.user.id, status: task.status },
      'task created'
    )
    return Response.json(task, { status: 201 })
  } catch (error) {
    return internalErrorResponse(
      error,
      { userId: auth.session.user.id },
      'Failed to create task'
    )
  }
}
