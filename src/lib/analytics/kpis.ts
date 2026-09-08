import { SPECIAL_SEGMENTS } from '@/config/specialSegments'
import { distinctCount } from '@/lib/analytics/aggregations'
import type { InventoryRow } from '@/types/inventory'

export interface ExecutiveKpis {
  totalQtyOnHand: number
  totalAvailableQty: number
  totalReservedQty: number
  totalInventoryValue: number
  totalSkus: number
  totalProductFamilies: number
  totalSites: number
  totalAreas: number
  totalDistricts: number
  totalChannels: number
  totalLocations: number
}

export function computeExecutiveKpis(rows: InventoryRow[]): ExecutiveKpis {
  let totalQtyOnHand = 0
  let totalAvailableQty = 0
  let totalReservedQty = 0
  let totalInventoryValue = 0

  for (const row of rows) {
    totalQtyOnHand += row.QTY_ONHAND
    totalAvailableQty += row.AVAILABLE_QTY
    totalReservedQty += row.RESERVED_QTY
    totalInventoryValue += row.inventoryValue
  }

  return {
    totalQtyOnHand,
    totalAvailableQty,
    totalReservedQty,
    totalInventoryValue,
    totalSkus: distinctCount(rows, 'PART_NO'),
    totalProductFamilies: distinctCount(rows, 'FAM_DES'),
    totalSites: distinctCount(rows, 'SITE_DES'),
    totalAreas: distinctCount(rows, 'AREA'),
    totalDistricts: distinctCount(rows, 'DISTRICT'),
    totalChannels: distinctCount(rows, 'CHANNEL'),
    totalLocations: distinctCount(rows, 'LOCATION_NO'),
  }
}

export interface SpecialSegmentKpi {
  id: string
  label: string
  description: string
  tone: 'warning' | 'info'
  qty: number
  availableQty: number
  reservedQty: number
  value: number
  skuCount: number
}

/**
 * Computes the always-visible Service Centre / Reverts / Revert Close /
 * Revert Close-UR cards. These are deliberately computed against the FULL
 * dataset (not the currently filtered rows) — they're the numbers
 * management checks every day regardless of what someone else is filtering
 * on elsewhere in the app.
 */
export function computeSpecialSegmentKpis(allRows: InventoryRow[]): SpecialSegmentKpi[] {
  return SPECIAL_SEGMENTS.map((rule) => {
    const matchSet = new Set(rule.matchValues)
    const matched = allRows.filter((row) => matchSet.has(row[rule.field]))
    const skuSet = new Set(matched.map((r) => r.PART_NO))
    return {
      id: rule.id,
      label: rule.label,
      description: rule.description,
      tone: rule.tone,
      qty: matched.reduce((sum, r) => sum + r.QTY_ONHAND, 0),
      availableQty: matched.reduce((sum, r) => sum + r.AVAILABLE_QTY, 0),
      reservedQty: matched.reduce((sum, r) => sum + r.RESERVED_QTY, 0),
      value: matched.reduce((sum, r) => sum + r.inventoryValue, 0),
      skuCount: skuSet.size,
    }
  })
}
