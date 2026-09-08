import { useMemo } from 'react'
import {
  Boxes,
  CheckCircle2,
  Clock,
  DollarSign,
  Layers,
  Map,
  MapPin,
  Package,
  Building2,
  Radio,
  Warehouse,
} from 'lucide-react'
import { useInventoryStore } from '@/store/useInventoryStore'
import { useFilteredRows } from '@/hooks/useFilteredRows'
import { computeExecutiveKpis, computeSpecialSegmentKpis } from '@/lib/analytics/kpis'
import { aggregateBy } from '@/lib/analytics/aggregations'
import { generateInsights } from '@/lib/analytics/insights'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { SpecialSegmentCard } from '@/components/dashboard/SpecialSegmentCard'
import { InsightsPanel } from '@/components/dashboard/InsightsPanel'
import { DimensionBarChart } from '@/components/charts/DimensionBarChart'
import { RankedBarList } from '@/components/charts/RankedBarList'
import { formatCurrency, formatNumber } from '@/lib/utils'

export function ExecutiveDashboard() {
  const allRows = useInventoryStore((s) => s.rows)
  const filters = useInventoryStore((s) => s.filters)
  const toggleFilterValue = useInventoryStore((s) => s.toggleFilterValue)
  const rows = useFilteredRows()

  const kpis = useMemo(() => computeExecutiveKpis(rows), [rows])
  const specialSegments = useMemo(() => computeSpecialSegmentKpis(allRows), [allRows])
  const insights = useMemo(() => generateInsights(rows), [rows])

  const byFamily = useMemo(() => aggregateBy(rows, (r) => r.FAM_DES), [rows])
  const byChannel = useMemo(() => aggregateBy(rows, (r) => r.CHANNEL), [rows])
  const byArea = useMemo(() => aggregateBy(rows, (r) => r.AREA), [rows])
  const byLocation = useMemo(() => aggregateBy(rows, (r) => r.LOCATION_NO), [rows])
  const bySku = useMemo(() => aggregateBy(rows, (r) => r.PART_NO), [rows])

  return (
    <div className="space-y-5 pb-8">
      {/* Executive KPI cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        <KpiCard label="Qty On Hand" value={formatNumber(kpis.totalQtyOnHand)} icon={Boxes} />
        <KpiCard label="Available Qty" value={formatNumber(kpis.totalAvailableQty)} icon={CheckCircle2} />
        <KpiCard label="Reserved Qty" value={formatNumber(kpis.totalReservedQty)} icon={Clock} />
        <KpiCard label="Inventory Value" value={formatCurrency(kpis.totalInventoryValue)} icon={DollarSign} />
        <KpiCard label="Total SKUs" value={formatNumber(kpis.totalSkus)} icon={Package} />
        <KpiCard label="Product Families" value={formatNumber(kpis.totalProductFamilies)} icon={Layers} />
        <KpiCard label="Sites" value={formatNumber(kpis.totalSites)} icon={Warehouse} />
        <KpiCard label="Areas" value={formatNumber(kpis.totalAreas)} icon={Map} />
        <KpiCard label="Districts" value={formatNumber(kpis.totalDistricts)} icon={Building2} />
        <KpiCard label="Channels" value={formatNumber(kpis.totalChannels)} icon={Radio} />
        <KpiCard label="Locations" value={formatNumber(kpis.totalLocations)} icon={MapPin} />
      </div>

      {/* Special business KPI cards — always computed on the full dataset, not the active filters */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Special Business Segments — monitored daily
        </p>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {specialSegments.map((segment) => (
            <SpecialSegmentCard key={segment.id} segment={segment} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <DimensionBarChart
              title="Channel Distribution"
              description="Qty / value by channel — click a bar to filter"
              buckets={byChannel}
              onSelect={(key) => toggleFilterValue('channel', key)}
              activeKeys={filters.channel}
              height={300}
            />
            <DimensionBarChart
              title="Area Distribution"
              description="Qty / value by area — click a bar to filter"
              buckets={byArea}
              onSelect={(key) => toggleFilterValue('area', key)}
              activeKeys={filters.area}
              height={300}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <RankedBarList
              title="Top 20 Locations"
              description="By quantity on hand or value — click to filter"
              buckets={byLocation}
              limit={20}
              onSelect={(key) => toggleFilterValue('location', key)}
              activeKeys={filters.location}
            />
            <RankedBarList
              title="Top 20 SKUs"
              description="By quantity on hand or value — click to filter"
              buckets={bySku}
              limit={20}
              onSelect={(key) => toggleFilterValue('sku', key)}
              activeKeys={filters.sku}
            />
          </div>
          <RankedBarList
            title="Top Product Families"
            description="By quantity on hand or value — click to filter"
            buckets={byFamily}
            limit={20}
            onSelect={(key) => toggleFilterValue('family', key)}
            activeKeys={filters.family}
            metricToggle
          />
        </div>
        <div className="space-y-4">
          <InsightsPanel insights={insights} />
        </div>
      </div>
    </div>
  )
}
