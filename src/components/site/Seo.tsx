import { site } from '@/config/site'

interface SeoProps {
  title: string
  description: string
  path: string
  /** Optional JSON-LD object(s). */
  jsonLd?: object | object[]
  noindex?: boolean
}

/** React 19 hoists <title>, <meta> and <link> into <head>. */
export function Seo({ title, description, path, jsonLd, noindex }: SeoProps) {
  const fullTitle = title.includes(site.name) ? title : `${title} | ${site.name}`
  const canonical = site.url ? `${site.url}${path}` : undefined
  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {canonical && <link rel="canonical" href={canonical} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={site.name} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {canonical && <meta property="og:url" content={canonical} />}
      {site.url && <meta property="og:image" content={`${site.url}/og-image.png`} />}
      <meta name="twitter:card" content="summary_large_image" />
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </>
  )
}

/** LocalBusiness data using only verified details from the BFS flyer plus configured contact fields. */
export function localBusinessJsonLd() {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'FinancialService',
    name: site.name,
    slogan: site.tagline,
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address.street,
      addressLocality: site.address.locality,
      addressRegion: site.address.region,
      postalCode: site.address.postalCode,
      addressCountry: site.address.country,
    },
    geo: { '@type': 'GeoCoordinates', latitude: site.geo.lat, longitude: site.geo.lng },
    hasMap: site.mapsUrl,
    areaServed: 'Hosur',
  }
  if (site.url) data.url = site.url
  if (site.contact.phone) data.telephone = site.contact.phone
  if (site.contact.email) data.email = site.contact.email
  return data
}
