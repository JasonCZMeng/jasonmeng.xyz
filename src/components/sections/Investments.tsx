import { useEffect, useRef } from 'react'
import { gsap } from '../../lib/gsap-config'
import { INVESTMENTS } from '../../lib/constants'
import { useReducedMotion } from '../../hooks/useMediaQuery'
import { ArrowUpRight } from 'lucide-react'

export default function Investments() {
  const sectionRef = useRef<HTMLElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion) return

    const ctx = gsap.context(() => {
      const cards = sectionRef.current?.querySelectorAll('.inv-card')
      if (cards) {
        gsap.fromTo(
          cards,
          {
            opacity: 0,
            rotateY: 60,
            transformPerspective: 1000,
          },
          {
            opacity: 1,
            rotateY: 0,
            duration: 0.7,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 60%',
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
      id="investments"
      className="relative mx-auto min-h-screen max-w-5xl px-6 py-24"
    >
      <h2 className="mb-16 text-center font-mono text-sm font-semibold uppercase tracking-[0.3em] text-accent">
        Investments
      </h2>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {INVESTMENTS.map((inv) => (
          <a
            key={inv.company}
            href={inv.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inv-card group relative overflow-hidden rounded-xl border border-border bg-surface/50 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:border-accent/30 hover:bg-surface-hover hover:shadow-[0_0_30px_rgba(99,102,241,0.08)]"
            data-hover
          >
            {/* Animated border gradient */}
            <div
              className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{
                background: 'conic-gradient(from 0deg, transparent, var(--color-accent), transparent, transparent)',
                mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                maskComposite: 'exclude',
                WebkitMaskComposite: 'xor',
                padding: '1px',
                animation: 'borderSpin 3s linear infinite',
              }}
            />

            <div className="relative z-10">
              <h3 className="text-lg font-bold text-text-primary">
                {inv.company}
              </h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {inv.category.map((cat) => (
                  <span
                    key={cat}
                    className="rounded-full bg-accent/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent"
                  >
                    {cat}
                  </span>
                ))}
              </div>
              <div className="mt-3 font-mono text-xs text-text-tertiary">
                {inv.stage}
              </div>

              <div className="mt-4 flex items-center gap-1 text-sm text-text-secondary transition-colors group-hover:text-accent">
                <span>Visit</span>
                <ArrowUpRight
                  size={14}
                  className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                />
              </div>
            </div>
          </a>
        ))}
      </div>

      <style>{`
        @keyframes borderSpin {
          from { --angle: 0deg; }
          to { --angle: 360deg; }
        }
        @property --angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
      `}</style>
    </section>
  )
}
