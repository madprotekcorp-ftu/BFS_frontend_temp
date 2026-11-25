import { clsx } from 'clsx'
import logoCompact from '@/assets/brand/logo-compact.webp'
import logoFull from '@/assets/brand/logo-full.webp'
import logoMark from '@/assets/brand/logo-mark.webp'

type Variant = 'compact' | 'full' | 'mark'
const SRC: Record<Variant, string> = { compact: logoCompact, full: logoFull, mark: logoMark }

interface LogoProps {
  variant?: Variant
  /** On dark backgrounds the navy lettering needs a light plate behind it. */
  onDark?: boolean
  className?: string
  imgClassName?: string
}

/** Official Bright Financial Solution logo (from frontend/src/assets). */
export function Logo({ variant = 'compact', onDark, className, imgClassName }: LogoProps) {
  const img = (
    <img
      src={SRC[variant]}
      alt="Bright Financial Solution"
      className={clsx('block w-auto select-none', imgClassName ?? (variant === 'full' ? 'h-28' : variant === 'mark' ? 'h-8' : 'h-12'))}
      draggable={false}
      decoding="async"
    />
  )
  if (!onDark) return <span className={clsx('inline-flex', className)}>{img}</span>
  return <span className={clsx('inline-flex rounded-xl bg-white px-3 py-2 shadow-sm', className)}>{img}</span>
}
