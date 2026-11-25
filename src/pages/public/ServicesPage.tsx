import { InsuranceShowcase, ServiceCard } from '@/components/site/Blocks'
import { PageHero, SectionHeading } from '@/components/site/Section'
import { Seo } from '@/components/site/Seo'
import { insuranceServices, loanServices } from '@/config/services'

export default function ServicesPage() {
  return (
    <>
      <Seo
        title="Loan & Insurance Services in Hosur"
        description="Personal, business, home, plot, car, commercial vehicle, education, gold, MSME and top-up loans, plus life, health, vehicle, home and accident insurance in Hosur."
        path="/services"
      />
      <PageHero palette="royal" eyebrow="Our services" title="Loan and insurance assistance, all in one place" intro="Explore our loan and insurance categories. Select a service to learn more or send us an enquiry." />
      <section className="py-20" aria-labelledby="loans">
        <div className="container-page">
          <SectionHeading eyebrow="Loans" title="Loan services" />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {loanServices.map((s, i) => <ServiceCard key={s.slug} service={s} index={i} />)}
          </div>
        </div>
      </section>
      <InsuranceShowcase services={insuranceServices} />
    </>
  )
}
