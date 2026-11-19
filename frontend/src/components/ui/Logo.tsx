import { cn } from '../../lib/cn'

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('size-9', className)} aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#438F91" />
      <path d="M16 7.5c-3.6 0-6.5 2.7-6.5 6.2 0 1.5.5 2.8 1.4 3.8-.5 1.4-.4 3.1.9 4.3 1.2 1.1 2.7 1.3 4.2.7 1.5.6 3 .4 4.2-.7 1.3-1.2 1.4-2.9.9-4.3.9-1 1.4-2.3 1.4-3.8 0-3.5-2.9-6.2-6.5-6.2Z" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M16 9.5v12" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark />
      <span className="text-lg font-bold tracking-tight text-ink">MindCare <span className="font-medium text-primary-strong">Assess</span></span>
    </span>
  )
}
