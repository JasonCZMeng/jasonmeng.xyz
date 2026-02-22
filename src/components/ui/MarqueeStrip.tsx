import { MARQUEE_WORDS } from '../../lib/constants'

export default function MarqueeStrip() {
  const content = MARQUEE_WORDS.join(' \u2666 ')
  // Double the content for seamless loop
  const doubled = `${content} \u2666 ${content} \u2666 ${content} \u2666 `

  return (
    <div className="group relative w-full overflow-hidden border-y border-border py-4">
      <div
        className="flex whitespace-nowrap font-mono text-lg tracking-widest text-text-tertiary opacity-30 transition-opacity duration-300 group-hover:opacity-80 sm:text-xl md:text-2xl"
        style={{
          animation: 'marquee 30s linear infinite',
        }}
      >
        <span className="inline-block">{doubled}</span>
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-33.33%); }
        }
        .group:hover div {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}
