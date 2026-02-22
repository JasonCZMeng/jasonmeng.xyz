import { useRef, type ReactNode } from 'react'

interface MagneticButtonProps {
  children: ReactNode
  className?: string
  href?: string
  onClick?: () => void
  strength?: number
}

export default function MagneticButton({
  children,
  className = '',
  href,
  onClick,
  strength = 0.3,
}: MagneticButtonProps) {
  const ref = useRef<HTMLElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return

    const rect = el.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const deltaX = (e.clientX - centerX) * strength
    const deltaY = (e.clientY - centerY) * strength

    el.style.transform = `translate(${deltaX}px, ${deltaY}px)`
  }

  const handleMouseLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.transform = 'translate(0, 0)'
    el.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)'
    setTimeout(() => {
      if (el) el.style.transition = ''
    }, 500)
  }

  const props = {
    ref: ref as React.Ref<HTMLAnchorElement>,
    className: `inline-block ${className}`,
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
    'data-hover': true,
  }

  if (href) {
    return (
      <a {...props} href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    )
  }

  return (
    <button
      {...(props as React.HTMLAttributes<HTMLButtonElement> & { ref: React.Ref<HTMLButtonElement> })}
      ref={ref as React.Ref<HTMLButtonElement>}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
