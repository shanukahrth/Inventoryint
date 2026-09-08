import * as XLSX from 'xlsx'
import type { InventoryRow } from '@/types/inventory'

/** Generic export: any array of plain objects becomes one worksheet. Runs entirely client-side. */
export function exportToExcel(
  rows: Record<string, unknown>[],
  filename: string,
  sheetName = 'Sheet1',
): void {
  const worksheet = XLSX.utils.json_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  XLSX.writeFile(workbook, filename, { compression: true })
}

export interface SkuReportRow {
  SKU: string
  Description: string
  'Product Family': string
  Brand: string
  'TV Size': string
  Qty: number
  'Available Qty': number
  'Reserved Qty': number
  Cost: number
  'Inventory Value': number
  Site: string
  Area: string
  District: string
  Channel: string
  Location: string
}

export function toSkuReportRows(rows: InventoryRow[]): SkuReportRow[] {
  return rows.map((r) => ({
    SKU: r.PART_NO,
    Description: r.PART_DES,
    'Product Family': r.FAM_DES,
    Brand: r.brand,
    'TV Size': r.tvSize,
    Qty: r.QTY_ONHAND,
    'Available Qty': r.AVAILABLE_QTY,
    'Reserved Qty': r.RESERVED_QTY,
    Cost: r.COST_PR,
    'Inventory Value': r.inventoryValue,
    Site: r.SITE_DES,
    Area: r.AREA,
    District: r.DISTRICT,
    Channel: r.CHANNEL,
    Location: r.LOCATION_NO,
  }))
}

function timestamp(): string {
  return new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
}

export function exportSkuReport(rows: InventoryRow[]): void {
  exportToExcel(
    toSkuReportRows(rows) as unknown as Record<string, unknown>[],
    `singer-sku-report-${timestamp()}.xlsx`,
    'SKU Report',
  )
}

export function exportExecutiveSummary(summaryRows: Record<string, unknown>[]): void {
  exportToExcel(summaryRows, `singer-executive-summary-${timestamp()}.xlsx`, 'Executive Summary')
}
