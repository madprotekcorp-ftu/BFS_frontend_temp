import type { ReactNode } from 'react'
import { AuthProvider, RequireAuth } from './auth'
import { AdminLayout } from './components/AdminLayout'

/** Wraps every /admin route with the auth context. */
export default function AdminRoot({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}

/** Protected shell: sidebar + top bar, only for signed-in admins. */
export function AdminShell() {
  return (
    <RequireAuth>
      <AdminLayout />
    </RequireAuth>
  )
}
