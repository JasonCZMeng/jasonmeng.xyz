import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../../lib/gsap-config'
import { EXPERIENCES } from '../../lib/constants'
import { useReducedMotion, useIsDesktop } from '../../hooks/useMediaQuery'
import TiltCard from '../ui/TiltCard'

export default function Experience() {
  const sectionRef = useRef<HTMLElement>(null)
  const timelineLineRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  const isDesktop = useIsDesktop()

  useEffect(() => {
    if (reducedMotion) return

    const ctx = gsap.context(() => {
      // Timeline line draws itself
      if (timelineLineRef.current) {
        gsap.fromTo(
          timelineLineRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 60%',
              end: 'bottom 40%',
              scrub: 0.5,
            },
          }
        )
      }

      // Cards slide in
      const cards = sectionRef.current?.querySelectorAll('.exp-card')
      if (cards) {
        cards.forEach((card, i) => {
          const fromLeft = isDesktop && i % 2 === 0
          gsap.fromTo(
            card,
            {
              opacity: 0,
              x: fromLeft ? -60 : 60,
            },
            {
              opacity: 1,
              x: 0,
              duration: 0.7,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: card,
                start: 'top 80%',
                toggleActions: 'play none none reverse',
              },
            }
          )
        })
      }

      // Timeline dots pulse
      const dots = sectionRef.current?.querySelectorAll('.timeline-dot')
      if (dots) {
        dots.forEach((dot) => {
          ScrollTrigger.create({
            trigger: dot,
            start: 'top 70%',
            onEnter: () => {
              gsap.to(dot, {
                scale: 1.5,
                boxShadow: '0 0 15px var(--color-accent), 0 0 30px var(--color-accent)',
                duration: 0.3,
              })
              gsap.to(dot, {
                scale: 1,
                boxShadow: '0 0 8px var(--color-accent)',
                duration: 0.3,
                delay: 0.3,
              })
            },
          })
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [reducedMotion, isDesktop])

  return (
    <section
      ref={sectionRef}
      id="experience"
      className="relative mx-auto min-h-screen max-w-5xl px-6 py-24"
    >
      <h2 className="mb-16 text-center font-mono text-sm font-semibold uppercase tracking-[0.3em] text-accent">
        Experience
      </h2>

      <div className="relative">
        {/* Timeline center line */}
        <div
          ref={timelineLineRef}
          className="absolute left-4 top-0 h-full w-[1px] origin-top bg-accent/30 lg:left-1/2 lg:-translate-x-px"
        />

        {/* Experience entries */}
        <div className="space-y-12 lg:space-y-16">
          {EXPERIENCES.map((exp, i) => {
            const isLeft = isDesktop && i % 2 === 0
            return (
              <div
                key={exp.company}
                className={`exp-card relative flex items-start gap-8 ${
                  isDesktop
                    ? i % 2 === 0
                      ? 'lg:flex-row-reverse lg:text-right'
                      : 'lg:flex-row'
                    : ''
                }`}
              >
                {/* Timeline dot */}
                <div
                  className="timeline-dot absolute left-4 top-1 z-10 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-accent bg-bg lg:left-1/2"
                  style={{ boxShadow: '0 0 8px var(--color-accent)' }}
                />

                {/* Card */}
                <div
                  className={`ml-12 lg:ml-0 ${
                    isDesktop
                      ? isLeft
                        ? 'lg:mr-[calc(50%+2rem)] lg:ml-0'
                        : 'lg:ml-[calc(50%+2rem)]'
                      : ''
                  } w-full lg:w-[calc(50%-2rem)]`}
                >
                  <TiltCard
                    className="group relative overflow-hidden rounded-xl border border-border bg-surface/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-accent/30 hover:bg-surface-hover hover:shadow-[0_0_30px_rgba(99,102,241,0.08)]"
                    maxTilt={8}
                  >
                    {/* CRT scan line effect */}
                    <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
                      <div
                        className="absolute left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-accent/30 to-transparent"
                        style={{
                          animation: 'scanline 1.5s ease-in-out forwards',
                          top: '0%',
                        }}
                      />
                    </div>

                    <div className="font-mono text-xs tracking-wider text-accent">
                      {exp.period}
                    </div>
                    <h3 className="mt-2 text-xl font-bold text-text-primary sm:text-2xl">
                      {exp.company}
                    </h3>
                    <div className="mt-1 text-sm text-text-secondary">
                      {exp.role}
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-text-tertiary">
                      {exp.description}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {exp.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-text-tertiary transition-colors hover:border-accent/30 hover:text-accent"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </TiltCard>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <style>{`
        @keyframes scanline {
          from { top: 0%; opacity: 1; }
          to { top: 100%; opacity: 0; }
        }
      `}</style>
    </section>
  )
}
