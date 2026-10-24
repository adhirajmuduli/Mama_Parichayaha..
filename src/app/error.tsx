'use client'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <main
      className="grid min-h-screen place-items-center px-6 text-center"
      style={{ background: '#05070D', color: 'oklch(0.95 0.005 85)' }}
    >
      <div className="max-w-md space-y-5">
        <p className="text-sm uppercase" style={{ letterSpacing: '0.28em', color: '#D97745' }}>
          Portfolio error
        </p>
        <h1 className="text-4xl font-semibold">The current view could not be loaded.</h1>
        <p className="leading-relaxed" style={{ color: 'oklch(0.78 0.015 78)' }}>
          Your navigation and portfolio content remain available after a retry.
        </p>
        <button
          type="button"
          className="rounded-md px-4 py-2 font-medium outline-offset-4 focus-visible:outline-2"
          style={{
            background: 'rgba(217, 119, 69, 0.22)',
            border: '1px solid rgba(217, 119, 69, 0.55)',
            color: 'oklch(0.95 0.005 85)',
          }}
          onClick={reset}
        >
          Retry
        </button>
      </div>
    </main>
  )
}
