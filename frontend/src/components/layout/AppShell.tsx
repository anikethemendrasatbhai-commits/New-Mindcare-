import {
  Activity, Bell, ClipboardList, Fingerprint, LayoutDashboard, LineChart, LogOut, Menu, NotebookPen, ShieldCheck, Users, X,
} from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { AppDataProvider, useAppData } from '../../auth/AppData'
import { useAuth } from '../../auth/AuthContext'
import { cn } from '../../lib/cn'
import { initials } from '../../lib/format'
import { Badge } from '../ui/Badge'
import { Logo } from '../ui/Logo'

/** Modules arrive in later stages. They are listed so the product structure is visible, but are not clickable. */
const upcoming = [
  { label: 'Adaptive assessments', icon: ClipboardList },
  { label: 'Cognitive Fingerprint', icon: Fingerprint },
  { label: 'Change detection', icon: Activity },
  { label: 'Health timeline', icon: LineChart },
  { label: 'Everyday observations', icon: NotebookPen },
  { label: 'Family circle', icon: Users },
]

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Main" className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-4">
      <ul className="space-y-1">
        <li>
          <NavLink
            to="/dashboard" onClick={onNavigate}
            className={({ isActive }) => cn('flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors', isActive ? 'bg-secondary text-primary-strong' : 'text-ink hover:bg-secondary/70')}
          >
            <LayoutDashboard className="size-5" aria-hidden /> Dashboard
          </NavLink>
        </li>
      </ul>
      <div>
        <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-ink-muted">Cognitive modules</p>
        <ul className="space-y-1">
          {upcoming.map(({ label, icon: Icon }) => (
            <li key={label}>
              <span aria-disabled="true" className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-muted">
                <Icon className="size-5" aria-hidden /> <span className="flex-1">{label}</span> <Badge>Soon</Badge>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

function UserMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown); document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open])

  if (!user) return null
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="menu" aria-label={`Account menu for ${user.full_name}`}
        className="flex size-10 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-primary-strong hover:bg-secondary-strong"
      >{initials(user.full_name)}</button>
      {open && (
        <div role="menu" className="card absolute right-0 z-30 mt-2 w-64 p-2 shadow-pop">
          <div className="border-b border-line px-3 pb-2 pt-1">
            <p className="truncate font-semibold">{user.full_name}</p>
            <p className="truncate text-sm text-ink-muted">{user.email}</p>
          </div>
          <Link role="menuitem" to="/dashboard#profile" onClick={() => setOpen(false)} className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-secondary">Profile &amp; settings</Link>
          <Link role="menuitem" to="/privacy" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-secondary"><ShieldCheck className="size-4" aria-hidden /> Privacy notice</Link>
          <button
            role="menuitem" disabled={busy}
            onClick={async () => { setBusy(true); try { await logout(); navigate('/login', { replace: true }) } finally { setBusy(false) } }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-secondary disabled:opacity-60"
          ><LogOut className="size-4" aria-hidden /> {busy ? 'Signing out…' : 'Sign out'}</button>
        </div>
      )}
    </div>
  )
}

function Bell_() {
  const { data } = useAppData()
  const unread = data?.unread_notifications ?? 0
  return (
    <Link
      to="/dashboard#notifications" aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
      className="relative flex size-10 items-center justify-center rounded-full text-ink hover:bg-secondary"
    >
      <Bell className="size-5" aria-hidden />
      {unread > 0 && <span className="absolute right-1.5 top-1.5 flex min-w-4 items-center justify-center rounded-full bg-warning px-1 text-[0.625rem] font-bold leading-4 text-ink" aria-hidden>{unread > 9 ? '9+' : unread}</span>}
    </Link>
  )
}

function Shell({ children }: { children?: ReactNode }) {
  const [drawer, setDrawer] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!drawer) return
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setDrawer(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [drawer])

  return (
    <div className="min-h-screen lg:pl-72">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-card focus:px-4 focus:py-2 focus:shadow-pop">Skip to main content</a>

      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 flex-col border-r border-line bg-card lg:flex">
        <div className="flex h-16 items-center border-b border-line px-5"><Logo /></div>
        <NavContent />
        <p className="border-t border-line p-4 text-xs text-ink-muted">Assessment-derived insights. Not a medical diagnosis.</p>
      </aside>

      {drawer && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setDrawer(false)} aria-hidden />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-card shadow-pop">
            <div className="flex h-16 items-center justify-between border-b border-line px-5">
              <Logo />
              <button ref={closeRef} onClick={() => setDrawer(false)} aria-label="Close menu" className="flex size-10 items-center justify-center rounded-full hover:bg-secondary"><X className="size-5" aria-hidden /></button>
            </div>
            <NavContent onNavigate={() => setDrawer(false)} />
          </div>
        </div>
      )}

      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-line bg-card/90 px-4 backdrop-blur sm:px-8">
        <div className="flex items-center gap-2 lg:hidden">
          <button onClick={() => setDrawer(true)} aria-label="Open menu" className="flex size-10 items-center justify-center rounded-full hover:bg-secondary"><Menu className="size-5" aria-hidden /></button>
          <Logo className="[&_span:last-child]:hidden sm:[&_span:last-child]:inline" />
        </div>
        <div className="hidden lg:block" />
        <div className="flex items-center gap-1"><Bell_ /><UserMenu /></div>
      </header>

      <main id="main" className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-8 sm:py-8">{children ?? <Outlet />}</main>
    </div>
  )
}

export function AppShell() {
  return <AppDataProvider><Shell /></AppDataProvider>
}
