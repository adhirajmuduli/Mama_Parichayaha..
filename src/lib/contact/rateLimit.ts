import 'server-only'

interface UpstashConfig {
  upstashRestToken: string
  upstashRestUrl: string
}

interface RateLimitInput extends UpstashConfig {
  emailHash: string
  ipHash: string
}

export interface RateLimitResult {
  allowed: boolean
  category?: 'email_rate_limited' | 'ip_rate_limited' | 'rate_limit_unavailable'
}

const RATE_WINDOW_SECONDS = 60 * 60
const IP_LIMIT = 5
const EMAIL_LIMIT = 3

async function incrementWithExpiry(config: UpstashConfig, key: string) {
  const response = await fetch(`${config.upstashRestUrl}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.upstashRestToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([
      ['INCR', key],
      ['EXPIRE', key, RATE_WINDOW_SECONDS.toString(), 'NX'],
    ]),
    cache: 'no-store',
    signal: AbortSignal.timeout(3_000),
  })

  if (!response.ok) {
    throw new Error('Upstash rate-limit request failed.')
  }

  const payload: unknown = await response.json()

  if (!Array.isArray(payload) || !payload[0] || typeof payload[0] !== 'object') {
    throw new Error('Upstash rate-limit response was malformed.')
  }

  const result = (payload[0] as { result?: unknown }).result

  if (typeof result !== 'number' || !Number.isSafeInteger(result) || result < 1) {
    throw new Error('Upstash rate-limit response did not include an increment count.')
  }

  return result
}

export async function enforceContactRateLimit({
  emailHash,
  ipHash,
  upstashRestToken,
  upstashRestUrl,
}: RateLimitInput): Promise<RateLimitResult> {
  try {
    const [ipCount, emailCount] = await Promise.all([
      incrementWithExpiry({ upstashRestToken, upstashRestUrl }, `contact:ip:${ipHash}`),
      incrementWithExpiry({ upstashRestToken, upstashRestUrl }, `contact:email:${emailHash}`),
    ])

    if (ipCount > IP_LIMIT) {
      return { allowed: false, category: 'ip_rate_limited' }
    }

    if (emailCount > EMAIL_LIMIT) {
      return { allowed: false, category: 'email_rate_limited' }
    }

    return { allowed: true }
  } catch {
    return { allowed: false, category: 'rate_limit_unavailable' }
  }
}
