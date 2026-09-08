import { Suspense, lazy } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useInventoryStore } from '@/store/useInventoryStore'
import { AppShell } from '@/components/layout/AppShell'
import { UploadPage } from '@/pages/UploadPage'
import { ComingSoon } from '@/pages/ComingSoon'
import { NAV_ITEMS } from '@/config/navigation'

// Route-level code splitting: charts (Recharts) and the SKU table
// (TanStack Table/Virtual + Fuse.js) are the heaviest dependencies, so
// their pages load on demand rather than bloating the initial bundle.
const ExecutiveDashboard = lazy(() =>
  import('@/pages/ExecutiveDashboard').then((m) => ({ default: m.ExecutiveDashboard })),
)
const TelevisionIntelligence = lazy(() =>
  import('@/pages/TelevisionIntelligence').then((m) => ({ default: m.TelevisionIntelligence })),
)
const SkuSearch = lazy(() => import('@/pages/SkuSearch').then((m) => ({ default: m.SkuSearch })))

function RouteFallback() {
  return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  )
}

// HashRouter is used deliberately: this app is deployed as a static bundle
// to GitHub Pages (no server-side routing), so hash-based routes
// (#/sku-search) always resolve correctly on refresh/deep-link.
function App() {
  const status = useInventoryStore((s) => s.status)

  if (status !== 'ready') {
    return <UploadPage />
  }

  return (
    <HashRouter>
      <AppShell>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<ExecutiveDashboard />} />
            <Route path="/television" element={<TelevisionIntelligence />} />
            <Route path="/sku-search" element={<SkuSearch />} />
            {NAV_ITEMS.filter((item) => item.status === 'planned').map((item) => (
              <Route key={item.path} path={item.path} element={<ComingSoon title={item.label} />} />
            ))}
          </Routes>
        </Suspense>
      </AppShell>
    </HashRouter>
  )
}

export default App
