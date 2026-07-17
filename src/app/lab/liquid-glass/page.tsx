import type { Metadata } from 'next'

import LiquidGlass from '@/components/liquid-glass/LiquidGlass'
import LiquidGlassButton from '@/components/liquid-glass/LiquidGlassButton'
import LiquidGlassPanel from '@/components/liquid-glass/LiquidGlassPanel'
import LiquidGlassPointerTracker from '@/components/liquid-glass/LiquidGlassPointerTracker'

export const metadata: Metadata = {
  title: 'Liquid Glass Harness | Adhiraj Muduli',
  robots: { index: false, follow: false },
}

export default function LiquidGlassHarnessPage() {
  return (
    <main className="relative z-10 min-h-screen px-6 py-16 text-[var(--site-foreground)] sm:px-12">
      <LiquidGlassPointerTracker />
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 max-w-3xl">
          <p className="text-sm uppercase tracking-[0.3em] text-violet-200">Component harness</p>
          <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">Liquid-glass states</h1>
          <p className="mt-4 text-[var(--site-muted)]">
            Isolated references for the bounded surface, opaque fallback, keyboard focus, disabled,
            loading, and responsive compositions.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2" aria-label="Liquid-glass component states">
          <LiquidGlassPanel aria-labelledby="glass-default" data-glass-state="default">
            <h2 id="glass-default" className="text-2xl font-semibold">
              Default surface
            </h2>
            <p className="mt-3 text-[var(--site-muted)]">
              Pointer-responsive highlights are scoped to this bounded panel.
            </p>
          </LiquidGlassPanel>

          <LiquidGlassPanel
            aria-labelledby="glass-fallback"
            data-glass-state="fallback"
            forceFallback
          >
            <h2 id="glass-fallback" className="text-2xl font-semibold">
              Opaque fallback
            </h2>
            <p className="mt-3 text-[var(--site-muted)]">
              Contrast-first mode removes blur and decorative layers.
            </p>
          </LiquidGlassPanel>

          <LiquidGlassPanel
            aria-labelledby="glass-loading"
            aria-busy="true"
            data-glass-state="loading"
          >
            <h2 id="glass-loading" className="text-2xl font-semibold">
              Loading state
            </h2>
            <p className="mt-3 text-[var(--site-muted)]">
              Content remains readable while data resolves.
            </p>
          </LiquidGlassPanel>

          <LiquidGlass
            as="section"
            aria-labelledby="glass-controls"
            data-glass-state="controls"
            className="p-8"
          >
            <h2 id="glass-controls" className="text-2xl font-semibold">
              Focus and disabled controls
            </h2>
            <div className="mt-5 flex flex-wrap gap-3">
              <LiquidGlassButton href="#glass-controls">Focusable action</LiquidGlassButton>
              <span
                aria-disabled="true"
                className="inline-flex cursor-not-allowed rounded-xl border border-white/15 px-4 py-2 text-[var(--site-muted)] opacity-60"
              >
                Disabled action
              </span>
            </div>
          </LiquidGlass>
        </section>
      </div>
    </main>
  )
}
