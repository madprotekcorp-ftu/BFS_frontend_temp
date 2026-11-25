import type { ReactNode } from 'react'
import { ArrowRight, BadgePercent, FileCheck2, Headset, MessageSquareText, Scale, Search, Timer, Workflow } from 'lucide-react'
import { Link } from 'react-router-dom'
import { GradientMotion, type GradientPalette } from '@/components/ui/GradientMotion'
import { trackSpotlight } from '@/lib/spotlight'
import { serviceImage, type ServiceContent } from '@/config/services'
import { lenders } from '@/config/lenders'
import { Reveal, SectionHeading } from './Section'

const STRIP_PALETTES: GradientPalette[] = ['midnight', 'ember', 'aurora', 'gold', 'royal', 'sunset', 'ocean']

/**
 * Service card.
 * - `strip` (default): white card with a moving gradient header; the palette rotates card to card.
 * - `glass`: compact white card used in the insurance section.
 */
export function ServiceCard({ service, index = 0, variant = 'strip' }: { service: ServiceContent; index?: number; variant?: 'strip' | 'glass' }) {
  const Icon = service.icon
  const num = String(index + 1).padStart(2, '0')

  if (variant === 'glass') {
    return (
      <Reveal delay={Math.min(index, 6) * 0.05} className="h-full">
        <article
          onMouseMove={trackSpotlight}
          className="spotlight group flex h-full flex-col rounded-2xl border border-line bg-white p-6 shadow-card transform-gpu transition-[translate,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-royal-100 hover:shadow-lift"
        >
          <div className="flex items-center justify-between">
            <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-gold-400 to-[#FF9900] text-navy-950 shadow-[0_8px_20px_-6px_rgb(255_153_0/0.5)] transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
              <Icon className="size-6" strokeWidth={1.8} />
            </div>
            <span className="font-display text-sm font-bold text-ink-400/60">{num}</span>
          </div>
          <h3 className="mt-5 text-lg font-semibold">{service.name}</h3>
          <p className="mt-2 flex-1 text-[15px] leading-relaxed text-ink-500">{service.short}</p>
          <div className="mt-6 flex items-center justify-between gap-2 border-t border-line pt-4 text-[13px] font-semibold whitespace-nowrap">
            <Link to={`/services/${service.slug}`} className="inline-flex items-center gap-1 text-navy-900 hover:text-royal-600">
              Learn More <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link to={`/contact?service=${service.slug}#enquiry`} className="rounded-full bg-royal-50 px-3 py-1 text-navy-900 ring-1 ring-royal-100 transition-colors hover:bg-gold-500 hover:ring-gold-500">
              Enquire Now
            </Link>
          </div>
        </article>
      </Reveal>
    )
  }

  const palette = STRIP_PALETTES[index % STRIP_PALETTES.length]
  const photo = serviceImage(service.slug)
  const badge = (
    <div className="flex h-full items-end justify-between p-5">
      <div className="flex size-12 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-white/30 backdrop-blur-md transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
        <Icon className="size-6" strokeWidth={1.75} />
      </div>
      <span className="font-display text-2xl font-extrabold text-white/70 drop-shadow">{num}</span>
    </div>
  )
  return (
    <Reveal delay={Math.min(index, 6) * 0.05} className="h-full">
      <article className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-line transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_22px_50px_-12px_rgb(8_45_101/0.35)]">
        {photo ? (
          <div className="relative h-40 shrink-0 overflow-hidden bg-navy-900">
            <img src={photo} alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-900/25 to-transparent" />
            <div aria-hidden className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-gold-500 to-[#FF5500] transition-transform duration-500 group-hover:scale-x-100" />
            <div className="relative h-full">{badge}</div>
          </div>
        ) : (
          <GradientMotion palette={palette} blobs={5} blur={36} speed={18} seed={index + 3} className="h-28 shrink-0">
            {badge}
          </GradientMotion>
        )}
        <div className="flex flex-1 flex-col p-6 pt-5">
          <h3 className="text-lg font-semibold">{service.name}</h3>
          <p className="mt-2 flex-1 text-[15px] leading-relaxed text-ink-500">{service.short}</p>
          <div className="mt-6 flex items-center justify-between gap-2 border-t border-line pt-4 text-[13px] font-semibold whitespace-nowrap">
            <Link to={`/services/${service.slug}`} className="inline-flex items-center gap-1 text-navy-900 hover:text-royal-600">
              Learn More <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link to={`/contact?service=${service.slug}#enquiry`} className="text-royal-600 hover:underline">
              Enquire Now
            </Link>
          </div>
        </div>
      </article>
    </Reveal>
  )
}

const benefits: { icon: typeof Workflow; title: string; text: string }[] = [
  { icon: Workflow, title: 'Simple Process', text: 'A clear, step-by-step process with guidance on exactly what is needed at each stage.' },
  { icon: Timer, title: 'Fast Approval Assistance', text: 'We help you prepare a complete application so lenders can review it without avoidable delays.' },
  { icon: BadgePercent, title: 'Competitive Rates', text: 'We help you compare offers from multiple lenders so you can choose what suits you best.' },
  { icon: Headset, title: 'Dedicated Support', text: 'A single point of contact who keeps you informed from enquiry to the lender’s decision.' },
]

export function WhyChooseUs() {
  return (
    <GradientMotion palette="royal" blobs={9} blur={110} speed={30} seed={13} contrast={1.15} className="py-20 sm:py-28">
      {/* Light streaks + dotted texture for depth behind the glass */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-[5]">
        <div className="absolute -top-24 left-1/4 h-72 w-[60%] -rotate-12 rounded-full bg-sky-300/20 blur-[90px]" />
        <div className="absolute right-0 -bottom-24 h-72 w-1/2 rotate-12 rounded-full bg-gold-400/15 blur-[90px]" />
        <div className="absolute inset-0 opacity-[0.12] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '22px 22px' }} />
      </div>
      <div className="container-page">
        <SectionHeading
          light
          eyebrow="Why choose us"
          title="Guidance you can rely on, at every step"
          align="center"
          intro="We focus on clear advice, complete documentation and regular updates, so you always know where your application stands."
        />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b, i) => (
            <Reveal key={b.title} delay={i * 0.08} className="h-full">
              <div
                onMouseMove={trackSpotlight}
                className="spotlight group relative h-full overflow-hidden rounded-3xl bg-white/[0.08] p-7 shadow-[0_8px_32px_rgb(2_8_28/0.35)] ring-1 ring-white/20 backdrop-blur-xl transform-gpu transition-[translate,background-color,box-shadow] duration-500 [backface-visibility:hidden] hover:-translate-y-2 hover:bg-white/[0.13] hover:ring-gold-400/50"
              >
                {/* glass highlight along the top edge */}
                <div aria-hidden className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                <span aria-hidden className="pointer-events-none absolute -right-2 -bottom-6 font-display text-[120px] leading-none font-extrabold text-white/[0.06] transition-[translate,color] duration-500 group-hover:-translate-y-2 group-hover:text-white/10">
                  0{i + 1}
                </span>
                <div className="relative flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 text-navy-950 shadow-[0_10px_30px_-6px_rgb(245_184_46/0.6)] transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                  <b.icon className="size-6" strokeWidth={1.9} />
                </div>
                <h3 className="relative mt-8 text-xl font-bold text-white">{b.title}</h3>
                <p className="relative mt-3 text-[15px] leading-relaxed text-white/75">{b.text}</p>
                <div aria-hidden className="relative mt-6 h-0.5 w-10 rounded-full bg-gold-400 transition-[width] duration-500 group-hover:w-20" />
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-10 text-center text-xs text-white/55">Loan approval and interest rates are decided by the lender and are not guaranteed.</p>
      </div>
    </GradientMotion>
  )
}

/** Plain section with the insurance cards. */
export function InsuranceShowcase({ services, cta }: { services: ServiceContent[]; cta?: ReactNode }) {
  return (
    <section className="bg-surface py-20 sm:py-24">
      <div className="container-page grid gap-12 lg:grid-cols-[1fr_2fr] lg:gap-16">
        <div>
          <p className="eyebrow">Insurance services</p>
          <h2 className="mt-3 text-3xl font-bold sm:text-[2.5rem] sm:leading-[1.15]">Protect what matters most</h2>
          <p className="mt-4 text-lg leading-relaxed text-ink-500">Alongside loans, we help you understand and choose insurance cover for your family, health, home and vehicles.</p>
          {cta}
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {services.map((s, i) => <ServiceCard key={s.slug} service={s} index={i} variant="glass" />)}
        </div>
      </div>
    </section>
  )
}

const steps = [
  { icon: MessageSquareText, title: 'Share Your Requirement', text: 'Tell us what you need through the enquiry form, a call or a visit to our office.' },
  { icon: Search, title: 'Explore Suitable Financial Options', text: 'We explain options from lenders in our network that match your profile and needs.' },
  { icon: FileCheck2, title: 'Documentation and Application Assistance', text: 'We guide you through the documents and help you submit a complete application.' },
  { icon: Scale, title: 'Lender Review and Decision', text: 'The lender reviews your application and makes the final decision on approval and disbursement.' },
]

export function HowItWorks() {
  return (
    <section className="py-20 sm:py-24">
      <div className="container-page">
        <SectionHeading eyebrow="How it works" title="Four simple steps" intro="From your first enquiry to the lender's decision, here is what to expect." />
        <ol className="relative mt-14 grid gap-8 md:grid-cols-4 md:gap-6">
          <div aria-hidden className="bg-motion-gold absolute top-8 right-[12%] left-[12%] hidden h-[2px] rounded-full opacity-60 md:block" />
          {steps.map((s, i) => (
            <li key={s.title}>
              <Reveal delay={i * 0.08} className="group relative flex gap-5 md:flex-col md:gap-0">
                <div className="border-conic relative size-16 shrink-0 rounded-full p-[2px] shadow-[0_10px_30px_-8px_rgb(255_85_0/0.45)]" style={{ animationDelay: `${-i * 1.5}s` }}>
                  <div className="flex size-full items-center justify-center rounded-full bg-white transition-colors duration-300 group-hover:bg-navy-900">
                    <s.icon className="size-6 text-royal-600 transition-colors duration-300 group-hover:text-gold-400" strokeWidth={1.75} />
                  </div>
                  <span className="absolute -top-1 -right-1 flex size-6 items-center justify-center rounded-full bg-navy-950 text-xs font-bold text-gold-400 ring-2 ring-white">{i + 1}</span>
                </div>
                <div className="md:mt-6">
                  <h3 className="text-[17px] font-semibold">{s.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink-500">{s.text}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
        <div className="mt-12 rounded-xl border border-gold-500/30 bg-gold-50 px-5 py-4 text-sm text-ink-700">
          <strong className="text-navy-900">Please note:</strong> Final loan approval, interest rates and disbursement are determined solely by the respective lender. {`Bright Financial Solution`} assists you with the process.
        </div>
      </div>
    </section>
  )
}

export function LenderNetwork() {
  return (
    <section className="py-20 sm:py-24">
      <div className="container-page">
        <SectionHeading
          eyebrow="Banking & lending network"
          title="Options across leading banks and NBFCs"
          intro="We help customers explore loan options from a wide range of banks and financial institutions, including:"
        />
        <ul className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {lenders.map((l, i) => (
            <li key={l.name} className="h-28">
              <Reveal delay={Math.min(i, 10) * 0.03} className="h-full">
                <div
                  onMouseMove={trackSpotlight}
                  className="spotlight group flex h-full flex-col items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-white px-4 text-center ring-1 ring-line transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card hover:ring-royal-600/30"
                >
                {l.logo ? (
                  <img src={l.logo} alt={`${l.name} logo`} className="relative max-h-10 max-w-[85%] object-contain transition-transform duration-300 group-hover:scale-110" loading="lazy" decoding="async" />
                ) : null}
                <span className={l.logo ? 'text-[11px] font-medium text-ink-500' : 'text-sm font-semibold text-ink-700'}>{l.name}</span>
                  <span aria-hidden className="bg-motion-gold absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100" />
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-xs text-ink-400">
          Bank and institution names are shown for information only and do not indicate a formal partnership or authorised-agent relationship. Trademarks belong to their respective owners.
        </p>
      </div>
    </section>
  )
}
