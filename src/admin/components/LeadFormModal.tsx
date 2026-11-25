import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { Alert } from '@/components/ui/Feedback'
import { Modal } from '@/components/ui/Modal'
import { ApiError } from '@/lib/api/client'
import { adminApi } from '@/lib/api/endpoints'
import { LEAD_SOURCES, LEAD_STATUSES, type LeadDetail, type LeadWritePayload } from '@/lib/api/types'
import { mobileSchema, optionalText } from '@/lib/validation'
import { useEmployees, useServiceOptions } from '../queries'

const schema = z.object({
  customer_name: z.string().trim().min(2, 'Enter the customer name.').max(150),
  mobile: mobileSchema,
  service_id: z.string().min(1, 'Select a service.'),
  location: optionalText(120, 'Location'),
  loan_amount: optionalText(50, 'Amount'),
  occupation: optionalText(120, 'Occupation'),
  message: optionalText(2000, 'Message'),
  source: z.string().min(1, 'Select a source.'),
  status: z.string().min(1),
  assigned_employee_id: z.string().optional(),
  next_followup_date: z.string().optional(),
})
type In = z.input<typeof schema>
type Out = z.output<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
  lead?: LeadDetail
  onSaved?: (lead: LeadDetail) => void
}

export function LeadFormModal({ open, onClose, lead, onSaved }: Props) {
  const editing = !!lead
  const qc = useQueryClient()
  const services = useServiceOptions()
  const employees = useEmployees(true)
  const [duplicate, setDuplicate] = useState<{ id?: number; payload: LeadWritePayload } | null>(null)

  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<In, unknown, Out>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (!open) return
    setDuplicate(null)
    reset(
      lead
        ? {
            customer_name: lead.customer_name,
            mobile: lead.mobile,
            service_id: String(lead.service.id),
            location: lead.location,
            loan_amount: lead.loan_amount,
            occupation: lead.occupation,
            message: lead.message,
            source: lead.source.code,
            status: lead.status.code,
            next_followup_date: lead.next_followup_date ?? '',
          }
        : { source: 'phone', status: 'new', assigned_employee_id: '', next_followup_date: '' },
    )
  }, [open, lead, reset])

  const mutation = useMutation({
    mutationFn: (payload: LeadWritePayload) => (editing ? adminApi.updateLead(lead.id, payload) : adminApi.createLead(payload)),
    onSuccess: (saved) => {
      qc.invalidateQueries({ queryKey: ['admin'] })
      onSaved?.(saved)
      onClose()
    },
    onError: (err, payload) => {
      if (err instanceof ApiError) {
        if (err.code === 'duplicate_mobile') {
          setDuplicate({ id: err.details.existing_lead_id as number | undefined, payload })
          return
        }
        for (const [f, m] of Object.entries(err.fields)) setError(f as keyof In, { message: m[0] })
      }
    },
  })

  const submit = (v: Out) => {
    const payload: LeadWritePayload = {
      customer_name: v.customer_name,
      mobile: v.mobile,
      service_id: Number(v.service_id),
      location: v.location ?? '',
      loan_amount: v.loan_amount ?? '',
      occupation: v.occupation ?? '',
      message: v.message ?? '',
      status: v.status as LeadWritePayload['status'],
      next_followup_date: v.next_followup_date || null,
    }
    if (!editing || lead.source.code !== 'website') payload.source = v.source as LeadWritePayload['source']
    if (!editing && v.assigned_employee_id) payload.assigned_employee_id = Number(v.assigned_employee_id)
    mutation.mutate(payload)
  }

  const isWebsite = editing && lead.source.code === 'website'
  const generalError = mutation.error && mutation.error instanceof ApiError && Object.keys(mutation.error.fields).length === 0 && mutation.error.code !== 'duplicate_mobile'

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={editing ? `Edit lead ${lead.lead_code}` : 'Add a new lead'}
      description={editing ? undefined : 'Create a lead from a phone call, walk-in, referral or other source.'}
      footer={
        duplicate ? (
          <>
            <Button variant="secondary" onClick={() => setDuplicate(null)}>Go back</Button>
            <Button loading={mutation.isPending} onClick={() => mutation.mutate({ ...duplicate.payload, allow_duplicate: true })}>Create anyway</Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" form="lead-form" loading={mutation.isPending}>{editing ? 'Save changes' : 'Create lead'}</Button>
          </>
        )
      }
    >
      {duplicate ? (
        <Alert tone="info" title="A lead with this mobile number already exists">
          {duplicate.id && <p>See <Link to={`/admin/leads/${duplicate.id}`} className="font-semibold underline" onClick={onClose}>the existing lead</Link> before creating a duplicate.</p>}
          <p className="mt-1">Create a separate lead only if this is a genuinely new requirement.</p>
        </Alert>
      ) : (
        <form id="lead-form" onSubmit={handleSubmit(submit)} noValidate className="space-y-5">
          {generalError && <Alert tone="error">{mutation.error.message}</Alert>}
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Customer Name" htmlFor="lf-name" required error={errors.customer_name?.message}>
              <Input id="lf-name" invalid={!!errors.customer_name} {...register('customer_name')} />
            </Field>
            <Field label="Mobile Number" htmlFor="lf-mobile" required error={errors.mobile?.message}>
              <Input id="lf-mobile" type="tel" inputMode="numeric" invalid={!!errors.mobile} {...register('mobile')} />
            </Field>
            <Field label="Service / Loan Type" htmlFor="lf-service" required error={errors.service_id?.message}>
              <Select id="lf-service" invalid={!!errors.service_id} {...register('service_id')}>
                <option value="">Select a service</option>
                {services.data?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            </Field>
            <Field label="Location" htmlFor="lf-location" error={errors.location?.message}>
              <Input id="lf-location" {...register('location')} />
            </Field>
            <Field label="Loan Amount" htmlFor="lf-amount" error={errors.loan_amount?.message}>
              <Input id="lf-amount" placeholder="e.g. 5 lakh" {...register('loan_amount')} />
            </Field>
            <Field label="Occupation" htmlFor="lf-occupation" error={errors.occupation?.message}>
              <Input id="lf-occupation" {...register('occupation')} />
            </Field>
            <Field label="Lead Source" htmlFor="lf-source" required error={errors.source?.message} hint={isWebsite ? 'Website leads keep their source.' : undefined}>
              <Select id="lf-source" disabled={isWebsite} {...register('source')}>
                {LEAD_SOURCES.filter((s) => s.code !== 'website' || isWebsite).map((s) => <option key={s.code} value={s.code}>{s.label}</option>)}
              </Select>
            </Field>
            <Field label="Status" htmlFor="lf-status" required>
              <Select id="lf-status" {...register('status')}>
                {LEAD_STATUSES.map((s) => <option key={s.code} value={s.code}>{s.label}</option>)}
              </Select>
            </Field>
            {!editing && (
              <Field label="Assign to" htmlFor="lf-employee">
                <Select id="lf-employee" {...register('assigned_employee_id')}>
                  <option value="">Unassigned</option>
                  {employees.data?.map((e) => <option key={e.id} value={e.id}>{e.name} ({e.employee_code})</option>)}
                </Select>
              </Field>
            )}
            <Field label="Next Follow-up Date" htmlFor="lf-next" error={errors.next_followup_date?.message}>
              <Input id="lf-next" type="date" {...register('next_followup_date')} />
            </Field>
          </div>
          <Field label="Message / Requirement" htmlFor="lf-message" error={errors.message?.message}>
            <Textarea id="lf-message" rows={3} {...register('message')} />
          </Field>
        </form>
      )}
    </Modal>
  )
}
