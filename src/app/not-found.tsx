import Link from 'next/link'

export default function NotFound() {
  return (
    <main
      className="grid min-h-screen place-items-center px-6 text-center"
      style={{ background: '#05070D', color: 'oklch(0.95 0.005 85)' }}
    >
      <div className="max-w-md space-y-5">
        <p className="text-sm uppercase" style={{ letterSpacing: '0.28em', color: '#D97745' }}>
          404
        </p>
        <h1 className="text-4xl font-semibold">This page is not part of the portfolio.</h1>
        <p className="leading-relaxed" style={{ color: 'oklch(0.78 0.015 78)' }}>
          Return to the biological sciences portfolio to continue exploring the current chapters.
        </p>
        <Link
          href="/#origins"
          className="inline-flex rounded-md px-4 py-2 font-medium outline-offset-4 focus-visible:outline-2"
          style={{
            background: 'rgba(217, 119, 69, 0.22)',
            border: '1px solid rgba(217, 119, 69, 0.55)',
            color: 'oklch(0.95 0.005 85)',
          }}
        >
          Return to origins
        </Link>
      </div>
    </main>
  )
}
