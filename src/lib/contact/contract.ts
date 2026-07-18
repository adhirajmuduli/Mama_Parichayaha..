import { z } from 'zod'

export const contactSubjectIds = ['general', 'academic', 'collaboration', 'technical'] as const

export const ContactSubjectSchema = z.enum(contactSubjectIds)

export const CONTACT_MAX_BODY_BYTES = 12_000
export const CONTACT_MIN_FILL_MS = 2_500

const unsafeControlPattern = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/u
const headerInjectionPattern = /[\r\n]/u

function hasUnsafeControlCharacter(value: string) {
  return unsafeControlPattern.test(value)
}

function normalizeSingleLine(value: string) {
  return value.normalize('NFC').trim().replace(/\s+/gu, ' ')
}

function normalizeMultiline(value: string) {
  return value.normalize('NFC').replace(/\r\n?/gu, '\n').trim()
}

const SafeSingleLineSchema = z
  .string()
  .transform(normalizeSingleLine)
  .refine((value) => !hasUnsafeControlCharacter(value), 'Contains unsupported control characters.')
  .refine((value) => !headerInjectionPattern.test(value), 'Line breaks are not allowed.')

const SafeMultilineSchema = z
  .string()
  .transform(normalizeMultiline)
  .refine((value) => !hasUnsafeControlCharacter(value), 'Contains unsupported control characters.')

const AffiliationSchema = SafeSingleLineSchema.pipe(z.string().max(160))
const EmailSchema = SafeSingleLineSchema.pipe(z.string().email().max(254)).transform((value) =>
  value.toLowerCase(),
)
const MessageSchema = SafeMultilineSchema.pipe(z.string().min(20).max(5_000))
const NameSchema = SafeSingleLineSchema.pipe(z.string().min(2).max(120))

export const ContactSubmissionSchema = z
  .object({
    affiliation: AffiliationSchema,
    email: EmailSchema,
    honeypot: z.string().max(200),
    message: MessageSchema,
    name: NameSchema,
    startedAt: z.number().int().nonnegative(),
    subject: ContactSubjectSchema,
    turnstileToken: z.string().trim().max(2_048),
  })
  .strict()

export type ContactSubmission = z.output<typeof ContactSubmissionSchema>

export const contactSubjectLabels: Record<ContactSubmission['subject'], string> = {
  academic: 'Academic enquiry',
  collaboration: 'Collaboration',
  general: 'General enquiry',
  technical: 'Technical portfolio feedback',
}

export function parseContactSubmission(payload: unknown) {
  return ContactSubmissionSchema.safeParse(payload)
}
