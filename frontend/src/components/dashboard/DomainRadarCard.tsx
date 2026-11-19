import { Gauge } from 'lucide-react'
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from 'recharts'
import { DOMAINS } from '../../lib/domains'
import type { Dashboard } from '../../lib/types'
import { Card, CardHeader } from '../ui/Card'
import { EmptyState } from '../ui/EmptyState'

export function DomainRadarCard({ data }: { data: Dashboard }) {
  const latest = data.latest_domain_scores
  const overall = data.timeline.at(-1)?.overall
  const rows = DOMAINS.map((d) => ({ domain: d.label, score: latest?.[d.key] ?? 0, key: d.key }))

  return (
    <Card aria-labelledby="overview-title">
      <CardHeader id="overview-title" title="Cognitive health overview" description="Your most recent completed assessment" />
      {!latest || overall === undefined ? (
        <EmptyState icon={<Gauge className="size-5" />} title="No completed assessments yet">
          Once you complete an assessment, your overall score and four cognitive domains will appear here.
        </EmptyState>
      ) : (
        <div className="grid items-center gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
          <div>
            <p className="text-sm text-ink-muted">Overall assessment score</p>
            <p className="text-5xl font-semibold tracking-tight">{Math.round(overall)}<span className="text-xl font-medium text-ink-muted"> / 100</span></p>
            <p className="mt-2 text-sm text-ink-muted">An assessment-derived score from your activities. It is not a clinical measure or a diagnosis.</p>
            <ul className="mt-4 space-y-1.5 text-sm">
              {rows.map((r) => (<li key={r.key} className="flex justify-between gap-3"><span className="text-ink-muted">{r.domain}</span><span className="font-semibold">{Math.round(r.score)}</span></li>))}
            </ul>
          </div>
          <div className="h-64" role="img" aria-label={`Radar chart of latest domain scores: ${rows.map((r) => `${r.domain} ${Math.round(r.score)}`).join(', ')}`}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={rows} outerRadius="62%" margin={{ top: 12, right: 56, bottom: 12, left: 56 }}>
                <PolarGrid stroke="#DDE6EC" />
                <PolarAngleAxis dataKey="domain" tick={{ fill: '#55667A', fontSize: 12 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar dataKey="score" stroke="#438F91" strokeWidth={2.5} fill="#438F91" fillOpacity={0.22} dot={{ r: 3, fill: '#438F91' }} isAnimationActive={false} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </Card>
  )
}
