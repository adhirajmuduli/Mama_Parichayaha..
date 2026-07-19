import { ImageResponse } from 'next/og'

export const alt = 'Adhiraj Muduli biological sciences portfolio'
export const contentType = 'image/png'
export const size = {
  width: 1200,
  height: 630,
}

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        alignItems: 'center',
        backgroundColor: '#07020f',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        justifyContent: 'center',
        overflow: 'hidden',
        padding: '88px',
        position: 'relative',
        width: '100%',
      }}
    >
      <div
        style={{
          backgroundColor: '#7c3aed',
          borderRadius: 9999,
          display: 'flex',
          height: 340,
          left: -100,
          opacity: 0.42,
          position: 'absolute',
          top: -130,
          width: 340,
        }}
      />
      <div
        style={{
          backgroundColor: '#0e7490',
          borderRadius: 9999,
          bottom: -170,
          display: 'flex',
          height: 420,
          opacity: 0.4,
          position: 'absolute',
          right: -110,
          width: 420,
        }}
      />
      <div style={{ color: '#c4b5fd', display: 'flex', fontSize: 28, letterSpacing: 8 }}>
        BIOLOGICAL SCIENCES
      </div>
      <div style={{ display: 'flex', fontSize: 76, fontWeight: 700, marginTop: 32 }}>
        Adhiraj Muduli
      </div>
      <div
        style={{ color: '#dbeafe', display: 'flex', fontSize: 32, lineHeight: 1.35, marginTop: 30 }}
      >
        Molecular systems · Computation · Scientific visualization
      </div>
    </div>,
    size,
  )
}
