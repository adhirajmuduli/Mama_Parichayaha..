import { createHash, randomUUID } from 'node:crypto'

import { CONTACT_MAX_BODY_BYTES } from './contract'

export class ContactRequestError extends Error {
  constructor(
    public readonly kind:
      | 'body_too_large'
      | 'invalid_content_type'
      | 'invalid_json'
      | 'invalid_origin'
      | 'missing_client_ip',
  ) {
    super(kind)
  }
}

export function createRequestId() {
  return randomUUID()
}

export function hashPrivacyPreservingIdentifier(value: string) {
  return createHash('sha256').update(value).digest('base64url')
}

export function getClientIp(request: Request) {
  const candidate =
    request.headers.get('x-nf-client-connection-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()

  if (!candidate || candidate.length > 64 || /[^0-9a-fA-F:.]/u.test(candidate)) {
    return null
  }

  return candidate
}

export function assertAllowedOrigin(request: Request, allowedOrigins: ReadonlySet<string>) {
  const origin = request.headers.get('origin')
  const host = request.headers.get('host')

  if (!origin || !host || !allowedOrigins.has(origin)) {
    throw new ContactRequestError('invalid_origin')
  }

  try {
    if (new URL(origin).host !== host) {
      throw new ContactRequestError('invalid_origin')
    }
  } catch (error) {
    if (error instanceof ContactRequestError) {
      throw error
    }

    throw new ContactRequestError('invalid_origin')
  }
}

async function readLimitedBody(request: Request) {
  const contentLength = request.headers.get('content-length')

  if (
    contentLength &&
    (!/^\d+$/u.test(contentLength) || Number(contentLength) > CONTACT_MAX_BODY_BYTES)
  ) {
    throw new ContactRequestError('body_too_large')
  }

  if (!request.body) {
    throw new ContactRequestError('invalid_json')
  }

  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let receivedBytes = 0

  try {
    while (true) {
      const { done, value } = await reader.read()

      if (done) {
        break
      }

      receivedBytes += value.byteLength

      if (receivedBytes > CONTACT_MAX_BODY_BYTES) {
        await reader.cancel()
        throw new ContactRequestError('body_too_large')
      }

      chunks.push(value)
    }
  } finally {
    reader.releaseLock()
  }

  const body = new Uint8Array(receivedBytes)
  let offset = 0

  for (const chunk of chunks) {
    body.set(chunk, offset)
    offset += chunk.byteLength
  }

  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(body)
  } catch {
    throw new ContactRequestError('invalid_json')
  }
}

export async function readContactJson(request: Request): Promise<unknown> {
  const contentType = request.headers.get('content-type')?.split(';')[0]?.trim().toLowerCase()

  if (contentType !== 'application/json') {
    throw new ContactRequestError('invalid_content_type')
  }

  const body = await readLimitedBody(request)

  try {
    return JSON.parse(body) as unknown
  } catch {
    throw new ContactRequestError('invalid_json')
  }
}
