/**
 * Core domain types for the Singer Inventory Intelligence Platform.
 *
 * The canonical row shape mirrors the Singer Stock-On-Hand (SOH) export
 * columns exactly. Everything downstream (analytics, filtering, detection)
 * is built on top of this single interface.
 */

/** The 17 columns expected in a Singer SOH export, in their canonical order. */
export const REQUIRED_COLUMNS = [
  'CHANNEL',
  'AREA',
  'DISTRICT',
  'CONTRACT',
  'SITE_DES',
  'PART_NO',
  'PART_DES',
  'PROD_FAM',
  'FAM_DES',
  'COMMO',
  'COM_DES',
  'LOCATION_NO',
  'QTY_ONHAND',
  'RESERVED_QTY',
  'AVAILABLE_QTY',
  'COST_PR',
  'VOLUMN',
] as const

export type RequiredColumn = (typeof REQUIRED_COLUMNS)[number]

/** A single raw row exactly as it appears in the uploaded workbook. */
export interface RawInventoryRow {
  CHANNEL: string
  AREA: string
  DISTRICT: string
  CONTRACT: string
  SITE_DES: string
  PART_NO: string
  PART_DES: string
  PROD_FAM: string
  FAM_DES: string
  COMMO: string
  COM_DES: string
  LOCATION_NO: string
  QTY_ONHAND: number
  RESERVED_QTY: number
  AVAILABLE_QTY: number
  COST_PR: number
  VOLUMN: number | null
}

/** A raw row enriched with derived analytics fields computed once at load time. */
export interface InventoryRow extends RawInventoryRow {
  /** Stable synthetic row id, used as a React/table key. */
  _id: number
  /** QTY_ONHAND * COST_PR */
  inventoryValue: number
  /** Detected TV brand (only meaningful when isTelevision is true). */
  brand: string
  /** Detected TV screen size, e.g. `"43\""`, or "Unknown". */
  tvSize: string
  /** True when FAM_DES matches the configured television family rule(s). */
  isTelevision: boolean
  /** Normalized (trimmed, upper-cased) LOCATION_NO, used for special KPI matching. */
  locationKey: string
  /** Normalized (trimmed, upper-cased) CHANNEL, used for special KPI matching. */
  channelKey: string
}

export interface ColumnWarning {
  column: string
  message: string
}

export interface LoadedFileMeta {
  fileName: string
  loadedDate: string
  totalRecords: number
  sheetName: string
  warnings: ColumnWarning[]
}

/** Keys the Global Filter Bar and drill-down pages operate on. */
export type FilterKey =
  | 'family'
  | 'brand'
  | 'tvSize'
  | 'area'
  | 'district'
  | 'channel'
  | 'site'
  | 'location'
  | 'sku'

export interface InventoryFilters {
  family: string[]
  brand: string[]
  tvSize: string[]
  area: string[]
  district: string[]
  channel: string[]
  site: string[]
  location: string[]
  sku: string[]
  search: string
}

export const EMPTY_FILTERS: InventoryFilters = {
  family: [],
  brand: [],
  tvSize: [],
  area: [],
  district: [],
  channel: [],
  site: [],
  location: [],
  sku: [],
  search: '',
}
