import { clsx } from 'clsx'
import { GradientMotion, type GradientPalette } from '@/components/ui/GradientMotion'

interface MotionBackgroundProps {
  /** Optional photo shown under the motion layers (e.g. '/images/hero.jpg' once BFS supplies one). */
  image?: string
  /** Draws the animated growth line. Use on the homepage hero. */
  growthLine?: boolean
  /** Blob gradient palette. */
  palette?: GradientPalette
  className?: string
}

/**
 * Animated brand background: moving navy gradient, drifting light orbs, a slowly panning grid
 * and (optionally) a self-drawing growth line. Pure CSS/SVG, GPU-friendly, and fully static
 * when the visitor prefers reduced motion.
 */
export function MotionBackground({ image, growthLine, palette = 'midnight', className }: MotionBackgroundProps) {
  return (
    <div aria-hidden className={clsx('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      <GradientMotion palette={palette} blobs={9} blur={110} speed={28} seed={palette.length} className="absolute inset-0" />

      {image && (
        <>
          <img src={image} alt="" className="absolute inset-0 size-full object-cover opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950/90 via-navy-900/70 to-navy-900/30" />
        </>
      )}

      {/* Readability scrim: darker behind the text column */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/15 to-transparent" />

      {/* Panning grid, faded at the edges */}
      <div
        className="motion-grid absolute inset-0 opacity-[0.09] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
        style={{
          backgroundImage:
            'linear-gradient(rgb(255 255 255 / 0.9) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 0.9) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          animation: 'grid-pan 12s linear infinite',
        }}
      />

      {growthLine && (
        <svg className="absolute inset-x-0 bottom-0 h-[55%] w-full" viewBox="0 0 1440 400" preserveAspectRatio="none">
          <defs>
            <linearGradient id="growth-stroke" x1="0" x2="1">
              <stop offset="0" stopColor="#F5B82E" stopOpacity="0" />
              <stop offset="0.35" stopColor="#F5B82E" stopOpacity="0.55" />
              <stop offset="1" stopColor="#F8C95A" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="growth-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#F5B82E" stopOpacity="0.12" />
              <stop offset="1" stopColor="#F5B82E" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0 360 C 180 340, 260 300, 400 310 S 620 250, 760 230 S 1000 200, 1120 140 S 1340 70, 1440 40 L1440 400 L0 400 Z" fill="url(#growth-fill)" />
          <path
            className="motion-line"
            d="M0 360 C 180 340, 260 300, 400 310 S 620 250, 760 230 S 1000 200, 1120 140 S 1340 70, 1440 40"
            fill="none"
            stroke="url(#growth-stroke)"
            strokeWidth="2.5"
            pathLength={1}
            strokeDasharray="1"
            style={{ animation: 'line-draw 3.2s cubic-bezier(0.22,1,0.36,1) 0.3s both' }}
          />
          <path
            d="M0 385 C 220 370, 360 350, 520 345 S 820 300, 980 280 S 1260 220, 1440 190"
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.12"
            strokeWidth="1.5"
            strokeDasharray="4 8"
          />
        </svg>
      )}
      {growthLine && (
        <span
          className="motion-dot absolute right-[1.5%] bottom-[48%] size-2.5 rounded-full bg-gold-400 shadow-[0_0_18px_6px_rgb(245_184_46/0.55)]"
          style={{ animation: 'pulse-dot 2.4s ease-in-out 3.4s infinite' }}
        />
      )}
    </div>
  )
}
