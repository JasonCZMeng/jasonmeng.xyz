import { useEffect, useRef } from 'react'
import { gsap } from '../../lib/gsap-config'
import { SITE } from '../../lib/constants'
import { useReducedMotion } from '../../hooks/useMediaQuery'

export default function About() {
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const linesRef = useRef<HTMLDivElement>(null)
  const blobRef = useRef<SVGSVGElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion) return

    const ctx = gsap.context(() => {
      // Heading slide in
      if (headingRef.current) {
        gsap.fromTo(
          headingRef.current,
          { opacity: 0, x: -60 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            scrollTrigger: {
              trigger: headingRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      }

      // Text lines reveal
      const lines = linesRef.current?.querySelectorAll('.reveal-line')
      if (lines) {
        lines.forEach((line) => {
          gsap.fromTo(
            line,
            { opacity: 0, y: 40, clipPath: 'inset(100% 0 0 0)' },
            {
              opacity: 1,
              y: 0,
              clipPath: 'inset(0% 0 0 0)',
              duration: 0.8,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: line,
                start: 'top 85%',
                toggleActions: 'play none none reverse',
              },
            }
          )
        })
      }

      // Blob animation
      if (blobRef.current) {
        gsap.to(blobRef.current, {
          rotation: 360,
          duration: 40,
          repeat: -1,
          ease: 'none',
        })

        gsap.fromTo(
          blobRef.current,
          { scale: 0.8, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 1,
            scrollTrigger: {
              trigger: blobRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center gap-12 px-6 py-24 lg:flex-row lg:gap-16"
    >
      {/* Text column */}
      <div className="flex-1">
        <h2
          ref={headingRef}
          className="mb-8 font-mono text-sm font-semibold uppercase tracking-[0.3em] text-accent"
        >
          About
        </h2>

        <div ref={linesRef} className="space-y-6">
          <p className="reveal-line text-lg leading-relaxed text-text-secondary sm:text-xl">
            {SITE.bio}
          </p>
          {SITE.aboutParagraphs.map((p, i) => (
            <p
              key={i}
              className="reveal-line text-base leading-relaxed text-text-secondary sm:text-lg"
            >
              {p}
            </p>
          ))}
          <div className="reveal-line flex items-center gap-3 border-l-2 border-accent/30 pl-4 font-mono text-sm text-text-tertiary">
            <span>{SITE.education.school}</span>
            <span className="text-accent">&mdash;</span>
            <span>{SITE.education.degree}</span>
          </div>
        </div>
      </div>

      {/* Blob column */}
      <div className="flex flex-1 items-center justify-center">
        <svg
          ref={blobRef}
          viewBox="0 0 200 200"
          className="h-64 w-64 opacity-0 sm:h-80 sm:w-80 lg:h-96 lg:w-96"
        >
          <defs>
            <linearGradient id="blobGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--color-accent)" />
              <stop offset="50%" stopColor="var(--color-accent-secondary)" />
              <stop offset="100%" stopColor="var(--color-accent-tertiary)" />
            </linearGradient>
            <filter id="blobGlow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            d="M 100 20 C 140 20, 180 50, 180 100 C 180 150, 140 180, 100 180 C 60 180, 20 150, 20 100 C 20 50, 60 20, 100 20 Z"
            fill="url(#blobGradient)"
            opacity="0.15"
            filter="url(#blobGlow)"
          >
            <animate
              attributeName="d"
              dur="8s"
              repeatCount="indefinite"
              values="
                M 100 20 C 140 20, 180 50, 180 100 C 180 150, 140 180, 100 180 C 60 180, 20 150, 20 100 C 20 50, 60 20, 100 20 Z;
                M 100 30 C 150 10, 190 60, 175 105 C 160 155, 130 190, 95 175 C 50 170, 15 140, 25 95 C 30 50, 55 35, 100 30 Z;
                M 105 25 C 145 15, 185 55, 178 102 C 170 148, 135 185, 98 178 C 55 175, 18 145, 22 98 C 25 48, 58 30, 105 25 Z;
                M 100 20 C 140 20, 180 50, 180 100 C 180 150, 140 180, 100 180 C 60 180, 20 150, 20 100 C 20 50, 60 20, 100 20 Z
              "
            />
          </path>
        </svg>
      </div>
    </section>
  )
}
