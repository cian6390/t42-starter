import { AsyncLocalStorage } from 'node:async_hooks'
import { getRootLogger, type Logger } from './logger.js'

export type LogContext = Record<string, unknown>

const storage = new AsyncLocalStorage<LogContext>()

export function withLogContext<T>(context: LogContext, fn: () => T): T {
  const parent = storage.getStore()
  const merged = parent ? { ...parent, ...context } : context
  return storage.run(merged, fn)
}

export function getLogContext(): LogContext | undefined {
  return storage.getStore()
}

export function getLogger(): Logger {
  const root = getRootLogger()
  const context = storage.getStore()

  return context ? root.child(context) : root
}
