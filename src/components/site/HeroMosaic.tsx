import { motion, useReducedMotion } from 'framer-motion'
import { Car, Gem, Home, Briefcase, type LucideIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { GradientMotion, type GradientPalette } from '@/components/ui/GradientMotion'
import { heroPhotos } from '@/config/site'

type Shape = 'square' | 'circle' | 'qtr-tl' | 'qtr-tr' | 'qtr-bl' | 'qtr-br' | 'pill-l' | 'pill-r'

const RADII: Record<Shape, [string, string, string, string]> = {
  // [top-left, top-right, bottom-right, bottom-left]
  square: ['0%', '0%', '0%', '0%'],
  circle: ['50%', '50%', '50%', '50%'],
  'qtr-tl': ['100%', '0%', '0%', '0%'],
  'qtr-tr': ['0%', '100%', '0%', '0%'],
  'qtr-br': ['0%', '0%', '100%', '0%'],
  'qtr-bl': ['0%', '0%', '0%', '100%'],
  'pill-l': ['50%', '0%', '0%', '50%'],
  'pill-r': ['0%', '50%', '50%', '0%'],
}
const CYCLE: Shape[] = ['qtr-tr', 'circle', 'qtr-bl', 'pill-r', 'qtr-tl', 'square', 'qtr-br', 'pill-l']

type Tile =
  | { kind: 'shape'; shape: Shape; color: string }
  | { kind: 'feature'; shape: Shape; palette: GradientPalette; icon: LucideIcon; label: string; to: string }

// 3 columns x 4 rows, mirroring the reference rhythm: features on a diagonal, shapes around them.
const TILES: Tile[] = [
  { kind: 'feature', shape: 'qtr-tl', palette: 'midnight', icon: Home, label: 'Home Loan', to: '/services/home-loan' },
  { kind: 'shape', shape: 'qtr-tr', color: 'var(--color-royal-600)' },
  { kind: 'shape', shape: 'qtr-br', color: 'var(--color-royal-100)' },
  { kind: 'shape', shape: 'circle', color: 'var(--color-gold-500)' },
  { kind: 'shape', shape: 'qtr-tl', color: 'var(--color-royal-100)' },
  { kind: 'feature', shape: 'square', palette: 'ember', icon: Briefcase, label: 'Business Loan', to: '/services/business-loan' },
  { kind: 'feature', shape: 'qtr-tr', palette: 'gold', icon: Gem, label: 'Gold Loan', to: '/services/gold-loan' },
  { kind: 'shape', shape: 'square', color: 'var(--color-navy-900)' },
  { kind: 'shape', shape: 'qtr-tl', color: 'var(--color-gold-100)' },
  { kind: 'shape', shape: 'qtr-bl', color: 'var(--color-royal-100)' },
  { kind: 'shape', shape: 'circle', color: 'var(--color-royal-600)' },
  { kind: 'feature', shape: 'qtr-tr', palette: 'aurora', icon: Car, label: 'Car Loan', to: '/services/car-loan' },
]

const radius = (s: Shape) => {
  const [tl, tr, br, bl] = RADII[s]
  return { borderTopLeftRadius: tl, borderTopRightRadius: tr, borderBottomRightRadius: br, borderBottomLeftRadius: bl }
}

export function HeroMosaic() {
  const reduce = useReducedMotion()
  const [shapes, setShapes] = useState<Shape[]>(() => TILES.map((t) => t.shape))

  // Every few seconds, two shape tiles morph to the next shape in the cycle.
  useEffect(() => {
    if (reduce) return
    let tick = 0
    const id = setInterval(() => {
      tick++
      setShapes((prev) =>
        prev.map((s, i) => {
          if (TILES[i].kind !== 'shape' || (i + tick) % 4 !== 0) return s
          return CYCLE[(CYCLE.indexOf(s) + 1) % CYCLE.length]
        }),
      )
    }, 2600)
    return () => clearInterval(id)
  }, [reduce])

  let photoIndex = 0
  return (
    <div className="grid aspect-[3/4] w-full grid-cols-3 grid-rows-4" aria-label="Loan services">
      {TILES.map((t, i) => {
        const enter = { initial: { opacity: 0, scale: 0.6 }, animate: { opacity: 1, scale: 1, ...radius(shapes[i]) } }
        const transition = {
          opacity: { duration: 0.5, delay: 0.15 + i * 0.06 },
          scale: { type: 'spring' as const, stiffness: 160, damping: 18, delay: 0.15 + i * 0.06 },
          default: { duration: 1.1, ease: [0.65, 0, 0.35, 1] as const },
        }

        if (t.kind === 'shape') {
          return <motion.div key={i} aria-hidden {...enter} transition={transition} style={{ background: t.color }} className="size-full" />
        }

        const photo = heroPhotos[photoIndex++]
        return (
          <motion.div key={i} {...enter} transition={transition} className="group relative size-full overflow-hidden">
            {photo ? (
              <img src={photo} alt="" className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
            ) : (
              <Link to={t.to} className="block size-full" aria-label={t.label}>
                <GradientMotion palette={t.palette} blobs={5} blur={34} speed={16} seed={i + 2} className="size-full">
                  <div className="flex size-full flex-col items-center justify-center gap-2 p-3 text-white">
                    <span className="flex size-[38%] max-h-16 max-w-16 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/30 backdrop-blur-md transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
                      <t.icon className="size-1/2" strokeWidth={1.6} />
                    </span>
                    <span className="rounded-full bg-black/25 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide whitespace-nowrap backdrop-blur-sm sm:text-xs">
                      {t.label}
                    </span>
                  </div>
                </GradientMotion>
              </Link>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}
