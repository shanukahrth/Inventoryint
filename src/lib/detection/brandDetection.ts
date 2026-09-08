import {
  BRAND_PREFIXES,
  DESCRIPTION_KEYWORDS,
  ROUTING_PREFIXES_TO_STRIP,
  UNKNOWN_BRAND,
  type BrandPrefixRule,
} from '@/config/brandRules'

const sortedPrefixes = (rules: BrandPrefixRule[]) =>
  [...rules].sort((a, b) => b.prefix.length - a.prefix.length)

const brandPrefixesSorted = sortedPrefixes(BRAND_PREFIXES)
const descriptionKeywordsSorted = sortedPrefixes(DESCRIPTION_KEYWORDS)

/** Strip known distributor/routing prefixes (e.g. "L-", "K-") off the front of a SKU. */
function stripRoutingPrefixes(sku: string): string {
  let result = sku
  let iterations = 0
  // Allow a couple of stacked prefixes, but never loop forever on bad config.
  while (iterations < 3) {
    const match = ROUTING_PREFIXES_TO_STRIP.find((p) => result.startsWith(p))
    if (!match) break
    result = result.slice(match.length)
    iterations++
  }
  return result
}

function matchPrefix(value: string, rules: BrandPrefixRule[]): string | null {
  for (const rule of rules) {
    if (value.startsWith(rule.prefix)) return rule.brand
  }
  return null
}

function matchKeyword(value: string, rules: BrandPrefixRule[]): string | null {
  for (const rule of rules) {
    if (value.includes(rule.prefix)) return rule.brand
  }
  return null
}

/**
 * Detect the TV brand for a row using, in order:
 *   1. PART_NO prefix (after stripping routing prefixes like "L-"/"K-")
 *   2. PART_DES prefix
 *   3. PART_DES keyword match (configurable mapping)
 *   4. "Other"
 */
export function detectBrand(partNo: string, partDes: string): string {
  const sku = (partNo ?? '').trim().toUpperCase()
  const des = (partDes ?? '').trim().toUpperCase()

  const cleanedSku = stripRoutingPrefixes(sku)
  const bySkuPrefix = matchPrefix(cleanedSku, brandPrefixesSorted)
  if (bySkuPrefix) return bySkuPrefix

  const byDesPrefix = matchPrefix(des, descriptionKeywordsSorted)
  if (byDesPrefix) return byDesPrefix

  const byDesKeyword = matchKeyword(des, descriptionKeywordsSorted)
  if (byDesKeyword) return byDesKeyword

  return UNKNOWN_BRAND
}
