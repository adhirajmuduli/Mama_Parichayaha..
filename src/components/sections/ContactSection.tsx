import { GlassCard, GlassLink } from '@/components/glass-card/GlassCard'
import { siteContent } from '@/content/site'

import ContactForm from './ContactForm'

export default function ContactSection() {
  const { contact, publicProfiles } = siteContent
  const headingId = `${contact.id}-heading`
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? null

  return (
    <section
      id={contact.id}
      aria-labelledby={headingId}
      className="relative z-10 flex scroll-mt-24 items-center px-6 py-20 sm:px-12"
    >
      <article className="mx-auto w-full max-w-5xl">
        <GlassCard glow="#C17A3A" className="p-0">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="mb-3 text-sm uppercase tracking-[0.3em] text-violet-200">
                {contact.eyebrow}
              </p>
              <h2 id={headingId} className="mb-4 text-4xl font-semibold sm:text-5xl">
                {contact.title}
              </h2>
              <p className="leading-relaxed text-[var(--site-muted)]">{contact.description}</p>
              <ul className="mt-6 flex flex-wrap gap-3" aria-label="Public contact links">
                {publicProfiles.map((profile) => (
                  <li key={profile.href}>
                    <GlassLink
                      href={profile.href}
                      aria-label={
                        profile.external ? `${profile.label} (opens in a new tab)` : profile.label
                      }
                      {...(profile.external
                        ? { rel: 'noopener noreferrer', target: '_blank' }
                        : {})}
                    >
                      {profile.label}
                    </GlassLink>
                  </li>
                ))}
              </ul>
              <p className="mt-8 border-t border-white/15 pt-4 text-sm leading-relaxed text-[var(--site-muted)]">
                {contact.privacyNotice}{' '}
                <a
                  className="rounded-sm border border-violet-300/80 bg-violet-950/80 px-1.5 py-0.5 font-semibold text-white underline decoration-2 underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--site-focus)]"
                  href="/privacy"
                >
                  Privacy details
                </a>
                {' · '}
                <a
                  className="rounded-sm border border-violet-300/80 bg-violet-950/80 px-1.5 py-0.5 font-semibold text-white underline decoration-2 underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--site-focus)]"
                  href="/credits"
                >
                  Credits
                </a>
              </p>
            </div>
            <ContactForm turnstileSiteKey={turnstileSiteKey} />
          </div>
        </GlassCard>
      </article>
    </section>
  )
}
