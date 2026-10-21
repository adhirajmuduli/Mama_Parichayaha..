/**
 * Layer-boundary enforcement for the rewrite (new_plan.md §4.1, §7, R11).
 *
 * Zero-dependency static import-graph checks over every .ts and .tsx file under src.
 *
 * Two rule families:
 *
 * 1. LEGACY rules (ported from scripts/check-server-client-boundaries.mjs) keep
 *    guarding the retired tree (content/, components/narrative, components/sections)
 *    until the P6 deletion wave removes it.
 *
 * 2. NEW-TREE rules encode the target layer matrix for src/{config,journey,content,
 *    runtime,exhibits,ui}. They apply the moment those directories gain files:
 *      - journey/       → pure: no react/motion/zustand/three/DOM libs, no content
 *      - content/schemas|validate|check|data → server-side only; never imported
 *        by runtime/ui/exhibits/journey
 *      - runtime/       → may not import ui/exhibits or any 3D stack
 *      - exhibits/      → no three; no content internals beyond projection types
 *      - ui/            → no three EXCEPT ui/fx/lanyard (the sanctioned island);
 *                         never @react-three/* or postprocessing
 *      - 'use client'   → forbidden in journey/ and content/projection.ts
 *
 * Violations print as `file:line specifier → rule` and exit 1.
 */

import { readdir, readFile } from 'node:fs/promises'
import { dirname, join, posix, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDirectory = resolve(dirname(fileURLToPath(new URL(import.meta.url))), '..', '..')
const sourceRoot = resolve(rootDirectory, 'src')

const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx'])

/** Package specifiers that constitute the 3D stack. */
const THREE_CORE = /^three(\/|$)/
const REACT_THREE = /^@react-three\//
const POSTPROCESSING = /^postprocessing(\/|$)/
const REACTIVE = /^react(-dom)?$|^motion(\/|$)|^zustand(\/|$)/

const IMPORT_PATTERN =
  /(?:^|\n)\s*(?:import\s[\s\S]*?from|export\s[\s\S]*?from|import)\s*['"]([^'"]+)['"]/g

async function listSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name)
      if (entry.isDirectory()) {
        if (entry.name.startsWith('.') || entry.name === '__tests__') return []
        return listSourceFiles(path)
      }
      const extension = path.slice(path.lastIndexOf('.'))
      return SOURCE_EXTENSIONS.has(extension) ? [path] : []
    }),
  )
  return files.flat()
}

function toRepositoryPath(absolutePath) {
  return absolutePath
    .slice(rootDirectory.length + 1)
    .split(sep)
    .join(posix.sep)
}

function isWithin(repositoryPath, directory) {
  return repositoryPath === directory || repositoryPath.startsWith(`${directory}/`)
}

function resolveSpecifier(specifier, fromRepositoryPath) {
  if (specifier.startsWith('@/')) return `src/${specifier.slice(2)}`
  if (specifier.startsWith('./') || specifier.startsWith('../')) {
    const base = posix.dirname(fromRepositoryPath)
    const segments = []
    for (const part of posix.normalize(posix.join(base, specifier)).split('/')) {
      if (part === '..') segments.pop()
      else if (part !== '.' && part !== '') segments.push(part)
    }
    return segments.join('/')
  }
  return null // bare package specifier
}

function extractImports(source) {
  const specifiers = new Set()
  let match
  IMPORT_PATTERN.lastIndex = 0
  while ((match = IMPORT_PATTERN.exec(source))) specifiers.add(match[1])
  return specifiers
}

const violations = []

function addViolation(repositoryPath, line, specifier, rule) {
  violations.push(`${repositoryPath}:${line}  →  ${rule}  (imported '${specifier}')`)
}

function findLine(source, specifier) {
  const index = source.indexOf(specifier)
  if (index === -1) return 0
  return source.slice(0, index).split('\n').length
}

