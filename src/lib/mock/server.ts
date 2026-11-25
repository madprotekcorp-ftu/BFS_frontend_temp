/**
 * DEVELOPMENT-ONLY mock of the Django API, following the backend spec contract.
 * Loaded only when import.meta.env.DEV && VITE_USE_MOCK_API === 'true'; never bundled in production.
 * All data is fictitious test data, kept in localStorage so it survives reloads.
 * Reset it from the browser console with: localStorage.removeItem('bfs-mock-db')
 */
import type { RawResponse } from '../api/client'
import {
  DOCUMENT_CATEGORIES,
  LEAD_SOURCES,
  LEAD_STATUSES,
  type Assignment,
  type Employee,
  type ImportRow,
  type LeadDetail,
  type LeadDocument,
  type Remark,
  type ServiceCategory,
} from '../api/types'
import { normaliseMobile, isIndianMobile } from '../validation'

// ---------- seed ----------
const SERVICES: Omit<ServiceCategory, 'id' | 'display_order'>[] = [
  ['Personal Loan', 'personal-loan'], ['Business Loan', 'business-loan'], ['Home Loan', 'home-loan'],
  ['Plot Loan', 'plot-loan'], ['Car Loan', 'car-loan'], ['Commercial Vehicle Loan', 'commercial-vehicle-loan'],
  ['Education Loan', 'education-loan'], ['Gold Loan', 'gold-loan'], ['MSME Loan', 'msme-loan'], ['Top-up Loan', 'top-up-loan'],
].map(([name, slug]): Omit<ServiceCategory, 'id' | 'display_order'> => ({ name, slug, group: 'loan', short_description: '' }))
  .concat(
    [['Life Insurance', 'life-insurance'], ['Health Insurance', 'health-insurance'], ['Vehicle Insurance', 'vehicle-insurance'],
      ['Home Insurance', 'home-insurance'], ['Personal Accident Insurance', 'personal-accident-insurance']]
      .map(([name, slug]): Omit<ServiceCategory, 'id' | 'display_order'> => ({ name, slug, group: 'insurance', short_description: '' })),
  )

interface DbLead {
  id: number
  customer_name: string
  mobile: string
  location: string
  service_id: number
  loan_amount: string
  occupation: string
  message: string
  consent: boolean
  consent_at: string | null
  source: string
  status: string
  assigned_employee_id: number | null
  assigned_at: string | null
  last_followup_date: string | null
  next_followup_date: string | null
  created_by: number | null
  import_batch_id: string | null
  created_at: string
  updated_at: string
  is_deleted?: boolean
}
interface DbEmployee { id: number; employee_code: string; name: string; mobile: string; email: string; is_active: boolean }
interface DbRemark { id: number; lead_id: number; text: string; created_at: string }
interface DbAssignment { id: number; lead_id: number; previous: number | null; next: number | null; at: string; note: string }
interface DbDoc { id: string; lead_id: number; original_filename: string; category: string; file_size: number; mime_type: string; uploaded_at: string; dataUrl: string; deleted_at?: string | null }
interface DbBatch { id: string; filename: string; status: 'preview' | 'completed' | 'cancelled'; rows: ImportRow[]; successful: number }
interface Db {
  services: ServiceCategory[]
  leads: DbLead[]
  employees: DbEmployee[]
  remarks: DbRemark[]
  assignments: DbAssignment[]
  docs: DbDoc[]
  batches: DbBatch[]
  seq: number
}

const ADMIN = { id: 1, username: 'admin', email: 'admin@example.com', full_name: 'BFS Admin' }
const KEY = 'bfs-mock-db'
const SESSION = 'bfs-mock-session'

