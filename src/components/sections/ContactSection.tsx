import LiquidGlassButton from '@/components/liquid-glass/LiquidGlassButton'
import LiquidGlassPanel from '@/components/liquid-glass/LiquidGlassPanel'
import { siteContent } from '@/content/site'

export default function ContactSection() {
  const { contact, publicProfiles } = siteContent
  const headingId = `${contact.id}-heading`

  return (
    <section
      id={contact.id}
      aria-labelledby={headingId}
      className="relative z-10 flex min-h-[60svh] scroll-mt-24 items-center px-6 py-20 sm:px-12"
    >
      <article className="w-full">
        <LiquidGlassPanel className="max-w-xl" tone="strong">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-violet-200">
            {contact.eyebrow}
          </p>
          <h2 id={headingId} className="mb-4 text-4xl font-semibold sm:text-5xl">
            {contact.title}
          </h2>
          <p className="leading-relaxed text-[var(--site-muted)]">{contact.description}</p>
          <ul className="mt-6 flex flex-wrap gap-3" aria-label="Public profiles">
            {publicProfiles.map((profile) => (
              <li key={profile.href}>
                <LiquidGlassButton
                  href={profile.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${profile.label} (opens in a new tab)`}
                >
                  {profile.label}
                </LiquidGlassButton>
              </li>
            ))}
          </ul>
        </LiquidGlassPanel>
      </article>
    </section>
  )
}
