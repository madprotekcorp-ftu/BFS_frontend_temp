import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { clsx } from 'clsx'
import { ArrowDown, ArrowUp, Download, Eye, Filter, Plus, RotateCcw, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Alert, EmptyState, Spinner } from '@/components/ui/Feedback'
import { adminApi } from '@/lib/api/endpoints'
import { LEAD_SOURCES, LEAD_STATUSES, type LeadFilters } from '@/lib/api/types'
import { formatDate, formatMobile, todayIST } from '@/lib/format'
import { LeadFormModal } from '../components/LeadFormModal'
import { filterControl, PageHeader, Pagination, SourceBadge, StatusBadge } from '../components/ui'
import { useDebounced, useUrlFilters } from '../hooks'
import { useEmployees, useServiceOptions } from '../queries'

const KEYS = ['search', 'status', 'source', 'service_id', 'employee_id', 'date_from', 'date_to', 'followup_due', 'ordering', 'page'] as const
const PAGE_SIZE = 20

export default function LeadsPage() {
  const { filters, setFilters, clear } = useUrlFilters(KEYS)
  const [searchInput, setSearchInput] = useState(filters.search)
  const debouncedSearch = useDebounced(searchInput)
  const [showFilters, setShowFilters] = useState(false)
  const [creating, setCreating] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const navigate = useNavigate()
  const employees = useEmployees()
  const services = useServiceOptions()

  useEffect(() => {
    if (debouncedSearch !== filters.search) setFilters({ search: debouncedSearch })
  }, [debouncedSearch]) // eslint-disable-line react-hooks/exhaustive-deps

  const query: LeadFilters = { ...filters, page: Number(filters.page) || 1, page_size: PAGE_SIZE, ordering: filters.ordering || '-created_at' }
  const leads = useQuery({ queryKey: ['admin', 'leads', query], queryFn: () => adminApi.leads(query), placeholderData: keepPreviousData })

  const activeFilterCount = (['status', 'source', 'service_id', 'employee_id', 'date_from', 'date_to', 'followup_due'] as const).filter((k) => filters[k]).length

  const sortBy = (field: string) => {
    const current = query.ordering ?? ''
    setFilters({ ordering: current === `-${field}` ? field : `-${field}` })
  }

  const doExport = async () => {
    setExporting(true)
    setExportError(null)
    try {
      await adminApi.exportLeads(query)
    } catch (e) {
      setExportError(e instanceof Error ? e.message : 'Export failed.')
    } finally {
      setExporting(false)
    }
  }

  const today = todayIST()

  return (
    <>
      <PageHeader
        title="Leads"
        description="Search, filter and manage all customer leads."
        actions={
          <>
            <Button variant="secondary" icon={<Download className="size-4" />} loading={exporting} onClick={doExport}>Export CSV</Button>
            <Button icon={<Plus className="size-4" />} onClick={() => setCreating(true)}>Add lead</Button>
          </>
        }
      />
      {exportError && <Alert tone="error" className="mb-4">{exportError}</Alert>}

      <div className="rounded-xl border border-line bg-white">
        <div className="flex flex-col gap-3 border-b border-line p-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-400" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, mobile or lead ID"
              aria-label="Search leads"
              className={clsx(filterControl, 'w-full pl-9')}
            />
          </div>
          <div className="flex gap-2">
            <select aria-label="Filter by status" className={filterControl} value={filters.status} onChange={(e) => setFilters({ status: e.target.value })}>
              <option value="">All statuses</option>
              {LEAD_STATUSES.map((s) => <option key={s.code} value={s.code}>{s.label}</option>)}
            </select>
            <Button variant="secondary" size="md" className="h-9" onClick={() => setShowFilters((s) => !s)} icon={<Filter className="size-4" />} aria-expanded={showFilters}>
              Filters{activeFilterCount > 0 && <span className="rounded-full bg-navy-900 px-1.5 text-[11px] text-white">{activeFilterCount}</span>}
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="grid gap-3 border-b border-line bg-surface/50 p-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            <FilterSelect label="Source" value={filters.source} onChange={(v) => setFilters({ source: v })} options={LEAD_SOURCES.map((s) => [s.code, s.label])} />
            <FilterSelect label="Service" value={filters.service_id} onChange={(v) => setFilters({ service_id: v })} options={services.data?.map((s) => [String(s.id), s.name]) ?? []} />
            <FilterSelect label="Employee" value={filters.employee_id} onChange={(v) => setFilters({ employee_id: v })} options={[['unassigned', 'Unassigned'], ...(employees.data?.map((e) => [String(e.id), e.name] as [string, string]) ?? [])]} />
            <label className="text-xs font-medium text-ink-500">Created from<input type="date" className={clsx(filterControl, 'mt-1 w-full')} value={filters.date_from} onChange={(e) => setFilters({ date_from: e.target.value })} /></label>
            <label className="text-xs font-medium text-ink-500">Created to<input type="date" className={clsx(filterControl, 'mt-1 w-full')} value={filters.date_to} onChange={(e) => setFilters({ date_to: e.target.value })} /></label>
            <label className="flex items-center gap-2 self-end pb-2 text-sm text-ink-700">
              <input type="checkbox" className="size-4 accent-navy-900" checked={filters.followup_due === 'true'} onChange={(e) => setFilters({ followup_due: e.target.checked ? 'true' : '' })} />
              Follow-up due
            </label>
            <button onClick={() => { clear(); setSearchInput('') }} className="flex items-center gap-1.5 self-end pb-2 text-sm font-medium text-ink-500 hover:text-ink-900">
              <RotateCcw className="size-3.5" /> Clear all
            </button>
          </div>
        )}

        {leads.isError ? (
          <div className="p-5"><Alert tone="error" title="Leads could not be loaded" action={<button className="font-semibold underline" onClick={() => leads.refetch()}>Retry</button>}>{leads.error.message}</Alert></div>
        ) : leads.isLoading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : leads.data && leads.data.data.length === 0 ? (
          <EmptyState
            title={activeFilterCount || filters.search ? 'No leads match your filters' : 'No leads yet'}
            description={activeFilterCount || filters.search ? 'Try changing or clearing the filters.' : 'Website enquiries will appear here automatically. You can also add a lead manually.'}
            action={!activeFilterCount && !filters.search ? <Button icon={<Plus className="size-4" />} onClick={() => setCreating(true)}>Add lead</Button> : undefined}
          />
        ) : leads.data ? (
          <>
            <div className={clsx('overflow-x-auto transition-opacity', leads.isFetching && 'opacity-60')}>
              <table className="w-full min-w-[1100px] text-sm [&_td]:whitespace-nowrap">
                <thead className="bg-surface/60 text-left text-xs text-ink-500">
                  <tr>
                    <th className="px-5 py-3 font-medium">Lead ID</th>
                    <SortHeader label="Customer" field="customer_name" ordering={query.ordering} onSort={sortBy} />
                    <th className="px-3 py-3 font-medium">Mobile</th>
                    <th className="px-3 py-3 font-medium">Service</th>
                    <th className="px-3 py-3 font-medium">Location</th>
                    <th className="px-3 py-3 font-medium">Source</th>
                    <th className="px-3 py-3 font-medium">Assigned to</th>
                    <SortHeader label="Status" field="status" ordering={query.ordering} onSort={sortBy} />
                    <SortHeader label="Created" field="created_at" ordering={query.ordering} onSort={sortBy} />
                    <SortHeader label="Next follow-up" field="next_followup_date" ordering={query.ordering} onSort={sortBy} />
                    <th className="px-5 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.data.data.map((l) => {
                    const due = l.next_followup_date && l.next_followup_date <= today && !['converted', 'closed'].includes(l.status.code)
                    return (
                      <tr key={l.id} className="cursor-pointer border-t border-line hover:bg-surface/60" onClick={() => navigate(`/admin/leads/${l.id}`)}>
                        <td className="px-5 py-3 font-mono text-xs text-ink-500">{l.lead_code}</td>
                        <td className="px-3 py-3 font-medium text-ink-900">{l.customer_name}</td>
                        <td className="px-3 py-3 whitespace-nowrap text-ink-700 tabular-nums">{formatMobile(l.mobile)}</td>
                        <td className="px-3 py-3 text-ink-700">{l.service.name}</td>
                        <td className="px-3 py-3 text-ink-700">{l.location || <span className="text-ink-400">—</span>}</td>
                        <td className="px-3 py-3"><SourceBadge source={l.source} /></td>
                        <td className="px-3 py-3 text-ink-700">{l.assigned_employee?.name ?? <span className="text-ink-400">Unassigned</span>}</td>
                        <td className="px-3 py-3"><StatusBadge status={l.status} /></td>
                        <td className="px-3 py-3 whitespace-nowrap text-ink-500">{formatDate(l.created_at)}</td>
                        <td className={clsx('px-3 py-3 whitespace-nowrap', due ? 'font-semibold text-red-700' : 'text-ink-500')}>{formatDate(l.next_followup_date)}</td>
                        <td className="px-5 py-3 text-right">
                          <Link to={`/admin/leads/${l.id}`} onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-royal-600 hover:bg-royal-50" aria-label={`View ${l.customer_name}`}>
                            <Eye className="size-3.5" /> View
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <Pagination pagination={leads.data.pagination} onPage={(p) => setFilters({ page: String(p) }, false)} />
          </>
        ) : null}
      </div>

      <LeadFormModal open={creating} onClose={() => setCreating(false)} onSaved={(l) => navigate(`/admin/leads/${l.id}`)} />
    </>
  )
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <label className="text-xs font-medium text-ink-500">
      {label}
      <select className={clsx(filterControl, 'mt-1 w-full')} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">All</option>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  )
}

function SortHeader({ label, field, ordering, onSort }: { label: string; field: string; ordering?: string; onSort: (f: string) => void }) {
  const active = ordering === field || ordering === `-${field}`
  const desc = ordering === `-${field}`
  return (
    <th className="px-3 py-3 font-medium" aria-sort={active ? (desc ? 'descending' : 'ascending') : 'none'}>
      <button className={clsx('inline-flex items-center gap-1 hover:text-ink-900', active && 'text-ink-900')} onClick={() => onSort(field)}>
        {label}
        {active && (desc ? <ArrowDown className="size-3" /> : <ArrowUp className="size-3" />)}
      </button>
    </th>
  )
}
