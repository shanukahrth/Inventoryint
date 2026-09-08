import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface KpiCardProps {
  label: string
  value: string
  icon: LucideIcon
  sub?: string
  className?: string
}

export function KpiCard({ label, value, icon: Icon, sub, className }: KpiCardProps) {
  return (
    <Card className={cn('flex flex-col gap-2 p-4', className)}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-muted-foreground/70" />
      </div>
      <p className="text-2xl font-semibold tabular-nums text-foreground">{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
    </Card>
  )
}
