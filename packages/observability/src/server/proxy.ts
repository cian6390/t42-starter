import { getLogger } from './context.js'
import type { Logger } from './logger.js'

type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'

function delegate(level: LogLevel): Logger[LogLevel] {
  const fn = (...args: Parameters<Logger[LogLevel]>) => {
    const instance = getLogger()
    return (
      instance[level] as (...args: Parameters<Logger[LogLevel]>) => void
    ).call(instance, ...args)
  }
  return fn as Logger[LogLevel]
}

/**
 * App-wide logger proxy. Each call delegates to `getLogger()` so request
 * context from AsyncLocalStorage is always current. Prefer this over
 * `const logger = getLogger()` at module scope.
 */
export const logger: Pick<Logger, LogLevel> = {
  trace: delegate('trace'),
  debug: delegate('debug'),
  info: delegate('info'),
  warn: delegate('warn'),
  error: delegate('error'),
  fatal: delegate('fatal')
}
