import LiquidGlassButton from '@/components/liquid-glass/LiquidGlassButton'
import LiquidGlassPanel from '@/components/liquid-glass/LiquidGlassPanel'
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
      className="relative z-10 scroll-mt-24 px-6 py-20 sm:px-12"
    >
      <article className="mx-auto max-w-3xl">
        <LiquidGlassPanel tone="strong">
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
                <LiquidGlassButton
                  href={profile.href}
                  aria-label={
                    profile.external ? `${profile.label} (opens in a new tab)` : profile.label
                  }
                  {...(profile.external ? { rel: 'noreferrer', target: '_blank' } : {})}
                >
                  {profile.label}
                </LiquidGlassButton>
              </li>
            ))}
          </ul>
          <ContactForm turnstileSiteKey={turnstileSiteKey} />
          <p className="mt-6 border-t border-white/15 pt-4 text-sm leading-relaxed text-[var(--site-muted)]">
            {contact.privacyNotice}
          </p>
        </LiquidGlassPanel>
      </article>
    </section>
  )
}
