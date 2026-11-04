/**
 * Env-leak guard (docs/deployment.md "Secrets and transient local artifacts").
 *
 * Deploy-time secret scanners fail the build when a local environment value
 * appears in repo code or build output. This guard enforces the repo-side
 * half locally and in CI: every non-empty value from the local `.env*` files
 * must NOT appear in any git-tracked file, nor in any untracked-but-not-
 * ignored file (i.e. files about to be committed).
 *
 * Scope notes:
 * - Gitignored transients (`.next/`, `.netlify/`, `coverage/`, ...) are
 *   excluded on purpose: `NEXT_PUBLIC_*` values are inlined into build output
 *   BY DESIGN, and CLI caches embed env values by accident — those are
 *   handled by the ignore list + cleanup rule, not by this guard.
 * - Values shorter than 8 chars and values documented as placeholders in
 *   `.env.example` are skipped (booleans, empty templates).
 * - The report prints variable NAMES and file paths only — never values.
 */

import { execSync } from 'node:child_process'
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(new URL(import.meta.url))), '..', '..')

const MIN_VALUE_LENGTH = 8

/** Parse KEY=VALUE pairs from an env file body. */
function parseEnv(body) {
  const pairs = []
  for (const line of body.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const match = trimmed.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/)
    if (!match) continue
    const value = match[2].trim().replace(/^["']|["']$/g, '')
    if (value.length >= MIN_VALUE_LENGTH) pairs.push({ name: match[1], value })
  }
  return pairs
}

// Placeholder values documented in .env.example are allowed to appear in code.
const examplePath = join(root, '.env.example')
const allowedValues = new Set()
if (existsSync(examplePath)) {
  for (const pair of parseEnv(readFileSync(examplePath, 'utf8'))) allowedValues.add(pair.value)
}

// Local env files (gitignored): .env, .env.local, .env.*.local, etc.
const envFiles = readdirSync(root).filter(
  (name) => /^\.env(\.|$)/.test(name) && name !== '.env.example',
)
if (envFiles.length === 0) {
  console.log('Env-leak check skipped: no local .env files present (CI).')
  process.exit(0)
}

const candidates = []
for (const file of envFiles) {
  for (const pair of parseEnv(readFileSync(join(root, file), 'utf8'))) {
    if (!allowedValues.has(pair.value)) candidates.push(pair)
  }
}

if (candidates.length === 0) {
  console.log(`Env-leak check passed (${envFiles.join(', ')}: no non-placeholder values).`)
  process.exit(0)
}

// Tracked files + untracked-but-not-ignored files (would be committed).
const targets = [
  ...execSync('git ls-files', { cwd: root, encoding: 'utf8' }).split('\n').filter(Boolean),
  ...execSync('git ls-files --others --exclude-standard', { cwd: root, encoding: 'utf8' })
    .split('\n')
    .filter(Boolean),
]

// Index the target file contents once (they are small; skip binaries/large).
const corpus = []
for (const file of targets) {
  try {
    const content = readFileSync(join(root, file), 'utf8')
    corpus.push({ file, content })
  } catch {
    // unreadable/binary — skip
  }
}

const hits = []
for (const candidate of candidates) {
  for (const entry of corpus) {
    if (entry.content.includes(candidate.value)) {
      hits.push({ name: candidate.name, file: entry.file })
    }
  }
}

if (hits.length > 0) {
  console.error(`Env-leak violations (${hits.length}) — variable names appear in repo files:`)
  for (const hit of hits) console.error(`  ${hit.name}  in  ${hit.file}`)
  console.error(
    '\nRemove the value from the file (or move it to a gitignored local artifact). Values are never printed.',
  )
  process.exit(1)
}

console.log(
  `Env-leak check passed (${candidates.length} local env value(s) absent from ${targets.length} repo files).`,
)
