import { clsx } from 'clsx'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import type { GradientPalette } from '@/components/ui/GradientMotion'
import { MotionBackground } from './MotionBackground'

export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

export function SectionHeading({ eyebrow, title, intro, align = 'left', light }: { eyebrow?: string; title: string; intro?: ReactNode; align?: 'left' | 'center'; light?: boolean }) {
  return (
    <div className={clsx('max-w-2xl', align === 'center' && 'mx-auto text-center')}>
      {eyebrow && <p className={clsx('eyebrow', light && 'text-gold-400')}>{eyebrow}</p>}
      <h2 className={clsx('mt-3 text-3xl font-bold sm:text-[2.5rem] sm:leading-[1.15]', light && 'text-white')}>{title}</h2>
      {intro && <p className={clsx('mt-4 text-lg leading-relaxed', light ? 'text-white/70' : 'text-ink-500')}>{intro}</p>}
    </div>
  )
}

export function PageHero({ eyebrow, title, intro, children, palette = 'midnight', image }: { eyebrow: string; title: string; intro?: string; children?: ReactNode; palette?: GradientPalette; image?: string }) {
  return (
    <section className="relative isolate overflow-hidden bg-navy-900 text-white">
      <MotionBackground palette={palette} image={image} />
      <div className="container-page relative py-16 sm:py-20">
        <p className="eyebrow text-gold-400">{eyebrow}</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold text-white sm:text-5xl sm:leading-[1.1]">{title}</h1>
        {intro && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/75">{intro}</p>}
        {children}
      </div>
    </section>
  )
}
