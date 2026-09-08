import { formatCurrency, formatNumber } from '@/lib/utils'

interface Payload {
  name?: string
  value?: number
  color?: string
  payload?: Record<string, unknown>
}

export function ChartTooltip({
  active,
  payload,
  label,
  metric = 'qty',
}: {
  active?: boolean
  payload?: Payload[]
  label?: string
  metric?: 'qty' | 'value'
}) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-md">
      {label && <p className="mb-1 font-medium text-foreground">{label}</p>}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-1.5 text-muted-foreground">
          {entry.color && <span className="h-2 w-2 rounded-full" style={{ background: entry.color }} />}
          <span>{entry.name ?? 'Value'}:</span>
          <span className="font-medium tabular-nums text-foreground">
            {metric === 'value' ? formatCurrency(entry.value ?? 0) : formatNumber(entry.value ?? 0)}
          </span>
        </div>
      ))}
    </div>
  )
}
