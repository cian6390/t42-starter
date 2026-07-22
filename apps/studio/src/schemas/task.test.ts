import { describe, expect, it } from 'vitest'
import { taskListResponseSchema } from './task'

describe('taskListResponseSchema', () => {
  it('requires tasks and counts', () => {
    const result = taskListResponseSchema.safeParse({
      tasks: [],
      counts: { active: 0, archived: 0, trash: 0 }
    })
    expect(result.success).toBe(true)
  })

  it('rejects responses without counts', () => {
    const result = taskListResponseSchema.safeParse({ tasks: [] })
    expect(result.success).toBe(false)
  })
})
