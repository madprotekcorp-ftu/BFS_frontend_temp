import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { CheckCircle2, RefreshCw, Send } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { Alert } from '@/components/ui/Feedback'
import { ApiError } from '@/lib/api/client'
import { publicApi } from '@/lib/api/endpoints'
import { mobileSchema, optionalText } from '@/lib/validation'

const schema = z.object({
  customer_name: z.string().trim().min(2, 'Please enter your full name.').max(150, 'Name is too long.'),
  mobile: mobileSchema,
  location: optionalText(120, 'Location'),
  service_id: z.string().min(1, 'Please select a service.'),
  loan_amount: optionalText(50, 'Amount'),
  occupation: z.string().optional(),
  message: optionalText(2000, 'Message'),
  consent: z.boolean().refine((v) => v, 'Please give consent so we can contact you.'),
  website: z.string().optional(), // honeypot: must stay empty
})
type FormInput = z.input<typeof schema>
type FormOutput = z.output<typeof schema>

const OCCUPATIONS = ['Salaried', 'Self-employed / Business', 'Professional', 'Student', 'Retired', 'Other']

interface EnquiryFormProps {
  /** Pre-select a service by its slug. */
  defaultServiceSlug?: string
  compact?: boolean
}

export function EnquiryForm({ defaultServiceSlug, compact }: EnquiryFormProps) {
  const services = useQuery({ queryKey: ['services'], queryFn: () => publicApi.services(), staleTime: 10 * 60_000 })
  const [done, setDone] = useState<{ reference: string; message?: string } | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    reset,
    getValues,
    formState: { errors },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: { consent: false, service_id: '', website: '' },
  })

  const defaultServiceId = useMemo(
    () => services.data?.find((s) => s.slug === defaultServiceSlug)?.id,
    [services.data, defaultServiceSlug],
  )
  useEffect(() => {
    if (defaultServiceId && !getValues('service_id')) setValue('service_id', String(defaultServiceId))
  }, [defaultServiceId, getValues, setValue])

  const mutation = useMutation({
    mutationFn: (v: FormOutput) =>
      publicApi.submitEnquiry({
        customer_name: v.customer_name,
        mobile: v.mobile,
        location: v.location || undefined,
        service_id: Number(v.service_id),
        loan_amount: v.loan_amount || undefined,
        occupation: v.occupation || undefined,
        message: v.message || undefined,
        consent: true,
        website: v.website ?? '',
      }),
    onSuccess: (res) => setDone({ reference: res.data.reference, message: res.message }),
    onError: (err) => {
      if (err instanceof ApiError) {
        for (const [field, msgs] of Object.entries(err.fields)) {
          const key = field === 'service' ? 'service_id' : field
          if (key in schema.shape) setError(key as keyof FormInput, { message: msgs[0] })
        }
      }
    },
  })

  if (done) {
    return (
      <div className="flex flex-col items-center py-8 text-center" role="status">
        <div className="flex size-14 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2 className="size-7 text-emerald-600" />
        </div>
        <h3 className="mt-5 text-xl font-semibold">Thank you for your enquiry</h3>
        <p className="mt-2 max-w-sm text-ink-500">{done.message ?? 'Our team will contact you shortly.'}</p>
        <p className="mt-4 rounded-md bg-surface px-3 py-1.5 text-sm text-ink-700">
          Reference: <span className="font-semibold text-navy-900">{done.reference}</span>
        </p>
        <Button
          variant="secondary"
          className="mt-6"
          onClick={() => {
            reset({ consent: false, service_id: defaultServiceId ? String(defaultServiceId) : '', website: '' })
            mutation.reset()
            setDone(null)
          }}
        >
          Submit another enquiry
        </Button>
      </div>
    )
  }

  const generalError = mutation.error && (!(mutation.error instanceof ApiError) || Object.keys(mutation.error.fields).length === 0)
  const loanGroup = services.data?.filter((s) => s.group === 'loan') ?? []
  const insuranceGroup = services.data?.filter((s) => s.group === 'insurance') ?? []

  return (
    <form onSubmit={handleSubmit((v) => mutation.mutate(v))} noValidate className="space-y-5">
      {generalError && (
        <Alert tone="error" title="We couldn't send your enquiry">
          {mutation.error.message} Please try again{` `}in a moment.
        </Alert>
      )}

      <div className={compact ? 'grid gap-5' : 'grid gap-5 sm:grid-cols-2'}>
        <Field label="Full Name" htmlFor="enq-name" required error={errors.customer_name?.message}>
          <Input id="enq-name" autoComplete="name" invalid={!!errors.customer_name} aria-describedby={errors.customer_name ? 'enq-name-error' : undefined} {...register('customer_name')} />
        </Field>
        <Field label="Mobile Number" htmlFor="enq-mobile" required error={errors.mobile?.message}>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-[15px] text-ink-500">+91</span>
            <Input id="enq-mobile" type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={14} className="pl-12" invalid={!!errors.mobile} aria-describedby={errors.mobile ? 'enq-mobile-error' : undefined} {...register('mobile')} />
          </div>
        </Field>
        <Field label="Service / Loan Type" htmlFor="enq-service" required error={errors.service_id?.message ?? (services.isError ? 'Services could not be loaded.' : undefined)}>
          <div className="flex gap-2">
            <Select id="enq-service" invalid={!!errors.service_id} disabled={services.isLoading || services.isError} {...register('service_id')}>
              <option value="">{services.isLoading ? 'Loading services…' : 'Select a service'}</option>
              {loanGroup.length > 0 && (
                <optgroup label="Loans">
                  {loanGroup.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </optgroup>
              )}
              {insuranceGroup.length > 0 && (
                <optgroup label="Insurance">
                  {insuranceGroup.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </optgroup>
              )}
            </Select>
            {services.isError && (
              <Button variant="secondary" className="h-11" onClick={() => services.refetch()} aria-label="Retry loading services" icon={<RefreshCw className="size-4" />} />
            )}
          </div>
        </Field>
        <Field label="Location / City" htmlFor="enq-location" error={errors.location?.message}>
          <Input id="enq-location" autoComplete="address-level2" placeholder="e.g. Hosur" {...register('location')} />
        </Field>
        <Field label="Approximate Loan Amount" htmlFor="enq-amount" error={errors.loan_amount?.message}>
          <Input id="enq-amount" placeholder="e.g. ₹5 lakh" {...register('loan_amount')} />
        </Field>
        <Field label="Employment / Occupation" htmlFor="enq-occupation">
          <Select id="enq-occupation" {...register('occupation')}>
            <option value="">Select</option>
            {OCCUPATIONS.map((o) => <option key={o}>{o}</option>)}
          </Select>
        </Field>
      </div>

      <Field label="Message / Requirement" htmlFor="enq-message" error={errors.message?.message}>
        <Textarea id="enq-message" rows={compact ? 3 : 4} placeholder="Tell us briefly what you need" {...register('message')} />
      </Field>

      {/* Honeypot: hidden from people, filled in by bots. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="enq-website">Website</label>
        <input id="enq-website" tabIndex={-1} autoComplete="off" {...register('website')} />
      </div>

      <div>
        <label className="flex items-start gap-3 text-sm text-ink-700">
          <input type="checkbox" className="mt-0.5 size-4 shrink-0 rounded border-line accent-navy-900" aria-invalid={!!errors.consent || undefined} {...register('consent')} />
          <span>
            I agree that {`Bright Financial Solution`} may contact me by phone, SMS or WhatsApp about my enquiry. I have read the{' '}
            <Link to="/privacy-policy" className="font-medium text-royal-600 underline-offset-2 hover:underline">Privacy Policy</Link>.
            <span className="text-red-600"> *</span>
          </span>
        </label>
        {errors.consent && <p role="alert" className="mt-1.5 text-sm text-red-600">{errors.consent.message}</p>}
      </div>

      <Button type="submit" variant="primary" size="lg" loading={mutation.isPending} className="w-full sm:w-auto" icon={<Send className="size-4" />}>
        {mutation.isPending ? 'Sending…' : 'Submit Enquiry'}
      </Button>
    </form>
  )
}