const istDate = (d: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(d)
const addDays = (n: number) => istDate(new Date(Date.now() + n * 86400000))
const iso = (d = new Date()) => d.toISOString()

function seed(): Db {
  const services = SERVICES.map((s, i) => ({ ...s, id: i + 1, display_order: i + 1 }))
  const employees: DbEmployee[] = [
    { id: 1, employee_code: 'EMP001', name: 'Test Employee A', mobile: '9000000001', email: '', is_active: true },
    { id: 2, employee_code: 'EMP002', name: 'Test Employee B', mobile: '9000000002', email: '', is_active: true },
    { id: 3, employee_code: 'EMP003', name: 'Test Employee C', mobile: '', email: '', is_active: true },
    { id: 4, employee_code: 'EMP004', name: 'Test Employee D', mobile: '', email: '', is_active: false },
  ]
  const first = ['Arun', 'Priya', 'Karthik', 'Divya', 'Suresh', 'Lakshmi', 'Vignesh', 'Meena', 'Rahul', 'Anitha', 'Prakash', 'Kavya', 'Manoj', 'Revathi', 'Sanjay']
  const last = ['Kumar', 'R', 'S', 'Raj', 'Murthy', 'Devi', 'Babu', 'N', 'Reddy', 'Gowda']
  const locs = ['Hosur', 'Bagalur', 'Denkanikottai', 'Krishnagiri', 'Shoolagiri', 'Bengaluru', '']
  const statuses = ['new', 'new', 'contacted', 'interested', 'follow_up', 'follow_up', 'converted', 'closed']
  const sources = ['website', 'website', 'website', 'phone', 'whatsapp', 'walk_in', 'referral', 'social_media', 'campaign', 'existing_db']
  const leads: DbLead[] = []
  let rnd = 42
  const r = (n: number) => { rnd = (rnd * 9301 + 49297) % 233280; return Math.floor((rnd / 233280) * n) }
  for (let i = 1; i <= 64; i++) {
    const created = new Date(Date.now() - r(90) * 86400000 - r(86400000))
    const status = statuses[r(statuses.length)]
    const emp = r(4) === 0 ? null : [1, 2, 3, 4][r(4)]
    const source = sources[r(sources.length)]
    leads.push({
      id: i,
      customer_name: `${first[r(first.length)]} ${last[r(last.length)]}`,
      mobile: `9${String(100000000 + i * 7919).slice(0, 9)}`,
      location: locs[r(locs.length)],
      service_id: 1 + r(15),
      loan_amount: ['', '2 lakh', '5 lakh', '10 lakh', '25 lakh', '50 lakh'][r(6)],
      occupation: ['', 'Salaried', 'Self-employed / Business', 'Professional'][r(4)],
      message: r(3) === 0 ? 'Test enquiry: please call in the evening.' : '',
      consent: true,
      consent_at: source === 'website' ? iso(created) : null,
      source,
      status,
      assigned_employee_id: emp,
      assigned_at: emp ? iso(new Date(created.getTime() + 3600000)) : null,
      last_followup_date: ['contacted', 'interested', 'follow_up'].includes(status) ? istDate(new Date(created.getTime() + 86400000)) : null,
      next_followup_date: ['contacted', 'interested', 'follow_up', 'new'].includes(status) && r(3) > 0 ? addDays(r(14) - 5) : null,
      created_by: source === 'website' ? null : 1,
      import_batch_id: null,
      created_at: iso(created),
      updated_at: iso(created),
    })
  }
  const assignments: DbAssignment[] = leads.filter((l) => l.assigned_employee_id).map((l, i) => ({ id: i + 1, lead_id: l.id, previous: null, next: l.assigned_employee_id, at: l.assigned_at!, note: '' }))
  return { services, leads, employees, remarks: [], assignments, docs: [], batches: [], seq: 1000 }
}

function load(): Db {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as Db
  } catch { /* reseed */ }
  const db = seed()
  save(db)
  return db
}
function save(db: Db) {
  try { localStorage.setItem(KEY, JSON.stringify(db)) } catch { /* storage full: keep in memory */ }
}

// ---------- helpers ----------
const json = (status: number, body?: unknown, headers: Record<string, string> = {}): RawResponse => ({ status, headers: new Headers(headers), json: body })
const ok = (data: unknown, extra: object = {}) => json(200, { success: true, data, ...extra })
const created = (data: unknown, message?: string) => json(201, { success: true, data, message })
const fail = (status: number, code: string, message: string, fields?: Record<string, string[]>, extra: object = {}) =>
  json(status, { success: false, error: { code, message, fields, ...extra } })
const fileRes = (blob: Blob, filename: string): RawResponse => ({ status: 200, headers: new Headers({ 'Content-Type': blob.type, 'Content-Disposition': `attachment; filename="${filename}"` }), blob })

const label = (list: readonly { code: string; label: string }[], code: string) => ({ code, label: list.find((x) => x.code === code)?.label ?? code })
const code = (id: number) => `BFS-${String(id).padStart(6, '0')}`
const delay = () => new Promise((r) => setTimeout(r, 250 + Math.random() * 300))
const isOpen = (s: string) => s !== 'converted' && s !== 'closed'

