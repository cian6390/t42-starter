import {
  conflictResponse,
  internalErrorResponse,
  notFoundResponse,
  requireApiSession
} from '@/lib/api-route'
import { logger } from '@/lib/logger'
import { trashTask } from '@/lib/tasks'

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
    const result = await trashTask(id)
    if (result === null) {
      return notFoundResponse()
    }
    if (result === 'already_trashed') {
      return conflictResponse('ALREADY_TRASHED', 'Task is already in trash', {
        taskId: id
      })
    }
    logger.info({ taskId: id, userId: auth.session.user.id }, 'task trashed')
    return Response.json(result)
  } catch (error) {
    return internalErrorResponse(error, { taskId: id }, 'Failed to trash task')
  }
}
