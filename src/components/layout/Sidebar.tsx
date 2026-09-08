import { NavLink } from 'react-router-dom'
import { BarChart3 } from 'lucide-react'
import { NAV_GROUPS, NAV_ITEMS } from '@/config/navigation'
import { cn } from '@/lib/utils'
import { useInventoryStore } from '@/store/useInventoryStore'

export function Sidebar() {
  const totalRecords = useInventoryStore((s) => s.meta?.totalRecords ?? 0)

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <BarChart3 className="h-4.5 w-4.5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold">Singer Inventory</p>
          <p className="text-[11px] text-sidebar-muted">Intelligence Platform</p>
        </div>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {NAV_GROUPS.map((group) => (
          <div key={group}>
            <p className="px-2.5 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-sidebar-muted">
              {group}
            </p>
            <div className="space-y-0.5">
              {NAV_ITEMS.filter((item) => item.group === group).map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center justify-between gap-2 rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors',
                      isActive
                        ? 'bg-sidebar-active text-white'
                        : 'text-sidebar-foreground/85 hover:bg-sidebar-active/60 hover:text-white',
                    )
                  }
                >
                  <span className="flex items-center gap-2.5">
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </span>
                  {item.status === 'planned' && (
                    <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-sidebar-muted">
                      Soon
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border px-4 py-3 text-[11px] text-sidebar-muted">
        {totalRecords > 0 ? (
          <p>{totalRecords.toLocaleString()} records loaded</p>
        ) : (
          <p>No workbook loaded</p>
        )}
        <p className="mt-0.5">100% local — data never leaves your browser</p>
      </div>
    </aside>
  )
}
