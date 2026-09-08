/**
 * Configuration for the "Special Business KPI Cards" that management
 * monitors daily, independent of whatever global filters are active:
 * Service Centre, REVERTS, REVERT CLOSE and REVERT CLOSE-UR.
 *
 * Matching is done on a normalized (trimmed, upper-cased, collapsed
 * whitespace) copy of CHANNEL / LOCATION_NO, because real exports are
 * inconsistent about spacing (e.g. "REVERTCLOSE" vs "REVERT CLOSE").
 */

export interface SpecialSegmentRule {
  id: string
  label: string
  description: string
  field: 'channelKey' | 'locationKey'
  /** Normalized values (see normalizeKey in src/lib/utils.ts) that match this segment. */
  matchValues: string[]
  tone: 'warning' | 'info'
}

export const SPECIAL_SEGMENTS: SpecialSegmentRule[] = [
  {
    id: 'service-centre',
    label: 'Service Centre',
    description: 'Stock held at Service Centre channel locations.',
    field: 'channelKey',
    matchValues: ['SERVICE CENTRE'],
    tone: 'info',
  },
  {
    id: 'reverts',
    label: 'Reverts',
    description: 'Stock sitting in REVERTS locations, monitored daily.',
    field: 'locationKey',
    matchValues: ['REVERTS'],
    tone: 'warning',
  },
  {
    id: 'revert-close',
    label: 'Revert Close',
    description: 'Stock sitting in REVERT CLOSE locations, monitored daily.',
    field: 'locationKey',
    matchValues: ['REVERT CLOSE', 'REVERTCLOSE'],
    tone: 'warning',
  },
  {
    id: 'revert-close-ur',
    label: 'Revert Close-UR',
    description: 'Stock sitting in REVERT CLOSE-UR locations, monitored daily.',
    field: 'locationKey',
    matchValues: ['REVERT CLOSE-UR', 'REVERTCLOSE-UR'],
    tone: 'warning',
  },
]
