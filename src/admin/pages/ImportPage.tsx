import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { clsx } from 'clsx'
import { AlertTriangle, CheckCircle2, Copy, Download, FileSpreadsheet, Upload, XCircle } from 'lucide-react'
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Alert, Spinner } from '@/components/ui/Feedback'
import { ApiError } from '@/lib/api/client'
import { adminApi } from '@/lib/api/endpoints'
import type { ImportBatch, ImportRowResult } from '@/lib/api/types'
import { formatBytes, formatNumber } from '@/lib/format'
import { Card, PageHeader, Pagination } from '../components/ui'

const MAX_MB = 5
const REQUIRED = ['customer_name', 'mobile', 'service']

type Step = 'upload' | 'review' | 'done'

export default function ImportPage() {
  const [step, setStep] = useState<Step>('upload')
  const [batch, setBatch] = useState<ImportBatch | null>(null)
  const reset = () => { setBatch(null); setStep('upload') }

  return (
    <>
      <PageHeader title="Import Leads" description="Bring in leads from an existing CSV or Excel (XLSX) file." />
      <Stepper step={step} />
      {step === 'upload' && <UploadStep onPreview={(b) => { setBatch(b); setStep('review') }} />}
      {step === 'review' && batch && <ReviewStep batch={batch} onDone={(b) => { setBatch(b); setStep('done') }} onCancel={reset} />}
      {step === 'done' && batch && <DoneStep batch={batch} onAgain={reset} />}
    </>
  )
}

function Stepper({ step }: { step: Step }) {
  const steps: [Step, string][] = [['upload', 'Upload file'], ['review', 'Review & confirm'], ['done', 'Results']]
  const idx = steps.findIndex(([s]) => s === step)
  return (
    <ol className="mb-6 flex items-center gap-2 text-sm">
      {steps.map(([s, label], i) => (
        <li key={s} className="flex items-center gap-2">
          <span className={clsx('flex size-6 items-center justify-center rounded-full text-xs font-bold', i < idx ? 'bg-emerald-600 text-white' : i === idx ? 'bg-navy-900 text-white' : 'bg-line text-ink-500')}>
            {i < idx ? '✓' : i + 1}
          </span>
          <span className={clsx('font-medium', i === idx ? 'text-ink-900' : 'text-ink-500')}>{label}</span>
          {i < steps.length - 1 && <span className="mx-2 h-px w-8 bg-line sm:w-16" />}
        </li>
      ))}
    </ol>
  )
}

function UploadStep({ onPreview }: { onPreview: (b: ImportBatch) => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [missing, setMissing] = useState<string[]>([])
  const [templateError, setTemplateError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const upload = useMutation({
    mutationFn: (f: File) => adminApi.importUpload(f),
    onSuccess: onPreview,
    onError: (e) => {
      setError(e.message)
      if (e instanceof ApiError && Array.isArray(e.details.missing_columns)) setMissing(e.details.missing_columns as string[])
    },
  })

  const pick = (f?: File) => {
    setError(null)
    setMissing([])
    if (!f) return
    const ext = f.name.split('.').pop()?.toLowerCase()
    if (ext !== 'csv' && ext !== 'xlsx') return setError('Only .csv and .xlsx files are supported.')
    if (f.size > MAX_MB * 1024 * 1024) return setError(`The file is larger than ${MAX_MB} MB.`)
    setFile(f)
  }

  const template = async (format: 'csv' | 'xlsx') => {
    setTemplateError(null)
    try { await adminApi.importTemplate(format) } catch (e) { setTemplateError(e instanceof Error ? e.message : 'Download failed.') }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <Card>
        {error && (
          <Alert tone="error" className="mb-5" title="This file can't be imported">
            {error}
            {missing.length > 0 && <p className="mt-1">Missing columns: <strong>{missing.join(', ')}</strong></p>}
          </Alert>
        )}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); pick(e.dataTransfer.files[0]) }}
          className="flex flex-col items-center rounded-xl border-2 border-dashed border-line bg-surface/50 px-6 py-14 text-center"
        >
          <div className="flex size-14 items-center justify-center rounded-2xl bg-white text-royal-600 shadow-card"><FileSpreadsheet className="size-7" /></div>
          {file ? (
            <p className="mt-4 font-medium text-ink-900">{file.name} <span className="font-normal text-ink-500">({formatBytes(file.size)})</span></p>
          ) : (
            <>
              <p className="mt-4 font-medium text-ink-900">Drag your CSV or XLSX file here</p>
              <p className="mt-1 text-sm text-ink-500">Up to {MAX_MB} MB</p>
            </>
          )}
          <div className="mt-5 flex gap-2">
            <Button variant="secondary" onClick={() => inputRef.current?.click()}>{file ? 'Choose another file' : 'Browse files'}</Button>
            {file && <Button loading={upload.isPending} icon={<Upload className="size-4" />} onClick={() => upload.mutate(file)}>Upload & validate</Button>}
          </div>
          <input ref={inputRef} type="file" accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className="hidden" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = '' }} />
        </div>
        {upload.isPending && <p className="mt-4 text-center text-sm text-ink-500">Validating rows… nothing is imported until you confirm.</p>}
      </Card>

      <div className="space-y-6">
        <Card title="1. Start from the template">
          <p className="text-sm text-ink-700">Use the sample file so your columns match.</p>
          <div className="mt-4 flex gap-2">
            <Button size="sm" variant="secondary" icon={<Download className="size-3.5" />} onClick={() => template('xlsx')}>Excel template</Button>
            <Button size="sm" variant="secondary" icon={<Download className="size-3.5" />} onClick={() => template('csv')}>CSV template</Button>
          </div>
          {templateError && <Alert tone="error" className="mt-3">{templateError}</Alert>}
          <p className="mt-4 text-xs text-ink-500">Required columns: {REQUIRED.map((c) => <code key={c} className="mr-1 rounded bg-surface px-1 py-0.5">{c}</code>)}</p>
          <p className="mt-2 text-xs text-ink-500">Optional: location, loan_amount, occupation, message, next_followup_date (YYYY-MM-DD).</p>
        </Card>
        <Card title="Import policy">
          <ul className="space-y-2.5 text-sm text-ink-700">
            <li className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" /> Only valid rows are imported, after you confirm.</li>
            <li className="flex gap-2"><XCircle className="mt-0.5 size-4 shrink-0 text-red-600" /> Rows with missing required values, invalid mobiles or unknown services are skipped.</li>
            <li className="flex gap-2"><Copy className="mt-0.5 size-4 shrink-0 text-amber-600" /> Rows whose mobile already exists, or repeats in the file, are skipped as duplicates. Existing leads are never overwritten.</li>
            <li className="flex gap-2"><FileSpreadsheet className="mt-0.5 size-4 shrink-0 text-royal-600" /> Imported leads get Source = Existing Database / Import and Status = New.</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}

