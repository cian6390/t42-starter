import type { z } from 'zod'
import { getSession } from '@/lib/auth-server'
import { logger } from '@/lib/logger'

export function unauthorizedResponse() {
  return Response.json({ error: 'Unauthorized' }, { status: 401 })
}

export function notFoundResponse(message = 'Not found') {
  return Response.json({ error: message }, { status: 404 })
}

export function conflictResponse(
  code: string,
  message: string,
  context?: Record<string, unknown>
) {
  logger.warn({ code, ...context }, message)
  return Response.json({ error: message, code }, { status: 409 })
}

export function internalErrorResponse(
  err: unknown,
  context: Record<string, unknown>,
  message: string
) {
  logger.error({ err, ...context }, message)
  return Response.json({ error: 'Internal server error' }, { status: 500 })
}

export async function requireApiSession(): Promise<
  | {
      session: NonNullable<Awaited<ReturnType<typeof getSession>>>
      response?: undefined
    }
  | { session?: undefined; response: Response }
> {
  const session = await getSession()
  if (!session) {
    return { response: unauthorizedResponse() }
  }
  return { session }
}

export async function parseJsonBody<T extends z.ZodType>(
  request: Request,
  schema: T
): Promise<
  { success: true; data: z.infer<T> } | { success: false; response: Response }
> {
  const json = await request.json().catch(() => null)
  const parsed = schema.safeParse(json)
  if (!parsed.success) {
    return {
      success: false,
      response: Response.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      )
    }
  }
  return { success: true, data: parsed.data }
}
