import { History } from 'lucide-react'
import { DOMAINS } from '../../lib/domains'
import { formatDate } from '../../lib/format'
import type { Dashboard } from '../../lib/types'
import { Card, CardHeader } from '../ui/Card'
import { EmptyState } from '../ui/EmptyState'

/** Also serves as the accessible text alternative to the timeline chart. */
export function HistoricalResultsCard({ data }: { data: Dashboard }) {
  const tz = data.user.timezone
  const rows = [...data.timeline].reverse()
  return (
    <Card aria-labelledby="history-title" className="lg:col-span-2">
      <CardHeader id="history-title" title="Historical results" description="Every recorded score from your last 12 assessments" />
      {rows.length === 0 ? (
        <EmptyState icon={<History className="size-5" />} title="No results recorded">Your completed assessment results will be listed here, newest first.</EmptyState>
      ) : (
        <div className="-mx-2 overflow-x-auto px-2">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <caption className="sr-only">Historical assessment scores, newest first</caption>
            <thead>
              <tr className="border-b border-line text-ink-muted">
                <th scope="col" className="py-2 pr-3 font-medium">Date</th>
                <th scope="col" className="px-3 py-2 font-medium">Overall</th>
                {DOMAINS.map((d) => (<th key={d.key} scope="col" className="px-3 py-2 font-medium">{d.label}</th>))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.date}>
                  <th scope="row" className="whitespace-nowrap py-2.5 pr-3 font-medium">{formatDate(r.date, tz)}</th>
                  <td className="px-3 py-2.5 font-semibold">{Math.round(r.overall)}</td>
                  {DOMAINS.map((d) => (<td key={d.key} className="px-3 py-2.5">{r.domains[d.key] !== undefined ? Math.round(r.domains[d.key]!) : '—'}</td>))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
