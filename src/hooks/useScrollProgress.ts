"use client"

import { useEffect, useState } from "react"

export default function useScrollProgress() {
  const [scrollProgress, setScrollProgress] =
    useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop =
        window.scrollY

      const docHeight =
        document.body.scrollHeight -
        window.innerHeight

      const progress =
        scrollTop / docHeight

      setScrollProgress(progress)
    }

    handleScroll()

    window.addEventListener(
      "scroll",
      handleScroll
    )

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      )
    }
  }, [])

  return scrollProgress
}