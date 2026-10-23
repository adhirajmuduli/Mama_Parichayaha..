'use client'

/**
 * RotatingText — adapted from React Bits (MIT), trimmed to the verified flip
 * variant and re-tooled for our tokens. Upstream semantics preserved:
 * grapheme-aware segmentation (Intl.Segmenter), staggered per-character
 * springs, sr-only mirror of the current phrase. Attribution:
 * docs/assets/fx-attributions.md (pending P11).
 *
 * HYDRATION SAFETY (a P7 finding): the rendered MARKUP must be identical
 * server-side and on the first client render — motion's useReducedMotion()
 * cannot influence what renders, only how it animates (MotionConfig's
 * reducedMotion="user" converts springs to instant transitions for reduced
 * users). A reduced-branch in the first render caused React #418 and a
 * full-root remount.
 */

import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'

interface RotatingTextProps {
  /** Phrases to cycle through (≥2, validated upstream of this component). */
  texts: string[]
  /** Per-phrase display time in ms (excludes enter/exit). */
  interval?: number
  /** Per-character stagger in ms. */
  stagger?: number
  className?: string
  /** Class for the animated word container. */
  wordClassName?: string
  /** Optional static label rendered before the cycling word. */
  prefix?: ReactNode
  style?: CSSProperties
}

const STAGGER_DEFAULT = 0.025
const INTERVAL_DEFAULT = 2600

function splitGraphemes(text: string): string[] {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' })
    return Array.from(segmenter.segment(text), (segment) => segment.segment)
  }

  return Array.from(text)
}

export function RotatingText({
  texts,
  interval = INTERVAL_DEFAULT,
  stagger = STAGGER_DEFAULT,
  className = '',
  wordClassName = '',
  prefix,
  style,
}: RotatingTextProps) {
  const [index, setIndex] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const current = texts[index] ?? ''
  const characters = useMemo(() => splitGraphemes(current), [current])

  useEffect(() => {
    if (texts.length < 2) {
      return
    }

    const cycle = () => {
      timerRef.current = setTimeout(() => {
        setIndex((previous) => (previous + 1) % texts.length)
        cycle()
      }, interval)
    }

    cycle()

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [texts, interval])

  return (
    <MotionConfig reducedMotion="user">
      <span className={`fx-rotating ${className}`.trim()} style={style}>
        {prefix ? <span className="fx-rotating__prefix">{prefix}</span> : null}
        <span className="fx-rotating__viewport" aria-hidden="true">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={current}
              className={`fx-rotating__word ${wordClassName}`.trim()}
              initial={{ opacity: 0, y: '0.45em', filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: '-0.45em', filter: 'blur(4px)' }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              {characters.map((character, characterIndex) => (
                <motion.span
                  key={`${current}-${characterIndex}-${character}`}
                  initial={{ opacity: 0, y: '0.45em' }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: '-0.45em' }}
                  transition={{
                    duration: 0.22,
                    ease: [0.22, 1, 0.36, 1],
                    delay: characterIndex * stagger,
                  }}
                >
                  {character}
                </motion.span>
              ))}
            </motion.span>
          </AnimatePresence>
        </span>
        {/* Screen readers hear the stable current phrase, never the flicker. */}
        <span className="fx-rotating__sr">{current}</span>
      </span>
    </MotionConfig>
  )
}
