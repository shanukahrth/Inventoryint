import { Construction } from 'lucide-react'

export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
        <Construction className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{title} is coming in the next iteration</p>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
          The Excel Parser, Analytics Engine and Filtering Engine this page needs are already built — this view
          just hasn't been wired up to them yet. Your Global Filter Bar selections carry over once it is.
        </p>
      </div>
    </div>
  )
}
