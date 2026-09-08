import { useLocation } from 'react-router-dom'
import { RefreshCw } from 'lucide-react'
import { NAV_ITEMS } from '@/config/navigation'
import { Button } from '@/components/ui/button'
import { useInventoryStore } from '@/store/useInventoryStore'

export function TopBar() {
  const location = useLocation()
  const meta = useInventoryStore((s) => s.meta)
  const reset = useInventoryStore((s) => s.reset)

  const current = NAV_ITEMS.find((item) => item.path === location.pathname)
  const title = current?.label ?? 'Singer Inventory Intelligence Platform'

  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-6 py-3.5">
      <div>
        <h1 className="text-base font-semibold text-foreground">{title}</h1>
        {meta && (
          <p className="text-xs text-muted-foreground">
            {meta.fileName} · sheet "{meta.sheetName}" · {meta.totalRecords.toLocaleString()} records ·{' '}
            loaded {new Date(meta.loadedDate).toLocaleString()}
          </p>
        )}
      </div>
      {meta && (
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={reset}>
          <RefreshCw className="h-3.5 w-3.5" />
          Upload a different report
        </Button>
      )}
    </header>
  )
}
