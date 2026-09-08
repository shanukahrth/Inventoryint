/**
 * TV Size Detection Engine — configuration.
 *
 * Singer TV model numbers encode the screen size as digits immediately
 * after the brand prefix (e.g. "SLE43E940" → Singer, 43"). We never parse
 * free-text descriptions for size; we extract it from the model number
 * itself. See src/lib/detection/tvSizeDetection.ts for the algorithm.
 */

/** Recognised screen sizes, in inches. Anything else resolves to "Unknown". */
export const KNOWN_TV_SIZES: number[] = [
  24, 32, 40, 43, 50, 55, 58, 60, 65, 70, 75, 77, 82, 85, 86, 98, 100,
]

export const UNKNOWN_TV_SIZE = 'Unknown'

export function formatTvSize(size: number): string {
  return `${size}"`
}
