import { ArrowRight, ArrowUp, Calculator, Clock, ExternalLink, Mail, MapPin, Phone, PhoneCall } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { insuranceServices, loanServices } from '@/config/services'
import { site, telLink } from '@/config/site'
import { Logo } from './Logo'

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="relative isolate overflow-hidden bg-navy-950 text-white/70">
      {/* Accent line + soft glows + watermark */}
      <div aria-hidden className="bg-motion-gold absolute inset-x-0 top-0 h-1" />
      <div aria-hidden className="pointer-events-none absolute -top-40 -left-40 -z-10 size-[520px] rounded-full bg-royal-600/25 blur-[120px]" />
      <div aria-hidden className="pointer-events-none absolute right-0 bottom-0 -z-10 size-[420px] rounded-full bg-gold-500/10 blur-[120px]" />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-10 left-1/2 -z-10 -translate-x-1/2 font-display text-[28vw] leading-none font-extrabold tracking-tighter text-white/[0.025] select-none lg:text-[22rem]"
      >
        BFS
      </div>

      <div className="container-page pt-16">
        {/* CTA card */}
        <div className="bg-motion-gold relative isolate overflow-hidden rounded-3xl p-8 shadow-[0_30px_80px_-30px_rgb(245_184_46/0.6)] ring-1 ring-gold-400/60 sm:p-10">
          <div aria-hidden className="absolute -top-20 -right-16 -z-10 size-72 rounded-full bg-white/30 blur-3xl" />
          <div aria-hidden className="absolute -bottom-24 left-1/3 -z-10 size-72 rounded-full bg-[#FF9900]/25 blur-3xl" />
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <p className="eyebrow text-navy-900 before:!bg-navy-900">Talk to our team</p>
              <h2 className="mt-3 text-2xl font-bold text-navy-950 sm:text-3xl">Have a question about a loan or insurance?</h2>
              <p className="mt-2 text-navy-900/75">Share your requirement and we will call you back to explain your options.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <CtaPill to="/contact#enquiry" icon={<PhoneCall className="size-4" />} primary>
                Request a Callback
              </CtaPill>
              <CtaPill to="/emi-calculator" icon={<Calculator className="size-4" />}>
                EMI Calculator
              </CtaPill>
              <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center gap-2 rounded-xl bg-white/40 px-5 text-sm font-semibold text-navy-950 ring-1 ring-navy-900/15 transition hover:bg-white/70">
                <MapPin className="size-4" /> Directions
              </a>
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 py-16 lg:grid-cols-[1.4fr_1fr_0.9fr_0.8fr_1.2fr] lg:gap-10">
          <div className="col-span-2 lg:col-span-1">
            <Logo variant="full" onDark className="px-4 py-3" imgClassName="h-24" />
            <p className="mt-6 max-w-sm text-sm leading-relaxed">
              Loan and insurance assistance for individuals, families and businesses in Hosur and nearby areas.
            </p>
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-xs font-semibold tracking-wider text-gold-400 ring-1 ring-white/10">
              {site.secondaryTagline}
            </p>
          </div>

          <FooterCol title="Loans" links={loanServices.map((s) => ({ to: `/services/${s.slug}`, label: s.name }))} />
          <FooterCol title="Insurance" links={insuranceServices.map((s) => ({ to: `/services/${s.slug}`, label: s.name.replace(' Insurance', '') }))} />
          <FooterCol
            title="Company"
            links={[
              { to: '/about', label: 'About Us' },
              { to: '/services', label: 'All Services' },
              { to: '/emi-calculator', label: 'EMI Calculator' },
              { to: '/contact', label: 'Contact Us' },
              { to: '/privacy-policy', label: 'Privacy Policy' },
            ]}
          />

          <div className="col-span-2 sm:col-span-1">
            <h2 className="text-sm font-semibold tracking-wide text-white">Visit us</h2>
            <div className="mt-5 space-y-4 text-sm">
              <ContactRow icon={<MapPin />}>
                <address className="not-italic leading-relaxed">
                  {site.address.lines.map((l) => <span key={l} className="block">{l}</span>)}
                </address>
                <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-gold-400 hover:text-gold-300">
                  Open in Google Maps <ExternalLink className="size-3" />
                </a>
              </ContactRow>
              {site.contact.phone && (
                <ContactRow icon={<Phone />}>
                  <a href={telLink(site.contact.phone)} className="hover:text-white">{site.contact.phone}</a>
                </ContactRow>
              )}
              {site.contact.email && (
                <ContactRow icon={<Mail />}>
                  <a href={`mailto:${site.contact.email}`} className="break-all hover:text-white">{site.contact.email}</a>
                </ContactRow>
              )}
              {site.contact.hours && (
                <ContactRow icon={<Clock />}>
                  <span className="whitespace-pre-line">{site.contact.hours}</span>
                </ContactRow>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 bg-black/20">
        <div className="container-page flex flex-col gap-4 py-6 text-xs text-white/50 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {site.name}. All rights reserved. · <Link to="/privacy-policy" className="hover:text-white">Privacy Policy</Link>
          </p>
          <p className="max-w-2xl md:text-right">
            {site.name} provides loan and insurance assistance. Loan approval, interest rates and disbursement are decided solely by the respective lender or insurer.
          </p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex size-10 shrink-0 items-center justify-center self-start rounded-full bg-white/10 text-white ring-1 ring-white/15 transition hover:-translate-y-0.5 hover:bg-gold-500 hover:text-navy-950 md:self-auto"
            aria-label="Back to top"
          >
            <ArrowUp className="size-4" />
          </button>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <h2 className="text-sm font-semibold tracking-wide text-white">{title}</h2>
      <ul className="mt-5 space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="group inline-flex items-center gap-1.5 transition-colors hover:text-white">
              <ArrowRight className="size-3 -translate-x-1 text-gold-400 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
              <span className="-ml-4.5 transition-[margin] group-hover:ml-0">{l.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ContactRow({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-gold-400 ring-1 ring-white/10 [&>svg]:size-4">{icon}</span>
      <div className="pt-1.5">{children}</div>
    </div>
  )
}

function CtaPill({ to, icon, children, primary }: { to: string; icon: ReactNode; children: ReactNode; primary?: boolean }) {
  return (
    <Link
      to={to}
      className={
        primary
          ? 'inline-flex h-12 items-center gap-2 rounded-xl bg-navy-900 px-5 text-sm font-semibold text-gold-400 shadow-[0_10px_30px_-8px_rgb(8_45_101/0.6)] transition hover:bg-navy-800'
          : 'inline-flex h-12 items-center gap-2 rounded-xl bg-white/40 px-5 text-sm font-semibold text-navy-950 ring-1 ring-navy-900/15 transition hover:bg-white/70'
      }
    >
      {icon} {children}
    </Link>
  )
}