const TABS: { key: '' | ImportRowResult; label: string }[] = [
  { key: '', label: 'All rows' },
  { key: 'invalid', label: 'Invalid' },
  { key: 'duplicate', label: 'Duplicates' },
  { key: 'valid', label: 'Valid' },
]

function ReviewStep({ batch, onDone, onCancel }: { batch: ImportBatch; onDone: (b: ImportBatch) => void; onCancel: () => void }) {
  const qc = useQueryClient()
  const [tab, setTab] = useState<'' | ImportRowResult>(batch.summary.invalid_rows > 0 ? 'invalid' : '')
  const [page, setPage] = useState(1)
  const rows = useQuery({
    queryKey: ['admin', 'import', batch.batch_id, tab, page],
    queryFn: () => adminApi.importBatch(batch.batch_id, { result: tab, page }),
    placeholderData: keepPreviousData,
  })

  const confirm = useMutation({
    mutationFn: () => adminApi.importConfirm(batch.batch_id),
    onSuccess: (b) => {
      qc.invalidateQueries({ queryKey: ['admin'] })
      onDone(b)
    },
  })
  const cancel = useMutation({ mutationFn: () => adminApi.importCancel(batch.batch_id), onSettled: onCancel })

  const s = batch.summary
  const data = rows.data ?? batch
  const columns = Array.from(new Set(data.rows.flatMap((r) => Object.keys(r.data)))).slice(0, 6)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryTile label="Total rows" value={s.total_rows} />
        <SummaryTile label="Ready to import" value={s.valid_rows} tone="green" />
        <SummaryTile label="Invalid" value={s.invalid_rows} tone="red" />
        <SummaryTile label="Duplicates" value={s.duplicate_rows} tone="amber" />
      </div>

      <Card bodyClassName="" title={<span className="flex items-center gap-2"><FileSpreadsheet className="size-4 text-ink-400" /> {batch.filename}</span>}>
        <div className="flex gap-1 overflow-x-auto border-b border-line px-3">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => { setTab(t.key); setPage(1) }} className={clsx('border-b-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap', tab === t.key ? 'border-navy-900 text-navy-900' : 'border-transparent text-ink-500 hover:text-ink-900')}>
              {t.label}
            </button>
          ))}
        </div>
        {rows.isLoading ? <div className="flex justify-center py-10"><Spinner /></div> : rows.isError ? <div className="p-4"><Alert tone="error">{rows.error.message}</Alert></div> : data.rows.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-ink-400">No rows in this view.</p>
        ) : (
          <>
            <div className={clsx('overflow-x-auto', rows.isFetching && 'opacity-60')}>
              <table className="w-full min-w-[800px] text-sm">
                <thead className="bg-surface/60 text-left text-xs text-ink-500">
                  <tr>
                    <th className="px-5 py-2.5 font-medium">Row</th>
                    <th className="px-3 py-2.5 font-medium">Result</th>
                    {columns.map((c) => <th key={c} className="px-3 py-2.5 font-medium">{c}</th>)}
                    <th className="px-5 py-2.5 font-medium">Issues</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((r) => (
                    <tr key={r.row_number} className="border-t border-line align-top">
                      <td className="px-5 py-2.5 text-ink-500 tabular-nums">{r.row_number}</td>
                      <td className="px-3 py-2.5"><ResultBadge result={r.result} /></td>
                      {columns.map((c) => {
                        const bad = r.errors.some((e) => e.field === c)
                        return <td key={c} className={clsx('max-w-[180px] truncate px-3 py-2.5', bad ? 'font-medium text-red-700' : 'text-ink-700')}>{r.data[c] || <span className="text-ink-400">—</span>}</td>
                      })}
                      <td className="px-5 py-2.5 text-xs text-red-700">{r.errors.map((e) => <p key={e.field + e.message}>{e.message}</p>)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data.rows_pagination && <Pagination pagination={data.rows_pagination} onPage={setPage} />}
          </>
        )}
      </Card>

      {confirm.isError && <Alert tone="error">{confirm.error.message}</Alert>}
      <div className="flex flex-col-reverse gap-3 rounded-xl border border-line bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-700">
          {s.valid_rows > 0
            ? <><strong>{formatNumber(s.valid_rows)}</strong> lead(s) will be imported. {s.invalid_rows + s.duplicate_rows > 0 && <>{formatNumber(s.invalid_rows + s.duplicate_rows)} row(s) will be skipped.</>}</>
            : <span className="flex items-center gap-2 text-red-700"><AlertTriangle className="size-4" /> No valid rows to import. Fix the file and upload again.</span>}
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" loading={cancel.isPending} onClick={() => cancel.mutate()}>Cancel</Button>
          <Button disabled={s.valid_rows === 0} loading={confirm.isPending} onClick={() => confirm.mutate()}>Import {formatNumber(s.valid_rows)} lead(s)</Button>
        </div>
      </div>
    </div>
  )
}

