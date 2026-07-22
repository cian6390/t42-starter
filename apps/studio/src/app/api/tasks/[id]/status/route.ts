import {
  conflictResponse,
  internalErrorResponse,
  notFoundResponse,
  parseJsonBody,
  requireApiSession
} from '@/lib/api-route'
import { logger } from '@/lib/logger'
import { moveTask } from '@/lib/tasks'
import { updateTaskStatusSchema } from '@/schemas/task'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireApiSession()
  if (auth.response) {
    return auth.response
  }

  const { id } = await context.params
  const body = await parseJsonBody(request, updateTaskStatusSchema)
  if (!body.success) {
    return body.response
  }

  try {
    const result = await moveTask(id, body.data.status)
    if (result === null) {
      return notFoundResponse()
    }
    if (result === 'in_trash') {
      return conflictResponse('IN_TRASH', 'Task is in trash', { taskId: id })
    }
    logger.info(
      {
        taskId: id,
        userId: auth.session.user.id,
        status: body.data.status
      },
      'task status updated'
    )
    return Response.json(result)
  } catch (error) {
    return internalErrorResponse(error, { taskId: id }, 'Failed to move task')
  }
}
