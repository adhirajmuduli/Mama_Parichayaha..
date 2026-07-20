import { readdir, readFile } from 'node:fs/promises'
import { extname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDirectory = resolve(fileURLToPath(new URL('..', import.meta.url)))
const sourceRoots = ['src/content', 'src/lib/siteMetadata.ts']
const sourceExtensions = new Set(['.ts', '.tsx'])
const urlPattern = /https:\/\/[^\s'"`<>)]+/gu
const errors = []
const links = new Map()

async function collectSourceFiles(entry) {
  const path = resolve(rootDirectory, entry)
  const entries = await readdir(path, { withFileTypes: true }).catch(() => null)

  if (!entries) {
    return sourceExtensions.has(extname(path)) ? [path] : []
  }

  const nestedFiles = await Promise.all(
    entries.map((child) => collectSourceFiles(relative(rootDirectory, join(path, child.name)))),
  )

  return nestedFiles.flat()
}

for (const root of sourceRoots) {
  for (const filePath of await collectSourceFiles(root)) {
    const source = await readFile(filePath, 'utf8')
    const urlMatches = source.match(urlPattern) ?? []

    for (const rawUrl of urlMatches) {
      const url = new URL(rawUrl)

      if (url.protocol !== 'https:' || url.username || url.password || !url.hostname) {
        errors.push(`${relative(rootDirectory, filePath)} contains an unsafe public URL: ${rawUrl}`)
        continue
      }

      links.set(rawUrl, relative(rootDirectory, filePath))
    }
  }
}

const requiredPublicUrls = [
  'https://github.com/adhirajmuduli',
  'https://orcid.org/0009-0005-5655-8120?lang=en',
  'https://sketchfab.com/3d-models/dna-vr-interactive-animation-c9a926f139044470ad3fb053c66ad71e',
]

for (const url of requiredPublicUrls) {
  if (!links.has(url)) {
    errors.push(`Missing approved public URL: ${url}`)
  }
}

if (errors.length > 0) {
  throw new Error(`Public-link audit failed:\n${errors.join('\n')}`)
}

console.log(`Public-link audit: verified ${links.size} HTTPS URL(s)`)
