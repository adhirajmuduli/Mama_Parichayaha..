export default function ScenePoster() {
  return (
    <div aria-hidden="true" className="fixed inset-0 z-0 overflow-hidden bg-[#07020f]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_18%,rgba(124,58,237,0.28),transparent_36%),radial-gradient(circle_at_78%_62%,rgba(8,145,178,0.18),transparent_42%),linear-gradient(145deg,#07020f_0%,#0d0920_52%,#07020f_100%)]" />
      <div className="absolute left-[12%] top-[18%] h-72 w-72 rounded-full border border-violet-300/10 shadow-[0_0_120px_rgba(124,58,237,0.15)]" />
      <div className="absolute bottom-[14%] right-[10%] h-48 w-48 rounded-full border border-cyan-200/10 shadow-[0_0_100px_rgba(34,211,238,0.1)]" />
    </div>
  )
}
