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
        <div className="w-full max-w-xl rounded-[32px] border border-white/10 bg-[#0b0715]/80 p-8 shadow-2xl shadow-black/30 sm:p-10">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-violet-200">
            {contact.eyebrow}
          </p>
          <h2 id={headingId} className="mb-4 text-4xl font-semibold sm:text-5xl">
            {contact.title}
          </h2>
          <p className="leading-relaxed text-zinc-200">{contact.description}</p>
          <ul className="mt-6 flex flex-wrap gap-3" aria-label="Public profiles">
            {publicProfiles.map((profile) => (
              <li key={profile.href}>
                <a
                  href={profile.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${profile.label} (opens in a new tab)`}
                  className="inline-flex rounded-md bg-white px-4 py-2 font-medium text-slate-950 outline-offset-4 focus-visible:outline-2 focus-visible:outline-violet-300"
                >
                  {profile.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </article>
    </section>
  )
}
