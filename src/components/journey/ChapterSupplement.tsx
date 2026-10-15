import type { ChapterId } from '@/content/portfolio'
import { siteContent } from '@/content/site'

export default function ChapterSupplement({ chapterId }: { chapterId: ChapterId }) {
  if (chapterId !== 'contact') return null
  return (
    <div className="mt-6 space-y-6">
      <ul aria-label="Public contact links" className="flex flex-wrap gap-4">
        {siteContent.publicProfiles.map((profile) => (
          <li key={profile.href}>
            <a
              href={profile.href}
              className="underline underline-offset-4"
              {...(profile.external
                ? {
                    target: '_blank',
                    rel: 'noopener noreferrer',
                    'aria-label': `${profile.label} (opens in a new tab)`,
                  }
                : {})}
            >
              {profile.label}
            </a>
          </li>
        ))}
      </ul>
      <p className="text-sm">
        <a href="/contact" className="underline">
          Send a message
        </a>
        {' · '}
        <a href="/privacy" className="underline">
          Privacy details
        </a>
        {' · '}
        <a href="/credits" className="underline">
          Credits
        </a>
      </p>
      <section aria-labelledby="credits-heading">
        <h3 id="credits-heading" className="text-lg font-semibold">
          {siteContent.credits.title}
        </h3>
        <ul className="mt-3 space-y-3 text-sm">
          {siteContent.credits.models.map((model) => (
            <li key={model.assetId}>
              <p>
                {model.attribution} {model.license}
              </p>
              {model.links.map((link) => (
                <a key={link.href} href={link.href} className="mr-3 underline">
                  {link.label}
                </a>
              ))}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
