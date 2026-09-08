import { AlertTriangle, Sparkles, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Insight } from '@/lib/analytics/insights'

const TONE_ICON = {
  default: Sparkles,
  warning: AlertTriangle,
  positive: TrendingUp,
} as const

const TONE_CLASS = {
  default: 'text-primary',
  warning: 'text-status-warning',
  positive: 'text-status-good',
} as const

export function InsightsPanel({ insights }: { insights: Insight[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          AI Insights
        </CardTitle>
        <CardDescription>Generated automatically from the current view.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {insights.length === 0 && <p className="text-xs text-muted-foreground">Not enough data for insights yet.</p>}
        {insights.map((insight) => {
          const Icon = TONE_ICON[insight.tone]
          return (
            <div key={insight.id} className="flex items-start gap-2 rounded-md bg-secondary/60 px-3 py-2">
              <Icon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${TONE_CLASS[insight.tone]}`} />
              <p className="text-xs leading-relaxed text-foreground">{insight.text}</p>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
