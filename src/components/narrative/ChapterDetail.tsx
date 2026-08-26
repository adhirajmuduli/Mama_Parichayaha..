import LiquidGlassButton from '@/components/liquid-glass/LiquidGlassButton'
import styles from '@/components/liquid-glass/liquid-glass.module.css'
import type { ChapterContent } from '@/content/portfolio'
import { chapterIds, type ChapterId } from '@/content/portfolio'
import { cn } from '@/lib/utils'

const statusLabels = {
  active: 'Active',
  completed: 'Completed',
  experimental: 'Experimental',
} as const

interface ChapterDetailProps {
  chapter: ChapterContent
  onAnchorNavigation?: ((chapterId: ChapterId) => void) | undefined
}

export default function ChapterDetail({ chapter, onAnchorNavigation }: ChapterDetailProps) {
  const detailHeadingId = `${chapter.id}-detail-heading`

  if (chapter.detail.items.length === 0 && chapter.actions.length === 0) {
    return null
  }

  return (
    <div className="mt-8 border-t border-white/15 pt-6">
      {chapter.detail.items.length > 0 ? (
        <>
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">
            {chapter.detail.eyebrow}
          </p>
          <h3 id={detailHeadingId} className="mt-2 text-xl font-semibold text-white">
            {chapter.detail.title}
          </h3>
          <ul className="mt-4 grid gap-4" aria-labelledby={detailHeadingId}>
            {chapter.detail.items.map((item) => (
              <li key={item.title} className="border-l border-white/20 pl-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-white">{item.title}</p>
                  {item.status ? (
                    <span className="rounded-full border border-emerald-200/35 bg-emerald-200/10 px-2 py-0.5 text-xs font-medium text-emerald-100">
                      {statusLabels[item.status]}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 leading-relaxed text-[var(--site-muted)]">{item.description}</p>
              </li>
            ))}
          </ul>
        </>
      ) : null}
      {chapter.actions.length > 0 ? (
        <div
          className={`flex flex-wrap gap-3 ${chapter.detail.items.length > 0 ? 'mt-6' : 'mt-8'}`}
          aria-label={`${chapter.title} links`}
        >
          {chapter.actions.map((action) => {
            const anchorChapterId = parseAnchorChapter(action.href)

            if (onAnchorNavigation && anchorChapterId) {
              return (
                <button
                  key={action.href}
                  type="button"
                  className={cn(styles.button, 'px-4 py-2 font-medium transition-colors')}
                  onClick={() => onAnchorNavigation(anchorChapterId)}
                >
                  <span>{action.label}</span>
                </button>
              )
            }

            return (
              <LiquidGlassButton
                key={action.href}
                href={action.href}
                {...(action.external
                  ? {
                      'aria-label': `${action.label} (opens in a new tab)`,
                      rel: 'noopener noreferrer',
                      target: '_blank',
                    }
                  : {})}
              >
                {action.label}
              </LiquidGlassButton>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

function parseAnchorChapter(href: string): ChapterId | null {
  if (!href.startsWith('#')) {
    return null
  }

  const candidate = href.slice(1) as ChapterId

  return chapterIds.includes(candidate) ? candidate : null
}
