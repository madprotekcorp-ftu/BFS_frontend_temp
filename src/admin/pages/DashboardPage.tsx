import { useQuery } from '@tanstack/react-query'
import { clsx } from 'clsx'
import { AlarmClock, ArrowRight, CircleCheckBig, Inbox, RotateCcw, Sparkles, UserX } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Alert, EmptyState, PageLoader } from '@/components/ui/Feedback'
import { adminApi } from '@/lib/api/endpoints'
import { LEAD_SOURCES, LEAD_STATUSES, type LeadListItem } from '@/lib/api/types'
import { formatDate, formatMobile, formatNumber, todayIST } from '@/lib/format'
import { Card, filterControl, PageHeader, STATUS_STYLES, StatusBadge } from '../components/ui'
import { useUrlFilters } from '../hooks'
import { useEmployees } from '../queries'

const FILTER_KEYS = ['date_from', 'date_to', 'status', 'source', 'employee_id'] as const

export default function DashboardPage() {
  const { filters, setFilters, clear } = useUrlFilters(FILTER_KEYS)
  const employees = useEmployees()
  const q = useQuery({ queryKey: ['admin', 'dashboard', filters], queryFn: () => adminApi.dashboard(filters), placeholderData: (p) => p })
  const hasFilters = Object.values(filters).some(Boolean)

  const leadsLink = (extra: Record<string, string>) => {
    const p = new URLSearchParams()
    for (const [k, v] of Object.entries({ ...filters, ...extra })) if (v) p.set(k, v)
    return `/admin/leads?${p.toString()}`
  }

  return (
    <>
      <PageHeader title="Dashboard" description={`Overview of your leads · ${formatDate(todayIST())}`} />

      <div className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-line bg-white p-4">
        <label className="text-xs font-medium text-ink-500">From<input type="date" className={clsx(filterControl, 'mt-1 block')} value={filters.date_from} onChange={(e) => setFilters({ date_from: e.target.value })} /></label>
        <label className="text-xs font-medium text-ink-500">To<input type="date" className={clsx(filterControl, 'mt-1 block')} value={filters.date_to} onChange={(e) => setFilters({ date_to: e.target.value })} /></label>
        <label className="text-xs font-medium text-ink-500">Status
          <select className={clsx(filterControl, 'mt-1 block')} value={filters.status} onChange={(e) => setFilters({ status: e.target.value })}>
            <option value="">All statuses</option>
            {LEAD_STATUSES.map((s) => <option key={s.code} value={s.code}>{s.label}</option>)}
          </select>
        </label>
        <label className="text-xs font-medium text-ink-500">Source
          <select className={clsx(filterControl, 'mt-1 block')} value={filters.source} onChange={(e) => setFilters({ source: e.target.value })}>
            <option value="">All sources</option>
            {LEAD_SOURCES.map((s) => <option key={s.code} value={s.code}>{s.label}</option>)}
          </select>
        </label>
        <label className="text-xs font-medium text-ink-500">Employee
          <select className={clsx(filterControl, 'mt-1 block')} value={filters.employee_id} onChange={(e) => setFilters({ employee_id: e.target.value })}>
            <option value="">All employees</option>
            <option value="unassigned">Unassigned</option>
            {employees.data?.map((e) => <option key={e.id} value={e.id}>{e.name}{e.is_active ? '' : ' (inactive)'}</option>)}
          </select>
        </label>
        {hasFilters && (
          <button onClick={clear} className="flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-ink-500 hover:bg-surface hover:text-ink-900">
            <RotateCcw className="size-3.5" /> Clear
          </button>
        )}
      </div>

      {q.isLoading ? (
        <PageLoader />
      ) : q.isError ? (
        <Alert tone="error" title="Dashboard could not be loaded" action={<button className="font-semibold underline" onClick={() => q.refetch()}>Retry</button>}>{q.error.message}</Alert>
      ) : q.data ? (
        <div className={clsx('space-y-6 transition-opacity', q.isFetching && 'opacity-60')}>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total Leads" value={q.data.summary.total_leads} icon={<Inbox />} tone="navy" to={leadsLink({})} />
            <StatCard label="New Leads" value={q.data.summary.new_leads} icon={<Sparkles />} tone="royal" to={leadsLink({ status: 'new' })} />
            <StatCard label="Follow-ups Due" value={q.data.summary.followups_due} icon={<AlarmClock />} tone="gold" to={leadsLink({ followup_due: 'true' })} hint="Due today or overdue" />
            <StatCard label="Converted Leads" value={q.data.summary.converted_leads} icon={<CircleCheckBig />} tone="green" to={leadsLink({ status: 'converted' })} />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card title="Lead status distribution">
              <DistributionChart data={q.data.status_distribution.map((s) => ({ ...s, color: STATUS_STYLES[s.code]?.color ?? '#0755A5' }))} />
            </Card>
            <Card title="Lead source distribution">
              <DistributionChart data={q.data.source_distribution.filter((s) => s.count > 0).map((s) => ({ ...s, color: '#0755A5' }))} />
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            <Card title="Recent leads" action={<Link to="/admin/leads" className="text-sm font-semibold text-royal-600 hover:underline">View all</Link>} bodyClassName="">
              <MiniLeadTable leads={q.data.recent_leads} />
            </Card>
            <Card title="Upcoming & pending follow-ups" action={<Link to={leadsLink({ followup_due: 'true' })} className="text-sm font-semibold text-royal-600 hover:underline">Due list</Link>} bodyClassName="">
              <FollowupList leads={q.data.upcoming_followups} />
            </Card>
          </div>

          <Card title="Employee-wise lead counts" bodyClassName="">
            <EmployeeCounts data={q.data.employee_counts} unassigned={q.data.unassigned_count} leadsLink={leadsLink} />
          </Card>
        </div>
      ) : null}
    </>
  )
}

