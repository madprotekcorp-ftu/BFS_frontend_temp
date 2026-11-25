import { Compass, Eye, HandHeart, Landmark, ListChecks, Target } from 'lucide-react'
import { HowItWorks } from '@/components/site/Blocks'
import { PageHero, Reveal, SectionHeading } from '@/components/site/Section'
import { Seo } from '@/components/site/Seo'
import { site } from '@/config/site'
import { trackSpotlight } from '@/lib/spotlight'

// Draft mission and vision wording: replace with BFS-approved text when supplied.
const missionVision = [
  {
    icon: Target,
    label: 'Our mission',
    title: 'Make borrowing and protection simple',
    text: 'To guide every customer with honest, clear advice, help them choose loan and insurance options that suit their needs, and support them with complete, well-prepared applications from the first conversation to the lender’s decision.',
  },
  {
    icon: Eye,
    label: 'Our vision',
    title: 'Hosur’s most trusted financial partner',
    text: 'To be the first name families and businesses in Hosur think of when they plan a financial goal, known for transparency, dependable service and long-term relationships that help them Dream, Plan and Achieve.',
  },
]

const approach = [
  { icon: HandHeart, title: 'Listen first', text: 'We start by understanding your goal, your income pattern and what repayment feels comfortable.' },
  { icon: Compass, title: 'Explain clearly', text: 'We explain options, terms and lender requirements in plain language, so you can make an informed choice.' },
  { icon: ListChecks, title: 'Prepare thoroughly', text: 'We help you organise documents and complete applications carefully to avoid back-and-forth.' },
  { icon: Landmark, title: 'Stay with you', text: 'We keep you updated as the lender reviews your application, until a decision is made.' },
]

export default function AboutPage() {
  return (
    <>
      <Seo
        title="About Us | Bright Financial Solution Hosur"
        description="Bright Financial Solution is a Hosur-based loan and insurance assistance firm helping individuals, families and businesses explore financial options."
        path="/about"
      />
      <PageHero palette="aurora" eyebrow="About us" title="Helping you move forward with confidence" intro={`${site.name} is a financial services firm in Hosur, Tamil Nadu, helping customers navigate loan and insurance options.`} />

      <section className="py-20 sm:py-24">
        <div className="container-page grid gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <SectionHeading eyebrow="Who we are" title="Your trusted loan partner in Hosur" />
          </Reveal>
          <Reveal delay={0.1}>
            <div className="space-y-5 text-[17px] leading-relaxed text-ink-700">
              <p>
                Choosing the right loan or insurance can feel complicated. Every lender has its own products, criteria and paperwork. {site.name} brings that information together and guides you through it.
              </p>
              <p>
                We work with salaried individuals, self-employed professionals, families and businesses. Whether you are buying a home, growing a business, funding education or protecting your family, our team helps you understand your options and apply with confidence.
              </p>
              <p className="rounded-xl border-l-4 border-gold-500 bg-gold-50 px-5 py-4 text-[15px]">
                We assist you with the process. Final approval, interest rates and disbursement are always decided by the respective lender or insurer.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-surface py-20 sm:py-24">
        <div className="container-page">
          <SectionHeading eyebrow="Our approach" title="How we assist our customers" align="center" />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {approach.map((a, i) => (
              <Reveal key={a.title} delay={i * 0.06}>
                <div onMouseMove={trackSpotlight} className="spotlight group h-full overflow-hidden rounded-2xl bg-white p-7 shadow-card ring-1 ring-line transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
                  <div className="bg-motion-gold flex size-12 items-center justify-center rounded-xl text-navy-950 transition-transform duration-300 group-hover:rotate-6"><a.icon className="size-6" strokeWidth={1.8} /></div>
                  <h3 className="mt-5 text-lg font-semibold">{a.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink-500">{a.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="container-page">
          <SectionHeading eyebrow="Mission & vision" title="What drives us" align="center" />
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {missionVision.map((m, i) => (
              <Reveal key={m.label} delay={i * 0.08} className="h-full">
                <div onMouseMove={trackSpotlight} className="spotlight h-full overflow-hidden rounded-3xl bg-white p-8 shadow-card ring-1 ring-line transition-[translate,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lift sm:p-10">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 text-navy-950 shadow-[0_10px_30px_-6px_rgb(245_184_46/0.6)]">
                    <m.icon className="size-7" strokeWidth={1.8} />
                  </div>
                  <p className="mt-7 text-xs font-semibold tracking-[0.16em] text-royal-600 uppercase">{m.label}</p>
                  <h3 className="mt-2 text-2xl font-bold">{m.title}</h3>
                  <p className="mt-4 text-[16px] leading-relaxed text-ink-500">{m.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <HowItWorks />
    </>
  )
}
