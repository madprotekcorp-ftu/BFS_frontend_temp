import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Logo } from '@/components/site/Logo'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Field'
import { Alert } from '@/components/ui/Feedback'
import { USE_MOCK_API } from '@/lib/api/client'
import { useAuth } from '../auth'

const schema = z.object({
  username: z.string().trim().min(1, 'Enter your username or email.'),
  password: z.string().min(1, 'Enter your password.'),
})
type Values = z.infer<typeof schema>

export default function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema) })

  const from = (location.state as { from?: string } | null)?.from ?? '/admin/dashboard'
  if (user) return <Navigate to={from} replace />

  const onSubmit = async (v: Values) => {
    setError(null)
    try {
      await login(v.username, v.password)
      navigate(from, { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign in failed. Please try again.')
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <title>Sign in | BFS Admin</title>
      <meta name="robots" content="noindex, nofollow" />
      <div className="relative hidden overflow-hidden bg-navy-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div aria-hidden className="absolute -right-32 -bottom-32 size-[480px] rounded-full border-[60px] border-gold-500/10" />
        <div aria-hidden className="absolute top-20 -left-20 size-80 rounded-full bg-royal-600/30 blur-3xl" />
        <Logo variant="full" onDark className="relative self-start" imgClassName="h-24" />
        <div className="relative">
          <p className="font-display text-3xl leading-tight font-bold text-white">Lead Management System</p>
          <p className="mt-3 max-w-sm text-white/60">Track enquiries from first contact to conversion, assign leads to your team and keep every follow-up on time.</p>
        </div>
        <p className="relative text-xs text-white/40">Authorised Bright Financial Solution administrators only.</p>
      </div>

      <div className="flex items-center justify-center bg-surface p-6">
        <div className="w-full max-w-sm">
          <Logo variant="full" className="mb-8 lg:hidden" imgClassName="h-20" />
          <div className="rounded-2xl border border-line bg-white p-8 shadow-card">
            <div className="mb-6 flex size-11 items-center justify-center rounded-xl bg-navy-900 text-gold-400">
              <Lock className="size-5" />
            </div>
            <h1 className="text-2xl font-bold">Admin sign in</h1>
            <p className="mt-1 text-sm text-ink-500">Sign in to manage leads and enquiries.</p>

            {error && <Alert tone="error" className="mt-6">{error}</Alert>}
            {USE_MOCK_API && (
              <Alert tone="info" className="mt-6" title="Development mock API">
                Use <code className="font-semibold">admin</code> / <code className="font-semibold">admin123</code>. Not available in production builds.
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-5">
              <Field label="Username or email" htmlFor="login-username" required error={errors.username?.message}>
                <Input id="login-username" autoComplete="username" autoFocus invalid={!!errors.username} {...register('username')} />
              </Field>
              <Field label="Password" htmlFor="login-password" required error={errors.password?.message}>
                <div className="relative">
                  <Input id="login-password" type={showPw ? 'text' : 'password'} autoComplete="current-password" className="pr-11" invalid={!!errors.password} {...register('password')} />
                  <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-ink-400 hover:text-ink-700" aria-label={showPw ? 'Hide password' : 'Show password'}>
                    {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </Field>
              <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>Sign in</Button>
            </form>
          </div>
          <p className="mt-6 text-center text-sm text-ink-500">
            <Link to="/" className="hover:text-navy-900">← Back to website</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
