import { useEffect, useRef } from 'react'
import { gsap } from '../../lib/gsap-config'
import { WRITING } from '../../lib/constants'
import { useReducedMotion } from '../../hooks/useMediaQuery'
import { ArrowUpRight, Twitter, BookOpen } from 'lucide-react'

const platformIcon: Record<string, React.ReactNode> = {
  x: <Twitter size={14} />,
  medium: <BookOpen size={14} />,
  other: <BookOpen size={14} />,
}

export default function Writing() {
  const sectionRef = useRef<HTMLElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion) return

    const ctx = gsap.context(() => {
      const cards = sectionRef.current?.querySelectorAll('.writing-card')
      if (cards) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 40, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.1,
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
      id="writing"
      className="relative mx-auto min-h-screen max-w-5xl px-6 py-24"
    >
      <h2 className="mb-4 text-center font-mono text-sm font-semibold uppercase tracking-[0.3em] text-accent">
        Writing
      </h2>
      <p className="mb-16 text-center font-mono text-xs text-text-tertiary">
        Thoughts, threads, and deep dives
      </p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {WRITING.map((entry, i) => (
          <a
            key={i}
            href={entry.url}
            target="_blank"
            rel="noopener noreferrer"
            className="writing-card group relative flex flex-col overflow-hidden rounded-xl border border-border bg-surface/50 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:border-accent/30 hover:bg-surface-hover"
            data-hover
          >
            {/* Platform badge */}
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent">
                {platformIcon[entry.platform]}
                {entry.platform === 'x' ? 'X / Twitter' : entry.platform}
              </span>
              <span className="font-mono text-[10px] text-text-tertiary">
                {entry.date}
              </span>
            </div>

            <h3 className="mt-3 text-base font-bold text-text-primary sm:text-lg">
              {entry.title}
            </h3>

            <p className="mt-2 flex-1 text-sm leading-relaxed text-text-tertiary">
              {entry.excerpt}
            </p>

            <div className="mt-4 flex items-center gap-1 text-sm text-text-secondary transition-colors group-hover:text-accent">
              <span>{entry.type === 'tweet' ? 'View thread' : 'Read article'}</span>
              <ArrowUpRight
                size={14}
                className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
              />
            </div>

            {/* Bottom gradient overlay on hover */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-accent/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </a>
        ))}
      </div>
    </section>
  )
}
