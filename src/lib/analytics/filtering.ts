import type { InventoryFilters, InventoryRow } from '@/types/inventory'

const FIELD_BY_FILTER: Record<
  Exclude<keyof InventoryFilters, 'search'>,
  keyof InventoryRow
> = {
  family: 'FAM_DES',
  brand: 'brand',
  tvSize: 'tvSize',
  area: 'AREA',
  district: 'DISTRICT',
  channel: 'CHANNEL',
  site: 'SITE_DES',
  location: 'LOCATION_NO',
  sku: 'PART_NO',
}

/** Applies the Global Filter Bar's active selections + free-text search to a row set. */
export function applyFilters(rows: InventoryRow[], filters: InventoryFilters): InventoryRow[] {
  const activeEntries = (Object.keys(FIELD_BY_FILTER) as (keyof typeof FIELD_BY_FILTER)[])
    .map((filterKey) => ({ filterKey, values: filters[filterKey], field: FIELD_BY_FILTER[filterKey] }))
    .filter((e) => e.values.length > 0)

  const search = filters.search.trim().toLowerCase()

  if (activeEntries.length === 0 && !search) return rows

  return rows.filter((row) => {
    for (const entry of activeEntries) {
      const value = String(row[entry.field] ?? '')
      if (!entry.values.includes(value)) return false
    }
    if (search) {
      const haystack = `${row.PART_NO} ${row.PART_DES} ${row.FAM_DES} ${row.LOCATION_NO} ${row.SITE_DES}`.toLowerCase()
      if (!haystack.includes(search)) return false
    }
    return true
  })
}

export function isAnyFilterActive(filters: InventoryFilters): boolean {
  return (
    filters.search.trim() !== '' ||
    (Object.keys(FIELD_BY_FILTER) as (keyof typeof FIELD_BY_FILTER)[]).some((k) => filters[k].length > 0)
  )
}
