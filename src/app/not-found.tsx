import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#07020f] px-6 text-center text-zinc-100">
      <div className="max-w-md space-y-5">
        <p className="text-sm uppercase tracking-[0.28em] text-violet-200">404</p>
        <h1 className="text-4xl font-semibold">This page is not part of the portfolio.</h1>
        <p className="leading-relaxed text-zinc-300">
          Return to the biological sciences portfolio to continue exploring the current chapters.
        </p>
        <Link
          href="/#origins"
          className="inline-flex rounded-md bg-white px-4 py-2 font-medium text-slate-950 outline-offset-4 focus-visible:outline-2 focus-visible:outline-violet-300"
        >
          Return to origins
        </Link>
      </div>
    </main>
  )
}
