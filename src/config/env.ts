/**
 * Client-safe public environment access.
 *
 * Every read here MUST reference `process.env.NEXT_PUBLIC_*` statically so the
 * Next.js compiler inlines the value into client bundles. Dynamic
 * `process.env[key]` access would silently produce `undefined` on the client.
 *
 * Server-only secrets (contact delivery, Turnstile secret, Upstash) are NOT
 * handled here — they stay behind `import 'server-only'` in `src/lib/contact`.
 */

/** Parses a NEXT_PUBLIC_* string as an optional boolean override. */
export function parseBooleanEnv(value: string | undefined): boolean | undefined {
  if (value === undefined) return undefined

  const normalized = value.trim().toLowerCase()
  if (normalized === 'true' || normalized === '1' || normalized === 'on') return true
  if (normalized === 'false' || normalized === '0' || normalized === 'off' || normalized === '')
    return false

  return undefined
}

/** Reads a NEXT_PUBLIC_* string with surrounding whitespace trimmed. */
export function readPublicString(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

/** Public Turnstile site key (safe for browsers; undefined renders the offline notice). */
export const turnstileSiteKey: string | undefined = readPublicString(
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
)
