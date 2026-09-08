/**
 * Recharts, by default, wraps long category tick labels onto multiple
 * lines that then overlap the row above/below. This renders a single
 * line, truncated with an ellipsis to fit the axis width, with the full
 * value available on hover via a native SVG <title>.
 */
export function TruncatedYAxisTick(props: {
  x?: number
  y?: number
  payload?: { value?: string }
  width?: number
}) {
  const { x = 0, y = 0, payload, width = 110 } = props
  const value = payload?.value ?? ''
  const maxChars = Math.max(6, Math.floor(width / 6.2))
  const truncated = value.length > maxChars ? `${value.slice(0, maxChars - 1)}…` : value

  return (
    <text x={x} y={y} dy={3} textAnchor="end" fontSize={11} fill="var(--color-chart-muted)">
      <title>{value}</title>
      {truncated}
    </text>
  )
}
