import { afterEach, describe, expect, it } from 'vitest'
import { getLogger, withLogContext } from './context.js'
import { resetRootLoggerForTests } from './logger.js'
import { logger } from './proxy.js'

describe('logger proxy', () => {
  afterEach(() => {
    resetRootLoggerForTests()
  })

  it('delegates to getLogger with current ALS context', () => {
    withLogContext({ requestId: 'req-proxy' }, () => {
      expect(getLogger().bindings()).toMatchObject({ requestId: 'req-proxy' })
      expect(() => logger.info('via proxy')).not.toThrow()
    })
  })

  it('does not freeze context at import time', () => {
    expect(getLogger().bindings()).not.toHaveProperty('requestId')

    withLogContext({ requestId: 'req-later' }, () => {
      expect(getLogger().bindings()).toMatchObject({ requestId: 'req-later' })
      logger.info('inside context')
    })

    expect(getLogger().bindings()).not.toHaveProperty('requestId')
  })
})
