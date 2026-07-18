import 'server-only'

interface ContactRuntimeConfig {
  allowedOrigins: ReadonlySet<string>
  fromEmail: string
  isProduction: boolean
  resendApiKey: string
  toEmail: string
  turnstileSecretKey: string
  upstashRestToken: string
  upstashRestUrl: string
}

interface ContactConfigResult {
  config: ContactRuntimeConfig | null
  issues: readonly string[]
}

function getRequiredEnvironmentValue(name: string, issues: string[]) {
  const value = process.env[name]?.trim()

  if (!value) {
    issues.push(name)
    return null
  }

  return value
}

function parseAllowedOrigins(value: string | null, issues: string[]) {
  const origins = new Set<string>()

  for (const candidate of value
    ?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean) ?? []) {
    try {
      const parsed = new URL(candidate)

      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
        throw new Error('Unsupported origin protocol.')
      }

      origins.add(parsed.origin)
    } catch {
      issues.push('CONTACT_ALLOWED_ORIGINS')
    }
  }

  return origins
}

export function getContactRuntimeConfig(): ContactConfigResult {
  const issues: string[] = []
  const isProduction = process.env.NODE_ENV === 'production'
  const resendApiKey = getRequiredEnvironmentValue('RESEND_API_KEY', issues)
  const toEmail = getRequiredEnvironmentValue('CONTACT_TO_EMAIL', issues)
  const fromEmail = getRequiredEnvironmentValue('CONTACT_FROM_EMAIL', issues)
  const upstashRestUrl = getRequiredEnvironmentValue('UPSTASH_REDIS_REST_URL', issues)
  const upstashRestToken = getRequiredEnvironmentValue('UPSTASH_REDIS_REST_TOKEN', issues)
  const turnstileSecretKey = getRequiredEnvironmentValue('TURNSTILE_SECRET_KEY', issues)
  const allowedOriginValue = process.env.CONTACT_ALLOWED_ORIGINS?.trim() ?? null
  const allowedOrigins = parseAllowedOrigins(allowedOriginValue, issues)

  if (isProduction && allowedOrigins.size === 0 && !issues.includes('CONTACT_ALLOWED_ORIGINS')) {
    issues.push('CONTACT_ALLOWED_ORIGINS')
  }

  if (
    issues.length > 0 ||
    !resendApiKey ||
    !toEmail ||
    !fromEmail ||
    !upstashRestUrl ||
    !upstashRestToken ||
    !turnstileSecretKey
  ) {
    return { config: null, issues }
  }

  try {
    const parsedUpstashUrl = new URL(upstashRestUrl)

    if (parsedUpstashUrl.protocol !== 'https:') {
      return { config: null, issues: [...issues, 'UPSTASH_REDIS_REST_URL'] }
    }
  } catch {
    return { config: null, issues: [...issues, 'UPSTASH_REDIS_REST_URL'] }
  }

  if (!isProduction && allowedOrigins.size === 0) {
    allowedOrigins.add('http://localhost:3000')
    allowedOrigins.add('http://127.0.0.1:3000')
  }

  return {
    config: {
      allowedOrigins,
      fromEmail,
      isProduction,
      resendApiKey,
      toEmail,
      turnstileSecretKey,
      upstashRestToken,
      upstashRestUrl,
    },
    issues: [],
  }
}
