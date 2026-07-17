export default function Loading() {
  return (
    <main
      aria-busy="true"
      className="grid min-h-screen place-items-center bg-[#07020f] px-6 text-center text-zinc-100"
    >
      <p
        role="status"
        aria-label="Loading portfolio"
        className="text-sm tracking-[0.2em] text-violet-200"
      >
        Loading portfolio
      </p>
    </main>
  )
}
