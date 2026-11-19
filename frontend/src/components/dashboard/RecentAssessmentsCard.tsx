import { ClipboardList } from 'lucide-react'
import { formatDate } from '../../lib/format'
import type { Dashboard } from '../../lib/types'
import { Badge } from '../ui/Badge'
import { Card, CardHeader } from '../ui/Card'
import { EmptyState } from '../ui/EmptyState'

const statusLabel = { completed: 'Completed', in_progress: 'In progress', abandoned: 'Stopped' } as const

export function RecentAssessmentsCard({ data }: { data: Dashboard }) {
  const tz = data.user.timezone
  return (
    <Card aria-labelledby="recent-title">
      <CardHeader id="recent-title" title="Recent assessments" />
      {data.recent_assessments.length === 0 ? (
        <EmptyState icon={<ClipboardList className="size-5" />} title="Nothing here yet">Assessments you start will be listed here.</EmptyState>
      ) : (
        <ul className="divide-y divide-line">
          {data.recent_assessments.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="font-medium">{formatDate(a.started_at, tz)}</p>
                <p className="text-sm text-ink-muted">Level {a.difficulty_level}</p>
              </div>
              <div className="flex items-center gap-3">
                {a.overall_score !== null && <span className="text-lg font-semibold">{Math.round(a.overall_score)}</span>}
                <Badge tone={a.status === 'completed' ? 'brand' : a.status === 'in_progress' ? 'warning' : 'neutral'}>{statusLabel[a.status]}</Badge>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
