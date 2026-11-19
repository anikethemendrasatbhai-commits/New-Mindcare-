import { Bell, BellOff } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { api, ApiError } from '../../lib/api'
import { cn } from '../../lib/cn'
import { relativeTime } from '../../lib/format'
import type { AppNotification, Dashboard } from '../../lib/types'
import { Alert } from '../ui/Alert'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card, CardHeader } from '../ui/Card'
import { EmptyState } from '../ui/EmptyState'

export function NotificationsCard({ data, patch }: { data: Dashboard; patch: (fn: (d: Dashboard) => Dashboard) => void }) {
  const { expireSession } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const guard = async (fn: () => Promise<void>) => {
    setError(null)
    try { await fn() } catch (e) {
      if (e instanceof ApiError && e.status === 401) expireSession()
      else setError(e instanceof ApiError ? e.message : 'Could not update notifications.')
    }
  }
  const markRead = (n: AppNotification) => guard(async () => {
    await api(`/api/notifications/${n.id}/read`, { method: 'POST' })
    patch((d) => ({ ...d, unread_notifications: Math.max(0, d.unread_notifications - 1), notifications: d.notifications.map((x) => (x.id === n.id ? { ...x, read: true } : x)) }))
  })
  const markAll = () => guard(async () => {
    await api('/api/notifications/read-all', { method: 'POST' })
    patch((d) => ({ ...d, unread_notifications: 0, notifications: d.notifications.map((x) => ({ ...x, read: true })) }))
  })

  return (
    <Card id="notifications" aria-labelledby="notif-title" className="scroll-mt-24">
      <CardHeader
        id="notif-title" title="Notifications"
        action={data.unread_notifications > 0 ? <Button size="sm" variant="secondary" onClick={markAll}>Mark all read</Button> : undefined}
      />
      {error && <Alert tone="error" className="mb-3">{error}</Alert>}
      {data.notifications.length === 0 ? (
        <EmptyState icon={<BellOff className="size-5" />} title="You're all caught up">Important updates will appear here.</EmptyState>
      ) : (
        <ul className="space-y-2">
          {data.notifications.map((n) => (
            <li key={n.id} className={cn('rounded-xl border p-3.5', n.read ? 'border-line bg-card' : n.severity === 'attention' ? 'border-warning bg-warning-soft' : 'border-secondary-strong bg-secondary')}>
              <div className="flex items-start gap-3">
                <Bell className="mt-0.5 size-4 shrink-0 text-primary-strong" aria-hidden />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{n.title}</p>{!n.read && <Badge tone="brand">New</Badge>}</div>
                  <p className="mt-0.5 text-sm text-ink-muted">{n.body}</p>
                  <div className="mt-2 flex items-center justify-between gap-3 text-xs text-ink-muted">
                    <time dateTime={n.created_at}>{relativeTime(n.created_at)}</time>
                    {!n.read && <button onClick={() => markRead(n)} className="font-semibold text-primary-strong underline underline-offset-2">Mark as read</button>}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
