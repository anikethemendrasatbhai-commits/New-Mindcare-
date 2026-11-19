import type { ReactNode } from 'react'

export function EmptyState({ icon, title, children }: { icon: ReactNode; title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-ink-muted/30 bg-canvas px-5 py-8 text-center">
      <div className="mb-3 flex size-11 items-center justify-center rounded-full bg-secondary text-primary-strong" aria-hidden>{icon}</div>
      <p className="font-semibold">{title}</p>
      {children && <div className="mt-1 max-w-sm text-sm text-ink-muted">{children}</div>}
    </div>
  )
}
