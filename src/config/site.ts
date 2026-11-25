// Business information. Only the name, taglines and address come from the BFS flyer.
// Phone, WhatsApp, email, hours and social links are configured through environment
// variables and stay hidden until BFS confirms them. Never hard-code them here.

const env = import.meta.env

export const site = {
  name: 'Bright Financial Solution',
  shortName: 'BFS',
  tagline: 'Your Trusted Loan Partner',
  secondaryTagline: 'Dream | Plan | Achieve',
  url: (env.VITE_SITE_URL ?? '').replace(/\/$/, ''),
  address: {
    lines: ['A13/17, 2nd Floor, THHB Colony,', 'Bagaluru Road, Hudco,', 'Hosur – 635 109, Tamil Nadu, India.'],
    street: 'A13/17, 2nd Floor, THHB Colony, Bagaluru Road, Hudco',
    locality: 'Hosur',
    region: 'Tamil Nadu',
    postalCode: '635109',
    country: 'IN',
  },
  // Google Maps listing for the office (place "Bright Financial Solution", Hosur).
  mapsUrl:
    'https://www.google.com/maps/place/Bright+Financial+Solution/@12.7392874,77.8298127,17.63z/data=!4m9!1m2!2m1!1sA13%2F17,+THHB+Colony,+Bagaluru+Road,+Hudco,+Hosur+635109,+Tamil+Nadu!3m5!1s0x3bae71ebc209109b:0x73bec8e2497248e9!8m2!3d12.7390771!4d77.8307374!16s%2Fg%2F11z_00477z',
  geo: { lat: 12.7390771, lng: 77.8307374 },
  mapsEmbedUrl: 'https://www.google.com/maps?output=embed&z=17&q=' + encodeURIComponent('Bright Financial Solution, Hosur @12.7390771,77.8307374'),
  contact: {
    phone: env.VITE_CONTACT_PHONE ?? '',
    whatsapp: env.VITE_CONTACT_WHATSAPP ?? '',
    email: env.VITE_CONTACT_EMAIL ?? '',
    hours: env.VITE_BUSINESS_HOURS ?? '',
  },
  social: {
    facebook: env.VITE_SOCIAL_FACEBOOK ?? '',
    instagram: env.VITE_SOCIAL_INSTAGRAM ?? '',
    linkedin: env.VITE_SOCIAL_LINKEDIN ?? '',
  },
} as const

/**
 * Hero mosaic photos (up to 4), e.g. ['/images/hero-1.jpg', ...]. Use only photos BFS owns or has
 * licensed. Empty slots show brand gradient tiles instead.
 */
export const heroPhotos: string[] = []

export const whatsappLink = (text?: string) => {
  const digits = site.contact.whatsapp.replace(/\D/g, '')
  if (!digits) return ''
  const n = digits.length === 10 ? `91${digits}` : digits
  return `https://wa.me/${n}${text ? `?text=${encodeURIComponent(text)}` : ''}`
}

export const telLink = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`
