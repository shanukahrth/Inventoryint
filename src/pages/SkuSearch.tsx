import { useMemo, useRef, useState } from 'react'
import Fuse from 'fuse.js'
import {
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { ArrowDown, ArrowUp, ArrowUpDown, Columns3, Download, Search } from 'lucide-react'
import { useFilteredRows } from '@/hooks/useFilteredRows'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { exportSkuReport } from '@/lib/export/exportEngine'
import { formatCurrency, formatNumber } from '@/lib/utils'
import type { InventoryRow } from '@/types/inventory'

const columns: ColumnDef<InventoryRow>[] = [
  { accessorKey: 'PART_NO', header: 'SKU', size: 150 },
  { accessorKey: 'PART_DES', header: 'Description', size: 280 },
  { accessorKey: 'FAM_DES', header: 'Product Family', size: 160 },
  { accessorKey: 'brand', header: 'Brand', size: 110 },
  { accessorKey: 'tvSize', header: 'TV Size', size: 90 },
  {
    accessorKey: 'QTY_ONHAND',
    header: 'Qty',
    size: 90,
    cell: (info) => <span className="tabular-nums">{formatNumber(info.getValue<number>())}</span>,
  },
  {
    accessorKey: 'AVAILABLE_QTY',
    header: 'Available',
    size: 90,
    cell: (info) => <span className="tabular-nums">{formatNumber(info.getValue<number>())}</span>,
  },
  {
    accessorKey: 'RESERVED_QTY',
    header: 'Reserved',
    size: 90,
    cell: (info) => <span className="tabular-nums">{formatNumber(info.getValue<number>())}</span>,
  },
  {
    accessorKey: 'COST_PR',
    header: 'Cost',
    size: 110,
    cell: (info) => <span className="tabular-nums">{formatCurrency(info.getValue<number>(), false)}</span>,
  },
  {
    accessorKey: 'inventoryValue',
    header: 'Inventory Value',
    size: 140,
    cell: (info) => <span className="tabular-nums">{formatCurrency(info.getValue<number>(), false)}</span>,
  },
  { accessorKey: 'SITE_DES', header: 'Site', size: 160 },
  { accessorKey: 'AREA', header: 'Area', size: 170 },
  { accessorKey: 'DISTRICT', header: 'District', size: 200 },
  { accessorKey: 'CHANNEL', header: 'Channel', size: 150 },
  { accessorKey: 'LOCATION_NO', header: 'Location', size: 120 },
]

const DEFAULT_HIDDEN: VisibilityState = { brand: false, tvSize: false }

export function SkuSearch() {
  const rows = useFilteredRows()
  const [query, setQuery] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(DEFAULT_HIDDEN)
  const scrollRef = useRef<HTMLDivElement>(null)

  const fuse = useMemo(
    () =>
      new Fuse(rows, {
        keys: ['PART_NO', 'PART_DES'],
        threshold: 0.32,
        ignoreLocation: true,
      }),
    [rows],
  )

  const searchedRows = useMemo(() => {
    if (!query.trim()) return rows
    return fuse.search(query).map((r) => r.item)
  }, [query, fuse, rows])

  const table = useReactTable({
    data: searchedRows,
    columns,
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const { rows: tableRows } = table.getRowModel()

  const rowVirtualizer = useVirtualizer({
    count: tableRows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 36,
    overscan: 12,
  })

  const virtualRows = rowVirtualizer.getVirtualItems()
  const totalSize = rowVirtualizer.getTotalSize()
  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0
  const paddingBottom = virtualRows.length > 0 ? totalSize - virtualRows[virtualRows.length - 1].end : 0

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Fuzzy search by SKU or description..."
            className="h-9 w-80 pl-7"
          />
        </div>
        <div className="flex items-center gap-2">
          <p className="text-xs text-muted-foreground">
            {searchedRows.length.toLocaleString()} of {rows.length.toLocaleString()} rows
          </p>
          <ColumnPicker table={table} />
          <Button size="sm" className="gap-1.5" onClick={() => exportSkuReport(searchedRows)}>
            <Download className="h-3.5 w-3.5" />
            Export to Excel
          </Button>
        </div>
      </div>

      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-auto">
          <table className="w-full border-collapse text-xs">
            <thead className="sticky top-0 z-10 bg-secondary">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const sortDir = header.column.getIsSorted()
                    return (
                      <th
                        key={header.id}
                        style={{ width: header.getSize() }}
                        className="cursor-pointer select-none whitespace-nowrap border-b border-border px-3 py-2 text-left font-semibold text-secondary-foreground"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <span className="inline-flex items-center gap-1">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sortDir === 'asc' && <ArrowUp className="h-3 w-3" />}
                          {sortDir === 'desc' && <ArrowDown className="h-3 w-3" />}
                          {!sortDir && <ArrowUpDown className="h-3 w-3 opacity-30" />}
                        </span>
                      </th>
                    )
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {paddingTop > 0 && (
                <tr>
                  <td style={{ height: paddingTop }} colSpan={columns.length} />
                </tr>
              )}
              {virtualRows.map((virtualRow) => {
                const row = tableRows[virtualRow.index]
                return (
                  <tr key={row.id} className="border-b border-border/60 hover:bg-accent/50">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="whitespace-nowrap px-3 py-1.5 text-foreground">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                )
              })}
              {paddingBottom > 0 && (
                <tr>
                  <td style={{ height: paddingBottom }} colSpan={columns.length} />
                </tr>
              )}
              {tableRows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="py-10 text-center text-muted-foreground">
                    No matching SKUs.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function ColumnPicker({ table }: { table: ReturnType<typeof useReactTable<InventoryRow>> }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Columns3 className="h-3.5 w-3.5" />
          Columns
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2">
        <div className="max-h-72 space-y-0.5 overflow-y-auto">
          {table.getAllLeafColumns().map((column) => (
            <label
              key={column.id}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-accent"
            >
              <Checkbox checked={column.getIsVisible()} onCheckedChange={(v) => column.toggleVisibility(!!v)} />
              <span>{typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id}</span>
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
