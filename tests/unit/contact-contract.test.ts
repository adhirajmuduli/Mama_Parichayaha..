import { describe, expect, it } from 'vitest'

import { parseContactSubmission } from '@/lib/contact/contract'

const validSubmission = {
  affiliation: 'NISER',
  email: 'VISITOR@EXAMPLE.ORG',
  honeypot: '',
  message: 'I would like to discuss a potential academic collaboration.',
  name: 'Visitor Name',
  startedAt: 1,
  subject: 'academic',
  turnstileToken: 'token',
}

describe('contact submission contract', () => {
  it('normalizes Unicode and email casing without accepting unsafe controls', () => {
    const parsed = parseContactSubmission({
      ...validSubmission,
      name: 'Cafe\u0301 Visitor',
    })

    expect(parsed.success).toBe(true)

    if (parsed.success) {
      expect(parsed.data.email).toBe('visitor@example.org')
      expect(parsed.data.name).toBe('Café Visitor')
    }
  })

  it('rejects header injection, unsafe controls, and unapproved categories', () => {
    expect(
      parseContactSubmission({ ...validSubmission, name: 'Visitor\nBcc: victim@example.org' })
        .success,
    ).toBe(false)
    expect(
      parseContactSubmission({ ...validSubmission, message: 'Valid message\u0000content here.' })
        .success,
    ).toBe(false)
    expect(parseContactSubmission({ ...validSubmission, subject: 'other' }).success).toBe(false)
  })

  it('keeps honeypot and timing fields in the server contract', () => {
    expect(parseContactSubmission({ ...validSubmission, honeypot: 'bot payload' }).success).toBe(
      true,
    )
    expect(parseContactSubmission({ ...validSubmission, startedAt: -1 }).success).toBe(false)
  })
})
