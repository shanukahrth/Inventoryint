import { aggregateBy, sortByQtyDesc } from '@/lib/analytics/aggregations'
import { SPECIAL_SEGMENTS } from '@/config/specialSegments'
import { formatCurrency, formatPercent, safeDiv } from '@/lib/utils'
import type { InventoryRow } from '@/types/inventory'

export interface Insight {
  id: string
  text: string
  tone: 'default' | 'warning' | 'positive'
}

const MULTI_LOCATION_THRESHOLD = 20

/**
 * Rule-based "AI Insights" — deterministic, explainable one-liners computed
 * fresh from whatever row set is passed in (so they refresh with the
 * Global Filter Bar, same as every chart). No external AI call is made:
 * everything here is derived straight from the loaded workbook, which also
 * keeps this fully offline-capable.
 */
export function generateInsights(rows: InventoryRow[]): Insight[] {
  const insights: Insight[] = []
  if (rows.length === 0) return insights

  const totalQty = rows.reduce((s, r) => s + r.QTY_ONHAND, 0)
  const totalAvailable = rows.reduce((s, r) => s + r.AVAILABLE_QTY, 0)
  const totalValue = rows.reduce((s, r) => s + r.inventoryValue, 0)

  const tvRows = rows.filter((r) => r.isTelevision)
  if (tvRows.length > 0 && totalQty > 0) {
    const tvQty = tvRows.reduce((s, r) => s + r.QTY_ONHAND, 0)
    insights.push({
      id: 'tv-share',
      text: `Televisions represent ${formatPercent(safeDiv(tvQty, totalQty) * 100)} of inventory on hand.`,
      tone: 'default',
    })

    const byBrand = sortByQtyDesc(aggregateBy(tvRows.filter((r) => r.brand !== 'Other'), (r) => r.brand))
    if (byBrand.length > 0) {
      insights.push({
        id: 'top-brand',
        text: `${byBrand[0].key} is the largest television brand by quantity on hand (${formatPercent(safeDiv(byBrand[0].qty, tvQty) * 100)} of TV stock).`,
        tone: 'default',
      })
    }

    const bySize = sortByQtyDesc(aggregateBy(tvRows.filter((r) => r.tvSize !== 'Unknown'), (r) => r.tvSize))
    if (bySize.length > 0) {
      insights.push({
        id: 'top-size',
        text: `${bySize[0].key} televisions are the highest stocked size (${bySize[0].qty.toLocaleString()} units).`,
        tone: 'default',
      })
    }
  }

  for (const segment of SPECIAL_SEGMENTS) {
    const matchSet = new Set(segment.matchValues)
    const matched = rows.filter((r) => matchSet.has(r[segment.field]))
    if (matched.length === 0) continue
    const value = matched.reduce((s, r) => s + r.inventoryValue, 0)
    const qty = matched.reduce((s, r) => s + r.QTY_ONHAND, 0)
    if (segment.id === 'service-centre') {
      insights.push({
        id: 'service-centre-share',
        text: `Service Centres hold ${formatPercent(safeDiv(qty, totalQty) * 100)} of total stock (${qty.toLocaleString()} units).`,
        tone: 'default',
      })
    } else {
      insights.push({
        id: `${segment.id}-value`,
        text: `${segment.label} inventory is worth ${formatCurrency(value)} across ${qty.toLocaleString()} units.`,
        tone: 'warning',
      })
    }
  }

  const byLocation = sortByQtyDesc(aggregateBy(rows, (r) => r.LOCATION_NO))
  if (byLocation.length > 0) {
    insights.push({
      id: 'top-location',
      text: `Location ${byLocation[0].key} has the highest inventory (${byLocation[0].qty.toLocaleString()} units).`,
      tone: 'default',
    })
  }

  const byArea = sortByQtyDesc(aggregateBy(rows, (r) => r.AREA))
  if (byArea.length > 0) {
    insights.push({
      id: 'top-area',
      text: `${byArea[0].key} is the highest stocked area (${byArea[0].qty.toLocaleString()} units).`,
      tone: 'default',
    })
  }

  const locationsPerSku = new Map<string, Set<string>>()
  for (const row of rows) {
    if (!row.PART_NO) continue
    let set = locationsPerSku.get(row.PART_NO)
    if (!set) {
      set = new Set()
      locationsPerSku.set(row.PART_NO, set)
    }
    set.add(row.LOCATION_NO)
  }
  const widelyStocked = Array.from(locationsPerSku.values()).filter((s) => s.size > MULTI_LOCATION_THRESHOLD).length
  if (widelyStocked > 0) {
    insights.push({
      id: 'widely-stocked-skus',
      text: `${widelyStocked} SKUs are stocked in more than ${MULTI_LOCATION_THRESHOLD} locations.`,
      tone: 'default',
    })
  }

  if (totalQty > 0) {
    insights.push({
      id: 'available-share',
      text: `Available inventory is ${formatPercent(safeDiv(totalAvailable, totalQty) * 100)} of total inventory on hand.`,
      tone: safeDiv(totalAvailable, totalQty) > 0.85 ? 'positive' : 'default',
    })
  }

  if (totalValue > 0) {
    insights.push({
      id: 'total-value',
      text: `Total inventory on hand is valued at ${formatCurrency(totalValue)}.`,
      tone: 'default',
    })
  }

  return insights
}
