/**
 * Product Family configuration.
 *
 * Product family itself comes straight from the data (PROD_FAM / FAM_DES
 * columns) — there is no detection needed there. This file only configures
 * which family(ies) trigger the dedicated Television Intelligence module,
 * so that can be changed (e.g. if Singer renames the family) without
 * touching component code.
 */

/**
 * FAM_DES values (case-insensitive, trimmed) that route rows into the
 * Television Intelligence module. Matches by substring so variants like
 * "Televisions-LED" / "TELEVISIONS - LED" both match.
 */
export const TELEVISION_FAMILY_MATCHERS: string[] = ['TELEVISION']
