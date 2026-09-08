import { KNOWN_TV_SIZES, UNKNOWN_TV_SIZE, formatTvSize } from '@/config/tvSizeRules'
import { ROUTING_PREFIXES_TO_STRIP } from '@/config/brandRules'

const KNOWN_SIZE_SET = new Set(KNOWN_TV_SIZES)
const DIGIT_RUN = /\d+/g

function stripRoutingPrefixes(sku: string): string {
  let result = sku
  let iterations = 0
  while (iterations < 3) {
    const match = ROUTING_PREFIXES_TO_STRIP.find((p) => result.startsWith(p))
    if (!match) break
    result = result.slice(match.length)
    iterations++
  }
  return result
}

/**
 * Given a digit run (e.g. "32", "670", "9500"), return the known TV size it
 * encodes, if any. Singer sizes are always 2-3 digits, so for longer runs
 * we only try the leading 2 and 3 digit substrings — this is what lets
 * "32E950" match on "32" rather than failing because "32950" isn't a size.
 */
function resolveSizeFromRun(run: string): number | null {
  if (run.length <= 3) {
    const asNumber = Number(run)
    if (KNOWN_SIZE_SET.has(asNumber)) return asNumber
    return null
  }
  const first2 = Number(run.slice(0, 2))
  if (KNOWN_SIZE_SET.has(first2)) return first2
  const first3 = Number(run.slice(0, 3))
  if (KNOWN_SIZE_SET.has(first3)) return first3
  return null
}

/**
 * Extract the first valid recognised TV size from a model number, scanning
 * left to right through its digit runs. This is how Singer model numbers
 * encode size (e.g. "SLE43E940" → 43", "KD55X80K" → 55").
 */
function extractSize(value: string): number | null {
  const matches = value.toUpperCase().match(DIGIT_RUN)
  if (!matches) return null
  for (const run of matches) {
    const size = resolveSizeFromRun(run)
    if (size !== null) return size
  }
  return null
}

/**
 * Detect TV screen size, preferring the model number (PART_NO). Falls back
 * to scanning PART_DES the same way when PART_NO yields nothing, which
 * keeps unmapped/"Other" brand SKUs from all collapsing into "Unknown".
 */
export function detectTvSize(partNo: string, partDes: string): string {
  const cleanedSku = stripRoutingPrefixes((partNo ?? '').trim().toUpperCase())
  const fromSku = extractSize(cleanedSku)
  if (fromSku !== null) return formatTvSize(fromSku)

  const fromDescription = extractSize((partDes ?? '').trim())
  if (fromDescription !== null) return formatTvSize(fromDescription)

  return UNKNOWN_TV_SIZE
}
