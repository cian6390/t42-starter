import { describe, expect, it } from 'vitest'
import { signInSchema, signUpSchema } from './auth'

describe('signInSchema', () => {
  it('accepts valid credentials', () => {
    const result = signInSchema.safeParse({
      email: 'user@example.com',
      password: 'secret'
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const result = signInSchema.safeParse({
      email: 'not-an-email',
      password: 'secret'
    })
    expect(result.success).toBe(false)
  })
})

describe('signUpSchema', () => {
  it('rejects short passwords', () => {
    const result = signUpSchema.safeParse({
      name: 'Cian',
      email: 'user@example.com',
      password: 'short'
    })
    expect(result.success).toBe(false)
  })
})
