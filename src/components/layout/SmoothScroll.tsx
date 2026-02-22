import { useEffect, useRef, type ReactNode } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '../../lib/gsap-config'

interface SmoothScrollProps {
  children: ReactNode
}

// Expose lenis instance globally for navigation
let lenisInstance: Lenis | null = null
export function getLenis() {
  return lenisInstance
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
    })

    lenisRef.current = lenis
    lenisInstance = lenis

    lenis.on('scroll', ScrollTrigger.update)

    gsap.ticker.add((time: number) => {
      lenis.raf(time * 1000)
    })
    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.destroy()
      lenisInstance = null
    }
  }, [])

  return <>{children}</>
}
