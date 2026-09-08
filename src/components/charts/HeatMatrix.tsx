import { useMemo } from 'react'
import { formatCompactNumber } from '@/lib/utils'

interface HeatMatrixProps {
  rowLabels: string[]
  colLabels: string[]
  /** value for a given (row, col) pair; 0/undefined renders as an empty cell. */
  getValue: (row: string, col: string) => number
  onCellClick?: (row: string, col: string) => void
  valueLabel?: string
}

/**
 * A generic row × column intensity matrix — sequential-hue, single color,
 * light→dark by magnitude (per the color formula: sequential = one hue).
 * Used for the Brand × Size matrix here and reusable as-is for the
 * Heat Maps module (Location × Product Family).
 */
export function HeatMatrix({ rowLabels, colLabels, getValue, onCellClick, valueLabel = 'Qty' }: HeatMatrixProps) {
  const max = useMemo(() => {
    let m = 0
    for (const r of rowLabels) for (const c of colLabels) m = Math.max(m, getValue(r, c) || 0)
    return m || 1
  }, [rowLabels, colLabels, getValue])

  return (
    <div className="overflow-auto">
      <table className="w-full border-separate border-spacing-1 text-[11px]">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-card px-2 py-1 text-left font-medium text-muted-foreground">
              {valueLabel}
            </th>
            {colLabels.map((c) => (
              <th key={c} className="min-w-[64px] px-2 py-1 text-center font-medium text-muted-foreground">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rowLabels.map((r) => (
            <tr key={r}>
              <th className="sticky left-0 z-10 whitespace-nowrap bg-card px-2 py-1 text-left font-medium text-foreground">
                {r}
              </th>
              {colLabels.map((c) => {
                const value = getValue(r, c) || 0
                const intensity = Math.min(value / max, 1)
                const bg = `color-mix(in oklab, var(--color-chart-1) ${Math.round(intensity * 90 + (value > 0 ? 8 : 0))}%, var(--color-card))`
                const textLight = intensity > 0.55
                return (
                  <td
                    key={c}
                    onClick={() => value > 0 && onCellClick?.(r, c)}
                    title={`${r} · ${c}: ${value.toLocaleString()}`}
                    className={`rounded-md px-2 py-1.5 text-center tabular-nums transition-transform ${
                      value > 0 && onCellClick ? 'cursor-pointer hover:scale-[1.04]' : ''
                    } ${textLight ? 'text-white' : 'text-foreground'}`}
                    style={{ background: value > 0 ? bg : 'var(--color-muted)' }}
                  >
                    {value > 0 ? formatCompactNumber(value) : '—'}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
