import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { clsx } from 'clsx'
import { Pencil, Plus, Search, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Field'
import { Alert, EmptyState, Spinner } from '@/components/ui/Feedback'
import { Modal } from '@/components/ui/Modal'
import { ApiError } from '@/lib/api/client'
import { adminApi } from '@/lib/api/endpoints'
import type { Employee } from '@/lib/api/types'
import { isIndianMobile, normaliseMobile } from '@/lib/validation'
import { filterControl, PageHeader } from '../components/ui'
import { useDebounced } from '../hooks'

export default function EmployeesPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'' | 'true' | 'false'>('')
  const debounced = useDebounced(search)
  const [editing, setEditing] = useState<Employee | 'new' | null>(null)
  const [toggling, setToggling] = useState<Employee | null>(null)
  const qc = useQueryClient()

  const list = useQuery({
    queryKey: ['admin', 'employees', 'list', { search: debounced, status }],
    queryFn: () => adminApi.employees({ search: debounced, is_active: status }),
  })
  const rows = list.data?.data
  const total = list.data?.pagination.total ?? 0

  const toggle = useMutation({
    mutationFn: (e: Employee) => adminApi.updateEmployee(e.id, { is_active: !e.is_active }),
    onSuccess: () => {
      setToggling(null)
      qc.invalidateQueries({ queryKey: ['admin', 'leads'] })
      qc.invalidateQueries({ queryKey: ['admin', 'employees'] })
      qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
    },
  })

  return (
    <>
      <PageHeader
        title="Employees"
        description="Directory of BFS staff for lead assignment. Employees do not have system logins."
        actions={<Button icon={<Plus className="size-4" />} onClick={() => setEditing('new')}>Add employee</Button>}
      />
      <div className="rounded-xl border border-line bg-white">
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-400" />
            <input type="search" aria-label="Search employees" placeholder="Search by name or employee ID" className={clsx(filterControl, 'w-full pl-9')} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select aria-label="Filter by status" className={filterControl} value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
            <option value="">All employees</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        {list.isLoading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : list.isError ? (
          <div className="p-5"><Alert tone="error">{list.error.message}</Alert></div>
        ) : rows?.length === 0 ? (
          <EmptyState icon={<Users className="size-5" />} title={search || status ? 'No employees match' : 'No employees yet'} description="Add employees so you can assign leads to them." action={!search && !status ? <Button icon={<Plus className="size-4" />} onClick={() => setEditing('new')}>Add employee</Button> : undefined} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-surface/60 text-left text-xs text-ink-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Employee ID</th>
                  <th className="px-3 py-3 font-medium">Name</th>
                  <th className="px-3 py-3 font-medium">Contact</th>
                  <th className="px-3 py-3 text-right font-medium">Total leads</th>
                  <th className="px-3 py-3 text-right font-medium">Open</th>
                  <th className="px-3 py-3 text-right font-medium">Converted</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows?.map((e) => (
                  <tr key={e.id} className={clsx('border-t border-line', !e.is_active && 'bg-surface/40')}>
                    <td className="px-5 py-3 font-mono text-xs text-ink-500">{e.employee_code}</td>
                    <td className="px-3 py-3 font-medium text-ink-900">{e.name}</td>
                    <td className="px-3 py-3 text-ink-700">
                      {e.mobile || e.email ? <>{e.mobile && <span className="block">{e.mobile}</span>}{e.email && <span className="block text-xs text-ink-500">{e.email}</span>}</> : <span className="text-ink-400">—</span>}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      <Link to={`/admin/leads?employee_id=${e.id}`} className="font-semibold text-royal-600 hover:underline">{e.lead_counts.total}</Link>
                    </td>
                    <td className="px-3 py-3 text-right text-ink-700 tabular-nums">{e.lead_counts.open}</td>
                    <td className="px-3 py-3 text-right text-emerald-700 tabular-nums">{e.lead_counts.converted}</td>
                    <td className="px-3 py-3">
                      <span className={clsx('inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset', e.is_active ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 'bg-slate-100 text-slate-600 ring-slate-500/20')}>
                        {e.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      <button onClick={() => setEditing(e)} className="rounded-md p-1.5 text-ink-400 hover:bg-surface hover:text-navy-900" aria-label={`Edit ${e.name}`}><Pencil className="size-4" /></button>
                      <button onClick={() => setToggling(e)} className="ml-1 rounded-md px-2 py-1 text-xs font-semibold text-royal-600 hover:bg-royal-50">{e.is_active ? 'Deactivate' : 'Activate'}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows && total > rows.length && <p className="border-t border-line px-5 py-3 text-xs text-ink-500">Showing {rows.length} of {total}. Search to narrow the list.</p>}
          </div>
        )}
      </div>

      <EmployeeModal employee={editing === 'new' ? undefined : editing ?? undefined} open={!!editing} onClose={() => setEditing(null)} />

      <Modal
        open={!!toggling}
        onClose={() => { setToggling(null); toggle.reset() }}
        size="sm"
        title={toggling?.is_active ? 'Deactivate employee?' : 'Activate employee?'}
        footer={<>
          <Button variant="secondary" onClick={() => setToggling(null)}>Cancel</Button>
          <Button variant={toggling?.is_active ? 'danger' : 'primary'} loading={toggle.isPending} onClick={() => toggling && toggle.mutate(toggling)}>{toggling?.is_active ? 'Deactivate' : 'Activate'}</Button>
        </>}
      >
        <p className="text-sm text-ink-700">
          {toggling?.is_active
            ? <><strong>{toggling.name}</strong> will no longer appear in assignment lists. Their {toggling.lead_counts.open} open lead(s) stay assigned until you transfer them.</>
            : <><strong>{toggling?.name}</strong> will be available for lead assignment again.</>}
        </p>
        {toggle.isError && <Alert tone="error" className="mt-4">{toggle.error.message}</Alert>}
      </Modal>
    </>
  )
}

const schema = z.object({
  employee_code: z.string().trim().min(1, 'Enter an employee ID.').max(20, 'Max 20 characters.'),
  name: z.string().trim().min(2, 'Enter the employee name.').max(120),
  mobile: z.string().trim().refine((v) => v === '' || isIndianMobile(v), 'Enter a valid 10-digit mobile number.').transform((v) => (v ? normaliseMobile(v) : '')),
  email: z.string().trim().refine((v) => v === '' || z.email().safeParse(v).success, 'Enter a valid email address.'),
})
type In = z.input<typeof schema>
type Out = z.output<typeof schema>

function EmployeeModal({ employee, open, onClose }: { employee?: Employee; open: boolean; onClose: () => void }) {
  const qc = useQueryClient()
  const { register, handleSubmit, reset, setError, formState: { errors, dirtyFields } } = useForm<In, unknown, Out>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (open) reset(employee ? { employee_code: employee.employee_code, name: employee.name, mobile: employee.mobile, email: employee.email } : { employee_code: '', name: '', mobile: '', email: '' })
  }, [open, employee, reset])

  const save = useMutation({
    // Edit is a partial PATCH: only the fields that changed.
    mutationFn: (v: Out) =>
      employee
        ? adminApi.updateEmployee(employee.id, Object.fromEntries(Object.keys(dirtyFields).map((k) => [k, v[k as keyof Out]])))
        : adminApi.createEmployee({ ...v, is_active: true }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'employees'] })
      onClose()
    },
    onError: (err) => {
      if (err instanceof ApiError) for (const [f, m] of Object.entries(err.fields)) if (f in schema.shape) setError(f as keyof In, { message: m[0] })
    },
  })
  // Errors with no matching input (or no field at all) go at the top.
  const other = save.error instanceof ApiError ? Object.entries(save.error.fields).filter(([f]) => !(f in schema.shape)).flatMap(([, m]) => m) : []
  const general = save.error && (!(save.error instanceof ApiError) || Object.keys(save.error.fields).length === 0 || other.length > 0)

  return (
    <Modal
      open={open}
      onClose={() => { save.reset(); onClose() }}
      title={employee ? 'Edit employee' : 'Add employee'}
      footer={<>
        <Button variant="secondary" onClick={() => { save.reset(); onClose() }}>Cancel</Button>
        <Button type="submit" form="employee-form" loading={save.isPending}>{employee ? 'Save changes' : 'Add employee'}</Button>
      </>}
    >
      <form id="employee-form" onSubmit={handleSubmit((v) => (employee && Object.keys(dirtyFields).length === 0 ? onClose() : save.mutate(v)))} noValidate className="grid gap-5 sm:grid-cols-2">
        {general && <Alert tone="error" className="sm:col-span-2">{other.length ? other.join(' ') : save.error.message}</Alert>}
        <Field label="Employee ID" htmlFor="emp-code" required error={errors.employee_code?.message}>
          <Input id="emp-code" invalid={!!errors.employee_code} {...register('employee_code')} />
        </Field>
        <Field label="Employee Name" htmlFor="emp-name" required error={errors.name?.message}>
          <Input id="emp-name" invalid={!!errors.name} {...register('name')} />
        </Field>
        <Field label="Mobile" htmlFor="emp-mobile" error={errors.mobile?.message}>
          <Input id="emp-mobile" type="tel" invalid={!!errors.mobile} {...register('mobile')} />
        </Field>
        <Field label="Email" htmlFor="emp-email" error={errors.email?.message}>
          <Input id="emp-email" type="email" invalid={!!errors.email} {...register('email')} />
        </Field>
      </form>
    </Modal>
  )
}
