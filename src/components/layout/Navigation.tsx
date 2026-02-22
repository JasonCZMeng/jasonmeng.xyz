import { useState, useEffect } from 'react'
import { SECTIONS } from '../../lib/constants'
import { getLenis } from './SmoothScroll'
import { useIsDesktop } from '../../hooks/useMediaQuery'
import { Menu, X } from 'lucide-react'

export default function Navigation() {
  const [activeSection, setActiveSection] = useState('hero')
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const isDesktop = useIsDesktop()

  useEffect(() => {
    const observers: IntersectionObserver[] = []

    SECTIONS.forEach((section) => {
      const el = document.getElementById(section.id)
      if (!el) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(section.id)
          }
        },
        { threshold: 0.3 }
      )

      observer.observe(el)
      observers.push(observer)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [])

  const scrollTo = (id: string) => {
    const lenis = getLenis()
    const el = document.getElementById(id)
    if (lenis && el) {
      lenis.scrollTo(el, { offset: 0 })
    }
    setMobileOpen(false)
  }

  // Desktop: floating side dots
  if (isDesktop) {
    return (
      <nav className="fixed right-6 top-1/2 z-50 -translate-y-1/2">
        <ul className="flex flex-col gap-4">
          {SECTIONS.map((section, i) => {
            const isActive = activeSection === section.id
            return (
              <li
                key={section.id}
                className="relative flex items-center justify-end"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Label */}
                <span
                  className="absolute right-8 whitespace-nowrap font-mono text-xs tracking-wider text-text-secondary transition-all duration-300"
                  style={{
                    opacity: hoveredIndex === i ? 1 : 0,
                    transform: hoveredIndex === i ? 'translateX(0)' : 'translateX(8px)',
                  }}
                >
                  {section.label}
                </span>

                {/* Dot */}
                <button
                  onClick={() => scrollTo(section.id)}
                  className="group relative flex h-4 w-4 items-center justify-center"
                  aria-label={`Navigate to ${section.label}`}
                >
                  <span
                    className="block rounded-full transition-all duration-300"
                    style={{
                      width: isActive ? 10 : 6,
                      height: isActive ? 10 : 6,
                      backgroundColor: isActive ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
                      boxShadow: isActive ? '0 0 10px var(--color-accent), 0 0 20px var(--color-accent)' : 'none',
                    }}
                  />
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    )
  }

  // Mobile: hamburger menu
  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed right-4 top-4 z-[60] flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface/80 backdrop-blur-md"
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Fullscreen overlay */}
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg/95 backdrop-blur-lg transition-all duration-500"
        style={{
          opacity: mobileOpen ? 1 : 0,
          pointerEvents: mobileOpen ? 'auto' : 'none',
          transform: mobileOpen ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        <ul className="flex flex-col gap-6">
          {SECTIONS.map((section, i) => (
            <li key={section.id}>
              <button
                onClick={() => scrollTo(section.id)}
                className="font-mono text-2xl tracking-wider text-text-secondary transition-colors hover:text-accent"
                style={{
                  transitionDelay: mobileOpen ? `${i * 50}ms` : '0ms',
                  opacity: mobileOpen ? 1 : 0,
                  transform: mobileOpen ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
                }}
              >
                {section.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