const tones = {
  navy: 'bg-navy-900 text-white',
  royal: 'bg-royal-50 text-royal-600',
  gold: 'bg-gold-100 text-gold-600',
  green: 'bg-emerald-50 text-emerald-600',
}

function StatCard({ label, value, icon, tone, to, hint }: { label: string; value: number; icon: ReactNode; tone: keyof typeof tones; to: string; hint?: string }) {
  return (
    <Link to={to} className="group rounded-xl border border-line bg-white p-5 transition-shadow hover:shadow-card">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-ink-500">{label}</p>
        <span className={clsx('flex size-9 items-center justify-center rounded-lg [&>svg]:size-[18px]', tones[tone])}>{icon}</span>
      </div>
      <p className="mt-3 font-display text-3xl font-bold text-ink-900">{formatNumber(value)}</p>
      <p className="mt-1 flex items-center gap-1 text-xs text-ink-400">
        {hint ?? 'View leads'} <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
      </p>
    </Link>
  )
}

function DistributionChart({ data }: { data: { label: string; count: number; color: string }[] }) {
  if (data.length === 0 || data.every((d) => d.count === 0)) return <EmptyState title="No leads yet" description="Counts appear here as leads come in." />
  return (
    <div style={{ height: Math.max(data.length * 38, 120) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 32, top: 0, bottom: 0 }} barCategoryGap={8}>
          <XAxis type="number" hide allowDecimals={false} />
          <YAxis type="category" dataKey="label" width={170} tickLine={false} axisLine={false} tick={{ fontSize: 13, fill: '#33415c' }} />
          <Tooltip cursor={{ fill: '#f5f7fa' }} contentStyle={{ borderRadius: 8, border: '1px solid #e3e8f0', fontSize: 13 }} formatter={(v) => [formatNumber(Number(v)), 'Leads']} />
          <Bar dataKey="count" isAnimationActive={false} radius={[0, 4, 4, 0]} label={{ position: 'right', fontSize: 12, fill: '#5b6b85' }}>
            {data.map((d) => <Cell key={d.label} fill={d.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function MiniLeadTable({ leads }: { leads: LeadListItem[] }) {
  if (leads.length === 0) return <EmptyState title="No leads yet" description="New enquiries and manually added leads will appear here." />
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-xs text-ink-500">
          <tr className="border-b border-line">
            <th className="px-5 py-2.5 font-medium">Customer</th>
            <th className="px-3 py-2.5 font-medium">Service</th>
            <th className="px-3 py-2.5 font-medium">Status</th>
            <th className="px-5 py-2.5 text-right font-medium">Created</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((l) => (
            <tr key={l.id} className="border-b border-line last:border-0 hover:bg-surface/60">
              <td className="px-5 py-3">
                <Link to={`/admin/leads/${l.id}`} className="font-medium text-ink-900 hover:text-royal-600">{l.customer_name}</Link>
                <p className="text-xs text-ink-500">{l.lead_code} · {formatMobile(l.mobile)}</p>
              </td>
              <td className="px-3 py-3 text-ink-700">{l.service.name}</td>
              <td className="px-3 py-3"><StatusBadge status={l.status} /></td>
              <td className="px-5 py-3 text-right whitespace-nowrap text-ink-500">{formatDate(l.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function FollowupList({ leads }: { leads: LeadListItem[] }) {
  const today = todayIST()
  if (leads.length === 0) return <EmptyState title="No follow-ups scheduled" description="Set a next follow-up date on a lead to see it here." icon={<AlarmClock className="size-5" />} />
  return (
    <ul className="divide-y divide-line">
      {leads.map((l) => {
        const d = l.next_followup_date ?? ''
        const overdue = d < today
        const isToday = d === today
        return (
          <li key={l.id}>
            <Link to={`/admin/leads/${l.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-surface/60">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink-900">{l.customer_name}</p>
                <p className="truncate text-xs text-ink-500">{l.service.name} · {l.assigned_employee?.name ?? 'Unassigned'}</p>
              </div>
              <span className={clsx('shrink-0 rounded-md px-2 py-1 text-xs font-semibold', overdue ? 'bg-red-50 text-red-700' : isToday ? 'bg-amber-50 text-amber-700' : 'bg-surface text-ink-700')}>
                {overdue ? 'Overdue · ' : isToday ? 'Today · ' : ''}{formatDate(d)}
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

function EmployeeCounts({ data, unassigned, leadsLink }: { data: { employee_id: number; name: string; total: number; open: number; converted: number }[]; unassigned: number; leadsLink: (x: Record<string, string>) => string }) {
  const max = Math.max(1, ...data.map((d) => d.total), unassigned)
  if (data.length === 0 && unassigned === 0) return <EmptyState title="No assignments yet" description="Add employees and assign leads to see counts here." />
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-xs text-ink-500">
          <tr className="border-b border-line">
            <th className="px-5 py-2.5 font-medium">Employee</th>
            <th className="w-[40%] px-3 py-2.5 font-medium">Total leads</th>
            <th className="px-3 py-2.5 text-right font-medium">Open</th>
            <th className="px-5 py-2.5 text-right font-medium">Converted</th>
          </tr>
        </thead>
        <tbody>
          {data.map((e) => (
            <tr key={e.employee_id} className="border-b border-line last:border-0">
              <td className="px-5 py-3"><Link to={leadsLink({ employee_id: String(e.employee_id) })} className="font-medium text-ink-900 hover:text-royal-600">{e.name}</Link></td>
              <td className="px-3 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-2 flex-1 rounded-full bg-surface"><div className="h-full rounded-full bg-royal-600" style={{ width: `${(e.total / max) * 100}%` }} /></div>
                  <span className="w-8 text-right font-semibold text-ink-900 tabular-nums">{e.total}</span>
                </div>
              </td>
              <td className="px-3 py-3 text-right text-ink-700 tabular-nums">{e.open}</td>
              <td className="px-5 py-3 text-right text-emerald-700 tabular-nums">{e.converted}</td>
            </tr>
          ))}
          <tr>
            <td className="px-5 py-3"><Link to={leadsLink({ employee_id: 'unassigned' })} className="flex items-center gap-2 font-medium text-ink-500 hover:text-royal-600"><UserX className="size-4" /> Unassigned</Link></td>
            <td className="px-3 py-3">
              <div className="flex items-center gap-3">
                <div className="h-2 flex-1 rounded-full bg-surface"><div className="h-full rounded-full bg-ink-400" style={{ width: `${(unassigned / max) * 100}%` }} /></div>
                <span className="w-8 text-right font-semibold text-ink-900 tabular-nums">{unassigned}</span>
              </div>
            </td>
            <td colSpan={2} />
          </tr>
        </tbody>
      </table>
    </div>
  )
}
