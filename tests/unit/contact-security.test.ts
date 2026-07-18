import { describe, expect, it } from 'vitest'

import {
  ContactRequestError,
  assertAllowedOrigin,
  getClientIp,
  hashPrivacyPreservingIdentifier,
  readContactJson,
} from '@/lib/contact/security'

describe('contact request security', () => {
  it('accepts only configured same-host origins', () => {
    const request = new Request('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: {
        Host: 'localhost:3000',
        Origin: 'http://localhost:3000',
      },
    })

    expect(() => assertAllowedOrigin(request, new Set(['http://localhost:3000']))).not.toThrow()
  })

  it('rejects an origin that is not allowlisted', () => {
    const request = new Request('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: {
        Host: 'localhost:3000',
        Origin: 'https://attacker.example',
      },
    })

    expect(() => assertAllowedOrigin(request, new Set(['http://localhost:3000']))).toThrow(
      ContactRequestError,
    )
  })

  it('enforces JSON content type and parses a bounded JSON request', async () => {
    const request = new Request('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({ message: 'hello' }),
    })

    await expect(readContactJson(request)).resolves.toEqual({ message: 'hello' })

    await expect(
      readContactJson(
        new Request('http://localhost:3000/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: 'hello',
        }),
      ),
    ).rejects.toMatchObject({ kind: 'invalid_content_type' })
  })

  it('uses irreversible digests and never returns a raw forwarded IP', () => {
    const request = new Request('http://localhost:3000/api/contact', {
      headers: { 'X-Forwarded-For': '203.0.113.5, 10.0.0.1' },
    })

    expect(getClientIp(request)).toBe('203.0.113.5')
    expect(hashPrivacyPreservingIdentifier('203.0.113.5')).not.toContain('203.0.113.5')
  })
})
