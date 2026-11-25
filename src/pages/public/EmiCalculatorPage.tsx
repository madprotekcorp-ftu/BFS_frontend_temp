import { clsx } from 'clsx'
import { Info, RotateCcw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { PageHero } from '@/components/site/Section'
import { Seo } from '@/components/site/Seo'
import { Button } from '@/components/ui/Button'
import { GradientMotion } from '@/components/ui/GradientMotion'
import { calculateEmi } from '@/lib/emi'
import { formatINR } from '@/lib/format'

type Unit = 'years' | 'months'
const DEFAULTS = { amount: '500000', rate: '10.5', tenure: '5', unit: 'years' as Unit }

const LIMITS = {
  amount: { min: 1000, max: 100_000_000 },
  rate: { min: 0, max: 50 },
  years: { min: 1, max: 40 },
  months: { min: 1, max: 480 },
}

function validate(amount: string, rate: string, tenure: string, unit: Unit) {
  const errors: Partial<Record<'amount' | 'rate' | 'tenure', string>> = {}
  const a = Number(amount)
  const r = Number(rate)
  const t = Number(tenure)
  if (amount.trim() === '' || !Number.isFinite(a)) errors.amount = 'Enter the loan amount.'
  else if (a < LIMITS.amount.min || a > LIMITS.amount.max) errors.amount = `Enter an amount between ${formatINR(LIMITS.amount.min)} and ${formatINR(LIMITS.amount.max)}.`
  if (rate.trim() === '' || !Number.isFinite(r)) errors.rate = 'Enter the annual interest rate.'
  else if (r < LIMITS.rate.min || r > LIMITS.rate.max) errors.rate = 'Enter a rate between 0% and 50%.'
  const lim = LIMITS[unit]
  if (tenure.trim() === '' || !Number.isFinite(t)) errors.tenure = 'Enter the loan tenure.'
  else if (!Number.isInteger(t) || t < lim.min || t > lim.max) errors.tenure = `Enter a whole number between ${lim.min} and ${lim.max} ${unit}.`
  return errors
}

export default function EmiCalculatorPage() {
  const [amount, setAmount] = useState(DEFAULTS.amount)
  const [rate, setRate] = useState(DEFAULTS.rate)
  const [tenure, setTenure] = useState(DEFAULTS.tenure)
  const [unit, setUnit] = useState<Unit>(DEFAULTS.unit)

  const errors = validate(amount, rate, tenure, unit)
  const valid = Object.keys(errors).length === 0
  const months = unit === 'years' ? Number(tenure) * 12 : Number(tenure)
  const result = useMemo(() => (valid ? calculateEmi(Number(amount), Number(rate), months) : null), [valid, amount, rate, months])

  const switchUnit = (next: Unit) => {
    if (next === unit) return
    const t = Number(tenure)
    if (Number.isFinite(t) && t > 0) setTenure(String(next === 'months' ? t * 12 : Math.max(1, Math.round(t / 12))))
    setUnit(next)
  }

  const reset = () => {
    setAmount(DEFAULTS.amount)
    setRate(DEFAULTS.rate)
    setTenure(DEFAULTS.tenure)
    setUnit(DEFAULTS.unit)
  }

  const principalShare = result && result.totalPayment > 0 ? Number(amount) / result.totalPayment : 1

  return (
    <>
      <Seo
        title="EMI Calculator – Estimate Your Loan EMI"
        description="Free EMI calculator from Bright Financial Solution, Hosur. Estimate your monthly EMI, total interest and total repayment for any loan."
        path="/emi-calculator"
      />
      <PageHero palette="gold" eyebrow="EMI calculator" title="Estimate your monthly EMI" intro="Enter the loan amount, interest rate and tenure to see an estimate of your monthly instalment and total cost." />

      <section className="py-16 sm:py-20">
        <div className="container-page grid gap-8 lg:grid-cols-[1.1fr_1fr]">
          <form className="rounded-3xl border border-line bg-white p-6 shadow-card sm:p-9" onSubmit={(e) => e.preventDefault()} noValidate>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Loan details</h2>
              <Button variant="ghost" size="sm" onClick={reset} icon={<RotateCcw className="size-4" />}>Reset</Button>
            </div>

            <div className="mt-8 space-y-8">
              <NumberSlider
                id="emi-amount" label="Loan Amount" prefix="₹" value={amount} onChange={setAmount} error={errors.amount}
                min={10000} max={10_000_000} step={10000} display={valid || !errors.amount ? formatINR(Number(amount) || 0) : undefined}
              />
              <NumberSlider
                id="emi-rate" label="Annual Interest Rate" suffix="%" value={rate} onChange={setRate} error={errors.rate}
                min={0} max={30} step={0.05} inputStep="0.01"
              />
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="emi-tenure" className="text-sm font-medium text-ink-900">Loan Tenure</label>
                  <div role="radiogroup" aria-label="Tenure unit" className="flex rounded-lg bg-surface p-1 text-sm">
                    {(['years', 'months'] as Unit[]).map((u) => (
                      <button
                        key={u} type="button" role="radio" aria-checked={unit === u} onClick={() => switchUnit(u)}
                        className={clsx('rounded-md px-3 py-1 font-medium capitalize transition-colors', unit === u ? 'bg-white text-navy-900 shadow-sm' : 'text-ink-500 hover:text-navy-900')}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>
                <NumberSlider
                  id="emi-tenure" label="" suffix={unit} value={tenure} onChange={setTenure} error={errors.tenure}
                  min={1} max={unit === 'years' ? 30 : 360} step={1} inputStep="1"
                />
              </div>
            </div>
          </form>

          <div className="flex flex-col gap-5" aria-live="polite">
            <GradientMotion palette="midnight" blobs={8} blur={70} speed={20} seed={12} className="rounded-3xl p-7 text-white shadow-lift sm:p-9">
              <p className="text-sm text-white/60">Monthly EMI</p>
              <p className="mt-2 font-display text-4xl font-bold sm:text-5xl">{result ? formatINR(result.emi, true) : '—'}</p>
              <p className="mt-2 text-sm text-white/60">{result ? `for ${result.months} monthly instalments` : 'Enter valid loan details to see your EMI'}</p>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <ResultTile label="Total Interest Payable" value={result ? formatINR(result.totalInterest, true) : '—'} dot="bg-gold-500" />
                <ResultTile label="Total Repayment Amount" value={result ? formatINR(result.totalPayment, true) : '—'} dot="bg-white" />
              </div>
            </GradientMotion>

            {result && (
              <div className="flex items-center gap-6 rounded-3xl border border-line bg-white p-6">
                <Donut principalShare={principalShare} />
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="flex items-center gap-2 text-ink-500"><span className="size-2.5 rounded-full bg-royal-600" /> Principal</dt>
                    <dd className="mt-0.5 font-semibold text-navy-900">{formatINR(Number(amount), true)} · {(principalShare * 100).toFixed(1)}%</dd>
                  </div>
                  <div>
                    <dt className="flex items-center gap-2 text-ink-500"><span className="size-2.5 rounded-full bg-gold-500" /> Interest</dt>
                    <dd className="mt-0.5 font-semibold text-navy-900">{formatINR(result.totalInterest, true)} · {((1 - principalShare) * 100).toFixed(1)}%</dd>
                  </div>
                </dl>
              </div>
            )}

            <div className="flex gap-3 rounded-2xl bg-gold-50 p-5 text-sm leading-relaxed text-ink-700">
              <Info className="mt-0.5 size-4 shrink-0 text-gold-600" />
              <p>
                EMI figures are estimates for informational purposes only. Actual interest rates, repayment schedules and loan conditions are determined by the respective financial institution. This calculator does not determine loan eligibility or guarantee approval.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

interface NumberSliderProps {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  error?: string
  min: number
  max: number
  step: number
  inputStep?: string
  prefix?: string
  suffix?: string
  display?: string
}

function NumberSlider({ id, label, value, onChange, error, min, max, step, inputStep, prefix, suffix, display }: NumberSliderProps) {
  const n = Number(value)
  const sliderValue = Number.isFinite(n) ? Math.min(Math.max(n, min), max) : min
  return (
    <div>
      {label && (
        <div className="mb-2 flex items-baseline justify-between">
          <label htmlFor={id} className="text-sm font-medium text-ink-900">{label}</label>
          {display && <span className="text-sm text-ink-500">{display}</span>}
        </div>
      )}
      <div className={clsx('flex h-12 items-center rounded-lg border bg-white px-3.5 focus-within:ring-3', error ? 'border-red-400 focus-within:ring-red-100' : 'border-line focus-within:border-royal-600 focus-within:ring-royal-100')}>
        {prefix && <span className="mr-2 text-ink-500">{prefix}</span>}
        <input
          id={id} type="number" inputMode="decimal" step={inputStep ?? step} value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error || undefined} aria-describedby={error ? `${id}-error` : undefined}
          className="w-full bg-transparent text-lg font-semibold text-navy-900 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        />
        {suffix && <span className="ml-2 text-ink-500 capitalize">{suffix}</span>}
      </div>
      <input
        type="range" min={min} max={max} step={step} value={sliderValue}
        onChange={(e) => onChange(e.target.value)}
        aria-label={`${label || suffix} slider`}
        className="mt-4 w-full accent-navy-900"
      />
      {error && <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  )
}

function ResultTile({ label, value, dot }: { label: string; value: string; dot: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur-md">
      <p className="flex items-center gap-2 text-xs text-white/60"><span className={clsx('size-2 rounded-full', dot)} /> {label}</p>
      <p className="mt-1.5 font-display text-lg font-semibold sm:text-xl">{value}</p>
    </div>
  )
}

function Donut({ principalShare }: { principalShare: number }) {
  const r = 42
  const c = 2 * Math.PI * r
  return (
    <svg viewBox="0 0 100 100" className="size-32 shrink-0 -rotate-90" role="img" aria-label={`Principal ${(principalShare * 100).toFixed(0)}%, interest ${((1 - principalShare) * 100).toFixed(0)}%`}>
      <circle cx="50" cy="50" r={r} fill="none" stroke="var(--color-gold-500)" strokeWidth="14" />
      <circle cx="50" cy="50" r={r} fill="none" stroke="var(--color-royal-600)" strokeWidth="14" strokeDasharray={`${c * principalShare} ${c}`} />
    </svg>
  )
}
