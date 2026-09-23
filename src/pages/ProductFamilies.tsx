import { useMemo } from 'react'
import { Layers, Boxes, CheckCircle2, Clock, DollarSign, Package } from 'lucide-react'
import { useInventoryStore } from '@/store/useInventoryStore'
import { useFilteredRows } from '@/hooks/useFilteredRows'
import { aggregateBy, distinctCount } from '@/lib/analytics/aggregations'
import { DimensionBarChart } from '@/components/charts/DimensionBarChart'
import { RankedBarList } from '@/components/charts/RankedBarList'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { formatCurrency, formatNumber } from '@/lib/utils'

export function ProductFamilies() {
  const filters = useInventoryStore((s) => s.filters)
  const toggleFilterValue = useInventoryStore((s) => s.toggleFilterValue)
  const rows = useFilteredRows()

  const totals = useMemo(() => {
    const qty = rows.reduce((s, r) => s + r.QTY_ONHAND, 0)
    const available = rows.reduce((s, r) => s + r.AVAILABLE_QTY, 0)
    const reserved = rows.reduce((s, r) => s + r.RESERVED_QTY, 0)
    const value = rows.reduce((s, r) => s + r.inventoryValue, 0)
    return { qty, available, reserved, value }
  }, [rows])

  const familyCount = useMemo(() => distinctCount(rows, 'FAM_DES'), [rows])
  const skuCount = useMemo(() => distinctCount(rows, 'PART_NO'), [rows])

  const byFamily = useMemo(() => aggregateBy(rows, (r) => r.FAM_DES), [rows])
  const byChannel = useMemo(() => aggregateBy(rows, (r) => r.CHANNEL), [rows])
  const byArea = useMemo(() => aggregateBy(rows, (r) => r.AREA), [rows])
  const byLocation = useMemo(() => aggregateBy(rows, (r) => r.LOCATION_NO), [rows])
  const bySku = useMemo(() => aggregateBy(rows, (r) => r.PART_NO), [rows])

  if (rows.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
        <Layers className="h-8 w-8" />
        <p className="text-sm">No inventory in the current view.</p>
        <p className="text-xs">Adjust the Global Filter Bar to see product family data.</p>
      </div>
    )
  }

  return (
    <div className="space-y-5 pb-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <KpiCard label="Product Families" value={formatNumber(familyCount)} icon={Layers} />
        <KpiCard label="Qty On Hand" value={formatNumber(totals.qty)} icon={Boxes} />
        <KpiCard label="Available Qty" value={formatNumber(totals.available)} icon={CheckCircle2} />
        <KpiCard label="Reserved Qty" value={formatNumber(totals.reserved)} icon={Clock} />
        <KpiCard label="Inventory Value" value={formatCurrency(totals.value)} icon={DollarSign} />
        <KpiCard label="Total SKUs" value={formatNumber(skuCount)} icon={Package} />
      </div>

      <RankedBarList
        title="All Product Families"
        description="Ranked by quantity on hand or value — click to filter"
        buckets={byFamily}
        limit={30}
        onSelect={(key) => toggleFilterValue('family', key)}
        activeKeys={filters.family}
        metricToggle
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <DimensionBarChart
          title="Channel Distribution"
          description="Within the selected families — click a bar to filter"
          buckets={byChannel}
          onSelect={(key) => toggleFilterValue('channel', key)}
          activeKeys={filters.channel}
        />
        <DimensionBarChart
          title="Area Distribution"
          description="Within the selected families — click a bar to filter"
          buckets={byArea}
          onSelect={(key) => toggleFilterValue('area', key)}
          activeKeys={filters.area}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <RankedBarList
          title="Top Locations"
          description="By quantity or value — click to filter"
          buckets={byLocation}
          limit={15}
          onSelect={(key) => toggleFilterValue('location', key)}
          activeKeys={filters.location}
        />
        <RankedBarList
          title="Top SKUs"
          description="By quantity or value — click to filter"
          buckets={bySku}
          limit={15}
          onSelect={(key) => toggleFilterValue('sku', key)}
          activeKeys={filters.sku}
        />
      </div>
    </div>
  )
}
