import type { Metadata } from 'next'
import Link from 'next/link'

import { buildClientContent, validatedContent } from '@/content'

import ContactSection from '@/components/sections/ContactSection'
import PublicationStatusSection from '@/components/sections/PublicationStatusSection'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact Adhiraj Muduli about biological sciences, research, and collaboration.',
  alternates: { canonical: '/contact' },
}

export default function ContactPage() {
  // Projected content: provenance and zod stay on the server; the sections
  // receive plain props (content index must never enter a client graph).
  const content = buildClientContent(validatedContent)

  return (
    <main className="relative z-10 mx-auto min-h-screen max-w-5xl px-6 py-20 sm:px-12">
      <Link className="text-sm text-violet-200 underline underline-offset-4" href="/">
        Return to portfolio
      </Link>
      <header className="mt-10">
        <h1 className="text-4xl font-semibold sm:text-5xl">Contact</h1>
      </header>
      <div className="mt-10">
        <PublicationStatusSection publications={content.publications} />
        <ContactSection contact={content.contact} publicProfiles={content.profiles} />
      </div>
    </main>
  )
}
