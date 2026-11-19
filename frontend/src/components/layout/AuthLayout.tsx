import { HeartHandshake, LockKeyhole, ShieldCheck } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '../ui/Logo'

const points = [
  { icon: ShieldCheck, title: 'Educational, not diagnostic', text: 'Insights come from assessment activities and are never a medical diagnosis.' },
  { icon: LockKeyhole, title: 'Private by design', text: 'We collect only what we need. Nothing is shared with anyone without your permission.' },
  { icon: HeartHandshake, title: 'At your own pace', text: 'Short, calm activities with no pass or fail.' },
]

export function AuthLayout({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-card focus:px-4 focus:py-2 focus:shadow-pop">Skip to main content</a>
      <aside className="hidden flex-col justify-between bg-secondary p-12 lg:flex" aria-label="About MindCare Assess">
        <Logo />
        <div>
          <h2 className="max-w-md text-3xl font-semibold leading-tight">A calm, private way to understand how your thinking changes over time.</h2>
          <ul className="mt-10 space-y-6">
            {points.map(({ icon: Icon, title: t, text }) => (
              <li key={t} className="flex gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-card text-primary-strong shadow-sm" aria-hidden><Icon className="size-5" /></span>
                <div><p className="font-semibold">{t}</p><p className="text-sm text-ink-muted">{text}</p></div>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-ink-muted">Student PBL project. Not a medical device.</p>
      </aside>
      <main id="main" className="flex flex-col px-5 py-8 sm:px-10">
        <div className="mb-8 lg:hidden"><Link to="/login" aria-label="MindCare Assess home"><Logo /></Link></div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
          <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-2 text-ink-muted">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-ink-muted">{footer}</div>}
        </div>
        <p className="mx-auto mt-10 max-w-md text-center text-xs text-ink-muted">
          By continuing you acknowledge our <Link to="/privacy" className="font-medium text-primary-strong underline underline-offset-2">privacy &amp; educational-use notice</Link>.
        </p>
      </main>
    </div>
  )
}
