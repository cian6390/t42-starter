import { beforeEach, describe, expect, it } from 'vitest'
import {
  getClientServiceName,
  initClientReporting,
  reportClientError,
  resetClientReportingForTests
} from './index.js'

describe('initClientReporting', () => {
  beforeEach(() => {
    resetClientReportingForTests()
  })

  it('sets service name', () => {
    initClientReporting({ service: 'app' })
    expect(getClientServiceName()).toBe('app')
  })

  it('is idempotent', () => {
    initClientReporting({ service: 'first' })
    initClientReporting({ service: 'second' })
    expect(getClientServiceName()).toBe('first')
  })
})

describe('reportClientError', () => {
  beforeEach(() => {
    resetClientReportingForTests()
  })

  it('does not throw when reporting', () => {
    expect(() =>
      reportClientError(new Error('test'), { boundary: 'test' })
    ).not.toThrow()
  })

  it('forwards to reporter when configured', () => {
    const reported: Array<{
      error: unknown
      context?: Record<string, unknown>
    }> = []
    initClientReporting({
      service: 'app',
      reporter: (error, context) => {
        reported.push({ error, context })
      }
    })
    reportClientError(new Error('forwarded'), { boundary: 'test' })
    expect(reported).toHaveLength(1)
    expect(reported[0]?.context).toEqual({ boundary: 'test' })
  })
})
