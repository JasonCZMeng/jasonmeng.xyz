import { useEffect, useRef, useState } from 'react'
import { gsap } from '../../lib/gsap-config'

interface PreloaderProps {
  onComplete: () => void
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLDivElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)
  const taglineRef = useRef<HTMLDivElement>(null)
  const [taglineText, setTaglineText] = useState('')
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const fullTagline = 'Building distribution for tokenized assets'

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const tl = gsap.timeline()

    // Name reveal - letter by letter
    const nameChars = nameRef.current?.querySelectorAll('.char')
    if (nameChars) {
      gsap.set(nameChars, { opacity: 0, y: 30 })
      tl.to(nameChars, {
        opacity: 1,
        y: 0,
        duration: 0.05,
        stagger: 0.04,
        ease: 'back.out(1.7)',
      })
    }

    // Line draw
    tl.fromTo(
      lineRef.current,
      { scaleX: 0 },
      { scaleX: 1, duration: 0.6, ease: 'power2.inOut' },
      '-=0.2'
    )

    // Typewriter tagline
    let typewriterInterval: ReturnType<typeof setInterval>
    tl.add(() => {
      let i = 0
      typewriterInterval = setInterval(() => {
        if (i <= fullTagline.length) {
          setTaglineText(fullTagline.slice(0, i))
          i++
        } else {
          clearInterval(typewriterInterval)
        }
      }, 30)
    }, '-=0.1')

    // Hold for a moment after typewriter completes
    tl.to({}, { duration: 2.5 })

    // Wipe-up reveal — directly in the timeline so it won't get killed
    tl.to(container, {
      clipPath: 'inset(0 0 100% 0)',
      duration: 0.8,
      ease: 'power4.inOut',
      onComplete: () => onCompleteRef.current(),
    })

    return () => {
      clearInterval(typewriterInterval)
      tl.kill()
    }
  }, [])

  const nameChars = 'JASON MENG'.split('')

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bg"
      style={{ clipPath: 'inset(0 0 0 0)' }}
    >
      <div
        ref={nameRef}
        className="text-4xl font-bold tracking-[0.3em] text-text-primary sm:text-5xl md:text-6xl"
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        {nameChars.map((char, i) => (
          <span key={i} className="char inline-block">
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </div>

      <div
        ref={lineRef}
        className="mt-4 h-[1px] w-48 origin-left bg-accent sm:w-64"
      />

      <div
        ref={taglineRef}
        className="mt-6 h-6 font-mono text-sm tracking-wider text-text-secondary sm:text-base"
      >
        {taglineText}
        <span className="ml-0.5 inline-block w-[2px] animate-pulse bg-accent-tertiary">
          &nbsp;
        </span>
      </div>
    </div>
  )
}
