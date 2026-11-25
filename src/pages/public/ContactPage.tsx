import { Clock, ExternalLink, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import type { ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { EnquiryForm } from '@/components/site/EnquiryForm'
import { PageHero } from '@/components/site/Section'
import { localBusinessJsonLd, Seo } from '@/components/site/Seo'
import { site, telLink, whatsappLink } from '@/config/site'
import { trackSpotlight } from '@/lib/spotlight'

export default function ContactPage() {
  const [params] = useSearchParams()
  const service = params.get('service') ?? undefined
  const wa = whatsappLink()

  return (
    <>
      <Seo
        title="Contact Us | Bright Financial Solution Hosur"
        description="Visit Bright Financial Solution at THHB Colony, Bagaluru Road, Hudco, Hosur, or send an enquiry and our team will call you back."
        path="/contact"
        jsonLd={localBusinessJsonLd()}
      />
      <PageHero palette="ocean" eyebrow="Contact us" title="We're here to help" intro="Send us an enquiry or visit our office in Hosur. Our team will get back to you to discuss your requirement." />

      <section className="py-16 sm:py-20">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.5fr] lg:gap-14">
          <div className="space-y-4">
            <ContactItem icon={<MapPin />} title="Office address">
              <address className="not-italic">
                <strong className="block text-navy-900">{site.name}</strong>
                {site.address.lines.map((l) => <span key={l} className="block">{l}</span>)}
              </address>
              <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-royal-600 hover:underline">
                Get directions <ExternalLink className="size-3.5" />
              </a>
            </ContactItem>
            {site.contact.phone && (
              <ContactItem icon={<Phone />} title="Phone">
                <a href={telLink(site.contact.phone)} className="hover:text-navy-900">{site.contact.phone}</a>
              </ContactItem>
            )}
            {wa && (
              <ContactItem icon={<MessageCircle />} title="WhatsApp">
                <a href={wa} target="_blank" rel="noopener noreferrer" className="hover:text-navy-900">{site.contact.whatsapp}</a>
              </ContactItem>
            )}
            {site.contact.email && (
              <ContactItem icon={<Mail />} title="Email">
                <a href={`mailto:${site.contact.email}`} className="hover:text-navy-900">{site.contact.email}</a>
              </ContactItem>
            )}
            {site.contact.hours && (
              <ContactItem icon={<Clock />} title="Business hours">
                <span className="whitespace-pre-line">{site.contact.hours}</span>
              </ContactItem>
            )}
            <div className="overflow-hidden rounded-2xl border border-line">
              <iframe
                title="Map showing the Bright Financial Solution office in Hosur"
                src={site.mapsEmbedUrl}
                className="h-64 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          <div id="enquiry" className="border-conic-soft scroll-mt-28 rounded-3xl p-[2px] shadow-lift"><div className="h-full rounded-[22px] bg-white p-6 sm:p-10">
            <h2 className="text-2xl font-bold">Send us an enquiry</h2>
            <p className="mt-2 mb-8 text-ink-500">Fields marked * are required. We will only use your details to respond to your enquiry.</p>
            <EnquiryForm defaultServiceSlug={service} />
          </div></div>
        </div>
      </section>
    </>
  )
}

function ContactItem({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div onMouseMove={trackSpotlight} className="spotlight flex gap-4 overflow-hidden rounded-2xl bg-surface p-5 ring-1 ring-transparent transition hover:bg-white hover:ring-line">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white text-royal-600 shadow-card [&>svg]:size-5">{icon}</div>
      <div className="text-[15px] leading-relaxed text-ink-700">
        <p className="mb-1 text-sm font-semibold text-ink-900">{title}</p>
        {children}
      </div>
    </div>
  )
}
