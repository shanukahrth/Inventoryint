import type { InventoryRow } from '@/types/inventory'

export interface AggregateBucket {
  key: string
  qty: number
  value: number
  available: number
  reserved: number
  skuCount: number
  rowCount: number
}

/**
 * Groups rows by an arbitrary key function and sums the standard inventory
 * measures. This is the one aggregation primitive every dashboard chart and
 * drill-down page is built from — kept generic and dependency-free so it's
 * cheap to memoize per (rows, keyFn) pair.
 */
export function aggregateBy(
  rows: InventoryRow[],
  keyFn: (row: InventoryRow) => string,
): AggregateBucket[] {
  const buckets = new Map<string, { qty: number; value: number; available: number; reserved: number; skus: Set<string>; rowCount: number }>()

  for (const row of rows) {
    const key = keyFn(row) || 'Unspecified'
    let bucket = buckets.get(key)
    if (!bucket) {
      bucket = { qty: 0, value: 0, available: 0, reserved: 0, skus: new Set(), rowCount: 0 }
      buckets.set(key, bucket)
    }
    bucket.qty += row.QTY_ONHAND
    bucket.value += row.inventoryValue
    bucket.available += row.AVAILABLE_QTY
    bucket.reserved += row.RESERVED_QTY
    bucket.skus.add(row.PART_NO)
    bucket.rowCount += 1
  }

  return Array.from(buckets.entries()).map(([key, b]) => ({
    key,
    qty: b.qty,
    value: b.value,
    available: b.available,
    reserved: b.reserved,
    skuCount: b.skus.size,
    rowCount: b.rowCount,
  }))
}

export function sortByQtyDesc(buckets: AggregateBucket[]): AggregateBucket[] {
  return [...buckets].sort((a, b) => b.qty - a.qty)
}

export function sortByValueDesc(buckets: AggregateBucket[]): AggregateBucket[] {
  return [...buckets].sort((a, b) => b.value - a.value)
}

export function topN(buckets: AggregateBucket[], n: number, by: 'qty' | 'value' = 'qty'): AggregateBucket[] {
  const sorted = by === 'qty' ? sortByQtyDesc(buckets) : sortByValueDesc(buckets)
  return sorted.slice(0, n)
}

export function distinctCount(rows: InventoryRow[], field: keyof InventoryRow): number {
  const set = new Set<string>()
  for (const row of rows) {
    const value = row[field]
    if (value !== '' && value != null) set.add(String(value))
  }
  return set.size
}
