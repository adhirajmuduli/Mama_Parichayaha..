import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import ErrorPage from '@/app/error'
import Loading from '@/app/loading'
import NotFound from '@/app/not-found'

describe('route recovery surfaces', () => {
  it('renders a labelled loading status', () => {
    render(<Loading />)

    expect(screen.getByRole('status', { name: 'Loading portfolio' })).toBeInTheDocument()
  })

  it('renders a return path for unknown routes', () => {
    render(<NotFound />)

    expect(
      screen.getByRole('heading', { name: 'This page is not part of the portfolio.' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Return to origins' })).toHaveAttribute(
      'href',
      '/#origins',
    )
  })

  it('retries an application error only after explicit user activation', () => {
    const reset = vi.fn()

    render(<ErrorPage error={new Error('test')} reset={reset} />)
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))

    expect(reset).toHaveBeenCalledTimes(1)
  })
})
