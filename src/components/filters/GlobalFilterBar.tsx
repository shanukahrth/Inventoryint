import { Search, X } from 'lucide-react'
import { useInventoryStore } from '@/store/useInventoryStore'
import { useFilterOptions } from '@/hooks/useFilteredRows'
import { MultiSelectFilter } from '@/components/filters/MultiSelectFilter'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { isAnyFilterActive } from '@/lib/analytics/filtering'

const FILTER_DEFS: { key: 'family' | 'brand' | 'tvSize' | 'area' | 'district' | 'channel' | 'site' | 'location' | 'sku'; label: string; field: string }[] = [
  { key: 'family', label: 'Product Family', field: 'FAM_DES' },
  { key: 'brand', label: 'Brand', field: 'brand' },
  { key: 'tvSize', label: 'TV Size', field: 'tvSize' },
  { key: 'area', label: 'Area', field: 'AREA' },
  { key: 'district', label: 'District', field: 'DISTRICT' },
  { key: 'channel', label: 'Channel', field: 'CHANNEL' },
  { key: 'site', label: 'Site', field: 'SITE_DES' },
  { key: 'location', label: 'Location', field: 'LOCATION_NO' },
  { key: 'sku', label: 'SKU', field: 'PART_NO' },
]

/**
 * The Global Filter Bar shared by every page. All state lives in the
 * Zustand store, so filtering here immediately refreshes every chart and
 * table on the current page (and stays applied when navigating).
 */
export function GlobalFilterBar() {
  const filters = useInventoryStore((s) => s.filters)
  const setSearch = useInventoryStore((s) => s.setSearch)
  const clearAllFilters = useInventoryStore((s) => s.clearAllFilters)

  const anyActive = isAnyFilterActive(filters)

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border bg-card/60 px-6 py-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search SKU, description, location..."
          className="h-8 w-56 pl-7 text-xs"
        />
      </div>
      <div className="h-5 w-px bg-border" />
      {FILTER_DEFS.map((def) => (
        <FilterDropdown key={def.key} filterKey={def.key} label={def.label} field={def.field} />
      ))}
      {anyActive && (
        <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs text-muted-foreground" onClick={clearAllFilters}>
          <X className="h-3.5 w-3.5" />
          Clear all
        </Button>
      )}
    </div>
  )
}

function FilterDropdown({
  filterKey,
  label,
  field,
}: {
  filterKey: 'family' | 'brand' | 'tvSize' | 'area' | 'district' | 'channel' | 'site' | 'location' | 'sku'
  label: string
  field: string
}) {
  const filters = useInventoryStore((s) => s.filters)
  const setFilterValues = useInventoryStore((s) => s.setFilterValues)
  const options = useFilterOptions(field as keyof import('@/types/inventory').InventoryRow)

  return (
    <MultiSelectFilter
      label={label}
      options={options}
      selected={filters[filterKey]}
      onChange={(values) => setFilterValues(filterKey, values)}
    />
  )
}
