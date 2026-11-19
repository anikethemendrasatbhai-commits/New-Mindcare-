import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

const tones = {
  neutral: 'bg-canvas text-ink-muted border border-line',
  brand: 'bg-secondary text-primary-strong',
  warning: 'bg-warning text-ink',
  danger: 'bg-danger-soft text-danger',
} as const

export function Badge({ tone = 'neutral', children, className }: { tone?: keyof typeof tones; children: ReactNode; className?: string }) {
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', tones[tone], className)}>{children}</span>
}
