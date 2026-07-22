import pino, { type Logger, type LoggerOptions } from 'pino'
import {
  DEFAULT_REDACT_PATHS,
  resolveLogLevel,
  resolveService,
  shouldUsePrettyLogs
} from './config.js'

export type CreateRootLoggerOptions = {
  service?: string
  level?: string
}

function buildLoggerOptions(
  options: CreateRootLoggerOptions = {}
): LoggerOptions {
  return {
    level: options.level ?? resolveLogLevel(),
    base: {
      service: resolveService(options.service),
      env: process.env.NODE_ENV ?? 'development'
    },
    redact: {
      paths: [...DEFAULT_REDACT_PATHS],
      censor: '[Redacted]'
    }
  }
}

export function createLogger(options: CreateRootLoggerOptions = {}): Logger {
  const loggerOptions = buildLoggerOptions(options)

  if (shouldUsePrettyLogs()) {
    return pino({
      ...loggerOptions,
      transport: {
        target: 'pino-pretty',
        options: { colorize: true }
      }
    })
  }

  return pino(loggerOptions)
}

let rootLogger: Logger | undefined

export function createRootLogger(
  options: CreateRootLoggerOptions = {}
): Logger {
  if (!rootLogger) {
    rootLogger = createLogger(options)
  }

  return rootLogger
}

export function getRootLogger(): Logger {
  return rootLogger ?? createRootLogger()
}

/** @internal Test helper */
export function resetRootLoggerForTests(): void {
  rootLogger = undefined
}

export type { Logger }
