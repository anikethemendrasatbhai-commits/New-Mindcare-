import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, ApiError } from '../lib/api'
import type { Dashboard } from '../lib/types'
import { useAuth } from './AuthContext'

type AppDataValue = {
  data: Dashboard | null
  loading: boolean
  error: string | null
  reload: () => Promise<void>
  patch: (fn: (d: Dashboard) => Dashboard) => void
}

const AppDataContext = createContext<AppDataValue | null>(null)

/** Loads the signed-in user's dashboard summary once and shares it with the shell (bell badge) and pages. */
export function AppDataProvider({ children }: { children: ReactNode }) {
  const { expireSession } = useAuth()
  const [data, setData] = useState<Dashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true); setError(null)
    try { setData(await api<Dashboard>('/api/dashboard')) }
    catch (e) {
      if (e instanceof ApiError && e.status === 401) expireSession()
      else setError(e instanceof ApiError ? e.message : 'Something went wrong loading your dashboard.')
    } finally { setLoading(false) }
  }, [expireSession])

  useEffect(() => { void reload() }, [reload])

  const patch = useCallback((fn: (d: Dashboard) => Dashboard) => setData((d) => (d ? fn(d) : d)), [])
  return <AppDataContext.Provider value={{ data, loading, error, reload, patch }}>{children}</AppDataContext.Provider>
}

export function useAppData(): AppDataValue {
  const ctx = useContext(AppDataContext)
  if (!ctx) throw new Error('useAppData must be used inside <AppDataProvider>')
  return ctx
}
