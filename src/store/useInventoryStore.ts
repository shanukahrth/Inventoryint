import { create } from 'zustand'
import { parseInventoryWorkbook } from '@/lib/excel/parser'
import { buildInventoryRows } from '@/lib/analytics/enrich'
import { EMPTY_FILTERS } from '@/types/inventory'
import type { InventoryFilters, InventoryRow, LoadedFileMeta } from '@/types/inventory'

interface InventoryState {
  rows: InventoryRow[]
  meta: LoadedFileMeta | null
  filters: InventoryFilters
  status: 'idle' | 'loading' | 'ready' | 'error'
  error: string | null

  loadWorkbook: (file: File) => Promise<void>
  reset: () => void

  setFilterValues: (key: keyof Omit<InventoryFilters, 'search'>, values: string[]) => void
  toggleFilterValue: (key: keyof Omit<InventoryFilters, 'search'>, value: string) => void
  clearFilter: (key: keyof Omit<InventoryFilters, 'search'>) => void
  setSearch: (value: string) => void
  clearAllFilters: () => void
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  rows: [],
  meta: null,
  filters: { ...EMPTY_FILTERS },
  status: 'idle',
  error: null,

  loadWorkbook: async (file: File) => {
    set({ status: 'loading', error: null })
    try {
      const { rows, sheetName, warnings } = await parseInventoryWorkbook(file)
      const enriched = buildInventoryRows(rows)
      set({
        rows: enriched,
        meta: {
          fileName: file.name,
          loadedDate: new Date().toISOString(),
          totalRecords: enriched.length,
          sheetName,
          warnings,
        },
        filters: { ...EMPTY_FILTERS },
        status: 'ready',
      })
    } catch (err) {
      set({ status: 'error', error: err instanceof Error ? err.message : 'Failed to parse workbook.' })
    }
  },

  reset: () => set({ rows: [], meta: null, filters: { ...EMPTY_FILTERS }, status: 'idle', error: null }),

  setFilterValues: (key, values) => set({ filters: { ...get().filters, [key]: values } }),

  toggleFilterValue: (key, value) => {
    const current = get().filters[key]
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
    set({ filters: { ...get().filters, [key]: next } })
  },

  clearFilter: (key) => set({ filters: { ...get().filters, [key]: [] } }),

  setSearch: (value) => set({ filters: { ...get().filters, search: value } }),

  clearAllFilters: () => set({ filters: { ...EMPTY_FILTERS } }),
}))
