import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { PageLoader } from '@/components/ui/Feedback'
import { ApiError, setUnauthorizedHandler } from '@/lib/api/client'
import { authApi } from '@/lib/api/endpoints'
import type { AdminUser } from '@/lib/api/types'

interface AuthState {
  user: AdminUser | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)
const ME_KEY = ['auth', 'me']

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient()
  const me = useQuery({
    queryKey: ME_KEY,
    queryFn: async () => {
      try {
        return await authApi.me()
      } catch (e) {
        if (e instanceof ApiError && (e.status === 401 || e.status === 403)) return null
        throw e
      }
    },
    retry: false,
    staleTime: 5 * 60_000,
  })

  useEffect(() => {
    // Any admin API returning 401 means the session ended: drop cached admin data.
    setUnauthorizedHandler(() => {
      qc.setQueryData(ME_KEY, null)
      qc.removeQueries({ predicate: (q) => q.queryKey[0] === 'admin' })
    })
  }, [qc])

  const login = useCallback(
    async (username: string, password: string) => {
      const user = await authApi.login(username, password)
      qc.setQueryData(ME_KEY, user)
    },
    [qc],
  )

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      qc.setQueryData(ME_KEY, null)
      qc.removeQueries({ predicate: (q) => q.queryKey[0] === 'admin' })
    }
  }, [qc])

  const value = useMemo<AuthState>(
    () => ({ user: me.data ?? null, loading: me.isLoading, login, logout }),
    [me.data, me.isLoading, login, logout],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <div className="min-h-screen bg-surface"><PageLoader /></div>
  if (!user) return <Navigate to="/admin/login" replace state={{ from: location.pathname + location.search }} />
  return <>{children}</>
}
