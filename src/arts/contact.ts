import {
  artworkSource,
  box,
  clearArtwork,
  createArtworkBuffer,
  ellipse,
  finishArtwork,
  line,
  put,
  shadedEllipse,
  writeText,
} from './shared'

// bg, channel, sender, packets, handshake, endpoint
const palette = ['#071B1C', '#0E3A38', '#43D9C1', '#79B8FF', '#F3BC69', '#D6FFF4']
const buffer = createArtworkBuffer(palette)

const SENDER = { x: 16, y: 16 }
const ENDPOINT = { x: 82, y: 16 }
const CHANNEL_Y = 16

function render(index: number, elapsedMs: number) {
  clearArtwork(buffer)
  const time = elapsedMs / 1000

  writeText(buffer, 2, 1, '07 / CONTACT  -  SIGNAL EXCHANGE', 2)

  // Sender: a small station with an antenna.
  shadedEllipse(buffer, SENDER.x, SENDER.y, 4, 2.4, 2, time * 0.5)
  ellipse(buffer, SENDER.x, SENDER.y, 5, 3, 'o', 2, 0)
  put(buffer, SENDER.x, SENDER.y, '@', 5)
  line(buffer, SENDER.x, SENDER.y - 3, SENDER.x, SENDER.y - 6, '|', 2)
  for (let wave = 0; wave < 3; wave += 1) {
    const radius = 2 + ((time * 3 + wave) % 3)
    put(buffer, SENDER.x - radius, SENDER.y - 6 - radius * 0.5, '(', 2)
    put(buffer, SENDER.x + radius, SENDER.y - 6 - radius * 0.5, ')', 2)
  }
  writeText(buffer, SENDER.x - 4, SENDER.y + 5, 'SENDER', 2)

  // Open endpoint: a receiving dish with an open gate.
  ellipse(buffer, ENDPOINT.x, ENDPOINT.y, 5, 3, 'o', 2, 0)
  shadedEllipse(buffer, ENDPOINT.x, ENDPOINT.y, 3, 1.8, 2, -time * 0.4)
  line(buffer, ENDPOINT.x, ENDPOINT.y - 3, ENDPOINT.x, ENDPOINT.y - 6, '|', 2)
  put(buffer, ENDPOINT.x + 4, ENDPOINT.y - 2, '>', 4)
  put(buffer, ENDPOINT.x + 5, ENDPOINT.y - 1, '>', 4)
  put(buffer, ENDPOINT.x + 6, ENDPOINT.y, '>', 4)
  writeText(buffer, ENDPOINT.x - 6, ENDPOINT.y + 5, 'OPEN ENDPOINT', 2)

  // Channel between them: a bordered conduit.
  line(buffer, SENDER.x + 7, CHANNEL_Y - 3, ENDPOINT.x - 7, CHANNEL_Y - 3, '=', 1)
  line(buffer, SENDER.x + 7, CHANNEL_Y + 3, ENDPOINT.x - 7, CHANNEL_Y + 3, '=', 1)
  for (let x = SENDER.x + 7; x <= ENDPOINT.x - 7; x += 4) {
    put(buffer, x, CHANNEL_Y - 3, '+', 1)
    put(buffer, x, CHANNEL_Y + 3, '+', 1)
  }
  writeText(buffer, 40, CHANNEL_Y - 5, 'CLEAR ROUTE', 1)

  // Packets travel the channel left to right; handshake replies right to left.
  const forward = (time * 0.5) % 1
  const reply = (time * 0.5 + 0.5) % 1
  for (let p = 0; p < 3; p += 1) {
    const progress = (forward + p * 0.33) % 1
    const x = SENDER.x + 8 + progress * (ENDPOINT.x - SENDER.x - 16)
    put(buffer, x, CHANNEL_Y, '◆', 3)
    put(buffer, x - 1, CHANNEL_Y, '.', 3)
  }
  for (let p = 0; p < 2; p += 1) {
    const progress = (reply + p * 0.5) % 1
    const x = ENDPOINT.x - 8 - progress * (ENDPOINT.x - SENDER.x - 16)
    put(buffer, x, CHANNEL_Y + 1, '◇', 4)
  }

  // Readout: handshake state machine cycling SYN -> ACK -> OPEN.
  const phase = Math.floor(time / 2) % 3
  const states = ['SYN', 'ACK', 'OPEN']
  box(buffer, 38, 24, 22, 6, 5)
  writeText(buffer, 40, 25, 'HANDSHAKE', 5)
  writeText(
    buffer,
    40,
    27,
    states.map((s, i) => (i <= phase ? s : '...')).join(' > '),
    i0Color(phase),
  )
  writeText(buffer, 40, 28, phase === 2 ? 'ROUTE OPEN - NO MESSAGE STORED' : 'establishing...', 1)

  // Ambient particles.
  for (let dot = 0; dot < 14; dot += 1) {
    const x = 4 + ((dot * 31 + index) % 88)
    const y = 4 + ((dot * 13 + Math.floor(time * 2)) % 8)
    if (y > 22) continue
    if (buffer.chars[y * buffer.cols + x] === ' ') put(buffer, x, y, '.', 1)
  }

  writeText(buffer, 2, 32, 'SIGNAL  /  HANDSHAKE  /  OPEN ROUTE', 2)
  return finishArtwork(buffer)
}

function i0Color(phase: number): number {
  return phase === 2 ? 3 : 4
}

export const contactArtwork = artworkSource(
  'contact',
  'Signal exchange',
  'A sender station and an open endpoint joined by a clear route: packet diamonds travel forward, handshake replies travel back, and a state readout cycles SYN > ACK > OPEN with a no-storage note.',
  palette,
  render,
)