function DoneStep({ batch, onAgain }: { batch: ImportBatch; onAgain: () => void }) {
  const s = batch.summary
  const [err, setErr] = useState<string | null>(null)
  const failed = (s.failed_rows ?? s.invalid_rows) + s.duplicate_rows
  return (
    <Card>
      <div className="flex flex-col items-center py-6 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-emerald-50"><CheckCircle2 className="size-7 text-emerald-600" /></div>
        <h2 className="mt-4 text-xl font-bold">Import complete</h2>
        <p className="mt-1 text-sm text-ink-500">{batch.filename}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryTile label="Total rows" value={s.total_rows} />
        <SummaryTile label="Successful" value={s.successful_rows ?? s.valid_rows} tone="green" />
        <SummaryTile label="Failed" value={s.failed_rows ?? s.invalid_rows} tone="red" />
        <SummaryTile label="Duplicate / skipped" value={s.duplicate_rows} tone="amber" />
      </div>
      {err && <Alert tone="error" className="mt-5">{err}</Alert>}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {failed > 0 && (
          <Button variant="secondary" icon={<Download className="size-4" />} onClick={async () => { setErr(null); try { await adminApi.importReport(batch.batch_id) } catch (e) { setErr(e instanceof Error ? e.message : 'Download failed.') } }}>
            Download error report
          </Button>
        )}
        <Link to="/admin/leads?source=existing_db" className="inline-flex h-10 items-center rounded-lg bg-navy-900 px-4 text-sm font-semibold text-white hover:bg-navy-800">View imported leads</Link>
        <Button variant="ghost" onClick={onAgain}>Import another file</Button>
      </div>
    </Card>
  )
}

function SummaryTile({ label, value, tone }: { label: string; value: number; tone?: 'green' | 'red' | 'amber' }) {
  const color = { green: 'text-emerald-700', red: 'text-red-700', amber: 'text-amber-700' }
  return (
    <div className="rounded-xl border border-line bg-white p-4">
      <p className="text-sm text-ink-500">{label}</p>
      <p className={clsx('mt-1 font-display text-2xl font-bold', tone ? color[tone] : 'text-ink-900')}>{formatNumber(value)}</p>
    </div>
  )
}

function ResultBadge({ result }: { result: ImportRowResult }) {
  const map: Record<ImportRowResult, string> = {
    valid: 'bg-emerald-50 text-emerald-700',
    imported: 'bg-emerald-50 text-emerald-700',
    invalid: 'bg-red-50 text-red-700',
    duplicate: 'bg-amber-50 text-amber-700',
  }
  return <span className={clsx('rounded-md px-2 py-0.5 text-xs font-semibold capitalize', map[result])}>{result}</span>
}
