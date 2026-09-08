import { detectBrand } from '@/lib/detection/brandDetection'
import { detectTvSize } from '@/lib/detection/tvSizeDetection'
import { normalizeKey } from '@/lib/utils'
import { TELEVISION_FAMILY_MATCHERS } from '@/config/productFamilyRules'
import type { InventoryRow, RawInventoryRow } from '@/types/inventory'

function isTelevisionFamily(famDes: string): boolean {
  const upper = famDes.toUpperCase()
  return TELEVISION_FAMILY_MATCHERS.some((m) => upper.includes(m.toUpperCase()))
}

/**
 * Enriches raw parsed rows with everything downstream analytics/UI needs:
 * a stable id, computed inventory value, detected brand/TV size, and
 * normalized keys for special-segment matching (Service Centre, Reverts…).
 *
 * This is the one place brand/size detection actually runs, so it only
 * ever runs once per row per upload, however many charts read the result.
 */
export function buildInventoryRows(raw: RawInventoryRow[]): InventoryRow[] {
  return raw.map((row, index) => {
    const television = isTelevisionFamily(row.FAM_DES)
    return {
      ...row,
      _id: index,
      inventoryValue: row.QTY_ONHAND * row.COST_PR,
      brand: television ? detectBrand(row.PART_NO, row.PART_DES) : '',
      tvSize: television ? detectTvSize(row.PART_NO, row.PART_DES) : '',
      isTelevision: television,
      locationKey: normalizeKey(row.LOCATION_NO),
      channelKey: normalizeKey(row.CHANNEL),
    }
  })
}
