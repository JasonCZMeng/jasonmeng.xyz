import { useEffect, useRef } from 'react'
import { useMediaQuery } from '../../hooks/useMediaQuery'

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const isPointerFine = useMediaQuery('(pointer: fine)')
  const pos = useRef({ x: 0, y: 0 })
  const ringPos = useRef({ x: 0, y: 0 })
  const isHovering = useRef(false)

  useEffect(() => {
    if (!isPointerFine) return

    document.documentElement.classList.add('custom-cursor-active')

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY }
    }

    const onEnterInteractive = () => {
      isHovering.current = true
      if (ringRef.current) {
        ringRef.current.style.width = '60px'
        ringRef.current.style.height = '60px'
        ringRef.current.style.borderColor = 'var(--color-accent)'
        ringRef.current.style.opacity = '0.5'
      }
    }

    const onLeaveInteractive = () => {
      isHovering.current = false
      if (ringRef.current) {
        ringRef.current.style.width = '40px'
        ringRef.current.style.height = '40px'
        ringRef.current.style.borderColor = 'var(--color-text-secondary)'
        ringRef.current.style.opacity = '0.4'
      }
    }

    window.addEventListener('mousemove', onMove)

    // Observe interactive elements
    const interactives = document.querySelectorAll('a, button, [data-hover]')
    interactives.forEach((el) => {
      el.addEventListener('mouseenter', onEnterInteractive)
      el.addEventListener('mouseleave', onLeaveInteractive)
    })

    // Use MutationObserver to handle dynamically added elements
    const observer = new MutationObserver(() => {
      const newInteractives = document.querySelectorAll('a, button, [data-hover]')
      newInteractives.forEach((el) => {
        el.addEventListener('mouseenter', onEnterInteractive)
        el.addEventListener('mouseleave', onLeaveInteractive)
      })
    })
    observer.observe(document.body, { childList: true, subtree: true })

    // Animation loop
    let rafId: number
    const animate = () => {
      // Dot follows exactly
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${pos.current.x - 3}px, ${pos.current.y - 3}px)`
      }

      // Ring follows with lerp
      ringPos.current.x += (pos.current.x - ringPos.current.x) * 0.15
      ringPos.current.y += (pos.current.y - ringPos.current.y) * 0.15

      if (ringRef.current) {
        const size = isHovering.current ? 60 : 40
        ringRef.current.style.transform = `translate(${ringPos.current.x - size / 2}px, ${ringPos.current.y - size / 2}px)`
      }

      rafId = requestAnimationFrame(animate)
    }
    rafId = requestAnimationFrame(animate)

    return () => {
      document.documentElement.classList.remove('custom-cursor-active')
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafId)
      observer.disconnect()
      interactives.forEach((el) => {
        el.removeEventListener('mouseenter', onEnterInteractive)
        el.removeEventListener('mouseleave', onLeaveInteractive)
      })
    }
  }, [isPointerFine])

  if (!isPointerFine) return null

  return (
    <>
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[9998] h-[6px] w-[6px] rounded-full bg-text-primary mix-blend-difference"
        style={{ willChange: 'transform' }}
      />
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[9997] h-[40px] w-[40px] rounded-full border border-text-secondary opacity-40 transition-[width,height,border-color,opacity] duration-300"
        style={{ willChange: 'transform' }}
      />
    </>
  )
}
