import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Download, Eye, FileImage, FileText, Trash2, Upload } from 'lucide-react'
import { type ReactNode, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Field, Select } from '@/components/ui/Field'
import { Alert, EmptyState, Spinner } from '@/components/ui/Feedback'
import { Modal } from '@/components/ui/Modal'
import { adminApi } from '@/lib/api/endpoints'
import { DOCUMENT_CATEGORIES, type LeadDocument } from '@/lib/api/types'
import { formatBytes, formatDateTime } from '@/lib/format'
import { Card } from './ui'

// Mirrors the backend allow-list (backend spec §6). The backend is the source of truth.
const ACCEPT = '.pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png'
const ALLOWED_MIME = ['application/pdf', 'image/jpeg', 'image/png']
const MAX_MB = 10

export function DocumentsPanel({ leadId }: { leadId: number }) {
  const qc = useQueryClient()
  const key = ['admin', 'documents', leadId]
  const docs = useQuery({ queryKey: key, queryFn: () => adminApi.documents(leadId) })
  const [uploadOpen, setUploadOpen] = useState(false)
  const [toDelete, setToDelete] = useState<LeadDocument | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const del = useMutation({
    mutationFn: (id: string) => adminApi.deleteDocument(id),
    onSuccess: () => {
      setToDelete(null)
      qc.invalidateQueries({ queryKey: key })
      qc.invalidateQueries({ queryKey: ['admin', 'lead', leadId] })
      qc.invalidateQueries({ queryKey: ['admin', 'document-bin'] })
    },
  })

  const view = async (doc: LeadDocument) => {
    setActionError(null)
    setBusyId(doc.id)
    // Open the tab synchronously so pop-up blockers allow it, then load the file into it.
    const win = window.open('', '_blank')
    try {
      const url = await adminApi.viewDocument(doc.id)
      if (win) win.location.href = url
      else window.location.href = url
      setTimeout(() => URL.revokeObjectURL(url), 60_000)
    } catch (e) {
      win?.close()
      setActionError(e instanceof Error ? e.message : 'The document could not be opened.')
    } finally {
      setBusyId(null)
    }
  }

  const download = async (doc: LeadDocument) => {
    setActionError(null)
    setBusyId(doc.id)
    try {
      await adminApi.downloadDocument(doc)
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'The document could not be downloaded.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <Card
      title={`Documents${docs.data ? ` (${docs.data.length})` : ''}`}
      action={<Button size="sm" variant="secondary" icon={<Upload className="size-3.5" />} onClick={() => setUploadOpen(true)}>Upload</Button>}
      bodyClassName=""
    >
      {actionError && <Alert tone="error" className="m-4">{actionError}</Alert>}
      {docs.isLoading ? (
        <div className="flex justify-center py-10"><Spinner /></div>
      ) : docs.isError ? (
        <div className="p-4"><Alert tone="error">{docs.error.message}</Alert></div>
      ) : docs.data?.length === 0 ? (
        <EmptyState title="No documents" description="Upload KYC, income or loan documents for this lead. Files are stored privately." icon={<FileText className="size-5" />} />
      ) : (
        <ul className="divide-y divide-line">
          {docs.data?.map((d) => (
            <li key={d.id} className="flex items-center gap-3 px-5 py-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface text-ink-500">
                {d.mime_type.startsWith('image/') ? <FileImage className="size-4" /> : <FileText className="size-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink-900" title={d.original_filename}>{d.original_filename}</p>
                <p className="text-xs text-ink-500">{d.category.label} · {formatBytes(d.file_size)} · {d.uploaded_by.name} · {formatDateTime(d.uploaded_at)}</p>
              </div>
              <div className="flex shrink-0 gap-0.5">
                {busyId === d.id ? <Spinner label="" className="px-2" /> : (
                  <>
                    <IconBtn label={`View ${d.original_filename}`} onClick={() => view(d)}><Eye className="size-4" /></IconBtn>
                    <IconBtn label={`Download ${d.original_filename}`} onClick={() => download(d)}><Download className="size-4" /></IconBtn>
                    <IconBtn label={`Move ${d.original_filename} to bin`} danger onClick={() => setToDelete(d)}><Trash2 className="size-4" /></IconBtn>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <UploadModal leadId={leadId} open={uploadOpen} onClose={() => setUploadOpen(false)} onUploaded={() => {
        qc.invalidateQueries({ queryKey: key })
        qc.invalidateQueries({ queryKey: ['admin', 'lead', leadId] })
      }} />

      <Modal
        open={!!toDelete}
        onClose={() => { setToDelete(null); del.reset() }}
        size="sm"
        title="Move document to bin?"
        footer={<>
          <Button variant="secondary" onClick={() => setToDelete(null)}>Cancel</Button>
          <Button variant="danger" loading={del.isPending} onClick={() => toDelete && del.mutate(toDelete.id)}>Move to bin</Button>
        </>}
      >
        <p className="text-sm text-ink-700"><strong>{toDelete?.original_filename}</strong> will be removed from this lead and moved to the bin. You can restore it from Documents → Bin.</p>
        {del.isError && <Alert tone="error" className="mt-4">{del.error.message}</Alert>}
      </Modal>
    </Card>
  )
}

function IconBtn({ label, onClick, children, danger }: { label: string; onClick: () => void; children: ReactNode; danger?: boolean }) {
  return (
    <button onClick={onClick} aria-label={label} title={label.split(' ')[0]} className={danger ? 'rounded-md p-2 text-ink-400 hover:bg-red-50 hover:text-red-600' : 'rounded-md p-2 text-ink-400 hover:bg-surface hover:text-navy-900'}>
      {children}
    </button>
  )
}

function UploadModal({ leadId, open, onClose, onUploaded }: { leadId: number; open: boolean; onClose: () => void; onUploaded: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [category, setCategory] = useState('')
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const upload = useMutation({
    mutationFn: () => adminApi.uploadDocument(leadId, file!, category),
    onSuccess: () => {
      onUploaded()
      close()
    },
    onError: (e) => setError(e.message),
  })

  const close = () => {
    setFile(null)
    setCategory('')
    setError(null)
    upload.reset()
    onClose()
  }

  const pick = (f: File | undefined) => {
    setError(null)
    if (!f) return
    if (!ALLOWED_MIME.includes(f.type)) return setError('Only PDF, JPG and PNG files are allowed.')
    if (f.size > MAX_MB * 1024 * 1024) return setError(`The file is larger than ${MAX_MB} MB.`)
    setFile(f)
  }

  const submit = () => {
    if (!file) return setError('Choose a file to upload.')
    if (!category) return setError('Select a document category.')
    upload.mutate()
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Upload document"
      description={`PDF, JPG or PNG, up to ${MAX_MB} MB. Stored privately; only administrators can access it.`}
      footer={<>
        <Button variant="secondary" onClick={close}>Cancel</Button>
        <Button loading={upload.isPending} onClick={submit} icon={<Upload className="size-4" />}>Upload</Button>
      </>}
    >
      <div className="space-y-5">
        {error && <Alert tone="error">{error}</Alert>}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); pick(e.dataTransfer.files[0]) }}
          className="flex flex-col items-center rounded-xl border-2 border-dashed border-line bg-surface/50 px-6 py-8 text-center"
        >
          <Upload className="size-6 text-ink-400" />
          {file ? (
            <p className="mt-3 text-sm font-medium text-ink-900">{file.name} <span className="font-normal text-ink-500">({formatBytes(file.size)})</span></p>
          ) : (
            <p className="mt-3 text-sm text-ink-500">Drag a file here, or</p>
          )}
          <Button size="sm" variant="secondary" className="mt-3" onClick={() => inputRef.current?.click()}>{file ? 'Choose another file' : 'Browse files'}</Button>
          <input ref={inputRef} type="file" accept={ACCEPT} className="hidden" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = '' }} />
        </div>
        <Field label="Category" htmlFor="doc-category" required>
          <Select id="doc-category" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Select a category</option>
            {DOCUMENT_CATEGORIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
          </Select>
        </Field>
      </div>
    </Modal>
  )
}
