import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const expected = readFileSync(join(root, '.nvmrc'), 'utf8').trim()
const current = process.versions.node

function matchesNvmrc(expectedVersion, currentVersion) {
  const expectedParts = expectedVersion.split('.')
  const currentParts = currentVersion.split('.')

  if (expectedParts.length === 1) {
    return currentParts[0] === expectedParts[0]
  }

  for (let i = 0; i < expectedParts.length; i += 1) {
    if (currentParts[i] !== expectedParts[i]) {
      return false
    }
  }

  return true
}

if (!matchesNvmrc(expected, current)) {
  console.error(
    `Node v${expected} required (see .nvmrc), got v${current}. Run: nvm use`,
  )
  process.exit(1)
}
