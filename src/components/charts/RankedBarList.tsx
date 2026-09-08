import { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency, formatNumber } from '@/lib/utils'
import type { AggregateBucket } from '@/lib/analytics/aggregations'
import { topN } from '@/lib/analytics/aggregations'

interface RankedBarListProps {
  title: string
  description?: string
  buckets: AggregateBucket[]
  limit?: number
  onSelect?: (key: string) => void
  activeKeys?: string[]
  metricToggle?: boolean
}

/**
 * A ranked, proportional-width bar list — used for every "Top N" widget
 * (locations, SKUs, families…). Chosen over a bar chart for these because
 * cardinality is high and a direct-labeled list stays legible at any N,
 * satisfying the palette's relief rule (visible labels) for free.
 */
export function RankedBarList({
  title,
  description,
  buckets,
  limit = 10,
  onSelect,
  activeKeys = [],
  metricToggle = true,
}: RankedBarListProps) {
  const [metric, setMetric] = useState<'qty' | 'value'>('qty')

  const rows = useMemo(() => topN(buckets, limit, metric), [buckets, limit, metric])
  const max = rows.length > 0 ? Math.max(...rows.map((r) => (metric === 'qty' ? r.qty : r.value))) : 0

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="text-sm font-semibold text-foreground">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {metricToggle && (
          <Tabs value={metric} onValueChange={(v) => setMetric(v as 'qty' | 'value')}>
            <TabsList className="h-7 p-0.5">
              <TabsTrigger value="qty" className="h-6 px-2 text-[11px]">
                Qty
              </TabsTrigger>
              <TabsTrigger value="value" className="h-6 px-2 text-[11px]">
                Value
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </CardHeader>
      <CardContent className="space-y-1.5 pt-0">
        {rows.length === 0 && <p className="py-6 text-center text-xs text-muted-foreground">No data.</p>}
        {rows.map((row, i) => {
          const measure = metric === 'qty' ? row.qty : row.value
          const pct = max > 0 ? (measure / max) * 100 : 0
          const isActive = activeKeys.includes(row.key)
          return (
            <button
              key={row.key}
              type="button"
              onClick={() => onSelect?.(row.key)}
              className={`group flex w-full items-center gap-2.5 rounded-md px-1.5 py-1.5 text-left transition-colors ${
                onSelect ? 'cursor-pointer hover:bg-accent' : 'cursor-default'
              } ${isActive ? 'bg-accent ring-1 ring-primary/40' : ''}`}
            >
              <span className="w-4 shrink-0 text-right text-[10px] tabular-nums text-muted-foreground">{i + 1}</span>
              <span className="w-28 shrink-0 truncate text-xs font-medium text-foreground" title={row.key}>
                {row.key}
              </span>
              <span className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <span
                  className="absolute inset-y-0 left-0 rounded-full bg-chart-1 transition-all"
                  style={{ width: `${Math.max(pct, 2)}%` }}
                />
              </span>
              <span className="w-20 shrink-0 text-right text-[11px] tabular-nums text-muted-foreground">
                {metric === 'qty' ? formatNumber(row.qty) : formatCurrency(row.value)}
              </span>
            </button>
          )
        })}
      </CardContent>
    </Card>
  )
}
