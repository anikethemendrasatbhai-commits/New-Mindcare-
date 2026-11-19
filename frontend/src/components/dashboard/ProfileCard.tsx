import { useState, type FormEvent } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { api, ApiError } from '../../lib/api'
import { formatDate, initials } from '../../lib/format'
import type { User } from '../../lib/types'
import { validateName } from '../../lib/validation'
import { Alert } from '../ui/Alert'
import { Button } from '../ui/Button'
import { Card, CardHeader } from '../ui/Card'
import { TextField } from '../ui/Field'

const zones: string[] = (() => { try { return Intl.supportedValuesOf('timeZone') } catch { return ['UTC'] } })()

export function ProfileCard() {
  const { user, setUser, expireSession } = useAuth()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [tz, setTz] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [nameError, setNameError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  if (!user) return null

  const begin = () => { setName(user.full_name); setTz(user.timezone); setError(null); setNameError(null); setEditing(true) }
  async function save(e: FormEvent) {
    e.preventDefault()
    const v = validateName(name); setNameError(v)
    if (v) return
    setSaving(true); setError(null)
    try { setUser(await api<User>('/api/users/me', { method: 'PATCH', body: { full_name: name.trim(), timezone: tz } })); setEditing(false) }
    catch (err) {
      if (err instanceof ApiError && err.status === 401) expireSession()
      else setError(err instanceof ApiError ? err.fields.full_name ?? err.fields.timezone ?? err.message : 'Could not save your changes.')
    } finally { setSaving(false) }
  }

  return (
    <Card id="profile" aria-labelledby="profile-title" className="scroll-mt-24">
      <CardHeader id="profile-title" title="Your profile" action={!editing ? <Button size="sm" variant="secondary" onClick={begin}>Edit</Button> : undefined} />
      {editing ? (
        <form onSubmit={save} noValidate className="space-y-4">
          {error && <Alert tone="error">{error}</Alert>}
          <TextField label="Full name" value={name} onChange={(e) => setName(e.target.value)} error={nameError} autoComplete="name" />
          <div>
            <label htmlFor="tz" className="mb-1.5 block text-sm font-medium">Time zone</label>
            <select id="tz" value={tz} onChange={(e) => setTz(e.target.value)} className="h-12 w-full rounded-xl border border-ink-muted/40 bg-card px-3 text-base hover:border-primary">
              {(zones.includes(tz) ? zones : [tz, ...zones]).map((z) => <option key={z} value={z}>{z.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div className="flex gap-2"><Button type="submit" loading={saving} loadingText="Saving…">Save changes</Button><Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button></div>
        </form>
      ) : (
        <div className="flex items-center gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-semibold text-ink" aria-hidden>{initials(user.full_name)}</div>
          <dl className="min-w-0 text-sm">
            <dt className="sr-only">Name</dt><dd className="truncate text-base font-semibold">{user.full_name}</dd>
            <dt className="sr-only">Email</dt><dd className="truncate text-ink-muted">{user.email}</dd>
            <dt className="sr-only">Details</dt><dd className="mt-1 text-ink-muted">Member since {formatDate(user.created_at, user.timezone)} · {user.timezone.replace(/_/g, ' ')}</dd>
          </dl>
        </div>
      )}
    </Card>
  )
}
