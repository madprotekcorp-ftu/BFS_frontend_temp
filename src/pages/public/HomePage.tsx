import { motion } from 'framer-motion'
import { ArrowRight, Building2, Calculator, CheckCircle2, Landmark, PhoneCall, ShieldCheck, Sparkle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { HowItWorks, InsuranceShowcase, LenderNetwork, ServiceCard, WhyChooseUs } from '@/components/site/Blocks'
import { EnquiryForm } from '@/components/site/EnquiryForm'
import { HeroMosaic } from '@/components/site/HeroMosaic'
import { Reveal, SectionHeading } from '@/components/site/Section'
import { localBusinessJsonLd, Seo } from '@/components/site/Seo'
import { buttonClass } from '@/components/ui/Button'
import { GradientMotion } from '@/components/ui/GradientMotion'
import { insuranceServices, loanServices } from '@/config/services'
import { site } from '@/config/site'

export default function HomePage() {
  return (
    <>
      <Seo
        title="Loan Consultant in Hosur | Bright Financial Solution"
        description="Bright Financial Solution, Hosur: assistance with personal, business, home, gold and MSME loans and insurance. Compare options from leading banks and NBFCs."
        path="/"
        jsonLd={localBusinessJsonLd()}
      />
      <Hero />

      <section className="py-20 sm:py-24" aria-labelledby="loans-heading">
        <div className="container-page">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading eyebrow="Loan services" title="Loans for every stage of life and business" intro="From your first home to growing your enterprise, we help you find and apply for the right loan." />
            <Link to="/services" className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-royal-600 hover:underline">
              View all services <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {loanServices.map((s, i) => <ServiceCard key={s.slug} service={s} index={i} />)}
          </div>
        </div>
      </section>

      <WhyChooseUs />

      <InsuranceShowcase
        services={insuranceServices}
        cta={
          <Link to="/contact?service=life-insurance#enquiry" className={buttonClass('gold', 'lg', 'mt-8')}>
            Enquire about insurance
          </Link>
        }
      />

      <HowItWorks />
      <EmiTeaser />
      <LenderNetwork />
      <EnquirySection />
    </>
  )
}

function Hero() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-white">
        {/* Soft light motion backdrop */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="motion-orb absolute -top-40 -left-40 size-[520px] rounded-full bg-royal-100 blur-[120px]" style={{ animation: 'orb-drift-a 24s ease-in-out infinite' }} />
          <div className="motion-orb absolute right-1/3 -bottom-40 size-[420px] rounded-full bg-gold-100 blur-[120px]" style={{ animation: 'orb-drift-b 28s ease-in-out infinite' }} />
          <div
            className="absolute inset-0 opacity-[0.5] [mask-image:linear-gradient(to_right,black,transparent_60%)]"
            style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(8 45 101 / 0.12) 1px, transparent 0)', backgroundSize: '26px 26px' }}
          />
        </div>

        <div className="container-page grid items-center gap-12 py-14 sm:py-16 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:py-14">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
            <p className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3.5 py-1.5 text-sm font-medium text-ink-700 shadow-sm">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-gold-500 opacity-60" />
                <span className="relative inline-flex size-2 rounded-sm bg-royal-600" />
              </span>
              {site.tagline}
            </p>
            <h1 className="mt-7 text-[2.75rem] leading-[1.04] font-semibold tracking-[-0.035em] text-navy-900 sm:text-6xl xl:text-[4.5rem]">
              Your Financial Goals.{' '}
              <span className="bg-gradient-to-r from-royal-600 via-[#FF5500] to-gold-500 bg-[length:200%_auto] bg-clip-text text-transparent" style={{ animation: 'gradient-shift 6s ease-in-out infinite' }}>
                Our Commitment.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-500">
              Explore financial solutions for your personal, business and future needs. {site.name} helps you navigate loan and insurance options with dedicated assistance.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Link to="/services" className="group inline-flex h-14 items-center overflow-hidden rounded-xl bg-navy-900 pl-6 text-[15px] font-semibold text-white shadow-[0_12px_30px_-10px_rgb(8_45_101/0.6)] transition-colors hover:bg-navy-800">
                Explore Loan Options
                <span className="ml-5 flex h-full w-14 items-center justify-center bg-gold-500 text-navy-950 transition-[width] duration-300 group-hover:w-16">
                  <ArrowRight className="size-5 transition-transform duration-300 group-hover:translate-x-0.5" />
                </span>
              </Link>
              <Link to="/contact#enquiry" className="inline-flex items-center gap-2 text-[15px] font-semibold text-navy-900 underline-offset-4 hover:text-royal-600 hover:underline">
                <PhoneCall className="size-4" /> Request a Callback
              </Link>
            </div>
            <div className="mt-12 flex items-center gap-4 border-t border-line pt-6">
              <div className="flex -space-x-2">
                {[Building2, ShieldCheck, Landmark].map((I, i) => (
                  <span key={i} className="flex size-10 items-center justify-center rounded-full bg-white text-royal-600 shadow-card ring-2 ring-white">
                    <I className="size-4" />
                  </span>
                ))}
              </div>
              <p className="text-sm leading-snug text-ink-500">
                <span className="font-semibold text-ink-900">Loans & insurance in one place</span>
                <br />Options across leading banks and NBFCs, from our office in Hosur.
              </p>
            </div>
          </motion.div>

          <div className="mx-auto w-full max-w-[460px] lg:mr-0 lg:max-w-[min(500px,calc((100vh-180px)*0.75))]">
            <HeroMosaic />
          </div>
        </div>
      </section>
      <TrustMarquee />
    </>
  )
}

