import { useMemo } from 'react'
import { useInventoryStore } from '@/store/useInventoryStore'
import { applyFilters } from '@/lib/analytics/filtering'
import type { InventoryRow } from '@/types/inventory'

/** All rows with the Global Filter Bar's current selections applied. Recomputed only when rows or filters change. */
export function useFilteredRows(): InventoryRow[] {
  const rows = useInventoryStore((s) => s.rows)
  const filters = useInventoryStore((s) => s.filters)
  return useMemo(() => applyFilters(rows, filters), [rows, filters])
}

/** Distinct, sorted values for a given field across the full (unfiltered) dataset — used to populate filter dropdowns. */
export function useFilterOptions(field: keyof InventoryRow): string[] {
  const rows = useInventoryStore((s) => s.rows)
  return useMemo(() => {
    const set = new Set<string>()
    for (const row of rows) {
      const value = row[field]
      if (value !== '' && value != null) set.add(String(value))
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [rows, field])
}
