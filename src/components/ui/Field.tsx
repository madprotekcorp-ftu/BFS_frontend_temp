import { clsx } from 'clsx'
import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'

export const controlClass = (invalid?: boolean, className?: string) =>
  clsx(
    'block w-full rounded-lg border bg-white px-3.5 text-[15px] text-ink-900 placeholder:text-ink-400 transition-colors',
    'focus:outline-none focus:ring-3 disabled:bg-surface disabled:text-ink-500',
    invalid
      ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
      : 'border-line hover:border-ink-400/50 focus:border-royal-600 focus:ring-royal-100',
    className,
  )

interface FieldProps {
  label: string
  htmlFor: string
  required?: boolean
  error?: string
  hint?: string
  children: ReactNode
  className?: string
}

export function Field({ label, htmlFor, required, error, hint, children, className }: FieldProps) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-ink-900">
        {label}
        {required ? <span className="ml-0.5 text-red-600" aria-hidden>*</span> : <span className="ml-1.5 text-xs font-normal text-ink-400">(optional)</span>}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="mt-1.5 text-sm text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-ink-500">{hint}</p>
      ) : null}
    </div>
  )
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }
export const Input = forwardRef<HTMLInputElement, InputProps>(({ invalid, className, ...rest }, ref) => (
  <input ref={ref} aria-invalid={invalid || undefined} className={controlClass(invalid, clsx('h-11', className))} {...rest} />
))

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }
export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ invalid, className, children, ...rest }, ref) => (
  <select ref={ref} aria-invalid={invalid || undefined} className={controlClass(invalid, clsx('h-11 pr-9', className))} {...rest}>
    {children}
  </select>
))

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ invalid, className, ...rest }, ref) => (
  <textarea ref={ref} aria-invalid={invalid || undefined} className={controlClass(invalid, clsx('py-2.5', className))} {...rest} />
))
