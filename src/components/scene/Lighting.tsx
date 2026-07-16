export default function Lighting() {
  return (
    <>
      {/* GLOBAL SOFT LIGHT */}
      <ambientLight intensity={0.51} />

      {/* MAIN PURPLE TOP LIGHT */}
      <directionalLight position={[0, 6, 4]} intensity={4} color="#c084fc" />

      {/* ORANGE SIDE ACCENT */}
      <pointLight position={[-5, -1, 3]} intensity={18} color="#f97316" />

      {/* PURPLE ATMOSPHERIC RIM */}
      <pointLight position={[3, 2, -4]} intensity={15} color="#7c3aed" />
    </>
  )
}