const marqueeItems = ['10 loan categories', '5 insurance categories', 'Banks & NBFCs', 'Office in Hosur, Tamil Nadu', 'Free EMI calculator', 'Dedicated assistance', 'Dream · Plan · Achieve']

function TrustMarquee() {
  const row = [...marqueeItems, ...marqueeItems]
  return (
    <div className="relative overflow-hidden border-y border-navy-800 bg-navy-900 py-4 text-white" aria-label="Highlights">
      <div className="flex w-max animate-[marquee_38s_linear_infinite] motion-reduce:animate-none hover:[animation-play-state:paused]">
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-10 pr-10 text-sm font-medium whitespace-nowrap text-white/85" aria-hidden={i >= marqueeItems.length}>
            {t}
            <Sparkle className="size-3.5 text-gold-500" />
          </span>
        ))}
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-navy-900 to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-navy-900 to-transparent" />
    </div>
  )
}

function EmiTeaser() {
  return (
    <section className="py-8">
      <div className="container-page">
        <Reveal>
          <GradientMotion palette="royal" blobs={8} blur={80} speed={24} seed={9} className="grid items-center gap-8 rounded-3xl p-8 text-white shadow-lift sm:p-12 lg:grid-cols-[auto_1fr_auto]">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-white/15 text-gold-400 ring-1 ring-white/30 backdrop-blur-md">
              <Calculator className="size-8" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Plan your repayments with our EMI calculator</h2>
              <p className="mt-2 text-white/75">Estimate your monthly instalment, total interest and total repayment in seconds. No sign-up needed.</p>
            </div>
            <Link to="/emi-calculator" className={buttonClass('gold', 'lg')}>Calculate EMI <ArrowRight className="size-4" /></Link>
          </GradientMotion>
        </Reveal>
      </div>
    </section>
  )
}

function EnquirySection() {
  return (
    <section id="enquiry" className="scroll-mt-28 bg-surface py-20 sm:py-24">
      <div className="container-page grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
        <div>
          <SectionHeading eyebrow="Get in touch" title="Request a callback" intro="Share a few details and our team will contact you to understand your requirement and explain your options." />
          <ul className="mt-8 space-y-4 text-[15px]">
            {['A team member calls you back to understand your needs','Guidance on documents lenders typically ask for', 'Your details are used only to respond to your enquiry'].map((t) => (
              <li key={t} className="flex gap-3"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-royal-600" /> {t}</li>
            ))}
          </ul>
        </div>
        <div className="border-conic-soft rounded-3xl p-[2px] shadow-lift">
          <div className="rounded-[22px] bg-white p-6 sm:p-9">
            <EnquiryForm />
          </div>
        </div>
      </div>
    </section>
  )
}
