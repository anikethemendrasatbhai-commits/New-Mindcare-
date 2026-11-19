import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { adoptAuth, api, ApiError, setCsrfToken } from '../lib/api'
import type { AuthResponse, User } from '../lib/types'

type Status = 'loading' | 'authenticated' | 'anonymous'

export type RegisterInput = {
  full_name: string; email: string; password: string; confirm_password: string
  date_of_birth: string; consent_privacy: boolean; consent_not_diagnostic: boolean
}

type AuthValue = {
  status: Status
  user: User | null
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  logout: () => Promise<void>
  setUser: (u: User) => void
  /** Call when any API request returns 401 so the UI returns to the sign-in page. */
  expireSession: () => void
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('loading')
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const ctrl = new AbortController()
    api<User>('/api/auth/me', { signal: ctrl.signal })
      .then((u) => { setUser(u); setStatus('authenticated') })
      .catch((e) => { if ((e as Error).name !== 'AbortError') { setUser(null); setStatus('anonymous') } })
    return () => ctrl.abort()
  }, [])

  const accept = useCallback((r: AuthResponse) => { adoptAuth(r); setUser(r.user); setStatus('authenticated') }, [])

  const value = useMemo<AuthValue>(() => ({
    status, user,
    login: async (email, password, remember_me) => accept(await api<AuthResponse>('/api/auth/login', { method: 'POST', body: { email, password, remember_me } })),
    register: async (input) => accept(await api<AuthResponse>('/api/auth/register', { method: 'POST', body: input })),
    logout: async () => {
      try { await api('/api/auth/logout', { method: 'POST' }) }
      catch (e) { if (!(e instanceof ApiError && e.status === 401)) throw e }
      setCsrfToken(null); setUser(null); setStatus('anonymous')
    },
    setUser,
    expireSession: () => { setCsrfToken(null); setUser(null); setStatus('anonymous') },
  }), [status, user, accept])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
