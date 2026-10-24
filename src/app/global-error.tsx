'use client'

interface GlobalErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalErrorPage({ reset }: GlobalErrorPageProps) {
  return (
    <html lang="en">
      <body
        style={{ background: '#05070D', color: '#F2EEE9', fontFamily: 'system-ui, sans-serif' }}
      >
        <main
          style={{
            alignItems: 'center',
            display: 'grid',
            minHeight: '100vh',
            padding: '1.5rem',
            placeItems: 'center',
            textAlign: 'center',
          }}
        >
          <div style={{ maxWidth: '32rem' }}>
            <p style={{ color: '#D97745', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              Portfolio error
            </p>
            <h1>The portfolio could not be loaded.</h1>
            <p>Retry to restore the current portfolio view.</p>
            <button
              type="button"
              onClick={reset}
              style={{
                background: 'rgba(217, 119, 69, 0.22)',
                border: '1px solid rgba(217, 119, 69, 0.55)',
                borderRadius: '0.375rem',
                color: 'inherit',
                fontWeight: 500,
                padding: '0.5rem 1rem',
              }}
            >
              Retry
            </button>
          </div>
        </main>
      </body>
    </html>
  )
}
