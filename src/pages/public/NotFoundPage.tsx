import { Link } from 'react-router-dom'
import { Seo } from '@/components/site/Seo'
import { buttonClass } from '@/components/ui/Button'

export default function NotFoundPage() {
  return (
    <section className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <Seo title="Page not found" description="The page you are looking for does not exist." path="/404" noindex />
      <p className="font-display text-7xl font-extrabold text-navy-900">404</p>
      <h1 className="mt-4 text-2xl font-bold">We couldn't find that page</h1>
      <p className="mt-2 text-ink-500">The page may have moved, or the link may be incorrect.</p>
      <div className="mt-8 flex gap-3">
        <Link to="/" className={buttonClass('primary', 'lg')}>Go to homepage</Link>
        <Link to="/contact" className={buttonClass('secondary', 'lg')}>Contact us</Link>
      </div>
    </section>
  )
}
