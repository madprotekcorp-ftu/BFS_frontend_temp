import { type InfiniteData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { clsx } from 'clsx'
import { AlertTriangle, ArrowLeft, ArrowRightLeft, MessageSquarePlus, Pencil, Phone, Trash2, UserPlus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { Alert, PageLoader, Spinner } from '@/components/ui/Feedback'
import { Modal } from '@/components/ui/Modal'
import { ApiError } from '@/lib/api/client'
import { adminApi } from '@/lib/api/endpoints'
import { LEAD_STATUSES, type LeadDetail, type LeadStatusCode } from '@/lib/api/types'
import { formatDateTime, formatMobile, todayIST } from '@/lib/format'
import { DocumentsPanel } from '../components/DocumentsPanel'
import { LeadFormModal } from '../components/LeadFormModal'
import { Card, DefinitionGrid, SourceBadge, StatusBadge } from '../components/ui'
import { useEmployees } from '../queries'

export default function LeadDetailPage() {
  const id = Number(useParams().id)
  const lead = useQuery({ queryKey: ['admin', 'lead', id], queryFn: () => adminApi.lead(id), enabled: Number.isFinite(id) })
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const qc = useQueryClient()
  const navigate = useNavigate()
  const remove = useMutation({
    mutationFn: () => adminApi.deleteLead(id),
    onSuccess: () => {
      qc.removeQueries({ queryKey: ['admin', 'lead', id] })
      qc.invalidateQueries({ queryKey: ['admin'] })
      navigate('/admin/leads', { replace: true })
    },
  })

  if (lead.isLoading) return <PageLoader />
  if (lead.isError || !lead.data) {
    const notFound = lead.error instanceof ApiError && lead.error.status === 404
    return (
      <div className="mx-auto max-w-lg py-10">
        <Alert tone="error" title={notFound ? 'Lead not found' : 'Lead could not be loaded'}>{notFound ? 'This lead does not exist or has been removed.' : lead.error?.message}</Alert>
        <Link to="/admin/leads" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-royal-600"><ArrowLeft className="size-4" /> Back to leads</Link>
      </div>
    )
  }
  const l = lead.data

  return (
    <>
      <Link to="/admin/leads" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-navy-900"><ArrowLeft className="size-4" /> All leads</Link>

      <div className="mb-6 flex flex-col gap-4 rounded-xl border border-line bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-navy-900 font-display text-lg font-bold text-white">
            {l.customer_name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold">{l.customer_name}</h1>
              <StatusBadge status={l.status} />
            </div>
            <p className="mt-0.5 text-sm text-ink-500">
              <span className="font-mono">{l.lead_code}</span> · {l.service.name} · Created {formatDateTime(l.created_at)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <a href={`tel:+91${l.mobile}`} className="inline-flex h-10 items-center gap-2 rounded-lg border border-line px-4 text-sm font-semibold text-navy-900 hover:bg-royal-50">
            <Phone className="size-4" /> {formatMobile(l.mobile)}
          </a>
          <Button variant="secondary" icon={<Pencil className="size-4" />} onClick={() => setEditing(true)}>Edit</Button>
          <Button variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700" icon={<Trash2 className="size-4" />} onClick={() => setDeleting(true)} aria-label="Delete lead" />
        </div>
      </div>

      {l.possible_duplicate && (
        <Alert tone="info" className="mb-6" title="Possible duplicate">Another lead exists with the same mobile number. Search the leads list by mobile to review it.</Alert>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-6">
          <Card title="Customer information">
            <DefinitionGrid
              items={[
                { label: 'Full name', value: l.customer_name },
                { label: 'Mobile number', value: formatMobile(l.mobile) },
                { label: 'Location / City', value: l.location },
                { label: 'Occupation', value: l.occupation },
                { label: 'Service / Loan type', value: l.service.name },
                { label: 'Approximate loan amount', value: l.loan_amount },
                { label: 'Lead source', value: <SourceBadge source={l.source} /> },
                { label: 'Consent to contact', value: l.consent ? `Yes${l.consent_at ? ` · ${formatDateTime(l.consent_at)}` : ''}` : 'Not recorded' },
              ]}
            />
            {l.message && (
              <div className="mt-5 rounded-lg bg-surface p-4">
                <p className="text-xs font-medium text-ink-500">Message / requirement</p>
                <p className="mt-1 text-sm whitespace-pre-line text-ink-900">{l.message}</p>
              </div>
            )}
          </Card>
          <RemarksCard leadId={l.id} />
          <DocumentsPanel leadId={l.id} />
        </div>

        <div className="space-y-6">
          <StatusCard lead={l} />
          <AssignmentCard lead={l} />
          <Card title="Record details">
            <DefinitionGrid
              items={[
                { label: 'Created', value: formatDateTime(l.created_at) },
                { label: 'Last updated', value: formatDateTime(l.updated_at) },
                { label: 'Created by', value: l.created_by?.name ?? (l.source.code === 'website' ? 'Website enquiry' : '—') },
                { label: 'Import batch', value: l.import_batch_id ? <span className="font-mono text-xs">{l.import_batch_id.slice(0, 8)}</span> : null },
              ]}
            />
          </Card>
        </div>
      </div>

      <LeadFormModal open={editing} onClose={() => setEditing(false)} lead={l} />
      <Modal
        open={deleting}
        onClose={() => { setDeleting(false); remove.reset() }}
        size="sm"
        title="Delete this lead?"
        footer={<>
          <Button variant="secondary" onClick={() => setDeleting(false)}>Cancel</Button>
          <Button variant="danger" loading={remove.isPending} onClick={() => remove.mutate()}>Delete lead</Button>
        </>}
      >
        <p className="text-sm text-ink-700">
          <strong>{l.customer_name}</strong> ({l.lead_code}) will be removed from lead lists, search, exports and dashboard counts. The record and its documents are kept, not erased.
        </p>
        {remove.isError && <Alert tone="error" className="mt-4">{remove.error.message}</Alert>}
      </Modal>
    </>
  )
}

function StatusCard({ lead }: { lead: LeadDetail }) {
  const qc = useQueryClient()
  const [status, setStatus] = useState<LeadStatusCode>(lead.status.code)
  const [next, setNext] = useState(lead.next_followup_date ?? '')
  const [last, setLast] = useState(lead.last_followup_date ?? '')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setStatus(lead.status.code)
    setNext(lead.next_followup_date ?? '')
    setLast(lead.last_followup_date ?? '')
  }, [lead])

  const dirty = status !== lead.status.code || next !== (lead.next_followup_date ?? '') || last !== (lead.last_followup_date ?? '')
  const save = useMutation({
    // Partial update: only the fields that changed.
    mutationFn: () =>
      adminApi.updateLead(lead.id, {
        ...(status !== lead.status.code && { status }),
        ...(next !== (lead.next_followup_date ?? '') && { next_followup_date: next || null }),
        ...(last !== (lead.last_followup_date ?? '') && { last_followup_date: last || null }),
      }),
    onSuccess: (updated) => {
      qc.setQueryData(['admin', 'lead', lead.id], updated)
      qc.invalidateQueries({ queryKey: ['admin', 'leads'] })
      qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    },
  })

  const today = todayIST()
  const due = lead.next_followup_date && lead.next_followup_date <= today && !['converted', 'closed'].includes(lead.status.code)

  return (
    <Card title="Status & follow-up">
      <div className="space-y-4">
        {due && (
          <p className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            <AlertTriangle className="size-4" /> Follow-up {lead.next_followup_date === today ? 'due today' : 'overdue'}
          </p>
        )}
        <Field label="Status" htmlFor="sc-status" required>
          <Select id="sc-status" value={status} onChange={(e) => setStatus(e.target.value as LeadStatusCode)}>
            {LEAD_STATUSES.map((s) => <option key={s.code} value={s.code}>{s.label}</option>)}
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Last follow-up" htmlFor="sc-last">
            <Input id="sc-last" type="date" max={today} value={last} onChange={(e) => setLast(e.target.value)} />
          </Field>
          <Field label="Next follow-up" htmlFor="sc-next">
            <Input id="sc-next" type="date" value={next} onChange={(e) => setNext(e.target.value)} />
          </Field>
        </div>
        {save.isError && (
          <Alert tone="error">
            {save.error instanceof ApiError && Object.keys(save.error.fields).length ? Object.values(save.error.fields).flat().join(' ') : save.error.message}
          </Alert>
        )}
        <div className="flex items-center gap-3">
          <Button className="flex-1" disabled={!dirty} loading={save.isPending} onClick={() => save.mutate()}>Update</Button>
          {saved && <span role="status" className="text-sm font-medium text-emerald-700">Saved</span>}
        </div>
      </div>
    </Card>
  )
}

function AssignmentCard({ lead }: { lead: LeadDetail }) {
  const qc = useQueryClient()
  const employees = useEmployees(true)
  const history = useQuery({ queryKey: ['admin', 'assignments', lead.id], queryFn: () => adminApi.assignments(lead.id).then((r) => r.data) })
  const [selected, setSelected] = useState('')
  const [note, setNote] = useState('')
  const [confirming, setConfirming] = useState(false)

  const assign = useMutation({
    mutationFn: () => adminApi.assign(lead.id, selected === 'none' ? null : Number(selected), note || undefined),
    onSuccess: (updated) => {
      qc.setQueryData(['admin', 'lead', lead.id], updated)
      qc.invalidateQueries({ queryKey: ['admin', 'assignments', lead.id] })
      qc.invalidateQueries({ queryKey: ['admin', 'leads'] })
      qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
      qc.invalidateQueries({ queryKey: ['admin', 'employees'] })
      setConfirming(false)
      setSelected('')
      setNote('')
    },
  })

  const target = employees.data?.find((e) => String(e.id) === selected)
  const isTransfer = !!lead.assigned_employee

  return (
    <Card title="Assignment">
      <div className="flex items-center gap-3 rounded-lg bg-surface p-3">
        <div className={clsx('flex size-9 items-center justify-center rounded-full text-xs font-semibold', lead.assigned_employee ? 'bg-royal-600 text-white' : 'bg-white text-ink-400')}>
          {lead.assigned_employee ? lead.assigned_employee.name.slice(0, 2).toUpperCase() : '—'}
        </div>
        <div>
          <p className="text-sm font-semibold text-ink-900">{lead.assigned_employee?.name ?? 'Unassigned'}</p>
          <p className="text-xs text-ink-500">{lead.assigned_at ? `Since ${formatDateTime(lead.assigned_at)}` : 'Not yet assigned'}</p>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Select aria-label="Select employee" value={selected} onChange={(e) => setSelected(e.target.value)} className="h-10 text-sm">
          <option value="">{isTransfer ? 'Transfer to…' : 'Assign to…'}</option>
          {employees.data?.filter((e) => e.id !== lead.assigned_employee?.id).map((e) => <option key={e.id} value={e.id}>{e.name} ({e.employee_code})</option>)}
          {isTransfer && <option value="none">Remove assignment</option>}
        </Select>
        <Button className="shrink-0" disabled={!selected} onClick={() => setConfirming(true)} icon={isTransfer ? <ArrowRightLeft className="size-4" /> : <UserPlus className="size-4" />}>
          {isTransfer ? 'Transfer' : 'Assign'}
        </Button>
      </div>
      {employees.data?.length === 0 && <p className="mt-2 text-xs text-ink-500">No active employees. <Link to="/admin/employees" className="font-semibold text-royal-600">Add an employee</Link>.</p>}

      <div className="mt-5">
        <p className="text-xs font-semibold tracking-wide text-ink-500 uppercase">History</p>
        {history.isLoading ? <Spinner className="mt-3" /> : history.data?.length ? (
          <ol className="mt-3 space-y-3 border-l border-line pl-4">
            {history.data.map((h) => (
              <li key={h.id} className="relative text-sm">
                <span className="absolute top-1.5 -left-[21px] size-2.5 rounded-full border-2 border-white bg-royal-600" />
                <p className="text-ink-900">
                  {h.previous_employee ? <>{h.previous_employee.name} → </> : null}
                  <span className="font-semibold">{h.new_employee?.name ?? 'Unassigned'}</span>
                </p>
                <p className="text-xs text-ink-500">{formatDateTime(h.assigned_at)} {h.assigned_by && <> · by {h.assigned_by.name}</>}</p>
                {h.note && <p className="mt-0.5 text-xs text-ink-700 italic">“{h.note}”</p>}
              </li>
            ))}
          </ol>
        ) : <p className="mt-2 text-sm text-ink-400">No assignment history.</p>}
      </div>

      <Modal
        open={confirming}
        onClose={() => { setConfirming(false); assign.reset() }}
        size="sm"
        title={selected === 'none' ? 'Remove assignment?' : isTransfer ? 'Confirm transfer' : 'Confirm assignment'}
        footer={<>
          <Button variant="secondary" onClick={() => setConfirming(false)}>Cancel</Button>
          <Button loading={assign.isPending} onClick={() => assign.mutate()}>Confirm</Button>
        </>}
      >
        <p className="text-sm text-ink-700">
          {selected === 'none'
            ? <>Remove <strong>{lead.assigned_employee?.name}</strong> from this lead?</>
            : isTransfer
              ? <>Transfer <strong>{lead.customer_name}</strong> from <strong>{lead.assigned_employee?.name}</strong> to <strong>{target?.name}</strong>?</>
              : <>Assign <strong>{lead.customer_name}</strong> to <strong>{target?.name}</strong>?</>}
        </p>
        <Field label="Note" htmlFor="assign-note" className="mt-4" hint="For example, the reason for a transfer.">
          <Input id="assign-note" maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
        {assign.isError && (
          <Alert tone="error" className="mt-4">
            {assign.error instanceof ApiError && Object.keys(assign.error.fields).length ? Object.values(assign.error.fields).flat().join(' ') : assign.error.message}
          </Alert>
        )}
      </Modal>
    </Card>
  )
}

function RemarksCard({ leadId }: { leadId: number }) {
  const qc = useQueryClient()
  const key = ['admin', 'remarks', leadId]
  // Paginated, newest first. "Load more" fetches the next page.
  const remarks = useInfiniteQuery({
    queryKey: key,
    queryFn: ({ pageParam }) => adminApi.remarks(leadId, pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.pagination.page < last.pagination.total_pages ? last.pagination.page + 1 : undefined),
  })
  const [text, setText] = useState('')
  const add = useMutation({
    mutationFn: () => adminApi.addRemark(leadId, text.trim()),
    onSuccess: (remark) => {
      setText('')
      // Put the new remark on top and bump the counts without a refetch.
      qc.setQueryData<InfiniteData<Awaited<ReturnType<typeof adminApi.remarks>>>>(key, (d) =>
        d && {
          ...d,
          pages: d.pages.map((pg, i) => ({
            ...pg,
            data: i === 0 ? [remark, ...pg.data] : pg.data,
            pagination: { ...pg.pagination, total: pg.pagination.total + 1 },
          })),
        },
      )
      qc.setQueryData<LeadDetail>(['admin', 'lead', leadId], (l) => l && { ...l, remark_count: l.remark_count + 1 })
    },
  })

  // A remark added before "load more" shifts the pages by one, so drop repeats.
  const seen = new Set<number>()
  const list = (remarks.data?.pages.flatMap((pg) => pg.data) ?? []).filter((r) => !seen.has(r.id) && !!seen.add(r.id))
  const total = remarks.data?.pages[0]?.pagination.total
  const addError = add.error instanceof ApiError && add.error.fields.text?.length ? add.error.fields.text.join(' ') : add.error?.message

  return (
    <Card title={total ? `Internal remarks (${total})` : 'Internal remarks'}>
      <form onSubmit={(e) => { e.preventDefault(); if (text.trim()) add.mutate() }} className="space-y-3">
        <Textarea aria-label="New remark" rows={3} maxLength={2000} placeholder="Add a note about a call, a document request or the next step…" value={text} onChange={(e) => setText(e.target.value)} />
        {add.isError && <Alert tone="error">{addError}</Alert>}
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={!text.trim()} loading={add.isPending} icon={<MessageSquarePlus className="size-4" />}>Add remark</Button>
        </div>
      </form>
      <div className="mt-5">
        {remarks.isLoading ? <Spinner /> : remarks.isError ? <Alert tone="error">{remarks.error.message}</Alert> : list.length ? (
          <>
            <ul className="space-y-3">
              {list.map((r) => (
                <li key={r.id} className="rounded-lg border border-line p-3.5">
                  <p className="text-sm whitespace-pre-line text-ink-900">{r.text}</p>
                  <p className="mt-2 text-xs text-ink-500">{r.created_by.name} · {formatDateTime(r.created_at)}</p>
                </li>
              ))}
            </ul>
            {remarks.hasNextPage && (
              <div className="mt-4 flex justify-center">
                <Button variant="secondary" size="sm" loading={remarks.isFetchingNextPage} onClick={() => remarks.fetchNextPage()}>
                  Load more{total ? ` (${list.length} of ${total})` : ''}
                </Button>
              </div>
            )}
          </>
        ) : <p className="text-sm text-ink-400">No remarks yet.</p>}
      </div>
    </Card>
  )
}

