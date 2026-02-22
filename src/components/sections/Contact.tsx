import { useEffect, useRef, useState } from 'react'
import { gsap } from '../../lib/gsap-config'
import { SITE, SOCIAL_LINKS } from '../../lib/constants'
import { useReducedMotion } from '../../hooks/useMediaQuery'
import { useMousePosition } from '../../hooks/useMousePosition'
import { Mail, Github, Linkedin, Twitter, Check, Copy } from 'lucide-react'

const iconMap: Record<string, React.ReactNode> = {
  mail: <Mail size={20} />,
  github: <Github size={20} />,
  linkedin: <Linkedin size={20} />,
  twitter: <Twitter size={20} />,
}

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const [copied, setCopied] = useState(false)
  const mouse = useMousePosition()
  const reducedMotion = useReducedMotion()

  const copyEmail = async () => {
    await navigator.clipboard.writeText(SITE.email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    if (reducedMotion) return

    const ctx = gsap.context(() => {
      // Heading character flip
      const chars = headingRef.current?.querySelectorAll('.char')
      if (chars) {
        gsap.fromTo(
          chars,
          { opacity: 0, rotateX: -90 },
          {
            opacity: 1,
            rotateX: 0,
            duration: 0.5,
            stagger: 0.03,
            ease: 'back.out(1.4)',
            scrollTrigger: {
              trigger: headingRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      }

      // Social buttons slide in
      const buttons = sectionRef.current?.querySelectorAll('.contact-link')
      if (buttons) {
        gsap.fromTo(
          buttons,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.08,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: buttons[0],
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [reducedMotion])

  const headingText = "Let's Build Something"
  const headingChars = headingText.split('')

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative flex min-h-screen flex-col items-center justify-center px-6 py-24"
    >
      {/* Cursor-following spotlight */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-1000"
        style={{
          background: `radial-gradient(600px circle at ${mouse.x}px ${mouse.y}px, rgba(99, 102, 241, 0.06), transparent 60%)`,
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center">
        <h2
          ref={headingRef}
          className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl lg:text-6xl"
          style={{ perspective: '1000px' }}
        >
          {headingChars.map((char, i) => (
            <span
              key={i}
              className="char inline-block"
              style={{ transformOrigin: 'bottom center' }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </h2>

        <p className="mt-4 text-text-secondary">
          Get in touch
        </p>

        {/* Email copy */}
        <button
          onClick={copyEmail}
          className="group mt-6 flex items-center gap-2 rounded-full border border-border bg-surface/50 px-5 py-2.5 font-mono text-sm text-text-secondary backdrop-blur-sm transition-all duration-300 hover:border-accent/30 hover:text-accent"
          data-hover
        >
          {copied ? (
            <>
              <Check size={16} className="text-green-400" />
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={16} />
              <span>{SITE.email}</span>
            </>
          )}
        </button>

        {/* Social links */}
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-link flex items-center gap-2 rounded-lg border border-border bg-surface/50 px-4 py-2.5 text-sm text-text-secondary backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:text-accent hover:shadow-[0_0_20px_rgba(99,102,241,0.1)]"
              data-hover
            >
              {iconMap[link.icon]}
              <span>{link.label}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 font-mono text-xs text-text-tertiary">
        &copy; {new Date().getFullYear()} Jason Meng
      </div>
    </section>
  )
}
