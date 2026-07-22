export {
  DEFAULT_REDACT_PATHS,
  resolveLogLevel,
  resolveService,
  shouldUsePrettyLogs
} from './config.js'
export {
  getLogContext,
  getLogger,
  type LogContext,
  withLogContext
} from './context.js'
export {
  type CreateRootLoggerOptions,
  createLogger,
  createRootLogger,
  getRootLogger,
  type Logger,
  resetRootLoggerForTests
} from './logger.js'
export { logger } from './proxy.js'
