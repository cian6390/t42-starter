import {
  conflictResponse,
  internalErrorResponse,
  notFoundResponse,
  requireApiSession
} from '@/lib/api-route'
import { logger } from '@/lib/logger'
import { restoreTask } from '@/lib/tasks'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function PATCH(_request: Request, context: RouteContext) {
  const auth = await requireApiSession()
  if (auth.response) {
    return auth.response
  }

  const { id } = await context.params

  try {
    const result = await restoreTask(id)
    if (result === null) {
      return notFoundResponse()
    }
    if (result === 'not_in_trash') {
      return conflictResponse('NOT_IN_TRASH', 'Task is not in trash', {
        taskId: id
      })
    }
    logger.info({ taskId: id, userId: auth.session.user.id }, 'task restored')
    return Response.json(result)
  } catch (error) {
    return internalErrorResponse(
      error,
      { taskId: id },
      'Failed to restore task'
    )
  }
}
