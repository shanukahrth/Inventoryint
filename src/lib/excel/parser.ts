import * as XLSX from 'xlsx'
import { REQUIRED_COLUMNS, type ColumnWarning, type RawInventoryRow } from '@/types/inventory'

export interface ParseResult {
  rows: RawInventoryRow[]
  sheetName: string
  warnings: ColumnWarning[]
}

const NUMERIC_COLUMNS = ['QTY_ONHAND', 'RESERVED_QTY', 'AVAILABLE_QTY', 'COST_PR', 'VOLUMN'] as const

function toNumber(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  if (value == null || value === '') return 0
  const parsed = Number(String(value).replace(/,/g, '').trim())
  return Number.isFinite(parsed) ? parsed : 0
}

function toText(value: unknown): string {
  if (value == null) return ''
  return String(value).trim()
}

/** Picks the sheet whose header row overlaps REQUIRED_COLUMNS the most; falls back to the first sheet. */
function pickBestSheet(workbook: XLSX.WorkBook): string {
  let bestSheet = workbook.SheetNames[0]
  let bestScore = -1
  for (const name of workbook.SheetNames) {
    const sheet = workbook.Sheets[name]
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, range: 0 })
    const header = rows[0] ?? []
    const headerSet = new Set(header.map((h) => toText(h).toUpperCase()))
    const score = REQUIRED_COLUMNS.filter((c) => headerSet.has(c)).length
    if (score > bestScore) {
      bestScore = score
      bestSheet = name
    }
  }
  return bestSheet
}

/**
 * Parses a Singer SOH workbook entirely in-browser (or in-memory here, in
 * Node, for build-time tooling) using SheetJS. The file is never uploaded
 * anywhere — this function only ever touches the ArrayBuffer it's given.
 */
export async function parseInventoryWorkbook(file: File | ArrayBuffer): Promise<ParseResult> {
  const buffer = file instanceof File ? await file.arrayBuffer() : file
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: false })

  if (workbook.SheetNames.length === 0) {
    throw new Error('This workbook has no sheets.')
  }

  const sheetName = pickBestSheet(workbook)
  const sheet = workbook.Sheets[sheetName]
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null, raw: true })

  const headerKeys = raw.length > 0 ? Object.keys(raw[0]) : []
  const headerSet = new Set(headerKeys.map((h) => h.toUpperCase().trim()))

  const warnings: ColumnWarning[] = []
  for (const column of REQUIRED_COLUMNS) {
    if (!headerSet.has(column)) {
      warnings.push({
        column,
        message: `Column "${column}" was not found in sheet "${sheetName}". Related figures will show as 0/blank.`,
      })
    }
  }

  // Build a lookup from canonical column name -> actual header key present in the file,
  // so we tolerate stray whitespace/case differences without silently dropping data.
  const resolvedKey = new Map<string, string>()
  for (const column of REQUIRED_COLUMNS) {
    const match = headerKeys.find((h) => h.toUpperCase().trim() === column)
    if (match) resolvedKey.set(column, match)
  }

  const rows: RawInventoryRow[] = raw.map((record) => {
    const get = (col: (typeof REQUIRED_COLUMNS)[number]) => {
      const key = resolvedKey.get(col)
      return key ? record[key] : undefined
    }
    const row: RawInventoryRow = {
      CHANNEL: toText(get('CHANNEL')),
      AREA: toText(get('AREA')),
      DISTRICT: toText(get('DISTRICT')),
      CONTRACT: toText(get('CONTRACT')),
      SITE_DES: toText(get('SITE_DES')),
      PART_NO: toText(get('PART_NO')),
      PART_DES: toText(get('PART_DES')),
      PROD_FAM: toText(get('PROD_FAM')),
      FAM_DES: toText(get('FAM_DES')),
      COMMO: toText(get('COMMO')),
      COM_DES: toText(get('COM_DES')),
      LOCATION_NO: toText(get('LOCATION_NO')),
      QTY_ONHAND: toNumber(get('QTY_ONHAND')),
      RESERVED_QTY: toNumber(get('RESERVED_QTY')),
      AVAILABLE_QTY: toNumber(get('AVAILABLE_QTY')),
      COST_PR: toNumber(get('COST_PR')),
      VOLUMN: get('VOLUMN') == null || get('VOLUMN') === '' ? null : toNumber(get('VOLUMN')),
    }
    return row
  })

  // Filter fully-blank trailing rows (common in exports with a footer/blank row).
  const cleanedRows = rows.filter((r) => r.PART_NO !== '' || r.PART_DES !== '')

  if (NUMERIC_COLUMNS.every((c) => !resolvedKey.has(c))) {
    warnings.push({
      column: 'QTY_ONHAND/COST_PR',
      message: 'No numeric inventory columns were found — KPI totals will be zero.',
    })
  }

  return { rows: cleanedRows, sheetName, warnings }
}
