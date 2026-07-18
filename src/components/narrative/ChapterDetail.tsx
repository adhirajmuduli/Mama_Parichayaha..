import LiquidGlassButton from '@/components/liquid-glass/LiquidGlassButton'
import type { ChapterContent } from '@/content/portfolio'

const statusLabels = {
  active: 'Active',
  completed: 'Completed',
  experimental: 'Experimental',
} as const

interface ChapterDetailProps {
  chapter: ChapterContent
}

export default function ChapterDetail({ chapter }: ChapterDetailProps) {
  const detailHeadingId = `${chapter.id}-detail-heading`

  return (
    <div className="mt-8 border-t border-white/15 pt-6">
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
      {chapter.actions.length > 0 ? (
        <div className="mt-6 flex flex-wrap gap-3" aria-label={`${chapter.title} links`}>
          {chapter.actions.map((action) => (
            <LiquidGlassButton
              key={action.href}
              href={action.href}
              {...(action.external ? { rel: 'noreferrer', target: '_blank' } : {})}
            >
              {action.label}
            </LiquidGlassButton>
          ))}
        </div>
      ) : null}
    </div>
  )
}