function toList(db: Db, l: DbLead) {
  const svc = db.services.find((s) => s.id === l.service_id)!
  const emp = db.employees.find((e) => e.id === l.assigned_employee_id)
  return {
    id: l.id,
    lead_code: code(l.id),
    customer_name: l.customer_name,
    mobile: l.mobile,
    service: { id: svc.id, name: svc.name },
    location: l.location,
    source: label(LEAD_SOURCES, l.source),
    status: label(LEAD_STATUSES, l.status),
    assigned_employee: emp ? { id: emp.id, name: emp.name } : null,
    created_at: l.created_at,
    next_followup_date: l.next_followup_date,
  }
}
function toDetail(db: Db, l: DbLead): LeadDetail {
  return {
    ...(toList(db, l) as LeadDetail),
    loan_amount: l.loan_amount,
    occupation: l.occupation,
    message: l.message,
    consent: l.consent,
    consent_at: l.consent_at,
    assigned_at: l.assigned_at,
    last_followup_date: l.last_followup_date,
    created_by: l.created_by ? { id: 1, name: ADMIN.full_name } : null,
    import_batch_id: l.import_batch_id,
    updated_at: l.updated_at,
    document_count: db.docs.filter((d) => d.lead_id === l.id && !d.deleted_at).length,
    remark_count: db.remarks.filter((r) => r.lead_id === l.id).length,
    possible_duplicate: db.leads.some((o) => o.id !== l.id && o.mobile === l.mobile),
  }
}
function toEmployee(db: Db, e: DbEmployee): Employee {
  const mine = db.leads.filter((l) => l.assigned_employee_id === e.id)
  return { ...e, lead_counts: { total: mine.length, open: mine.filter((l) => isOpen(l.status)).length, converted: mine.filter((l) => l.status === 'converted').length } }
}

function filterLeads(db: Db, q: URLSearchParams) {
  const today = istDate(new Date())
  let rows = db.leads.filter((l) => !l.is_deleted)
  const search = (q.get('search') ?? '').trim().toLowerCase()
  if (search) rows = rows.filter((l) => l.customer_name.toLowerCase().includes(search) || l.mobile.includes(search) || code(l.id).toLowerCase().includes(search))
  const multi = (k: string) => (q.get(k) ? q.get(k)!.split(',') : null)
  const st = multi('status'); if (st) rows = rows.filter((l) => st.includes(l.status))
  const src = multi('source'); if (src) rows = rows.filter((l) => src.includes(l.source))
  const svc = multi('service_id'); if (svc) rows = rows.filter((l) => svc.includes(String(l.service_id)))
  const emp = q.get('employee_id')
  if (emp === 'unassigned') rows = rows.filter((l) => !l.assigned_employee_id)
  else if (emp) rows = rows.filter((l) => String(l.assigned_employee_id) === emp)
  const from = q.get('date_from'); if (from) rows = rows.filter((l) => istDate(new Date(l.created_at)) >= from)
  const to = q.get('date_to'); if (to) rows = rows.filter((l) => istDate(new Date(l.created_at)) <= to)
  if (q.get('followup_due') === 'true') rows = rows.filter((l) => l.next_followup_date && l.next_followup_date <= today && isOpen(l.status))
  const ord = q.get('ordering') || '-created_at'
  const field = ord.replace('-', '') as keyof DbLead
  const dir = ord.startsWith('-') ? -1 : 1
  rows.sort((a, b) => {
    const av = (a[field] ?? '') as string, bv = (b[field] ?? '') as string
    return av < bv ? -dir : av > bv ? dir : 0
  })
  return rows
}

function paginate<T>(rows: T[], q: URLSearchParams) {
  const page = Math.max(1, Number(q.get('page')) || 1)
  const size = Math.min(100, Math.max(1, Number(q.get('page_size')) || 20))
  return { data: rows.slice((page - 1) * size, page * size), pagination: { page, page_size: size, total: rows.length, total_pages: Math.max(1, Math.ceil(rows.length / size)) } }
}

function validateLead(db: Db, b: Record<string, unknown>, partial: boolean) {
  const fields: Record<string, string[]> = {}
  if (!partial || 'customer_name' in b) if (!String(b.customer_name ?? '').trim()) fields.customer_name = ['This field is required.']
  if (!partial || 'mobile' in b) if (!isIndianMobile(String(b.mobile ?? ''))) fields.mobile = ['Enter a valid 10-digit Indian mobile number.']
  if (!partial || 'service_id' in b) if (!db.services.some((s) => s.id === Number(b.service_id))) fields.service_id = ['Select a valid service.']
  return fields
}

