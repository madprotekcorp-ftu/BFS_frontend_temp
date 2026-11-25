import { PageHero } from '@/components/site/Section'
import { Seo } from '@/components/site/Seo'
import { site } from '@/config/site'

// DRAFT: This policy must be reviewed and approved by BFS (and ideally a legal advisor) before launch.

const sections: { title: string; body: string[] }[] = [
  {
    title: 'Information we collect',
    body: [
      'When you submit an enquiry, we collect the details you provide: your name, mobile number, location, the service you are interested in, an approximate loan amount, your occupation and any message you write.',
      'If you choose to proceed with an application, we may ask for documents such as identity, address and income proof. These are collected directly by our team, not through this website.',
    ],
  },
  {
    title: 'How we use your information',
    body: [
      'We use your details to contact you about your enquiry, understand your requirement, explain suitable options and assist with your application.',
      'We do not sell your personal information.',
    ],
  },
  {
    title: 'Sharing with lenders and insurers',
    body: [
      'With your agreement, we share the information needed for your application with the bank, NBFC or insurer you choose to apply with. Those institutions process your data under their own privacy policies.',
    ],
  },
  {
    title: 'How we protect your information',
    body: [
      'Enquiry records and documents are stored in systems that only authorised BFS staff can access. Connections to this website are encrypted.',
    ],
  },
  {
    title: 'How long we keep it',
    body: ['We keep enquiry and application records only for as long as needed to serve you and to meet legal and regulatory obligations.'],
  },
  {
    title: 'Your choices',
    body: [
      'You can ask us to update or delete your details, or to stop contacting you, at any time by contacting our office.',
    ],
  },
  {
    title: 'EMI calculator',
    body: ['The EMI calculator runs entirely in your browser. The figures you enter are not sent to or stored by us.'],
  },
]

export default function PrivacyPage() {
  return (
    <>
      <Seo title="Privacy Policy" description={`How ${site.name} collects, uses and protects your personal information.`} path="/privacy-policy" />
      <PageHero palette="midnight" eyebrow="Legal" title="Privacy Policy" intro={`How ${site.name} collects, uses and protects the information you share with us.`} />
      <section className="py-16 sm:py-20">
        <div className="container-page max-w-3xl">
          <div className="space-y-10">
            {sections.map((s) => (
              <div key={s.title}>
                <h2 className="text-xl font-semibold">{s.title}</h2>
                {s.body.map((p) => <p key={p} className="mt-3 leading-relaxed text-ink-700">{p}</p>)}
              </div>
            ))}
            <div>
              <h2 className="text-xl font-semibold">Contact</h2>
              <p className="mt-3 leading-relaxed text-ink-700">
                For questions about this policy, please contact us at our office: {site.address.lines.join(' ')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
