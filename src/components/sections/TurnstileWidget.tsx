'use client'

import Script from 'next/script'
import { useEffect, useRef, useState } from 'react'

interface TurnstileRenderOptions {
  callback: (token: string) => void
  'error-callback': () => void
  'expired-callback': () => void
  sitekey: string
  theme: 'light'
}

declare global {
  interface Window {
    turnstile?: {
      remove(widgetId: string): void
      render(container: HTMLElement, options: TurnstileRenderOptions): string
    }
  }
}

interface TurnstileWidgetProps {
  onTokenChange: (token: string) => void
  siteKey: string
}

export default function TurnstileWidget({ onTokenChange, siteKey }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const onTokenChangeRef = useRef(onTokenChange)
  const widgetIdRef = useRef<string | null>(null)
  const [isClientReady, setIsClientReady] = useState(false)
  const [isScriptReady, setIsScriptReady] = useState(
    () => typeof window !== 'undefined' && Boolean(window.turnstile),
  )

  useEffect(() => {
    onTokenChangeRef.current = onTokenChange
  }, [onTokenChange])

  useEffect(() => {
    setIsClientReady(true)
  }, [])

  useEffect(() => {
    if (!isScriptReady || !containerRef.current || !window.turnstile || widgetIdRef.current) {
      return
    }

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      theme: 'light',
      callback: (token) => onTokenChangeRef.current(token),
      'error-callback': () => onTokenChangeRef.current(''),
      'expired-callback': () => onTokenChangeRef.current(''),
    })

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
      }

      widgetIdRef.current = null
    }
  }, [isScriptReady, siteKey])

  return (
    <div>
      {isClientReady ? (
        <Script
          id="cloudflare-turnstile"
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="afterInteractive"
          onLoad={() => setIsScriptReady(true)}
        />
      ) : null}
      <div ref={containerRef} role="group" aria-label="Spam protection" className="min-h-[65px]" />
    </div>
  )
}
