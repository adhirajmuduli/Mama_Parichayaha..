/**
 * Frame-allocation guard (new_plan.md §11.2).
 *
 * Statically scans the tick-path modules for allocation patterns inside
 * `subscribeTick(...)` callback bodies and the scheduler's internal loop:
 * object construction (`new X`), spreads, and the common allocating calls.
 * Style-string writes (transform/opacity) are explicitly allowed — they are
 * the sanctioned way to move DOM.
 *
 * This is a best-effort heuristic guard for review automation, not a
 * proving tool: the unit suites pin the behavioral side (frame counters,
 * player cadence). Per-line suppression: append
 * `// tick-alloc-ok: <reason>` to a flagged line.
 *
 * The lanyard island runs its own self-parking rAF (documented §11.1
 * exception) and is intentionally out of scope.
 */

import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDirectory = join(dirname(fileURLToPath(new URL(import.meta.url))), '..', '..')

/** Modules whose subscribeTick callbacks are hot-path by design. */
const TICK_PATH_MODULES = [
  'src/runtime/scheduler.ts',
  'src/exhibits/AsciiFramePlayer.tsx',
  'src/ui/fx/ProjectSpiral.tsx',
]

/** The scheduler's internal loop function. */
const SCHEDULER_LOOP_NAME = 'function tick('

const ALLOCATION_PATTERNS = [
  { pattern: /\bnew\s+[A-Z]/, label: 'object construction' },
  { pattern: /\.\.\.\w/, label: 'spread operator' },
  { pattern: /\bArray\.from\s*\(/, label: 'Array.from' },
  { pattern: /\bObject\.assign\s*\(/, label: 'Object.assign' },
  { pattern: /\.map\s*\(/, label: '.map()' },
  { pattern: /\.filter\s*\(/, label: '.filter()' },
  { pattern: /\.concat\s*\(/, label: '.concat()' },
  { pattern: /\bJSON\.(parse|stringify)\s*\(/, label: 'JSON round-trip' },
]

const ALLOW_MARKER = 'tick-alloc-ok:'

/** Extracts the balanced-brace body starting at the first '{' from index. */
function extractBraceBody(source, openIndex) {
  let depth = 0
  let insideString = false
  let stringChar = ''
  let escaped = false

  for (let index = openIndex; index < source.length; index += 1) {
    const char = source[index]

    if (escaped) {
      escaped = false
      continue
    }

    if (char === '\\') {
      escaped = true
      continue
    }

    if (insideString) {
      if (char === stringChar) insideString = false
      continue
    }

    if (char === '"' || char === "'" || char === '`') {
      insideString = true
      stringChar = char
      continue
    }

    if (char === '{') depth += 1
    else if (char === '}') {
      depth -= 1
      if (depth === 0) return source.slice(openIndex, index + 1)
    }
  }

  return null
}

function lineOf(source, index) {
  return source.slice(0, index).split('\n').length
}

async function auditTickCallbacks(path, source) {
  const violations = []
  const needle = 'subscribeTick('
  let searchFrom = 0

  for (;;) {
    const start = source.indexOf(needle, searchFrom)
    if (start === -1) break

    const openBrace = source.indexOf('{', start)
    if (openBrace === -1) break

    const body = extractBraceBody(source, openBrace)
    if (!body) break

    const bodyStartLine = lineOf(source, openBrace)
    const lines = body.split('\n')

    lines.forEach((line, offset) => {
      const trimmed = line.trim()

      if (trimmed.startsWith('//')) return
      if (trimmed.includes(ALLOW_MARKER)) return

      for (const { pattern, label } of ALLOCATION_PATTERNS) {
        if (pattern.test(line)) {
          violations.push({
            path,
            line: bodyStartLine + offset,
            label,
            excerpt: trimmed.slice(0, 96),
          })
        }
      }
    })

    searchFrom = openBrace + body.length
  }

  return violations
}

async function auditSchedulerLoop(path, source) {
  const violations = []
  const start = source.indexOf(SCHEDULER_LOOP_NAME)

  if (start === -1) return violations

  const openBrace = source.indexOf('{', start)
  const body = openBrace === -1 ? null : extractBraceBody(source, openBrace)
  if (!body) return violations

  const bodyStartLine = lineOf(source, openBrace)
  const lines = body.split('\n')

  lines.forEach((line, offset) => {
    const trimmed = line.trim()

    if (trimmed.startsWith('//')) return
    if (trimmed.includes(ALLOW_MARKER)) return

    for (const { pattern, label } of ALLOCATION_PATTERNS) {
      if (pattern.test(line)) {
        violations.push({
          path,
          line: bodyStartLine + offset,
          label,
          excerpt: trimmed.slice(0, 96),
        })
      }
    }
  })

  return violations
}

const allViolations = []

for (const relativePath of TICK_PATH_MODULES) {
  const source = await readFile(join(rootDirectory, relativePath), 'utf8')

  allViolations.push(...(await auditTickCallbacks(relativePath, source)))

  if (relativePath === 'src/runtime/scheduler.ts') {
    allViolations.push(...(await auditSchedulerLoop(relativePath, source)))
  }
}

if (allViolations.length > 0) {
  console.error(`Frame-allocation violations (${allViolations.length}):\n`)

  for (const violation of allViolations) {
    console.error(`  ${violation.path}:${violation.line}  ${violation.label}`)
    console.error(`    ${violation.excerpt}`)
  }

  process.exitCode = 1
} else {
  console.log(`Frame-allocation check passed (${TICK_PATH_MODULES.length} tick-path modules audited).`)
}
