import 'server-only'

interface TurnstileInput {
  isProduction: boolean
  secretKey: string
  token: string
}

export async function verifyTurnstile({ isProduction, secretKey, token }: TurnstileInput) {
  if (!isProduction && !token) {
    return true
  }

  if (!token || !secretKey) {
    return false
  }

  try {
    const body = new URLSearchParams({ response: token, secret: secretKey })
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      cache: 'no-store',
      signal: AbortSignal.timeout(5_000),
    })

    if (!response.ok) {
      return false
    }

    const payload: unknown = await response.json()
    return (
      typeof payload === 'object' &&
      payload !== null &&
      (payload as { success?: unknown }).success === true
    )
  } catch {
    return false
  }
}
