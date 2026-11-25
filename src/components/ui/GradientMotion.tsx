import { clsx } from 'clsx'
import { type CSSProperties, type ReactNode, useEffect, useMemo, useRef } from 'react'

/**
 * Gradient motion background.
 * Technique (after the "gradient motion bg" reference): heavily blurred, rounded colour blobs
 * that slowly orbit and rotate, a contrast boost on the container that makes the colours glow,
 * and an SVG film-grain overlay. Animations pause when off-screen and stop for reduced motion.
 */

export type GradientPalette = 'ember' | 'midnight' | 'aurora' | 'gold' | 'royal' | 'dawn' | 'sunset' | 'ocean'

export const PALETTES: Record<GradientPalette, { base: string; colors: string[]; dark: boolean }> = {
  // The reference gradient: orange rgb(255,85,0), amber rgb(255,153,0) and black. A dark base keeps
  // the "darkness changes colours" look instead of washing out to yellow.
  ember: { base: '#000000', colors: ['#FF5500', '#000000', '#FF9900', '#000000'], dark: true },
  // Brand: navy, royal blue and BFS gold.
  midnight: { base: '#020b1c', colors: ['#0755A5', '#F5B82E', '#041a3d', '#1a6bc0'], dark: true },
  aurora: { base: '#020814', colors: ['#0755A5', '#0fb9a5', '#000000', '#0e7490'], dark: true },
  gold: { base: '#0b0700', colors: ['#d99a12', '#FF5500', '#041a3d', '#F5B82E'], dark: true },
  royal: { base: '#06163a', colors: ['#1a6bc0', '#6d4aff', '#041a3d', '#0755A5'], dark: true },
  sunset: { base: '#0d0310', colors: ['#FF5500', '#c2185b', '#000000', '#FF9900'], dark: true },
  ocean: { base: '#00121f', colors: ['#0284c7', '#0755A5', '#000000', '#0891b2'], dark: true },
  // Light variant for surfaces that carry dark text.
  dawn: { base: '#ffffff', colors: ['#F5B82E', '#FF9900', '#dbe8f7', '#9fbde3'], dark: false },
}

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch' result='noise'/%3E%3CfeColorMatrix in='noise' type='matrix' values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

// Deterministic pseudo-random so server/client and re-renders stay stable.
function rand(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

interface GradientMotionProps {
  palette?: GradientPalette
  /** Number of blobs. Fewer for small cards. */
  blobs?: number
  /** Blur in px. Scale with the element size (cards ~40–60, sections ~100). */
  blur?: number
  /** Seconds for one orbit; lower is faster. */
  speed?: number
  /** Container contrast boost (reference uses 2; 1.2–1.5 keeps brand colours true). */
  contrast?: number
  /** Blob layer opacity (reference uses 0.78). */
  intensity?: number
  grain?: boolean
  seed?: number
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

export function GradientMotion({
  palette = 'ember',
  blobs = 9,
  blur = 104,
  speed = 24,
  contrast = 1.35,
  intensity = 0.78,
  grain = true,
  seed = 1,
  className,
  style,
  children,
}: GradientMotionProps) {
  const p = PALETTES[palette]
  const ref = useRef<HTMLDivElement>(null)

  const items = useMemo(
    () =>
      Array.from({ length: blobs }, (_, i) => {
        const r = (k: number) => rand(seed * 31 + i * 7 + k)
        return {
          color: p.colors[i % p.colors.length],
          left: r(1) * 100,
          top: r(2) * 100,
          size: 50 + r(3) * 120,
          orbit: 6 + r(4) * 18,
          duration: speed * (0.7 + r(5) * 0.9),
          delay: -r(6) * speed,
          reverse: r(7) > 0.5,
        }
      }),
    [blobs, seed, speed, p.colors],
  )

  // Pause the animation while off-screen to keep scrolling smooth.
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => el.toggleAttribute('data-paused', !e.isIntersecting), { rootMargin: '120px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref} className={clsx('gradient-motion relative isolate overflow-hidden', className)} style={style}>
      <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden" style={{ background: p.base, filter: `contrast(${contrast * 100}%)` }}>
        <div className="absolute inset-0" style={{ opacity: intensity }}>
          {items.map((b, i) => (
            <span
              key={i}
              className="gm-blob absolute block"
              style={
                {
                  left: `${b.left}%`,
                  top: `${b.top}%`,
                  width: `${b.size}%`,
                  aspectRatio: '1',
                  background: b.color,
                  borderRadius: '40%',
                  filter: `blur(${blur}px)`,
                  '--orbit': `${b.orbit}%`,
                  animation: `gm-orbit ${b.duration}s linear ${b.delay}s infinite ${b.reverse ? 'reverse' : 'normal'}`,
                } as CSSProperties
              }
            />
          ))}
        </div>
        {grain && (
          <div
            className="absolute inset-0"
            style={{ backgroundImage: GRAIN, backgroundSize: '68px 68px', opacity: 0.38, mixBlendMode: 'overlay' }}
          />
        )}
      </div>
      {children}
    </div>
  )
}
