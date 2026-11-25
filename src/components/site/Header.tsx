import { clsx } from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, ChevronDown, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { buttonClass } from '@/components/ui/Button'
import { insuranceServices, loanServices } from '@/config/services'
import { site } from '@/config/site'
import { Logo } from './Logo'

const nav = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About Us' },
  { to: '/services', label: 'Services', mega: true },
  { to: '/emi-calculator', label: 'EMI Calculator' },
  { to: '/contact', label: 'Contact Us' },
]

export function Header() {
  const [open, setOpen] = useState(false)
  const [mega, setMega] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    setOpen(false)
    setMega(false)
  }, [pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={clsx('sticky top-0 z-40 bg-white/95 backdrop-blur transition-shadow', scrolled && 'shadow-[0_1px_0_var(--color-line),0_8px_24px_rgb(8_45_101/0.06)]')}>
      <div className="container-page flex h-[72px] items-center justify-between gap-6">
        <Link to="/" aria-label={`${site.name} home`}>
          <Logo imgClassName="h-11 sm:h-12" />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {nav.map((item) =>
            item.mega ? (
              <div key={item.to} className="relative" onMouseEnter={() => setMega(true)} onMouseLeave={() => setMega(false)}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) => navClass(isActive)}
                  aria-expanded={mega}
                  onFocus={() => setMega(true)}
                >
                  {item.label} <ChevronDown className="size-3.5" />
                </NavLink>
                <AnimatePresence>{mega && <MegaMenu onBlurOut={() => setMega(false)} />}</AnimatePresence>
              </div>
            ) : (
              <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => navClass(isActive)}>
                {item.label}
              </NavLink>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/contact#enquiry" className="group hidden h-11 items-center overflow-hidden rounded-lg bg-navy-900 pl-4 text-sm font-semibold text-white transition-colors hover:bg-navy-800 sm:inline-flex">
            Request a Callback
            <span className="ml-3 flex h-full w-11 items-center justify-center bg-gold-500 text-navy-950">
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
          <button
            type="button"
            className="rounded-md p-2 text-navy-900 hover:bg-surface lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-nav"
            aria-label="Mobile"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-line bg-white lg:hidden"
          >
            <div className="container-page flex flex-col py-3">
              {nav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) => clsx('rounded-md px-3 py-3 font-medium', isActive ? 'bg-royal-50 text-navy-900' : 'text-ink-700')}
                >
                  {item.label}
                </NavLink>
              ))}
              <NavLink to="/privacy-policy" className="rounded-md px-3 py-3 font-medium text-ink-700">Privacy Policy</NavLink>
              <Link to="/contact#enquiry" className={buttonClass('gold', 'lg', 'mt-3')}>Request a Callback</Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}

const navClass = (active: boolean) =>
  clsx(
    'relative flex items-center gap-1 rounded-md px-3.5 py-2 text-[15px] font-medium transition-colors',
    active ? 'text-navy-900 after:absolute after:inset-x-3.5 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-gold-500' : 'text-ink-700 hover:text-navy-900',
  )

function MegaMenu({ onBlurOut }: { onBlurOut: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.15 }}
      className="absolute top-full left-1/2 w-[720px] -translate-x-1/2 pt-3"
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && onBlurOut()}
    >
      <div className="grid grid-cols-[1.6fr_1fr] gap-6 rounded-2xl border border-line bg-white p-6 shadow-lift">
        <div>
          <p className="mb-3 text-xs font-semibold tracking-wider text-ink-400 uppercase">Loans</p>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
            {loanServices.map((s) => (
              <li key={s.slug}>
                <Link to={`/services/${s.slug}`} className="flex items-center gap-2.5 rounded-md px-2 py-2 text-sm text-ink-700 hover:bg-surface hover:text-navy-900">
                  <s.icon className="size-4 text-royal-600" /> {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="border-l border-line pl-6">
          <p className="mb-3 text-xs font-semibold tracking-wider text-ink-400 uppercase">Insurance</p>
          <ul className="space-y-1">
            {insuranceServices.map((s) => (
              <li key={s.slug}>
                <Link to={`/services/${s.slug}`} className="flex items-center gap-2.5 rounded-md px-2 py-2 text-sm text-ink-700 hover:bg-surface hover:text-navy-900">
                  <s.icon className="size-4 text-gold-600" /> {s.name}
                </Link>
              </li>
            ))}
          </ul>
          <Link to="/services" className="mt-3 block px-2 text-sm font-semibold text-royal-600 hover:underline">View all services →</Link>
        </div>
      </div>
    </motion.div>
  )
}
