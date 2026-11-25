// Generates public/sitemap.xml and robots.txt from VITE_SITE_URL and the service slugs.
// Runs before `vite build`. Reads .env.production / .env if present.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'

function loadEnv() {
  const env = { ...process.env }
  for (const file of ['.env', '.env.production', '.env.production.local']) {
    if (!existsSync(file)) continue
    for (const line of readFileSync(file, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m && !(m[1] in process.env)) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  }
  return env
}

const env = loadEnv()
const base = (env.VITE_SITE_URL || 'https://www.example.com').replace(/\/$/, '')
const slugs = [...readFileSync('src/config/services.ts', 'utf8').matchAll(/slug: '([a-z0-9-]+)'/g)].map((m) => m[1])
const paths = ['/', '/about', '/services', '/emi-calculator', '/contact', '/privacy-policy', ...slugs.map((s) => `/services/${s}`)]
const today = new Date().toISOString().slice(0, 10)

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `  <url><loc>${base}${p}</loc><lastmod>${today}</lastmod><priority>${p === '/' ? '1.0' : p.startsWith('/services/') ? '0.8' : '0.6'}</priority></url>`).join('\n')}
</urlset>
`
writeFileSync('public/sitemap.xml', xml)
writeFileSync('public/robots.txt', `User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: ${base}/sitemap.xml\n`)
console.log(`sitemap.xml: ${paths.length} URLs for ${base}`)
