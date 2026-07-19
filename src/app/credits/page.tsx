import type { Metadata } from 'next'
import Link from 'next/link'

import { siteContent } from '@/content/site'

export const metadata: Metadata = {
  title: 'Credits',
  description: 'Asset, scientific-source, and license credits for the Adhiraj Muduli portfolio.',
  alternates: { canonical: '/credits' },
}

export default function CreditsPage() {
  const { credits } = siteContent

  return (
    <main className="relative z-10 mx-auto min-h-screen max-w-4xl px-6 py-20 sm:px-12">
      <Link className="text-sm text-violet-200 underline underline-offset-4" href="/">
        Return to portfolio
      </Link>
      <header className="mt-10 max-w-3xl">
        <p className="text-sm uppercase tracking-[0.3em] text-violet-200">{credits.eyebrow}</p>
        <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">{credits.title}</h1>
        <p className="mt-6 leading-relaxed text-[var(--site-muted)]">{credits.description}</p>
      </header>
      <section className="mt-12" aria-labelledby="asset-credits-heading">
        <h2 id="asset-credits-heading" className="text-2xl font-semibold text-white">
          Deployed 3D assets
        </h2>
        <ul className="mt-6 grid gap-6">
          {credits.models.map((model) => (
            <li key={model.assetId} className="rounded-xl border border-white/12 bg-black/15 p-6">
              <h3 className="text-xl font-semibold text-white">{model.title}</h3>
              <p className="mt-3 leading-relaxed text-[var(--site-muted)]">{model.attribution}</p>
              <p className="mt-3 leading-relaxed text-[var(--site-muted)]">{model.license}</p>
              <ul className="mt-4 flex flex-wrap gap-4" aria-label={`${model.title} source links`}>
                {model.links.map((link) => (
                  <li key={link.href}>
                    <a
                      className="text-violet-200 underline underline-offset-4"
                      href={link.href}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {link.label} <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>
      <section
        className="mt-10 rounded-xl border border-white/12 bg-black/15 p-6"
        aria-labelledby="software-heading"
      >
        <h2 id="software-heading" className="text-xl font-semibold text-white">
          Software and scientific sources
        </h2>
        <p className="mt-3 leading-relaxed text-[var(--site-muted)]">
          The interactive scene uses local assets with recorded hashes and provenance. Three.js,
          React Three Fiber, and related open-source packages are tracked through the project
          lockfile and the generated license inventory.
        </p>
      </section>
    </main>
  )
}
