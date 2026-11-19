import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

type Tone = 'info' | 'warning' | 'error' | 'success'
const tones: Record<Tone, { box: string; icon: ReactNode }> = {
  info: { box: 'bg-secondary text-ink border-secondary-strong', icon: <Info className="size-5 text-primary-strong" aria-hidden /> },
  warning: { box: 'bg-warning-soft text-warning-ink border-warning', icon: <AlertTriangle className="size-5 text-warning-ink" aria-hidden /> },
  error: { box: 'bg-danger-soft text-danger border-danger/30', icon: <XCircle className="size-5" aria-hidden /> },
  success: { box: 'bg-secondary text-ink border-primary/40', icon: <CheckCircle2 className="size-5 text-primary-strong" aria-hidden /> },
}

export function Alert({ tone = 'info', title, children, className }: { tone?: Tone; title?: string; children: ReactNode; className?: string }) {
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={cn('flex gap-3 rounded-xl border p-4 text-sm leading-6', tones[tone].box, className)}>
      <span className="mt-0.5 shrink-0">{tones[tone].icon}</span>
      <div>{title && <p className="font-semibold">{title}</p>}<div>{children}</div></div>
    </div>
  )
}
