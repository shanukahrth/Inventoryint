import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts'
import { TruncatedYAxisTick } from '@/components/charts/TruncatedYAxisTick'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChartTooltip } from '@/components/charts/ChartTooltip'
import { formatCompactNumber } from '@/lib/utils'
import type { AggregateBucket } from '@/lib/analytics/aggregations'
import { sortByQtyDesc, sortByValueDesc } from '@/lib/analytics/aggregations'

interface DimensionBarChartProps {
  title: string
  description?: string
  buckets: AggregateBucket[]
  limit?: number
  onSelect?: (key: string) => void
  activeKeys?: string[]
  height?: number
}

/**
 * A horizontal bar chart for a categorical dimension (channel, area…),
 * with a Qty/Value toggle. One hue (chart-1, "series 1") throughout — color
 * here encodes selection state, not category identity, so it never
 * competes with the categorical palette used elsewhere on the same page.
 */
export function DimensionBarChart({
  title,
  description,
  buckets,
  limit = 12,
  onSelect,
  activeKeys = [],
  height = 320,
}: DimensionBarChartProps) {
  const [metric, setMetric] = useState<'qty' | 'value'>('qty')

  const data = useMemo(() => {
    const sorted = metric === 'qty' ? sortByQtyDesc(buckets) : sortByValueDesc(buckets)
    return sorted.slice(0, limit).map((b) => ({
      name: b.key,
      metricValue: metric === 'qty' ? b.qty : b.value,
    }))
  }, [buckets, metric, limit])

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-semibold text-foreground">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
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
      </CardHeader>
      <CardContent className="pt-0" style={{ height }}>
        {data.length === 0 ? (
          <p className="py-10 text-center text-xs text-muted-foreground">No data.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 4 }} barCategoryGap={6}>
              <CartesianGrid horizontal={false} stroke="var(--color-chart-grid)" />
              <XAxis
                type="number"
                tickFormatter={(v) => formatCompactNumber(v)}
                tick={{ fontSize: 11, fill: 'var(--color-chart-muted)' }}
                axisLine={{ stroke: 'var(--color-chart-axis)' }}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={112}
                tick={<TruncatedYAxisTick width={104} />}
                axisLine={{ stroke: 'var(--color-chart-axis)' }}
                tickLine={false}
                interval={0}
              />
              <Tooltip content={<ChartTooltip metric={metric} />} cursor={{ fill: 'var(--color-accent)' }} />
              <Bar
                dataKey="metricValue"
                name={metric === 'qty' ? 'Quantity' : 'Value'}
                radius={[0, 4, 4, 0]}
                maxBarSize={18}
                onClick={(entry: { name?: string }) => entry?.name && onSelect?.(entry.name)}
                cursor={onSelect ? 'pointer' : 'default'}
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={activeKeys.includes(entry.name) ? 'var(--color-chart-2)' : 'var(--color-chart-1)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
