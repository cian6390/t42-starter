import {
  conflictResponse,
  internalErrorResponse,
  notFoundResponse,
  parseJsonBody,
  requireApiSession
} from '@/lib/api-route'
import { logger } from '@/lib/logger'
import { reorderTask } from '@/lib/tasks'
import { updateTaskPositionSchema } from '@/schemas/task'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireApiSession()
  if (auth.response) {
    return auth.response
  }

  const { id } = await context.params
  const body = await parseJsonBody(request, updateTaskPositionSchema)
  if (!body.success) {
    return body.response
  }

  try {
    const result = await reorderTask(id, body.data)
    if (result === null) {
      return notFoundResponse()
    }
    if (result === 'in_trash') {
      return conflictResponse('IN_TRASH', 'Task is in trash', { taskId: id })
    }
    if (result === 'not_active') {
      return conflictResponse('NOT_ACTIVE', 'Task is not on active board', {
        taskId: id
      })
    }
    logger.info(
      {
        taskId: id,
        userId: auth.session.user.id,
        status: body.data.status,
        position: body.data.position
      },
      'task reordered'
    )
    return Response.json(result)
  } catch (error) {
    return internalErrorResponse(
      error,
      { taskId: id },
      'Failed to reorder task'
    )
  }
}
