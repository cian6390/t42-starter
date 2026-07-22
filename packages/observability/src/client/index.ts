import { isDevEnvironment } from './env.js'

export type ClientErrorReporter = (
  error: unknown,
  context?: Record<string, unknown>
) => void

export type ClientReportingOptions = {
  /** App slug — should match server `LOG_APP_NAME` / `NEXT_PUBLIC_LOG_APP_NAME` */
  service?: string
  /** Vendor DSN — passed through to app-specific SDK init (e.g. Sentry) */
  dsn?: string
  /** Production error capture — wired by each app (Sentry, Better Stack, etc.) */
  reporter?: ClientErrorReporter
}

let serviceName = 'unknown'
let errorReporter: ClientErrorReporter | null = null
let initialized = false

/** @internal Test helper */
export function resetClientReportingForTests(): void {
  serviceName = 'unknown'
  errorReporter = null
  initialized = false
}

/**
 * Initialize client-side error reporting.
 * v1: records service name; production SDK wiring lands when a vendor is chosen.
 * Call once at app root (e.g. web `Providers`, Expo root layout).
 */
export function initClientReporting(
  options: ClientReportingOptions = {}
): void {
  if (initialized) return
  initialized = true
  serviceName = options.service ?? 'unknown'
  if (options.reporter) {
    errorReporter = options.reporter
  }
}

export function getClientServiceName(): string {
  return serviceName
}

/**
 * Report a client-side error (React error boundary, unhandled rejection, etc.).
 * v1: logs to console in development only; production capture deferred to error SDK.
 */
export function reportClientError(
  error: unknown,
  context?: Record<string, unknown>
): void {
  if (!initialized) {
    initClientReporting({ service: serviceName })
  }

  if (isDevEnvironment()) {
    console.error(`[${serviceName}]`, error, context ?? {})
  }

  errorReporter?.(error, context)
}
