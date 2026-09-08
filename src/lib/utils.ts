import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Trim + collapse internal whitespace + upper-case, for stable key matching. */
export function normalizeKey(value: string | null | undefined): string {
  return (value ?? '').replace(/\s+/g, ' ').trim().toUpperCase()
}

const compactNumber = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
})
const plainNumber = new Intl.NumberFormat('en-US')
const currencyCompact = new Intl.NumberFormat('en-LK', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

export function formatNumber(value: number): string {
  return plainNumber.format(Math.round(value))
}

export function formatCompactNumber(value: number): string {
  return compactNumber.format(value)
}

export function formatCurrency(value: number, compact = true): string {
  const prefix = 'LKR '
  if (compact) return `${prefix}${currencyCompact.format(value)}`
  return `${prefix}${plainNumber.format(Math.round(value))}`
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`
}

export function safeDiv(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : numerator / denominator
}
