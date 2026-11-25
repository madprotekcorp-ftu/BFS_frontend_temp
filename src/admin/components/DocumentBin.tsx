import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { clsx } from 'clsx'
import { RotateCcw, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Alert, EmptyState, Spinner } from '@/components/ui/Feedback'
import { Modal } from '@/components/ui/Modal'
import { adminApi } from '@/lib/api/endpoints'
import type { BinnedDocument } from '@/lib/api/types'
import { formatBytes, formatDateTime } from '@/lib/format'
import { Pagination } from './ui'

export function DocumentBin() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [toPurge, setToPurge] = useState<BinnedDocument | null>(null)
  const [error, setError] = useState<string | null>(null)
  const bin = useQuery({ queryKey: ['admin', 'document-bin', page], queryFn: () => adminApi.documentBin(page), placeholderData: keepPreviousData })

  const refresh = (leadId: number) => {
    qc.invalidateQueries({ queryKey: ['admin', 'document-bin'] })
    qc.invalidateQueries({ queryKey: ['admin', 'documents', leadId] })
    qc.invalidateQueries({ queryKey: ['admin', 'lead', leadId] })
  }
  const restore = useMutation({
    mutationFn: (d: BinnedDocument) => adminApi.restoreDocument(d.id),
    onSuccess: (_r, d) => refresh(d.lead.id),
    onError: (e) => setError(e.message),
  })
  const purge = useMutation({
    mutationFn: (d: BinnedDocument) => adminApi.purgeDocument(d.id),
    onSuccess: (_r, d) => { setToPurge(null); refresh(d.lead.id) },
  })

  return (
    <div className="rounded-xl border border-line bg-white">
      <div className="border-b border-line px-5 py-3.5">
        <h2 className="text-[15px] font-semibold">Bin</h2>
        <p className="text-sm text-ink-500">Documents moved to the bin. Restore them to their lead, or delete them permanently.</p>
      </div>
      {error && <Alert tone="error" className="m-4">{error}</Alert>}
      {bin.isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : bin.isError ? (
        <div className="p-4"><Alert tone="error">{bin.error.message}</Alert></div>
      ) : bin.data?.data.length === 0 ? (
        <EmptyState icon={<Trash2 className="size-5" />} title="The bin is empty" description="Documents you remove from a lead appear here." />
      ) : bin.data ? (
        <>
          <div className={clsx('overflow-x-auto', bin.isFetching && 'opacity-60')}>
            <table className="w-full min-w-[820px] text-sm">
              <thead className="bg-surface/60 text-left text-xs text-ink-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Document</th>
                  <th className="px-3 py-3 font-medium">Lead</th>
                  <th className="px-3 py-3 font-medium">Category</th>
                  <th className="px-3 py-3 font-medium">Moved to bin</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bin.data.data.map((d) => (
                  <tr key={d.id} className="border-t border-line">
                    <td className="px-5 py-3">
                      <p className="max-w-[260px] truncate font-medium text-ink-900" title={d.original_filename}>{d.original_filename}</p>
                      <p className="text-xs text-ink-500">{formatBytes(d.file_size)}</p>
                    </td>
                    <td className="px-3 py-3">
                      <Link to={`/admin/leads/${d.lead.id}`} className="font-medium text-royal-600 hover:underline">{d.lead.customer_name}</Link>
                      <p className="font-mono text-xs text-ink-500">{d.lead.lead_code}</p>
                    </td>
                    <td className="px-3 py-3 text-ink-700">{d.category.label}</td>
                    <td className="px-3 py-3 text-ink-500">{formatDateTime(d.deleted_at)}<p className="text-xs">by {d.deleted_by.name}</p></td>
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      <Button size="sm" variant="secondary" icon={<RotateCcw className="size-3.5" />} loading={restore.isPending && restore.variables?.id === d.id} onClick={() => { setError(null); restore.mutate(d) }}>Restore</Button>
                      <Button size="sm" variant="ghost" className="ml-1 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => setToPurge(d)}>Delete permanently</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination pagination={bin.data.pagination} onPage={setPage} />
        </>
      ) : null}

      <Modal
        open={!!toPurge}
        onClose={() => { setToPurge(null); purge.reset() }}
        size="sm"
        title="Delete permanently?"
        footer={<>
          <Button variant="secondary" onClick={() => setToPurge(null)}>Cancel</Button>
          <Button variant="danger" loading={purge.isPending} onClick={() => toPurge && purge.mutate(toPurge)}>Delete permanently</Button>
        </>}
      >
        <p className="text-sm text-ink-700"><strong>{toPurge?.original_filename}</strong> and its file will be permanently deleted. This cannot be undone.</p>
        {purge.isError && <Alert tone="error" className="mt-4">{purge.error.message}</Alert>}
      </Modal>
    </div>
  )
}
