import { readdirSync, rmSync } from 'node:fs'
import { dirname, join, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const SKIP_DIRS = new Set(['.git', '.vscode', '.cursor', '.claude', '.github'])

/** Directory basenames removed wherever they appear under the repo root. */
const REMOVE_DIR_NAMES = new Set([
  'node_modules',
  'dist',
  '.next',
  '.turbo',
  '.expo',
  '.trigger',
  'coverage',
  'test-results',
  'playwright-report',
  '.pnpm-store',
])

function shouldRemoveFile(name) {
  return name.endsWith('.tsbuildinfo')
}

function shouldRemovePlaywrightCache(parentDir, name) {
  return name === '.cache' && parentDir.split(sep).at(-1) === 'playwright'
}

function collectPaths(dir, queue = []) {
  let entries
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch {
    return queue
  }

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)

    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) {
        continue
      }

      if (
        REMOVE_DIR_NAMES.has(entry.name) ||
        shouldRemovePlaywrightCache(dir, entry.name)
      ) {
        queue.push(fullPath)
        continue
      }

      collectPaths(fullPath, queue)
    } else if (entry.isFile() && shouldRemoveFile(entry.name)) {
      queue.push(fullPath)
    }
  }

  return queue
}

const paths = collectPaths(root).sort()

if (paths.length === 0) {
  console.log('Nothing to clean.')
  process.exit(0)
}

console.log(`Removing ${paths.length} path(s)...`)

for (const fullPath of paths) {
  const rel = fullPath.startsWith(root)
    ? fullPath.slice(root.length + 1)
    : fullPath
  rmSync(fullPath, { recursive: true, force: true })
  console.log(`  removed ${rel}`)
}

console.log('Done.')
