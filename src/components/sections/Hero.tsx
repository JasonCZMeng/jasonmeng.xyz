import { useEffect, useRef, lazy, Suspense } from 'react'
import { gsap } from '../../lib/gsap-config'
import { SITE, SOCIAL_LINKS } from '../../lib/constants'
import { useIsDesktop, useReducedMotion } from '../../hooks/useMediaQuery'
import MagneticButton from '../ui/MagneticButton'
import { Mail, Github, Linkedin, Twitter, MapPin, ChevronDown } from 'lucide-react'

const Scene = lazy(() => import('../three/Scene'))

const iconMap: Record<string, React.ReactNode> = {
  mail: <Mail size={20} />,
  github: <Github size={20} />,
  linkedin: <Linkedin size={20} />,
  twitter: <Twitter size={20} />,
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const nameRef = useRef<HTMLHeadingElement>(null)
  const taglineRef = useRef<HTMLParagraphElement>(null)
  const locationRef = useRef<HTMLDivElement>(null)
  const socialsRef = useRef<HTMLDivElement>(null)
  const scrollIndicatorRef = useRef<HTMLDivElement>(null)
  const isDesktop = useIsDesktop()
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 3.2 })

      // Name characters animate in
      const chars = nameRef.current?.querySelectorAll('.char')
      if (chars) {
        gsap.set(chars, { opacity: 0, y: 60, rotateX: -90 })
        tl.to(chars, {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.6,
          stagger: 0.04,
          ease: 'back.out(1.7)',
        })
      }

      // Tagline words
      const words = taglineRef.current?.querySelectorAll('.word')
      if (words) {
        gsap.set(words, { opacity: 0, y: 20 })
        tl.to(words, {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.08,
          ease: 'power2.out',
        }, '-=0.3')
      }

      // Location badge
      if (locationRef.current) {
        gsap.set(locationRef.current, { opacity: 0, x: -30 })
        tl.to(locationRef.current, {
          opacity: 1,
          x: 0,
          duration: 0.5,
          ease: 'power2.out',
        }, '-=0.2')
      }

      // Social links stagger
      const socials = socialsRef.current?.querySelectorAll('.social-link')
      if (socials) {
        gsap.set(socials, { opacity: 0, y: 30 })
        tl.to(socials, {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.08,
          ease: 'power2.out',
        }, '-=0.2')
      }

      // Scroll indicator bounce
      if (scrollIndicatorRef.current) {
        gsap.set(scrollIndicatorRef.current, { opacity: 0 })
        tl.to(scrollIndicatorRef.current, { opacity: 1, duration: 0.5 }, '-=0.1')
        gsap.to(scrollIndicatorRef.current, {
          y: 8,
          duration: 1.2,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut',
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [reducedMotion])

  const nameChars = SITE.name.split('')
  const taglineWords = SITE.tagline.split(' ')

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4"
    >
      {/* 3D Background - desktop only */}
      {isDesktop && !reducedMotion && (
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      )}

      {/* Gradient fallback for mobile / reduced motion */}
      {(!isDesktop || reducedMotion) && (
        <div className="absolute inset-0 -z-10">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: 'radial-gradient(ellipse at 50% 50%, var(--color-accent) 0%, transparent 60%)',
            }}
          />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Name */}
        <h1
          ref={nameRef}
          className="text-[clamp(2.5rem,8vw,7rem)] font-bold leading-none tracking-tight"
          style={{ perspective: '1000px' }}
        >
          {nameChars.map((char, i) => (
            <span
              key={i}
              className="char inline-block transition-colors duration-200 hover:text-accent"
              style={{ transformOrigin: 'bottom center' }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </h1>

        {/* Tagline */}
        <p
          ref={taglineRef}
          className="mt-4 text-lg font-medium tracking-wide text-text-secondary sm:text-xl md:mt-6 md:text-2xl"
        >
          {taglineWords.map((word, i) => (
            <span key={i} className="word inline-block gradient-text">
              {word}
              {i < taglineWords.length - 1 ? '\u00A0' : ''}
            </span>
          ))}
        </p>

        {/* Location */}
        <div
          ref={locationRef}
          className="mt-4 flex items-center gap-1.5 font-mono text-sm text-text-secondary md:mt-6"
        >
          <MapPin size={14} className="text-accent-tertiary" />
          <span>{SITE.location}</span>
        </div>

        {/* Social Links */}
        <div ref={socialsRef} className="mt-8 flex gap-3 md:mt-10">
          {SOCIAL_LINKS.map((link) => (
            <MagneticButton
              key={link.label}
              href={link.url}
              className="social-link flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface/50 text-text-secondary backdrop-blur-sm transition-all duration-300 hover:border-accent hover:bg-accent/10 hover:text-accent hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(99,102,241,0.15)]"
            >
              {iconMap[link.icon]}
            </MagneticButton>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        ref={scrollIndicatorRef}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-text-tertiary"
      >
        <ChevronDown size={24} />
      </div>
    </section>
  )
}
