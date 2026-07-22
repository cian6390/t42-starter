import { healthResponseSchema } from '@t42/validators'

export async function GET() {
  const response = healthResponseSchema.parse({
    status: 'ok',
    timestamp: new Date().toISOString()
  })
  return Response.json(response)
}
