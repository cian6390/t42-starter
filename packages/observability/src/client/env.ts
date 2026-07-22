/**
 * Detect dev environment across Next.js (process.env.NODE_ENV) and Expo/RN (__DEV__).
 */
export function isDevEnvironment(): boolean {
  if (typeof globalThis !== 'undefined') {
    const globalWithDev = globalThis as typeof globalThis & {
      __DEV__?: boolean
    }
    if (typeof globalWithDev.__DEV__ === 'boolean') {
      return globalWithDev.__DEV__
    }
  }

  if (typeof process !== 'undefined' && process.env.NODE_ENV) {
    return process.env.NODE_ENV === 'development'
  }

  return false
}
