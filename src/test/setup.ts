import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(() => {
  cleanup()
})

Object.defineProperty(window, 'matchMedia', {
  configurable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    addEventListener: vi.fn(),
    addListener: vi.fn(),
    dispatchEvent: vi.fn(),
    matches: false,
    media: query,
    onchange: null,
    removeEventListener: vi.fn(),
    removeListener: vi.fn(),
  })),
  writable: true,
})

Object.defineProperty(window, 'IntersectionObserver', {
  configurable: true,
  value: class {
    disconnect = vi.fn()
    observe = vi.fn()
    takeRecords = vi.fn(() => [])
    unobserve = vi.fn()
  },
  writable: true,
})
