'use client'

interface GlobalErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalErrorPage({ reset }: GlobalErrorPageProps) {
  return (
    <html lang="en">
      <body
        style={{ background: '#07020f', color: '#f4f4f5', fontFamily: 'system-ui, sans-serif' }}
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
            <p style={{ color: '#ddd6fe', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              Portfolio error
            </p>
            <h1>The portfolio could not be loaded.</h1>
            <p>Retry to restore the current portfolio view.</p>
            <button type="button" onClick={reset}>
              Retry
            </button>
          </div>
        </main>
      </body>
    </html>
  )
}
