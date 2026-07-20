import { NextResponse } from 'next/server'

import { getContactRuntimeConfig, isContactDeliveryEnabled } from '@/lib/contact/config'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export function GET() {
  const { config } = getContactRuntimeConfig()

  return NextResponse.json(
    {
      contact: !isContactDeliveryEnabled() ? 'disabled' : config ? 'configured' : 'unavailable',
      status: 'ok',
    },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'Content-Type': 'application/json; charset=utf-8',
      },
    },
  )
}
