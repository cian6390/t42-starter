import {
  conflictResponse,
  internalErrorResponse,
  notFoundResponse,
  parseJsonBody,
  requireApiSession
} from '@/lib/api-route'
import { logger } from '@/lib/logger'
import { permanentDeleteTask, updateTask } from '@/lib/tasks'
import { updateTaskSchema } from '@/schemas/task'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireApiSession()
  if (auth.response) {
    return auth.response
  }

  const { id } = await context.params
  const body = await parseJsonBody(request, updateTaskSchema)
  if (!body.success) {
    return body.response
  }

  try {
    const result = await updateTask(id, body.data)
    if (result === null) {
      return notFoundResponse()
    }
    if (result === 'in_trash') {
      return conflictResponse('IN_TRASH', 'Task is in trash', { taskId: id })
    }
    logger.info({ taskId: id, userId: auth.session.user.id }, 'task updated')
    return Response.json(result)
  } catch (error) {
    return internalErrorResponse(error, { taskId: id }, 'Failed to update task')
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireApiSession()
  if (auth.response) {
    return auth.response
  }

  const { id } = await context.params

  try {
    const result = await permanentDeleteTask(id)
    if (result === null) {
      return notFoundResponse()
    }
    if (result === 'not_in_trash') {
      return conflictResponse('NOT_IN_TRASH', 'Task is not in trash', {
        taskId: id
      })
    }
    logger.info(
      { taskId: id, userId: auth.session.user.id },
      'task permanently deleted'
    )
    return new Response(null, { status: 204 })
  } catch (error) {
    return internalErrorResponse(error, { taskId: id }, 'Failed to delete task')
  }
}
