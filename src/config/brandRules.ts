/**
 * Brand Detection Engine — configuration.
 *
 * Singer inventory does NOT encode brand as free text. Brand is inferred
 * from the SKU (PART_NO) model-prefix convention. This file is the single
 * source of truth for that mapping so it can be maintained without touching
 * component code, and can eventually be exported/imported as JSON from the
 * Settings module.
 *
 * Detection order (see src/lib/detection/brandDetection.ts):
 *   1. PART_NO prefix match (this file's `brandPrefixes`)
 *   2. PART_DES prefix / keyword match (this file's `descriptionKeywords`)
 *   3. Configurable keyword mapping (also `descriptionKeywords`)
 *   4. Otherwise "Other"
 */

export interface BrandPrefixRule {
  /** Model-number prefix, matched case-insensitively against PART_NO. */
  prefix: string
  brand: string
}

/**
 * Distributor / warehouse routing prefixes seen in real Singer exports
 * (e.g. "L-SLE32E710", "K-55S30") that sit in FRONT of the actual model
 * prefix. These are stripped before matching `brandPrefixes` so
 * "L-SLE32E710" still resolves to Singer via "SLE".
 *
 * Longest prefixes are tried first, and stripping is applied repeatedly
 * (in case more than one such prefix is stacked) up to a small limit.
 */
export const ROUTING_PREFIXES_TO_STRIP: string[] = ['L-', 'X-', 'K-']

/**
 * Brand prefix → brand name. Matched against PART_NO after stripping any
 * routing prefixes above. Order does not matter here; matching always
 * tries the longest prefix first so e.g. "KDL" is preferred over "K".
 */
export const BRAND_PREFIXES: BrandPrefixRule[] = [
  { prefix: 'SLE', brand: 'Singer' },
  { prefix: 'ULED', brand: 'UNIC' },
  { prefix: 'SKY', brand: 'Skyworth' },
  { prefix: 'TCL', brand: 'TCL' },
  { prefix: 'PN', brand: 'Panasonic' },
  { prefix: 'KD', brand: 'Sony' },
  { prefix: 'XR', brand: 'Sony' },
  { prefix: 'KLV', brand: 'Sony' },
  { prefix: 'KDL', brand: 'Sony' },
  { prefix: 'SMG', brand: 'Samsung' },
  { prefix: 'NK', brand: 'Nikai' },
  { prefix: 'H-', brand: 'Hisense' },
  // Additional prefixes observed in real Singer SOH exports, added so the
  // "Other" bucket stays small. Safe to remove/edit — this is config, not code.
  { prefix: 'SHPLC', brand: 'Sharp' },
  { prefix: 'SHP', brand: 'Sharp' },
]

/**
 * Fallback keyword mapping, checked against PART_DES when the PART_NO
 * prefix does not resolve. Case-insensitive substring match.
 */
export const DESCRIPTION_KEYWORDS: BrandPrefixRule[] = [
  { prefix: 'SINGER', brand: 'Singer' },
  { prefix: 'UNIC', brand: 'UNIC' },
  { prefix: 'SKYWORTH', brand: 'Skyworth' },
  { prefix: 'TCL', brand: 'TCL' },
  { prefix: 'PANASONIC', brand: 'Panasonic' },
  { prefix: 'SONY', brand: 'Sony' },
  { prefix: 'SAMSUNG', brand: 'Samsung' },
  { prefix: 'NIKAI', brand: 'Nikai' },
  { prefix: 'HISENSE', brand: 'Hisense' },
  { prefix: 'SHARP', brand: 'Sharp' },
]

export const UNKNOWN_BRAND = 'Other'
