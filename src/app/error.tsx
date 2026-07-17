'use client'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#07020f] px-6 text-center text-zinc-100">
      <div className="max-w-md space-y-5">
        <p className="text-sm uppercase tracking-[0.28em] text-violet-200">Portfolio error</p>
        <h1 className="text-4xl font-semibold">The current view could not be loaded.</h1>
        <p className="leading-relaxed text-zinc-300">
          Your navigation and portfolio content remain available after a retry.
        </p>
        <button
          type="button"
          className="rounded-md bg-white px-4 py-2 font-medium text-slate-950 outline-offset-4 focus-visible:outline-2 focus-visible:outline-violet-300"
          onClick={reset}
        >
          Retry
        </button>
      </div>
    </main>
  )
}
