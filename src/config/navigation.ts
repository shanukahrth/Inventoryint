import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  Layers,
  Tv,
  MapPin,
  Search,
  Map,
  Building2,
  Milestone,
  Grid3x3,
  Sparkles,
  FileSpreadsheet,
  Settings,
} from 'lucide-react'

export interface NavItem {
  label: string
  path: string
  icon: LucideIcon
  /** Pages fully implemented in this release vs. placeholders slated for the next iteration. */
  status: 'ready' | 'planned'
  group: 'Overview' | 'Analytics' | 'Tools' | 'System'
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Executive Summary', path: '/', icon: LayoutDashboard, status: 'ready', group: 'Overview' },
  { label: 'Product Families', path: '/product-families', icon: Layers, status: 'planned', group: 'Analytics' },
  { label: 'Television Analytics', path: '/television', icon: Tv, status: 'ready', group: 'Analytics' },
  { label: 'Location Analysis', path: '/locations', icon: MapPin, status: 'planned', group: 'Analytics' },
  { label: 'Area Analysis', path: '/areas', icon: Map, status: 'planned', group: 'Analytics' },
  { label: 'District Analysis', path: '/districts', icon: Building2, status: 'planned', group: 'Analytics' },
  { label: 'Channel Analysis', path: '/channels', icon: Milestone, status: 'planned', group: 'Analytics' },
  { label: 'Heat Maps', path: '/heat-maps', icon: Grid3x3, status: 'planned', group: 'Analytics' },
  { label: 'SKU Search', path: '/sku-search', icon: Search, status: 'ready', group: 'Tools' },
  { label: 'Inventory Intelligence', path: '/intelligence', icon: Sparkles, status: 'planned', group: 'Tools' },
  { label: 'Reports', path: '/reports', icon: FileSpreadsheet, status: 'planned', group: 'Tools' },
  { label: 'Settings', path: '/settings', icon: Settings, status: 'planned', group: 'System' },
]

export const NAV_GROUPS: NavItem['group'][] = ['Overview', 'Analytics', 'Tools', 'System']
