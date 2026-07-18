import 'server-only'

import { contactSubjectLabels, type ContactSubmission } from './contract'

interface DeliveryConfig {
  fromEmail: string
  resendApiKey: string
  toEmail: string
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/gu, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      "'": '&#39;',
      '"': '&quot;',
      '<': '&lt;',
      '>': '&gt;',
    }

    return entities[character] ?? character
  })
}

function createMailContent(submission: ContactSubmission) {
  const subject = contactSubjectLabels[submission.subject]
  const text = [
    `Category: ${subject}`,
    `Name: ${submission.name}`,
    `Email: ${submission.email}`,
    `Affiliation: ${submission.affiliation || 'Not provided'}`,
    '',
    'Message:',
    submission.message,
  ].join('\n')
  const html = [
    `<p><strong>Category:</strong> ${escapeHtml(subject)}</p>`,
    `<p><strong>Name:</strong> ${escapeHtml(submission.name)}</p>`,
    `<p><strong>Email:</strong> ${escapeHtml(submission.email)}</p>`,
    `<p><strong>Affiliation:</strong> ${escapeHtml(submission.affiliation || 'Not provided')}</p>`,
    `<p><strong>Message:</strong><br>${escapeHtml(submission.message).replace(/\n/gu, '<br>')}</p>`,
  ].join('')

  return { html, subject: `[Portfolio] ${subject}`, text }
}

export async function deliverContactMessage(config: DeliveryConfig, submission: ContactSubmission) {
  const mail = createMailContent(submission)
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: config.fromEmail,
      html: mail.html,
      reply_to: submission.email,
      subject: mail.subject,
      text: mail.text,
      to: [config.toEmail],
    }),
    cache: 'no-store',
    signal: AbortSignal.timeout(8_000),
  })

  if (!response.ok) {
    throw new Error('Resend delivery failed.')
  }
}
