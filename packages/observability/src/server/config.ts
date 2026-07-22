export const DEFAULT_REDACT_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'authorization',
  'cookie',
  '*.password',
  '*.token',
  '*.secret',
  'DATABASE_URL',
  'BETTER_AUTH_SECRET'
] as const

export function resolveLogLevel(): string {
  if (process.env.LOG_LEVEL) {
    return process.env.LOG_LEVEL
  }

  return process.env.NODE_ENV === 'production' ? 'info' : 'debug'
}

export function resolveService(explicit?: string): string {
  return explicit ?? process.env.LOG_APP_NAME ?? 'unknown'
}

export function shouldUsePrettyLogs(): boolean {
  return (
    process.env.LOG_PRETTY === 'true' && process.env.NODE_ENV !== 'production'
  )
}
