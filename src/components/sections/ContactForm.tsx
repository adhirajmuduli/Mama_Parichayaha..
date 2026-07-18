'use client'

import { useEffect, useState } from 'react'

import {
  contactSubjectIds,
  contactSubjectLabels,
  parseContactSubmission,
  type ContactSubmission,
} from '@/lib/contact/contract'

import TurnstileWidget from './TurnstileWidget'

type ContactField = 'affiliation' | 'email' | 'message' | 'name' | 'subject'
type ContactFormState = ContactSubmission
type FieldErrors = Partial<Record<ContactField | 'turnstile', string>>

interface ContactFormProps {
  turnstileSiteKey: string | null
}

const isProduction = process.env.NODE_ENV === 'production'

function createEmptyForm(): ContactFormState {
  return {
    affiliation: '',
    email: '',
    honeypot: '',
    message: '',
    name: '',
    startedAt: Date.now(),
    subject: 'general',
    turnstileToken: '',
  }
}

export default function ContactForm({ turnstileSiteKey }: ContactFormProps) {
  const [form, setForm] = useState<ContactFormState>(createEmptyForm)
  const [isOnline, setIsOnline] = useState(
    () => typeof navigator === 'undefined' || navigator.onLine,
  )
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [isPending, setIsPending] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  useEffect(() => {
    const syncOnlineStatus = () => setIsOnline(navigator.onLine)

    window.addEventListener('online', syncOnlineStatus)
    window.addEventListener('offline', syncOnlineStatus)
    return () => {
      window.removeEventListener('online', syncOnlineStatus)
      window.removeEventListener('offline', syncOnlineStatus)
    }
  }, [])

  const setField = <Field extends ContactField>(field: Field, value: ContactFormState[Field]) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const validate = () => {
    const parsed = parseContactSubmission(form)

    if (parsed.success) {
      setFieldErrors({})
      return true
    }

    const nextErrors: FieldErrors = {}

    parsed.error.issues.forEach((issue) => {
      const field = issue.path[0]

      if (
        typeof field === 'string' &&
        field in form &&
        field !== 'honeypot' &&
        field !== 'startedAt' &&
        field !== 'turnstileToken'
      ) {
        nextErrors[field as ContactField] ??= issue.message
      }
    })

    if (isProduction && !form.turnstileToken) {
      nextErrors.turnstile = 'Complete the spam-protection check before sending your message.'
    }

    setFieldErrors(nextErrors)
    return false
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setResult(null)

    if (!isOnline) {
      setResult(
        'You are offline. Reconnect before submitting, or use the email link when available.',
      )
      return
    }

    if (!validate()) {
      return
    }

    setIsPending(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        credentials: 'same-origin',
      })
      const payload: unknown = await response.json().catch(() => null)
      const message =
        typeof payload === 'object' &&
        payload !== null &&
        typeof (payload as { message?: unknown }).message === 'string'
          ? (payload as { message: string }).message
          : 'We could not send your message. Please try again later or use the email link.'

      setResult(message)

      if (response.ok && (payload as { ok?: unknown } | null)?.ok === true) {
        setForm(createEmptyForm())
      }
    } catch {
      setResult('We could not send your message. Please try again later or use the email link.')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form className="mt-8 grid gap-5" noValidate onSubmit={submit}>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-white" htmlFor="contact-name">
          Name
          <input
            id="contact-name"
            name="name"
            autoComplete="name"
            maxLength={120}
            required
            value={form.name}
            onChange={(event) => setField('name', event.target.value)}
            aria-describedby={fieldErrors.name ? 'contact-name-error' : undefined}
            aria-invalid={Boolean(fieldErrors.name)}
            className="rounded-lg border border-white/20 bg-black/20 px-3 py-2 text-base text-white outline-none placeholder:text-slate-400 focus-visible:border-[var(--site-focus)] focus-visible:ring-2 focus-visible:ring-[var(--site-focus)]"
          />
          {fieldErrors.name ? (
            <span id="contact-name-error" className="text-rose-200">
              {fieldErrors.name}
            </span>
          ) : null}
        </label>
        <label className="grid gap-2 text-sm font-medium text-white" htmlFor="contact-email">
          Email
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            required
            value={form.email}
            onChange={(event) => setField('email', event.target.value)}
            aria-describedby={fieldErrors.email ? 'contact-email-error' : undefined}
            aria-invalid={Boolean(fieldErrors.email)}
            className="rounded-lg border border-white/20 bg-black/20 px-3 py-2 text-base text-white outline-none placeholder:text-slate-400 focus-visible:border-[var(--site-focus)] focus-visible:ring-2 focus-visible:ring-[var(--site-focus)]"
          />
          {fieldErrors.email ? (
            <span id="contact-email-error" className="text-rose-200">
              {fieldErrors.email}
            </span>
          ) : null}
        </label>
      </div>
      <label className="grid gap-2 text-sm font-medium text-white" htmlFor="contact-subject">
        Subject
        <select
          id="contact-subject"
          name="subject"
          value={form.subject}
          onChange={(event) =>
            setField('subject', event.target.value as ContactSubmission['subject'])
          }
          className="rounded-lg border border-white/20 bg-slate-950/80 px-3 py-2 text-base text-white outline-none focus-visible:border-[var(--site-focus)] focus-visible:ring-2 focus-visible:ring-[var(--site-focus)]"
        >
          {contactSubjectIds.map((subject) => (
            <option key={subject} value={subject}>
              {contactSubjectLabels[subject]}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 text-sm font-medium text-white" htmlFor="contact-affiliation">
        Affiliation <span className="font-normal text-[var(--site-muted)]">(optional)</span>
        <input
          id="contact-affiliation"
          name="affiliation"
          autoComplete="organization"
          maxLength={160}
          value={form.affiliation}
          onChange={(event) => setField('affiliation', event.target.value)}
          aria-describedby={fieldErrors.affiliation ? 'contact-affiliation-error' : undefined}
          aria-invalid={Boolean(fieldErrors.affiliation)}
          className="rounded-lg border border-white/20 bg-black/20 px-3 py-2 text-base text-white outline-none placeholder:text-slate-400 focus-visible:border-[var(--site-focus)] focus-visible:ring-2 focus-visible:ring-[var(--site-focus)]"
        />
        {fieldErrors.affiliation ? (
          <span id="contact-affiliation-error" className="text-rose-200">
            {fieldErrors.affiliation}
          </span>
        ) : null}
      </label>
      <label className="grid gap-2 text-sm font-medium text-white" htmlFor="contact-message">
        Message
        <textarea
          id="contact-message"
          name="message"
          rows={6}
          maxLength={5_000}
          required
          value={form.message}
          onChange={(event) => setField('message', event.target.value)}
          aria-describedby={fieldErrors.message ? 'contact-message-error' : undefined}
          aria-invalid={Boolean(fieldErrors.message)}
          className="resize-y rounded-lg border border-white/20 bg-black/20 px-3 py-2 text-base text-white outline-none placeholder:text-slate-400 focus-visible:border-[var(--site-focus)] focus-visible:ring-2 focus-visible:ring-[var(--site-focus)]"
        />
        <span className="text-xs font-normal text-[var(--site-muted)]">20–5,000 characters</span>
        {fieldErrors.message ? (
          <span id="contact-message-error" className="text-rose-200">
            {fieldErrors.message}
          </span>
        ) : null}
      </label>
      <label
        className="pointer-events-none absolute -left-[10000px] h-px w-px overflow-hidden"
        aria-hidden="true"
        htmlFor="contact-website"
      >
        Website
        <input
          id="contact-website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={form.honeypot}
          onChange={(event) => setForm((current) => ({ ...current, honeypot: event.target.value }))}
        />
      </label>
      {isProduction && turnstileSiteKey ? (
        <div>
          <TurnstileWidget
            siteKey={turnstileSiteKey}
            onTokenChange={(turnstileToken) => {
              setForm((current) => ({ ...current, turnstileToken }))
              setFieldErrors((current) => {
                const nextErrors = { ...current }
                delete nextErrors.turnstile
                return nextErrors
              })
            }}
          />
          {fieldErrors.turnstile ? (
            <p className="mt-2 text-sm text-rose-200">{fieldErrors.turnstile}</p>
          ) : null}
        </div>
      ) : null}
      <button
        type="submit"
        disabled={!isOnline || isPending || (isProduction && !turnstileSiteKey)}
        className="w-fit rounded-lg border border-white/25 bg-white/10 px-5 py-2.5 font-medium text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--site-focus)]"
      >
        {isPending ? 'Sending…' : 'Send message'}
      </button>
      {!isOnline ? (
        <p className="text-sm text-amber-100" role="status">
          You are offline. Contact submissions require a connection; the public email link remains
          available.
        </p>
      ) : null}
      <p role="status" aria-live="polite" className="min-h-6 text-sm text-[var(--site-muted)]">
        {result}
      </p>
    </form>
  )
}
