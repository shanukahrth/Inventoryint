import { AlertTriangle, Info } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { formatCurrency, formatNumber } from '@/lib/utils'
import type { SpecialSegmentKpi } from '@/lib/analytics/kpis'
import { cn } from '@/lib/utils'

export function SpecialSegmentCard({ segment }: { segment: SpecialSegmentKpi }) {
  const isWarning = segment.tone === 'warning'
  return (
    <Card
      className={cn(
        'flex flex-col gap-2.5 p-4',
        isWarning ? 'border-status-warning/40 bg-status-warning/[0.07]' : 'border-primary/25 bg-accent/40',
      )}
    >
      <div className="flex items-center gap-2">
        {isWarning ? (
          <AlertTriangle className="h-4 w-4 text-status-warning" />
        ) : (
          <Info className="h-4 w-4 text-primary" />
        )}
        <p className="text-xs font-semibold text-foreground">{segment.label}</p>
      </div>
      <p className="text-xl font-semibold tabular-nums text-foreground">{formatNumber(segment.qty)} units</p>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
        <span>
          Available <span className="font-medium text-foreground">{formatNumber(segment.availableQty)}</span>
        </span>
        <span>
          Reserved <span className="font-medium text-foreground">{formatNumber(segment.reservedQty)}</span>
        </span>
        <span>
          Value <span className="font-medium text-foreground">{formatCurrency(segment.value)}</span>
        </span>
        <span>
          SKUs <span className="font-medium text-foreground">{formatNumber(segment.skuCount)}</span>
        </span>
      </div>
    </Card>
  )
}
