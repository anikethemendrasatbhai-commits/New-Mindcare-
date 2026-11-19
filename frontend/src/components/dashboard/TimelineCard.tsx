import { TrendingUp } from 'lucide-react'
import { useMemo, useState } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { cn } from '../../lib/cn'
import { DOMAINS, OVERALL_COLOR } from '../../lib/domains'
import { formatDate, formatShortDate } from '../../lib/format'
import type { Dashboard } from '../../lib/types'
import { Card, CardHeader } from '../ui/Card'
import { EmptyState } from '../ui/EmptyState'

type Visible = Record<string, boolean>

export function TimelineCard({ data }: { data: Dashboard }) {
  const [visible, setVisible] = useState<Visible>({ overall: true, memory: true, attention: false, processing_speed: false, executive_function: false })
  const tz = data.user.timezone
  const rows = useMemo(
    () => data.timeline.map((p) => ({ label: formatShortDate(p.date, tz), full: formatDate(p.date, tz), overall: p.overall, ...p.domains })),
    [data.timeline, tz],
  )
  const series = [{ key: 'overall', label: 'Overall', color: OVERALL_COLOR, dash: '0', width: 3 }, ...DOMAINS.map((d) => ({ ...d, width: 2 }))]
  const shown = series.filter((s) => visible[s.key])

  return (
    <Card aria-labelledby="timeline-title" className="lg:col-span-2">
      <CardHeader id="timeline-title" title="Cognitive health timeline" description="Recorded assessment scores over time (last 12 assessments)" />
      {rows.length === 0 ? (
        <EmptyState icon={<TrendingUp className="size-5" />} title="Your timeline will build here">Each completed assessment adds a point, so changes in your recorded results can be seen over time.</EmptyState>
      ) : (
        <>
          <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="Choose lines to show">
            {series.map((s) => (
              <button
                key={s.key} aria-pressed={visible[s.key]} onClick={() => setVisible((v) => ({ ...v, [s.key]: !v[s.key] }))}
                className={cn('flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors', visible[s.key] ? 'border-primary-strong bg-secondary text-ink' : 'border-line bg-card text-ink-muted hover:bg-canvas')}
              >
                <svg width="22" height="8" aria-hidden><line x1="0" y1="4" x2="22" y2="4" stroke={s.color} strokeWidth="3" strokeDasharray={s.dash} /></svg>{s.label}
              </button>
            ))}
          </div>
          <div className="h-72" role="img" aria-label={`Line chart of ${rows.length} assessment${rows.length === 1 ? '' : 's'}. The data is also available in the table below.`}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rows} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
                <CartesianGrid stroke="#DDE6EC" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#55667A', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#DDE6EC' }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#55667A', fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip
                  labelFormatter={(_, p) => (p?.[0]?.payload as { full?: string } | undefined)?.full ?? ''}
                  formatter={(v, name) => [typeof v === 'number' ? v.toFixed(1) : v, name]}
                  contentStyle={{ borderRadius: 12, border: '1px solid #DDE6EC', boxShadow: '0 12px 40px -12px rgba(36,52,71,.28)' }}
                />
                {shown.map((s) => (
                  <Line key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.color} strokeWidth={s.width} strokeDasharray={s.dash} dot={{ r: 3, fill: s.color }} activeDot={{ r: 5 }} isAnimationActive={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-ink-muted">Scores come from unvalidated educational activities. Changes shown here are not evidence of a medical condition.</p>
        </>
      )}
    </Card>
  )
}
