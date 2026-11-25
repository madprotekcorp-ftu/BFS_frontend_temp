import { clsx } from 'clsx'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'
import type { LeadSourceCode, LeadStatusCode, Pagination as PaginationT } from '@/lib/api/types'
import { formatNumber } from '@/lib/format'

export const STATUS_STYLES: Record<LeadStatusCode, { badge: string; color: string }> = {
  new: { badge: 'bg-royal-50 text-royal-600 ring-royal-600/20', color: '#0755A5' },
  contacted: { badge: 'bg-sky-50 text-sky-700 ring-sky-600/20', color: '#0EA5E9' },
  interested: { badge: 'bg-violet-50 text-violet-700 ring-violet-600/20', color: '#7C3AED' },
  follow_up: { badge: 'bg-amber-50 text-amber-700 ring-amber-600/25', color: '#F5B82E' },
  converted: { badge: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', color: '#059669' },
  closed: { badge: 'bg-slate-100 text-slate-600 ring-slate-500/20', color: '#94A3B8' },
}

export function StatusBadge({ status }: { status: { code: LeadStatusCode; label: string } }) {
  return (
    <span className={clsx('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ring-1 ring-inset', STATUS_STYLES[status.code]?.badge)}>
      <span className="size-1.5 rounded-full" style={{ background: STATUS_STYLES[status.code]?.color }} />
      {status.label}
    </span>
  )
}

export function SourceBadge({ source }: { source: { code: LeadSourceCode; label: string } }) {
  return <span className="inline-flex rounded-md bg-surface px-2 py-0.5 text-xs font-medium whitespace-nowrap text-ink-700">{source.label}</span>
}

export function Card({ title, action, children, className, bodyClassName }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; bodyClassName?: string }) {
  return (
    <section className={clsx('rounded-xl border border-line bg-white', className)}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
          {title && <h2 className="text-[15px] font-semibold">{title}</h2>}
          {action}
        </div>
      )}
      <div className={clsx(bodyClassName ?? 'p-5')}>{children}</div>
    </section>
  )
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function Pagination({ pagination, onPage }: { pagination: PaginationT; onPage: (p: number) => void }) {
  const { page, total_pages, total, page_size } = pagination
  const from = total === 0 ? 0 : (page - 1) * page_size + 1
  const to = Math.min(page * page_size, total)
  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-line px-5 py-3 text-sm text-ink-500 sm:flex-row">
      <p>
        Showing <span className="font-medium text-ink-900">{formatNumber(from)}–{formatNumber(to)}</span> of{' '}
        <span className="font-medium text-ink-900">{formatNumber(total)}</span>
      </p>
      <div className="flex items-center gap-1">
        <button className="rounded-md p-1.5 hover:bg-surface disabled:opacity-40" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page">
          <ChevronLeft className="size-4" />
        </button>
        <span className="px-2">Page {page} of {Math.max(total_pages, 1)}</span>
        <button className="rounded-md p-1.5 hover:bg-surface disabled:opacity-40" disabled={page >= total_pages} onClick={() => onPage(page + 1)} aria-label="Next page">
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  )
}

export const filterControl =
  'h-9 rounded-lg border border-line bg-white px-3 text-sm text-ink-900 focus:border-royal-600 focus:ring-3 focus:ring-royal-100 focus:outline-none'

export function DefinitionGrid({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
      {items.map((i) => (
        <div key={i.label}>
          <dt className="text-xs font-medium text-ink-500">{i.label}</dt>
          <dd className="mt-1 text-sm break-words text-ink-900">{i.value || <span className="text-ink-400">—</span>}</dd>
        </div>
      ))}
    </dl>
  )
}
