import { NextResponse } from 'next/server'

import { getContactRuntimeConfig } from '@/lib/contact/config'
import { deliverContactMessage } from '@/lib/contact/delivery'
import { parseContactSubmission } from '@/lib/contact/contract'
import { enforceContactRateLimit } from '@/lib/contact/rateLimit'
import {
  ContactRequestError,
  assertAllowedOrigin,
  createRequestId,
  getClientIp,
  hashPrivacyPreservingIdentifier,
  readContactJson,
} from '@/lib/contact/security'
import { verifyTurnstile } from '@/lib/contact/turnstile'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const genericFailureMessage =
  'We could not send your message. Please try again later or use the email link.'
const acceptedMessage = 'Thank you. Your message has been sent.'

type ContactOutcome =
  | 'accepted'
  | 'body_too_large'
  | 'configuration_unavailable'
  | 'delivery_unavailable'
  | 'honeypot'
  | 'invalid_content_type'
  | 'invalid_json'
  | 'invalid_origin'
  | 'invalid_submission'
  | 'minimum_fill_time'
  | 'missing_client_ip'
  | 'rate_limit_unavailable'
  | 'rate_limited'
  | 'turnstile_rejected'
  | 'unexpected_error'

function response(body: { ok: boolean; message: string }, status: number) {
  return NextResponse.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json; charset=utf-8',
    },
  })
}

function logContactOutcome(requestId: string, outcome: ContactOutcome, startedAt: number) {
  console.info(
    JSON.stringify({
      event: 'contact_submission',
      latencyMs: Math.round(performance.now() - startedAt),
      outcome,
      requestId,
    }),
  )
}

export async function POST(request: Request) {
  const requestId = createRequestId()
  const startedAt = performance.now()
  let outcome: ContactOutcome = 'unexpected_error'

  try {
    const { config } = getContactRuntimeConfig()

    if (!config) {
      outcome = 'configuration_unavailable'
      return response({ ok: false, message: genericFailureMessage }, 503)
    }

    assertAllowedOrigin(request, config.allowedOrigins)
    const payload = await readContactJson(request)
    const parsed = parseContactSubmission(payload)

    if (!parsed.success) {
      outcome = 'invalid_submission'
      return response({ ok: false, message: genericFailureMessage }, 400)
    }

    const submission = parsed.data

    if (submission.honeypot) {
      outcome = 'honeypot'
      return response({ ok: true, message: acceptedMessage }, 202)
    }

    if (Date.now() - submission.startedAt < 2_500) {
      outcome = 'minimum_fill_time'
      return response({ ok: true, message: acceptedMessage }, 202)
    }

    const clientIp = getClientIp(request)

    if (!clientIp) {
      outcome = 'missing_client_ip'
      return response({ ok: false, message: genericFailureMessage }, 400)
    }

    const rateLimit = await enforceContactRateLimit({
      emailHash: hashPrivacyPreservingIdentifier(submission.email),
      ipHash: hashPrivacyPreservingIdentifier(clientIp),
      upstashRestToken: config.upstashRestToken,
      upstashRestUrl: config.upstashRestUrl,
    })

    if (!rateLimit.allowed) {
      outcome =
        rateLimit.category === 'rate_limit_unavailable' ? 'rate_limit_unavailable' : 'rate_limited'
      return response({ ok: false, message: genericFailureMessage }, 429)
    }

    const turnstileAccepted = await verifyTurnstile({
      isProduction: config.isProduction,
      secretKey: config.turnstileSecretKey,
      token: submission.turnstileToken,
    })

    if (!turnstileAccepted) {
      outcome = 'turnstile_rejected'
      return response({ ok: false, message: genericFailureMessage }, 403)
    }

    await deliverContactMessage(config, submission)
    outcome = 'accepted'
    return response({ ok: true, message: acceptedMessage }, 202)
  } catch (error) {
    if (error instanceof ContactRequestError) {
      outcome = error.kind
      return response(
        { ok: false, message: genericFailureMessage },
        error.kind === 'body_too_large' ? 413 : error.kind === 'invalid_origin' ? 403 : 400,
      )
    }

    outcome = 'delivery_unavailable'
    return response({ ok: false, message: genericFailureMessage }, 503)
  } finally {
    logContactOutcome(requestId, outcome, startedAt)
  }
}