function csv(rows: string[][]) {
  const esc = (v: string) => {
    let s = v ?? ''
    if (/^[=+\-@]/.test(s)) s = `'${s}`
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  return '﻿' + rows.map((r) => r.map(esc).join(',')).join('\r\n')
}

function parseCsv(text: string): string[][] {
  const out: string[][] = []
  let row: string[] = [], cell = '', q = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++ } else if (c === '"') q = false; else cell += c
    } else if (c === '"') q = true
    else if (c === ',') { row.push(cell); cell = '' }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cell); out.push(row); row = []; cell = '' }
    else cell += c
  }
  if (cell || row.length) { row.push(cell); out.push(row) }
  return out.filter((r) => r.some((c) => c.trim()))
}

const readAsDataUrl = (f: File) => new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(f) })
const dataUrlToBlob = async (u: string) => (await fetch(u)).blob()

// ---------- router ----------
export async function handleMockRequest(method: string, url: string, body?: unknown, form?: FormData): Promise<RawResponse> {
  await delay()
  const db = load()
  const [path, qs] = url.split('?')
  const q = new URLSearchParams(qs)
  const b = (body ?? {}) as Record<string, unknown>
  const authed = localStorage.getItem(SESSION) === '1'
  let m: RegExpMatchArray | null

  // ----- public -----
  if (method === 'GET' && path === '/api/services/') {
    const g = q.get('group')
    return ok(db.services.filter((s) => !g || s.group === g))
  }
  if (method === 'POST' && path === '/api/public/enquiries/') {
    if (b.website) return created({ reference: 'BFS-000000' }, 'Thank you.')
    const fields = validateLead(db, b, false)
    if (b.consent !== true) fields.consent = ['Consent is required.']
    if (Object.keys(fields).length) return fail(400, 'validation_error', 'Please correct the highlighted fields.', fields)
    const id = Math.max(0, ...db.leads.map((l) => l.id)) + 1
    const now = iso()
    db.leads.push({
      id, customer_name: String(b.customer_name).trim(), mobile: normaliseMobile(String(b.mobile)), location: String(b.location ?? ''),
      service_id: Number(b.service_id), loan_amount: String(b.loan_amount ?? ''), occupation: String(b.occupation ?? ''), message: String(b.message ?? ''),
      consent: true, consent_at: now, source: 'website', status: 'new', assigned_employee_id: null, assigned_at: null,
      last_followup_date: null, next_followup_date: null, created_by: null, import_batch_id: null, created_at: now, updated_at: now,
    })
    save(db)
    return created({ reference: code(id) }, 'Thank you. Our team will contact you shortly.')
  }

  // ----- auth -----
  if (method === 'GET' && path === '/api/auth/csrf/') return ok({ csrf_token: 'mock' })
  if (method === 'POST' && path === '/api/auth/login/') {
    if ((b.username === 'admin' || b.username === ADMIN.email) && b.password === 'admin123') {
      localStorage.setItem(SESSION, '1')
      return ok(ADMIN)
    }
    return fail(400, 'invalid_credentials', 'Incorrect username or password.')
  }
  if (method === 'POST' && path === '/api/auth/logout/') { localStorage.removeItem(SESSION); return ok(null) }
  if (method === 'GET' && path === '/api/auth/me/') return authed ? ok(ADMIN) : fail(401, 'not_authenticated', 'Not signed in.')

  if (path.startsWith('/api/admin/') && !authed) return fail(401, 'not_authenticated', 'Your session has expired. Please sign in again.')

  // ----- dashboard -----
  if (method === 'GET' && path === '/api/admin/dashboard/') {
    const rows = filterLeads(db, q)
    const today = istDate(new Date())
    const due = rows.filter((l) => l.next_followup_date && l.next_followup_date <= today && isOpen(l.status))
    return ok({
      summary: { total_leads: rows.length, new_leads: rows.filter((l) => l.status === 'new').length, followups_due: due.length, converted_leads: rows.filter((l) => l.status === 'converted').length },
      status_distribution: LEAD_STATUSES.map((s) => ({ ...s, count: rows.filter((l) => l.status === s.code).length })),
      source_distribution: LEAD_SOURCES.map((s) => ({ ...s, count: rows.filter((l) => l.source === s.code).length })),
      employee_counts: db.employees.map((e) => {
        const mine = rows.filter((l) => l.assigned_employee_id === e.id)
        return { employee_id: e.id, name: e.name, total: mine.length, open: mine.filter((l) => isOpen(l.status)).length, converted: mine.filter((l) => l.status === 'converted').length }
      }),
      unassigned_count: rows.filter((l) => !l.assigned_employee_id).length,
      recent_leads: [...rows].sort((a, b) => (a.created_at < b.created_at ? 1 : -1)).slice(0, 10).map((l) => toList(db, l)),
      upcoming_followups: rows
        .filter((l) => l.next_followup_date && l.next_followup_date <= addDays(7) && isOpen(l.status))
        .sort((a, b) => (a.next_followup_date! < b.next_followup_date! ? -1 : 1)).slice(0, 20).map((l) => toList(db, l)),
    })
  }

  // ----- leads -----
  if (method === 'GET' && path === '/api/admin/leads/') {
    const p = paginate(filterLeads(db, q), q)
    return ok(p.data.map((l) => toList(db, l)), { pagination: p.pagination })
  }
  if (method === 'GET' && path === '/api/admin/leads/export/') {
    const rows = filterLeads(db, q).map((l) => {
      const x = toDetail(db, l)
      return [x.lead_code, x.customer_name, x.mobile, x.service.name, x.location, x.source.label, x.assigned_employee?.name ?? '', x.status.label, x.created_at, x.next_followup_date ?? '', x.occupation, x.loan_amount, x.message]
    })
    const header = ['Lead ID', 'Customer Name', 'Mobile', 'Service', 'Location', 'Source', 'Assigned Employee', 'Status', 'Created', 'Next Follow-up', 'Occupation', 'Loan Amount', 'Message']
    return fileRes(new Blob([csv([header, ...rows])], { type: 'text/csv' }), `bfs-leads-${istDate(new Date()).replace(/-/g, '')}.csv`)
  }
  if (method === 'POST' && path === '/api/admin/leads/') {
    const fields = validateLead(db, b, false)
    if (Object.keys(fields).length) return fail(400, 'validation_error', 'Please correct the highlighted fields.', fields)
    const mobile = normaliseMobile(String(b.mobile))
    const existing = db.leads.find((l) => l.mobile === mobile)
    if (existing && !b.allow_duplicate) return fail(409, 'duplicate_mobile', 'A lead with this mobile number already exists.', undefined, { existing_lead_id: existing.id })
    const id = Math.max(0, ...db.leads.map((l) => l.id)) + 1
    const now = iso()
    const emp = b.assigned_employee_id ? Number(b.assigned_employee_id) : null
    db.leads.push({
      id, customer_name: String(b.customer_name).trim(), mobile, location: String(b.location ?? ''), service_id: Number(b.service_id),
      loan_amount: String(b.loan_amount ?? ''), occupation: String(b.occupation ?? ''), message: String(b.message ?? ''), consent: false, consent_at: null,
      source: String(b.source ?? 'other'), status: String(b.status ?? 'new'), assigned_employee_id: emp, assigned_at: emp ? now : null,
      last_followup_date: null, next_followup_date: (b.next_followup_date as string) || null, created_by: 1, import_batch_id: null, created_at: now, updated_at: now,
    })
    if (emp) db.assignments.push({ id: ++db.seq, lead_id: id, previous: null, next: emp, at: now, note: '' })
    save(db)
    return created(toDetail(db, db.leads.find((l) => l.id === id)!))
  }
  if ((m = path.match(/^\/api\/admin\/leads\/(\d+)\/$/))) {
    const lead = db.leads.find((l) => l.id === Number(m![1]) && !l.is_deleted)
    if (!lead) return fail(404, 'not_found', 'Lead not found.')
    if (method === 'GET') return ok(toDetail(db, lead))
    if (method === 'DELETE') {
      lead.is_deleted = true
      lead.updated_at = iso()
      save(db)
      return json(204)
    }
    if (method === 'PATCH') {
      const fields = validateLead(db, b, true)
      if (Object.keys(fields).length) return fail(400, 'validation_error', 'Please correct the highlighted fields.', fields)
      if ('source' in b && (b.source === 'website') !== (lead.source === 'website')) return fail(400, 'validation_error', 'Website source cannot be changed.', { source: ['Website source cannot be changed.'] })
      for (const k of ['customer_name', 'location', 'loan_amount', 'occupation', 'message', 'source', 'status', 'next_followup_date', 'last_followup_date'] as const) if (k in b) (lead as unknown as Record<string, unknown>)[k] = b[k]
      if ('mobile' in b) lead.mobile = normaliseMobile(String(b.mobile))
      if ('service_id' in b) lead.service_id = Number(b.service_id)
      lead.updated_at = iso()
      save(db)
      return ok(toDetail(db, lead))
    }
  }
  if ((m = path.match(/^\/api\/admin\/leads\/(\d+)\/remarks\/$/))) {
    const id = Number(m[1])
    const toRemark = (r: DbRemark): Remark => ({ id: r.id, text: r.text, created_by: { id: 1, name: ADMIN.full_name }, created_at: r.created_at })
    if (method === 'GET') return ok(db.remarks.filter((r) => r.lead_id === id).sort((a, b) => (a.created_at < b.created_at ? 1 : -1)).map(toRemark))
    if (!String(b.text ?? '').trim()) return fail(400, 'validation_error', 'Remark cannot be empty.', { text: ['This field is required.'] })
    const r = { id: ++db.seq, lead_id: id, text: String(b.text).trim(), created_at: iso() }
    db.remarks.push(r)
    save(db)
    return created(toRemark(r))
  }
  if ((m = path.match(/^\/api\/admin\/leads\/(\d+)\/assign\/$/)) && method === 'POST') {
    const lead = db.leads.find((l) => l.id === Number(m![1]))
    if (!lead) return fail(404, 'not_found', 'Lead not found.')
    const empId = b.employee_id === null ? null : Number(b.employee_id)
    if (empId !== null) {
      const emp = db.employees.find((e) => e.id === empId)
      if (!emp) return fail(404, 'not_found', 'Employee not found.')
      if (!emp.is_active) return fail(409, 'conflict', 'This employee is inactive and cannot receive leads.')
    }
    if (empId === lead.assigned_employee_id) return fail(409, 'conflict', 'The lead is already assigned to this employee.')
    const now = iso()
    db.assignments.push({ id: ++db.seq, lead_id: lead.id, previous: lead.assigned_employee_id, next: empId, at: now, note: String(b.note ?? '') })
    lead.assigned_employee_id = empId
    lead.assigned_at = empId ? now : null
    lead.updated_at = now
    save(db)
    return ok(toDetail(db, lead))
  }
  if ((m = path.match(/^\/api\/admin\/leads\/(\d+)\/assignments\/$/))) {
    const ref = (id: number | null) => { const e = db.employees.find((x) => x.id === id); return e ? { id: e.id, name: e.name } : null }
    const list: Assignment[] = db.assignments.filter((a) => a.lead_id === Number(m![1])).sort((a, b) => (a.at < b.at ? 1 : -1))
      .map((a) => ({ id: a.id, previous_employee: ref(a.previous), new_employee: ref(a.next), assigned_by: { id: 1, name: ADMIN.full_name }, assigned_at: a.at, note: a.note }))
    return ok(list)
  }

  // ----- employees -----
  if (path === '/api/admin/employees/') {
    if (method === 'GET') {
      let rows = db.employees
      const s = (q.get('search') ?? '').toLowerCase()
      if (s) rows = rows.filter((e) => e.name.toLowerCase().includes(s) || e.employee_code.toLowerCase().includes(s))
      if (q.get('is_active')) rows = rows.filter((e) => String(e.is_active) === q.get('is_active'))
      return ok(rows.map((e) => toEmployee(db, e)))
    }
    if (method === 'POST') {
      if (db.employees.some((e) => e.employee_code.toLowerCase() === String(b.employee_code).toLowerCase())) return fail(400, 'validation_error', 'Please correct the highlighted fields.', { employee_code: ['This employee ID is already used.'] })
      const e: DbEmployee = { id: Math.max(0, ...db.employees.map((x) => x.id)) + 1, employee_code: String(b.employee_code), name: String(b.name), mobile: String(b.mobile ?? ''), email: String(b.email ?? ''), is_active: true }
      db.employees.push(e)
      save(db)
      return created(toEmployee(db, e))
    }
  }
  if ((m = path.match(/^\/api\/admin\/employees\/(\d+)\/$/))) {
    const e = db.employees.find((x) => x.id === Number(m![1]))
    if (!e) return fail(404, 'not_found', 'Employee not found.')
    if (method === 'PATCH') {
      if ('employee_code' in b && db.employees.some((x) => x.id !== e.id && x.employee_code.toLowerCase() === String(b.employee_code).toLowerCase())) return fail(400, 'validation_error', 'Please correct the highlighted fields.', { employee_code: ['This employee ID is already used.'] })
      Object.assign(e, b)
      save(db)
    }
    return ok(toEmployee(db, e))
  }

  // ----- import -----
  if (method === 'GET' && path === '/api/admin/leads/import/template/') {
    const rows = [['customer_name', 'mobile', 'service', 'location', 'loan_amount', 'occupation', 'message', 'next_followup_date'], ['Sample Customer', '9876500001', 'Home Loan', 'Hosur', '25 lakh', 'Salaried', 'Sample row', ''], ['Another Sample', '9876500002', 'gold-loan', '', '', '', '', '']]
    return fileRes(new Blob([csv(rows)], { type: 'text/csv' }), `bfs-import-template.csv`)
  }
  if (method === 'POST' && path === '/api/admin/leads/import/') {
    const file = form?.get('file') as File | null
    if (!file) return fail(400, 'validation_error', 'Choose a file.', { file: ['This field is required.'] })
    if (!file.name.toLowerCase().endsWith('.csv')) return fail(415, 'unsupported_file_type', 'The development mock only reads CSV files. XLSX is parsed by the real backend.')
    const grid = parseCsv(await file.text())
    const header = (grid[0] ?? []).map((h) => h.trim().toLowerCase().replace(/^﻿/, ''))
    const missing = ['customer_name', 'mobile', 'service'].filter((c) => !header.includes(c))
    if (missing.length) return fail(400, 'missing_columns', 'The file is missing required columns.', undefined, { missing_columns: missing })
    const seen = new Set<string>()
    const rows: ImportRow[] = grid.slice(1).map((cells, i) => {
      const data: Record<string, string> = {}
      header.forEach((h, j) => (data[h] = (cells[j] ?? '').trim()))
      const errors: { field: string; message: string }[] = []
      if (!data.customer_name) errors.push({ field: 'customer_name', message: 'Customer name is required.' })
      if (!isIndianMobile(data.mobile ?? '')) errors.push({ field: 'mobile', message: 'Invalid mobile number.' })
      const svc = db.services.find((s) => s.name.toLowerCase() === (data.service ?? '').toLowerCase() || s.slug === (data.service ?? '').toLowerCase())
      if (!svc) errors.push({ field: 'service', message: 'Unknown service.' })
      if (data.next_followup_date && !/^\d{4}-\d{2}-\d{2}$/.test(data.next_followup_date)) errors.push({ field: 'next_followup_date', message: 'Use YYYY-MM-DD.' })
      let result: ImportRow['result'] = errors.length ? 'invalid' : 'valid'
      if (result === 'valid') {
        const mob = normaliseMobile(data.mobile)
        if (seen.has(mob) || db.leads.some((l) => l.mobile === mob)) { result = 'duplicate'; errors.push({ field: 'mobile', message: 'Mobile number already exists.' }) }
        seen.add(mob)
      }
      return { row_number: i + 2, result, data, errors }
    })
    const batch: DbBatch = { id: crypto.randomUUID(), filename: file.name, status: 'preview', rows, successful: 0 }
    db.batches.push(batch)
    save(db)
    return created(batchView(batch, q))
  }
  if ((m = path.match(/^\/api\/admin\/leads\/import\/([\w-]+)\/(confirm|cancel|report)?\/?$/))) {
    const batch = db.batches.find((x) => x.id === m![1])
    if (!batch) return fail(404, 'not_found', 'Import batch not found.')
    const action = m[2]
    if (!action && method === 'GET') return ok(batchView(batch, q))
    if (action === 'report') {
      const bad = batch.rows.filter((r) => r.result === 'invalid' || r.result === 'duplicate')
      const cols = Object.keys(bad[0]?.data ?? {})
      return fileRes(new Blob([csv([['row_number', ...cols, 'result', 'errors'], ...bad.map((r) => [String(r.row_number), ...cols.map((c) => r.data[c]), r.result, r.errors.map((e) => e.message).join('; ')])])], { type: 'text/csv' }), `import-errors-${batch.id.slice(0, 8)}.csv`)
    }
    if (batch.status !== 'preview') return fail(409, 'conflict', 'This import has already been processed.')
    if (action === 'cancel') { batch.status = 'cancelled'; save(db); return ok(batchView(batch, q)) }
    if (action === 'confirm') {
      const now = iso()
      for (const r of batch.rows.filter((x) => x.result === 'valid')) {
        const svc = db.services.find((s) => s.name.toLowerCase() === r.data.service.toLowerCase() || s.slug === r.data.service.toLowerCase())!
        const id = Math.max(0, ...db.leads.map((l) => l.id)) + 1
        db.leads.push({
          id, customer_name: r.data.customer_name, mobile: normaliseMobile(r.data.mobile), location: r.data.location ?? '', service_id: svc.id,
          loan_amount: r.data.loan_amount ?? '', occupation: r.data.occupation ?? '', message: r.data.message ?? '', consent: false, consent_at: null,
          source: 'existing_db', status: 'new', assigned_employee_id: null, assigned_at: null, last_followup_date: null,
          next_followup_date: r.data.next_followup_date || null, created_by: 1, import_batch_id: batch.id, created_at: now, updated_at: now,
        })
        r.result = 'imported'
        batch.successful++
      }
      batch.status = 'completed'
      save(db)
      return ok(batchView(batch, q))
    }
  }

  // ----- documents -----
  if ((m = path.match(/^\/api\/admin\/leads\/(\d+)\/documents\/$/))) {
    const leadId = Number(m[1])
    if (!db.leads.some((l) => l.id === leadId)) return fail(404, 'not_found', 'Lead not found.')
    if (method === 'GET') return ok(db.docs.filter((d) => d.lead_id === leadId && !d.deleted_at).sort((a, b) => (a.uploaded_at < b.uploaded_at ? 1 : -1)).map(toDoc))
    const file = form?.get('file') as File | null
    const category = String(form?.get('category') ?? '')
    if (!file) return fail(400, 'validation_error', 'Choose a file.', { file: ['This field is required.'] })
    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) return fail(415, 'unsupported_file_type', 'Only PDF, JPG and PNG files are allowed.')
    if (file.size > 10 * 1024 * 1024) return fail(413, 'file_too_large', 'The file is larger than 10 MB.')
    if (!DOCUMENT_CATEGORIES.some((c) => c.code === category)) return fail(400, 'validation_error', 'Select a category.', { category: ['Invalid category.'] })
    const doc: DbDoc = { id: crypto.randomUUID(), lead_id: leadId, original_filename: file.name, category, file_size: file.size, mime_type: file.type, uploaded_at: iso(), dataUrl: file.size < 1.5 * 1024 * 1024 ? await readAsDataUrl(file) : '' }
    db.docs.push(doc)
    save(db)
    return created(toDoc(doc))
  }
  if (method === 'GET' && path === '/api/admin/documents/bin/') {
    const binned = db.docs.filter((d) => d.deleted_at).sort((a, b) => (a.deleted_at! < b.deleted_at! ? 1 : -1))
    const p = paginate(binned, q)
    return ok(p.data.map((d) => {
      const l = db.leads.find((x) => x.id === d.lead_id)!
      return { ...toDoc(d), lead: { id: l.id, lead_code: code(l.id), customer_name: l.customer_name }, deleted_at: d.deleted_at, deleted_by: { id: 1, name: ADMIN.full_name } }
    }), { pagination: p.pagination })
  }
  if ((m = path.match(/^\/api\/admin\/documents\/([\w-]+)\/(download|restore|purge)?\/?$/))) {
    const doc = db.docs.find((d) => d.id === m![1])
    if (!doc) return fail(404, 'not_found', 'Document not found.')
    const action = m[2]
    if (action === 'restore' && method === 'POST') {
      if (!doc.deleted_at) return fail(409, 'conflict', 'This document is not in the bin.')
      doc.deleted_at = null
      save(db)
      return ok(toDoc(doc))
    }
    if (action === 'purge' && method === 'DELETE') {
      if (!doc.deleted_at) return fail(409, 'conflict', 'Only documents in the bin can be permanently deleted.')
      db.docs = db.docs.filter((d) => d.id !== doc.id)
      save(db)
      return json(204)
    }
    if (doc.deleted_at) return fail(404, 'not_found', 'Document not found.')
    if (action === 'download' && method === 'GET') {
      if (!doc.dataUrl) return fail(404, 'not_found', 'The mock only keeps files under 1.5 MB. Use the real backend for larger files.')
      return fileRes(await dataUrlToBlob(doc.dataUrl), doc.original_filename)
    }
    if (!action && method === 'DELETE') {
      doc.deleted_at = iso()
      save(db)
      return json(204)
    }
  }

  return fail(404, 'not_found', `Mock API has no handler for ${method} ${path}`)
}

function toDoc(d: DbDoc): LeadDocument {
  return { id: d.id, original_filename: d.original_filename, category: label(DOCUMENT_CATEGORIES, d.category) as LeadDocument['category'], file_size: d.file_size, mime_type: d.mime_type, uploaded_by: { id: 1, name: ADMIN.full_name }, uploaded_at: d.uploaded_at }
}

function batchView(b: DbBatch, q: URLSearchParams) {
  const count = (r: string) => b.rows.filter((x) => x.result === r).length
  const filtered = q.get('result') ? b.rows.filter((r) => r.result === q.get('result')) : b.rows
  const p = paginate(filtered, q)
  const valid = b.status === 'completed' ? b.successful : count('valid')
  return {
    batch_id: b.id,
    status: b.status,
    filename: b.filename,
    summary: {
      total_rows: b.rows.length,
      valid_rows: valid,
      invalid_rows: count('invalid'),
      duplicate_rows: count('duplicate'),
      ...(b.status === 'completed' ? { successful_rows: b.successful, failed_rows: count('invalid') } : {}),
    },
    missing_columns: [],
    rows: p.data,
    rows_pagination: p.pagination,
  }
}
