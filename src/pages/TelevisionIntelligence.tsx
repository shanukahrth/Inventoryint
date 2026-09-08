import { useMemo } from 'react'
import { Tv } from 'lucide-react'
import { useInventoryStore } from '@/store/useInventoryStore'
import { useFilteredRows } from '@/hooks/useFilteredRows'
import { aggregateBy, sortByQtyDesc } from '@/lib/analytics/aggregations'
import { KNOWN_TV_SIZES } from '@/config/tvSizeRules'
import { DimensionBarChart } from '@/components/charts/DimensionBarChart'
import { RankedBarList } from '@/components/charts/RankedBarList'
import { HeatMatrix } from '@/components/charts/HeatMatrix'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { Boxes, CheckCircle2, Clock, DollarSign } from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/utils'

export function TelevisionIntelligence() {
  const filters = useInventoryStore((s) => s.filters)
  const toggleFilterValue = useInventoryStore((s) => s.toggleFilterValue)
  const rows = useFilteredRows()

  const tvRows = useMemo(() => rows.filter((r) => r.isTelevision), [rows])

  const totals = useMemo(() => {
    const qty = tvRows.reduce((s, r) => s + r.QTY_ONHAND, 0)
    const available = tvRows.reduce((s, r) => s + r.AVAILABLE_QTY, 0)
    const reserved = tvRows.reduce((s, r) => s + r.RESERVED_QTY, 0)
    const value = tvRows.reduce((s, r) => s + r.inventoryValue, 0)
    return { qty, available, reserved, value }
  }, [tvRows])

  const byBrand = useMemo(() => aggregateBy(tvRows, (r) => r.brand || 'Other'), [tvRows])
  const bySize = useMemo(() => {
    const buckets = aggregateBy(tvRows, (r) => r.tvSize || 'Unknown')
    const order = [...KNOWN_TV_SIZES.map((s) => `${s}"`), 'Unknown']
    return buckets.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key))
  }, [tvRows])
  const byModel = useMemo(() => aggregateBy(tvRows, (r) => r.PART_DES || r.PART_NO), [tvRows])
  const bySku = useMemo(() => aggregateBy(tvRows, (r) => r.PART_NO), [tvRows])
  const byLocation = useMemo(() => aggregateBy(tvRows, (r) => r.LOCATION_NO), [tvRows])

  const brands = useMemo(() => sortByQtyDesc(byBrand).map((b) => b.key), [byBrand])
  const sizes = useMemo(() => bySize.map((b) => b.key), [bySize])
  const matrixLookup = useMemo(() => {
    const map = new Map<string, number>()
    for (const row of tvRows) {
      const key = `${row.brand || 'Other'}||${row.tvSize || 'Unknown'}`
      map.set(key, (map.get(key) ?? 0) + row.QTY_ONHAND)
    }
    return map
  }, [tvRows])

  if (tvRows.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
        <Tv className="h-8 w-8" />
        <p className="text-sm">No television inventory in the current view.</p>
        <p className="text-xs">Adjust the Global Filter Bar or upload a report that includes TV stock.</p>
      </div>
    )
  }

  return (
    <div className="space-y-5 pb-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard label="TV Qty On Hand" value={formatNumber(totals.qty)} icon={Boxes} />
        <KpiCard label="TV Available Qty" value={formatNumber(totals.available)} icon={CheckCircle2} />
        <KpiCard label="TV Reserved Qty" value={formatNumber(totals.reserved)} icon={Clock} />
        <KpiCard label="TV Inventory Value" value={formatCurrency(totals.value)} icon={DollarSign} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <DimensionBarChart
          title="Brand Distribution"
          description="Detected from PART_NO / PART_DES — click to filter"
          buckets={byBrand}
          onSelect={(key) => toggleFilterValue('brand', key)}
          activeKeys={filters.brand}
        />
        <DimensionBarChart
          title="Size Distribution"
          description="Extracted from the model number — click to filter"
          buckets={bySize}
          onSelect={(key) => toggleFilterValue('tvSize', key)}
          activeKeys={filters.tvSize}
        />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-foreground">Brand × Size Matrix</CardTitle>
          <CardDescription>Quantity on hand — darker means more stock. Click a cell to filter both.</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <HeatMatrix
            rowLabels={brands}
            colLabels={sizes}
            getValue={(row, col) => matrixLookup.get(`${row}||${col}`) ?? 0}
            onCellClick={(row, col) => {
              toggleFilterValue('brand', row)
              toggleFilterValue('tvSize', col)
            }}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <RankedBarList title="Top Models" description="By quantity or value" buckets={byModel} limit={15} />
        <RankedBarList
          title="Top TV SKUs"
          description="By quantity or value — click to filter"
          buckets={bySku}
          limit={15}
          onSelect={(key) => toggleFilterValue('sku', key)}
          activeKeys={filters.sku}
        />
        <RankedBarList
          title="Top TV Locations"
          description="By quantity or value — click to filter"
          buckets={byLocation}
          limit={15}
          onSelect={(key) => toggleFilterValue('location', key)}
          activeKeys={filters.location}
        />
      </div>
    </div>
  )
}
