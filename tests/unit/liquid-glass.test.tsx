import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import LiquidGlass from '@/components/liquid-glass/LiquidGlass'
import LiquidGlassButton from '@/components/liquid-glass/LiquidGlassButton'
import LiquidGlassPanel from '@/components/liquid-glass/LiquidGlassPanel'
import LiquidGlassPointerTracker from '@/components/liquid-glass/LiquidGlassPointerTracker'

function createMediaQueryList(matches: boolean): MediaQueryList {
  return {
    addEventListener: vi.fn(),
    addListener: vi.fn(),
    dispatchEvent: vi.fn(),
    matches,
    media: '',
    onchange: null,
    removeEventListener: vi.fn(),
    removeListener: vi.fn(),
  }
}

describe('liquid-glass primitives', () => {
  it('renders semantic bounded surfaces with an explicit opaque fallback', () => {
    render(
      <LiquidGlass
        as="section"
        accent="oklch(0.8 0.15 290)"
        aria-label="Fallback surface"
        forceFallback
        interactive={false}
      >
        <h2>Readable fallback</h2>
      </LiquidGlass>,
    )

    const surface = screen.getByRole('region', { name: 'Fallback surface' })

    expect(surface).toHaveAttribute('data-liquid-glass', 'true')
    expect(surface).toHaveAttribute('data-glass-fallback', 'true')
    expect(surface).toHaveAttribute('data-glass-interactive', 'false')
    expect(surface.style.getPropertyValue('--glass-accent')).toBe('oklch(0.8 0.15 290)')
    expect(screen.getByRole('heading', { name: 'Readable fallback' })).toBeInTheDocument()
  })

  it('keeps button links accessible without adding a nested backdrop-filter surface', () => {
    render(
      <LiquidGlassPanel>
        <LiquidGlassButton href="https://example.com" target="_blank">
          External profile
        </LiquidGlassButton>
      </LiquidGlassPanel>,
    )

    const link = screen.getByRole('link', { name: 'External profile' })

    expect(link).toHaveAttribute('href', 'https://example.com')
    expect(link).toHaveAttribute('rel', 'noreferrer')
    expect(link.closest('[data-liquid-glass]')).not.toBe(link)
  })

  it('writes bounded fine-pointer coordinates to the active surface without React state', () => {
    const reducedMotion = createMediaQueryList(false)
    const finePointer = createMediaQueryList(true)
    const matchMedia = vi
      .spyOn(window, 'matchMedia')
      .mockImplementation((query) =>
        query.includes('reduced-motion') ? reducedMotion : finePointer,
      )

    render(
      <>
        <LiquidGlass aria-label="Pointer surface">
          <span>Pointer content</span>
        </LiquidGlass>
        <LiquidGlassPointerTracker />
      </>,
    )

    const surface = screen.getByLabelText('Pointer surface')
    vi.spyOn(surface, 'getBoundingClientRect').mockReturnValue({
      bottom: 70,
      height: 50,
      left: 10,
      right: 110,
      toJSON: () => ({}),
      top: 20,
      width: 100,
      x: 10,
      y: 20,
    })

    surface.dispatchEvent(
      new MouseEvent('pointermove', { bubbles: true, clientX: 35, clientY: 45 }),
    )

    expect(surface.style.getPropertyValue('--glass-pointer-x')).toBe('25%')
    expect(surface.style.getPropertyValue('--glass-pointer-y')).toBe('50%')

    matchMedia.mockRestore()
  })
  it('does not install pointer tracking when reduced motion is requested', () => {
    const reducedMotion = createMediaQueryList(true)
    const finePointer = createMediaQueryList(true)
    const matchMedia = vi
      .spyOn(window, 'matchMedia')
      .mockImplementation((query) =>
        query.includes('reduced-motion') ? reducedMotion : finePointer,
      )
    const addEventListener = vi.spyOn(window, 'addEventListener')

    const { unmount } = render(<LiquidGlassPointerTracker />)

    expect(addEventListener.mock.calls.some(([event]) => event === 'pointermove')).toBe(false)

    unmount()
    matchMedia.mockRestore()
    addEventListener.mockRestore()
  })
})
