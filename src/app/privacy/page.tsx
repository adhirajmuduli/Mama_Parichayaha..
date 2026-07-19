import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'Privacy information for the Adhiraj Muduli biological sciences portfolio.',
  alternates: { canonical: '/privacy' },
}

const sections = [
  {
    title: 'Contact submissions',
    body: 'The contact form processes the name, email address, optional affiliation, subject, message, and anti-abuse signals that you provide. This information is used only to review and respond to your enquiry.',
  },
  {
    title: 'Service providers',
    body: 'Cloudflare Turnstile processes an anti-bot challenge when it is enabled in production. Resend delivers contact email, and Upstash Redis applies temporary rate limits. These services process the minimum request data needed for their respective functions.',
  },
  {
    title: 'Retention',
    body: 'The site does not keep a message archive. Delivered messages remain in the recipient inbox until manually deleted. Temporary rate-limit records are privacy-preserving hashes and expire automatically.',
  },
  {
    title: 'Analytics and tracking',
    body: 'This site does not load analytics, advertising, or cross-site tracking scripts. Browser requests are limited to the application and the optional anti-bot service needed for contact-form abuse prevention.',
  },
  {
    title: 'Your choices',
    body: 'You can contact Adhiraj using the public email address to request information about or deletion of a message you sent. Avoid sending sensitive personal, medical, or confidential research information through the contact form.',
  },
] as const

export default function PrivacyPage() {
  return (
    <main className="relative z-10 mx-auto min-h-screen max-w-4xl px-6 py-20 sm:px-12">
      <Link className="text-sm text-violet-200 underline underline-offset-4" href="/">
        Return to portfolio
      </Link>
      <header className="mt-10 max-w-3xl">
        <p className="text-sm uppercase tracking-[0.3em] text-violet-200">Privacy</p>
        <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">Contact and processing notice</h1>
        <p className="mt-6 leading-relaxed text-[var(--site-muted)]">
          This notice explains the limited processing associated with the public portfolio and its
          contact form.
        </p>
      </header>
      <div className="mt-12 grid gap-6">
        {sections.map((section) => (
          <section
            key={section.title}
            className="rounded-xl border border-white/12 bg-black/15 p-6"
          >
            <h2 className="text-xl font-semibold text-white">{section.title}</h2>
            <p className="mt-3 leading-relaxed text-[var(--site-muted)]">{section.body}</p>
          </section>
        ))}
      </div>
    </main>
  )
}
