import { clsx } from 'clsx'
import { ChevronsLeft, ChevronsRight, FileStack, FileUp, LayoutDashboard, LogOut, Menu, UserRound, Users, UsersRound, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Logo } from '@/components/site/Logo'
import { useAuth } from '../auth'

const nav = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/leads', label: 'Leads', icon: UsersRound },
  { to: '/admin/employees', label: 'Employees', icon: Users },
  { to: '/admin/import', label: 'Import Leads', icon: FileUp },
  { to: '/admin/documents', label: 'Documents', icon: FileStack },
]

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('bfs-sidebar') === 'collapsed')
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => setMobileOpen(false), [pathname])
  useEffect(() => localStorage.setItem('bfs-sidebar', collapsed ? 'collapsed' : 'expanded'), [collapsed])

  const current = nav.find((n) => pathname.startsWith(n.to))

  return (
    <div className="min-h-screen bg-surface">
      <title>{`${current?.label ?? 'Admin'} | BFS Admin`}</title>
      <meta name="robots" content="noindex, nofollow" />

      {mobileOpen && <div className="fixed inset-0 z-40 bg-navy-950/40 lg:hidden" onClick={() => setMobileOpen(false)} />}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-navy-950 text-white/70 transition-[width,transform] duration-200',
          collapsed ? 'lg:w-[76px]' : 'lg:w-64',
          'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          <Link to="/admin/dashboard" className="overflow-hidden">
            {collapsed ? <span className="hidden lg:block"><Logo variant="mark" onDark className="px-1.5 py-1.5" imgClassName="h-6" /></span> : null}
            <span className={clsx(collapsed && 'lg:hidden')}><Logo onDark className="px-2.5 py-1.5" imgClassName="h-8" /></span>
          </Link>
          <button className="rounded-md p-1.5 hover:bg-white/10 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <X className="size-5" />
          </button>
        </div>
        <nav aria-label="Admin" className="flex-1 space-y-1 p-3">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive ? 'bg-white/10 text-white' : 'hover:bg-white/5 hover:text-white',
                  collapsed && 'lg:justify-center lg:px-0',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={clsx('size-[18px] shrink-0', isActive && 'text-gold-400')} />
                  <span className={clsx(collapsed && 'lg:sr-only')}>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="mx-3 mb-4 hidden items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-white/5 hover:text-white lg:flex"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronsRight className="mx-auto size-[18px]" /> : <><ChevronsLeft className="size-[18px]" /> Collapse</>}
        </button>
      </aside>

      <div className={clsx('transition-[padding] duration-200', collapsed ? 'lg:pl-[76px]' : 'lg:pl-64')}>
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-line bg-white/95 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button className="rounded-md p-1.5 text-ink-700 hover:bg-surface lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <Menu className="size-5" />
            </button>
            <p className="font-display text-[15px] font-semibold text-ink-900">{current?.label ?? 'Admin'}</p>
          </div>
          <ProfileMenu />
        </header>
        <main className="mx-auto max-w-[1440px] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function ProfileMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const initials = (user?.full_name || user?.username || 'A').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-3 rounded-lg p-1.5 pr-3 hover:bg-surface" aria-expanded={open} aria-haspopup="menu">
        <span className="flex size-8 items-center justify-center rounded-full bg-navy-900 text-xs font-semibold text-white">{initials}</span>
        <span className="hidden text-left sm:block">
          <span className="block text-sm font-semibold text-ink-900">{user?.full_name || user?.username}</span>
          <span className="block text-xs text-ink-500">Administrator</span>
        </span>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-56 rounded-xl border border-line bg-white p-1.5 shadow-lift">
          <div className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-ink-500">
            <UserRound className="size-4" /> <span className="truncate">{user?.email || user?.username}</span>
          </div>
          <div className="my-1 h-px bg-line" />
          <button
            role="menuitem"
            onClick={async () => {
              await logout()
              navigate('/admin/login', { replace: true })
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      )}
    </div>
  )
}