async function auditFile(absolutePath) {
  const repositoryPath = toRepositoryPath(absolutePath)
  const source = await readFile(absolutePath, 'utf8')
  const isClientModule = /^\s*['"]use client['"]/m.test(source)

  for (const specifier of extractImports(source)) {
    const line = findLine(source, specifier)
    const target = resolveSpecifier(specifier, repositoryPath)

    const isThreeCore = THREE_CORE.test(specifier)
    const isReactThree = REACT_THREE.test(specifier)
    const isPostprocessing = POSTPROCESSING.test(specifier)
    const isReactive = REACTIVE.test(specifier)
    const importsContentSchemas =
      target !== null &&
      (isWithin(target, 'src/content/schemas') ||
        target === 'src/content/validate' ||
        target === 'src/content/check' ||
        isWithin(target, 'src/content/data'))

    // ---- LEGACY rules ------------------------------------------------------
    if (
      (isWithin(repositoryPath, 'src/content') ||
        isWithin(repositoryPath, 'src/components/narrative') ||
        isWithin(repositoryPath, 'src/components/sections')) &&
      (isThreeCore || isReactThree || /^@\/stores\//.test(specifier))
    ) {
      addViolation(
        repositoryPath,
        line,
        specifier,
        'legacy: narrative content must stay render-free',
      )
      continue
    }

    // ---- NEW-TREE rules ----------------------------------------------------
    const isNewTree =
      isWithin(repositoryPath, 'src/journey') ||
      isWithin(repositoryPath, 'src/runtime') ||
      isWithin(repositoryPath, 'src/exhibits') ||
      isWithin(repositoryPath, 'src/ui') ||
      isWithin(repositoryPath, 'src/config') ||
      isWithin(repositoryPath, 'src/content')

    if (isNewTree && (isReactThree || isPostprocessing)) {
      addViolation(
        repositoryPath,
        line,
        specifier,
        'new tree: @react-three/* and postprocessing are banned',
      )
      continue
    }

    if (isNewTree && isThreeCore && !isWithin(repositoryPath, 'src/ui/fx/lanyard')) {
      addViolation(
        repositoryPath,
        line,
        specifier,
        'three may only be imported inside ui/fx/lanyard (R11)',
      )
      continue
    }

    if (isWithin(repositoryPath, 'src/journey')) {
      if (isReactive) {
        addViolation(
          repositoryPath,
          line,
          specifier,
          'journey/ must stay pure (no react/motion/zustand)',
        )
        continue
      }
      if (importsContentSchemas) {
        addViolation(repositoryPath, line, specifier, 'journey/ must not import content internals')
        continue
      }
      if (
        target !== null &&
        (isWithin(target, 'src/runtime') ||
          isWithin(target, 'src/ui') ||
          isWithin(target, 'src/exhibits'))
      ) {
        addViolation(repositoryPath, line, specifier, 'journey/ may not import runtime/ui/exhibits')
        continue
      }
    }

    if (
      (isWithin(repositoryPath, 'src/runtime') ||
        isWithin(repositoryPath, 'src/exhibits') ||
        isWithin(repositoryPath, 'src/ui')) &&
      importsContentSchemas
    ) {
      addViolation(
        repositoryPath,
        line,
        specifier,
        'client layers may not import content schemas/data (projection only)',
      )
      continue
    }

    if (isWithin(repositoryPath, 'src/runtime')) {
      if (target !== null && (isWithin(target, 'src/ui') || isWithin(target, 'src/exhibits'))) {
        addViolation(
          repositoryPath,
          line,
          specifier,
          'runtime/ may not import ui/exhibits (dependency direction)',
        )
        continue
      }
    }

    if (isWithin(repositoryPath, 'src/exhibits')) {
      if (target !== null && isWithin(target, 'src/ui/stage')) {
        addViolation(
          repositoryPath,
          line,
          specifier,
          'exhibits/ may not import ui/stage (avoid cycles)',
        )
        continue
      }
    }

    if (repositoryPath === 'src/content/projection.ts' && isClientModule) {
      addViolation(
        repositoryPath,
        1,
        'use client',
        'content/projection must stay server-shared (no directive)',
      )
    }
  }

  if (isWithin(repositoryPath, 'src/journey') && isClientModule) {
    addViolation(
      repositoryPath,
      1,
      'use client',
      'journey/ must stay framework-free (no directive)',
    )
  }
}

const sourceFiles = await listSourceFiles(sourceRoot)
await Promise.all(sourceFiles.map(auditFile))

if (violations.length > 0) {
  console.error(`Boundary violations (${violations.length}):\n`)
  for (const violation of violations) console.error(`  ${violation}`)
  process.exitCode = 1
} else {
  console.log(`Boundary check passed (${sourceFiles.length} source files audited).`)
}
