import { PlayCircle, Users } from 'lucide-react'
import type { Dashboard } from '../../lib/types'
import { Badge } from '../ui/Badge'
import { Card, CardHeader } from '../ui/Card'

/** Honest, clearly-labelled availability states: these modules are built in later stages and perform no actions yet. */
export function QuickAssessmentCard({ data }: { data: Dashboard }) {
  return (
    <Card aria-labelledby="quick-title">
      <CardHeader id="quick-title" title="Quick assessment" action={<Badge tone="warning">Coming next</Badge>} />
      <p className="text-sm text-ink-muted">Short, adaptive activities covering memory, attention, processing speed and executive function.</p>
      <button disabled className="mt-4 inline-flex h-11 cursor-not-allowed items-center gap-2 rounded-xl bg-secondary px-4 font-semibold text-ink-muted" aria-describedby="quick-note">
        <PlayCircle className="size-5" aria-hidden /> Start assessment
      </button>
      <p id="quick-note" className="mt-2 text-xs text-ink-muted">The assessment engine is the next release.{data.assessments_in_progress > 0 ? ' You have a session in progress.' : ''}</p>
    </Card>
  )
}

export function FamilyCard() {
  return (
    <Card aria-labelledby="family-title">
      <CardHeader id="family-title" title="Family monitoring" action={<Badge tone="warning">Coming next</Badge>} />
      <div className="flex gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary-strong" aria-hidden><Users className="size-5" /></span>
        <p className="text-sm text-ink-muted">Optional and permission-based. When released, only people you invite can see only what you choose to share, and you can revoke access at any time. Nothing is shared today.</p>
      </div>
    </Card>
  )
}

export function AssessmentProgressCard({ data }: { data: Dashboard }) {
  const { assessments_completed: done, assessments_in_progress: running } = data
  return (
    <Card aria-labelledby="progress-title">
      <CardHeader id="progress-title" title="Assessment progress" />
      <dl className="grid grid-cols-2 gap-4">
        <div><dt className="text-sm text-ink-muted">Completed</dt><dd className="text-3xl font-semibold">{done}</dd></div>
        <div><dt className="text-sm text-ink-muted">In progress</dt><dd className="text-3xl font-semibold">{running}</dd></div>
      </dl>
      <p className="mt-3 text-sm text-ink-muted">{running > 0 ? 'You have an unfinished session.' : done > 0 ? 'Regular, relaxed check-ins give the clearest picture over time.' : 'Your first assessment will start your record.'}</p>
    </Card>
  )
}
