import { useQuery } from '@tanstack/react-query'
import { clsx } from 'clsx'
import { ExternalLink, FileStack, Search, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { EmptyState, Spinner } from '@/components/ui/Feedback'
import { adminApi } from '@/lib/api/endpoints'
import { formatMobile } from '@/lib/format'
import { DocumentBin } from '../components/DocumentBin'
import { DocumentsPanel } from '../components/DocumentsPanel'
import { filterControl, PageHeader, StatusBadge } from '../components/ui'
import { useDebounced } from '../hooks'

export default function DocumentsPage() {
  const [params, setParams] = useSearchParams()
  const leadId = Number(params.get('lead')) || null
  const view = params.get('view') === 'bin' ? 'bin' : 'lead'
  const [search, setSearch] = useState('')
  const debounced = useDebounced(search)

  const results = useQuery({
    queryKey: ['admin', 'leads', 'doc-search', debounced],
    queryFn: () => adminApi.leads({ search: debounced, page_size: 8 }),
    enabled: debounced.trim().length >= 2,
  })
  const lead = useQuery({ queryKey: ['admin', 'lead', leadId], queryFn: () => adminApi.lead(leadId!), enabled: !!leadId })

  return (
    <>
      <PageHeader title="Documents" description="Find a lead to view, upload or remove its documents." />
      <div role="tablist" className="mb-6 flex gap-1 border-b border-line">
        {([['lead', 'By lead'], ['bin', 'Bin']] as const).map(([k, l]) => (
          <button
            key={k}
            role="tab"
            aria-selected={view === k}
            onClick={() => setParams(k === 'bin' ? { view: 'bin' } : leadId ? { lead: String(leadId) } : {})}
            className={clsx('-mb-px border-b-2 px-4 py-2.5 text-sm font-medium', view === k ? 'border-navy-900 text-navy-900' : 'border-transparent text-ink-500 hover:text-ink-900')}
          >
            {l}
          </button>
        ))}
      </div>
      {view === 'bin' ? <DocumentBin /> : <>
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-royal-100 bg-royal-50 p-4 text-sm text-navy-900">
        <ShieldCheck className="mt-0.5 size-4 shrink-0" />
        <p>Documents are stored privately and can only be opened by signed-in administrators. Upload KYC or financial documents only when needed for an application.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <div className="rounded-xl border border-line bg-white">
          <div className="border-b border-line p-4">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-400" />
              <input type="search" autoFocus aria-label="Search leads" placeholder="Search name, mobile or lead ID" className={clsx(filterControl, 'w-full pl-9')} value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          {debounced.trim().length < 2 ? (
            <p className="px-5 py-8 text-center text-sm text-ink-400">Type at least 2 characters to search.</p>
          ) : results.isLoading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : results.data?.data.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-ink-400">No leads found.</p>
          ) : (
            <ul className="divide-y divide-line">
              {results.data?.data.map((l) => (
                <li key={l.id}>
                  <button onClick={() => setParams({ lead: String(l.id) })} className={clsx('w-full px-5 py-3 text-left hover:bg-surface/60', l.id === leadId && 'bg-royal-50')}>
                    <p className="text-sm font-medium text-ink-900">{l.customer_name}</p>
                    <p className="text-xs text-ink-500">{l.lead_code} · {formatMobile(l.mobile)} · {l.service.name}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="min-w-0">
          {!leadId ? (
            <div className="rounded-xl border border-line bg-white">
              <EmptyState icon={<FileStack className="size-5" />} title="Select a lead" description="Search for a lead on the left to manage its documents." />
            </div>
          ) : (
            <div className="space-y-4">
              {lead.data && (
                <div className="flex items-center justify-between rounded-xl border border-line bg-white px-5 py-4">
                  <div>
                    <p className="font-semibold text-ink-900">{lead.data.customer_name}</p>
                    <p className="text-xs text-ink-500">{lead.data.lead_code} · {lead.data.service.name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={lead.data.status} />
                    <Link to={`/admin/leads/${lead.data.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-royal-600 hover:underline">Open lead <ExternalLink className="size-3.5" /></Link>
                  </div>
                </div>
              )}
              <DocumentsPanel leadId={leadId} />
            </div>
          )}
        </div>
      </div>
      </>}
    </>
  )
}
