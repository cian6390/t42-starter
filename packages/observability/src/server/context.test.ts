import { afterEach, describe, expect, it } from 'vitest'
import { getLogContext, getLogger, withLogContext } from './context.js'
import { resetRootLoggerForTests } from './logger.js'

describe('withLogContext', () => {
  afterEach(() => {
    resetRootLoggerForTests()
  })

  it('stores context for nested calls', () => {
    withLogContext({ requestId: 'req-1' }, () => {
      expect(getLogContext()).toEqual({ requestId: 'req-1' })

      withLogContext({ userId: 'user-1' }, () => {
        expect(getLogContext()).toEqual({
          requestId: 'req-1',
          userId: 'user-1'
        })
      })
    })

    expect(getLogContext()).toBeUndefined()
  })

  it('returns child logger bindings from context', () => {
    withLogContext({ requestId: 'req-2' }, () => {
      const logger = getLogger()
      expect(logger.bindings()).toMatchObject({ requestId: 'req-2' })
    })
  })
})
