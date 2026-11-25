import type { ReactNode } from 'react'
import { ArrowLeft, CheckCircle2, FileText, Users } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { ServiceCard } from '@/components/site/Blocks'
import { EnquiryForm } from '@/components/site/EnquiryForm'
import { PageHero, Reveal } from '@/components/site/Section'
import { Seo } from '@/components/site/Seo'
import { allServices, findService, serviceImage } from '@/config/services'
import NotFoundPage from './NotFoundPage'

export default function ServiceDetailPage() {
  const { slug = '' } = useParams()
  const service = findService(slug)
  if (!service) return <NotFoundPage />

  const related = allServices.filter((s) => s.group === service.group && s.slug !== service.slug).slice(0, 3)
  const Icon = service.icon

  return (
    <>
      <Seo
        title={`${service.name} in Hosur`}
        description={`${service.name} assistance in Hosur from Bright Financial Solution. ${service.short}`}
        path={`/services/${service.slug}`}
      />
      <PageHero image={serviceImage(service.slug)} palette={service.group === 'loan' ? 'midnight' : 'ember'} eyebrow={service.group === 'loan' ? 'Loan service' : 'Insurance service'} title={service.name} intro={service.intro}>
        <Link to="/services" className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-white/70 hover:text-white">
          <ArrowLeft className="size-4" /> All services
        </Link>
      </PageHero>

      <section className="py-16 sm:py-20">
        <div className="container-page grid gap-12 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
          <div className="space-y-12">
            <Reveal>
              <div className="flex items-center gap-4">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-royal-50 text-royal-600">
                  <Icon className="size-7" strokeWidth={1.6} />
                </div>
                <p className="text-lg text-ink-700">{service.short}</p>
              </div>
            </Reveal>
            <DetailList icon={<Users className="size-5" />} title="Who it is for" items={service.suitableFor} />
            <DetailList icon={<CheckCircle2 className="size-5" />} title="How we help" items={service.howWeHelp} />
            <DetailList
              icon={<FileText className="size-5" />}
              title="Documents commonly requested"
              items={service.documents}
              note="Exact requirements vary by lender and your profile. We confirm the final list with you."
            />
            <p className="rounded-xl bg-surface px-5 py-4 text-sm text-ink-500">
              Eligibility, interest rates, approval and disbursement are decided solely by the respective {service.group === 'loan' ? 'lender' : 'insurer'}.
            </p>
          </div>

          <aside id="enquiry" className="scroll-mt-28">
            <div className="border-conic-soft sticky top-28 rounded-3xl p-[2px] shadow-lift"><div className="rounded-[22px] bg-white p-6 sm:p-8">
              <h2 className="text-xl font-semibold">Enquire about {service.name}</h2>
              <p className="mt-1.5 mb-6 text-sm text-ink-500">Share your details and we will call you back.</p>
              <EnquiryForm defaultServiceSlug={service.slug} compact />
            </div></div>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-surface py-16 sm:py-20">
          <div className="container-page">
            <h2 className="text-2xl font-bold">Related services</h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((s, i) => <ServiceCard key={s.slug} service={s} index={i} />)}
            </div>
          </div>
        </section>
      )}
    </>
  )
}

function DetailList({ icon, title, items, note }: { icon: ReactNode; title: string; items: string[]; note?: string }) {
  return (
    <Reveal>
      <h2 className="flex items-center gap-2.5 text-xl font-semibold"><span className="text-gold-600">{icon}</span>{title}</h2>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {items.map((i) => (
          <li key={i} className="flex gap-3 rounded-xl border border-line px-4 py-3.5 text-[15px]">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-royal-600" /> {i}
          </li>
        ))}
      </ul>
      {note && <p className="mt-3 text-sm text-ink-500">{note}</p>}
    </Reveal>
  )
}
