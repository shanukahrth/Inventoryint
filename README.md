# Singer Inventory Intelligence Platform

A browser-only inventory analytics platform for Singer Stock-On-Hand (SOH) exports. Upload an `.xlsx`/`.xls`
report and instantly get an interactive, filterable dashboard across channels, areas, districts, sites,
locations and SKUs — with a dedicated Television Intelligence module (brand & screen-size detection from
model numbers) and a fast, exportable SKU search.

**Your data never leaves your browser.** There is no backend, no database and no upload endpoint — the
workbook is parsed and analyzed entirely client-side with [SheetJS](https://sheetjs.com/), and the app is
designed to be hosted as a static site (GitHub Pages).

## Status: MVP (release 1)

This is the first release, built to be genuinely production-quality rather than a wide, shallow prototype.
It fully implements:

- **Excel upload & parsing** — drag/drop or browse, `.xlsx`/`.xls`, column validation with non-blocking
  warnings, file metadata display.
- **Executive Summary dashboard** — all 11 top-level KPIs, the four always-on Special Business Segment cards
  (Service Centre, Reverts, Revert Close, Revert Close-UR), Channel/Area distribution charts, Top 20
  Locations/SKUs/Product Families, and an auto-generated AI Insights panel.
- **Television Intelligence module** — brand detection and screen-size detection engines (configurable, not
  hardcoded — see below), brand/size distribution charts, a Brand × Size heat matrix, and Top Models/SKUs/Locations.
- **SKU Search** — Fuse.js fuzzy search over SKU/description, a virtualized table (handles 100k+ rows without
  lag), sortable columns, column show/hide, and one-click Excel export.
- **Global Filter Bar** — Product Family, Brand, TV Size, Area, District, Channel, Site, Location, SKU and
  free-text search, shared across every implemented page, with click-to-filter from charts.

The sidebar also lists the remaining modules from the full specification (Product Families drill-down,
Location/Area/District/Channel Analysis, Heat Maps, Inventory Intelligence, Reports, Settings) marked
**"Soon"** — their routes exist and render a placeholder today. The Excel Parser, Analytics/Filtering
Engine, and Brand/TV-Size Detection Engines they'll need are already built and shared, so wiring each one up
is UI work, not a new data layer. See [Roadmap](#roadmap).

## Tech stack

React 19 · TypeScript · Vite 8 · Tailwind CSS v4 · Radix UI primitives (shadcn/ui-style components) ·
Zustand · TanStack Table v8 + TanStack Virtual · Recharts · SheetJS (`xlsx`) · Fuse.js · React Router ·
Lucide Icons.

## Getting started

Requires Node.js 20+.

```bash
npm install
npm run dev        # start the dev server (http://localhost:5173)
```

### Build for production

```bash
npm run build       # type-checks with tsc, then builds to dist/
npm run preview      # serve the production build locally to sanity-check it
```

## Deploying to GitHub Pages

The build is configured with a relative base path (`base: './'` in `vite.config.ts`), so it works out of the
box whether it's served from the domain root or a GitHub Pages *project* URL like
`https://<your-username>.github.io/<repo-name>/` — no extra configuration needed. Routing uses a
`HashRouter` for the same reason: GitHub Pages has no server-side rewrite rules, so hash-based routes
(`#/sku-search`) always resolve correctly on refresh or a direct link.

### Option A — GitHub Actions (recommended)

This repo already includes `.github/workflows/deploy.yml`, which builds and deploys to Pages automatically
on every push to `main`.

1. Push this project to a new GitHub repository.
2. In the repo, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Push to `main` (or run the workflow manually from the **Actions** tab). The site will be published at
   `https://<your-username>.github.io/<repo-name>/`.

### Option B — Manual deploy

```bash
npm run build
npx gh-pages -d dist
```

Then enable Pages in **Settings → Pages** with the `gh-pages` branch as the source.

## Uploading a report

The app expects these 17 columns (case-insensitive header matching, so minor spacing differences are
tolerated):

```
CHANNEL, AREA, DISTRICT, CONTRACT, SITE_DES, PART_NO, PART_DES, PROD_FAM, FAM_DES,
COMMO, COM_DES, LOCATION_NO, QTY_ONHAND, RESERVED_QTY, AVAILABLE_QTY, COST_PR, VOLUMN
```

If a column is missing, the app still loads — it shows a warning banner listing what wasn't found, and any
figures that depend on that column will show as 0/blank rather than blocking you. Inventory Value is
computed as `QTY_ONHAND × COST_PR`.

## User guide

- **Global Filter Bar** (top of every page): multi-select dropdowns for Product Family, Brand, TV Size,
  Area, District, Channel, Site, Location and SKU, plus a free-text search box. Selections apply instantly
  across every chart and table on the page, and persist as you navigate. Click any bar in a chart, or any row
  in a "Top N" list, to add it as a filter (click again to remove it).
- **Executive Summary**: KPI cards reflect the *current filters*; the four Special Business Segment cards
  (Service Centre, Reverts, Revert Close, Revert Close-UR) are intentionally always computed against the
  full dataset, since these are the numbers management checks daily regardless of what anyone else is
  filtering on elsewhere.
- **Television Analytics**: automatically scoped to rows whose `FAM_DES` matches a television family (see
  `src/config/productFamilyRules.ts`). Brand and screen size are *detected*, not read from a column — see
  below.
- **SKU Search**: the search box here is a separate fuzzy search (SKU/description only) layered on top of
  the Global Filter Bar's selections. Use **Columns** to show/hide fields, click a column header to sort, and
  **Export to Excel** to download exactly what's currently shown (filtered + searched).

## Brand & TV-size detection (configurable, not hardcoded)

Singer SKUs encode brand and screen size in the model number itself (e.g. `SLE43E940` → Singer, 43").
Detection logic lives in `src/lib/detection/` and reads its rules from plain config objects in
`src/config/` — nothing is hardcoded inside components:

- `src/config/brandRules.ts` — the PART_NO prefix → brand table, a fallback PART_DES keyword table, and a
  list of distributor/routing prefixes (`L-`, `K-`, `X-`) that get stripped before matching (so
  `L-SLE32E710` still resolves to Singer).
- `src/config/tvSizeRules.ts` — the list of recognized screen sizes.
- `src/config/productFamilyRules.ts` — which `FAM_DES` values route into the Television module.
- `src/config/specialSegments.ts` — the matching rules for the Service Centre / Reverts / Revert Close /
  Revert Close-UR cards.

Detection order for brand: (1) PART_NO prefix, (2) PART_DES prefix, (3) PART_DES keyword, (4) `"Other"`.
Editing these files and rebuilding is all that's needed to add a new brand or size — no component changes.
A visual Settings page for editing these without touching code (with JSON import/export) is on the roadmap.

## Architecture

```
src/
  config/       Brand/TV-size/product-family/special-segment rules — the editable "settings" layer
  types/        Shared TypeScript interfaces (RawInventoryRow, InventoryRow, filters, …)
  lib/
    excel/      Excel Parser — SheetJS workbook parsing + column validation
    detection/  Brand Detection Engine, TV Size Detection Engine
    analytics/  Aggregation, KPI, filtering and AI Insights engines
    export/     Export Engine — SheetJS-based Excel export, reusable across pages
  store/        Zustand store (raw data, file metadata, active filters)
  hooks/        useFilteredRows / useFilterOptions — memoized selectors over the store
  components/
    ui/         Small Radix-based primitives (button, card, tabs, popover, checkbox…)
    layout/     Sidebar, top bar, app shell
    filters/    Global Filter Bar + multi-select filter widget
    dashboard/  KPI cards, special-segment cards, AI insights panel
    charts/     Reusable chart primitives (ranked bar list, dimension bar chart, heat matrix)
  pages/        One file per route
```

This separation (Parser / Detection Engines / Analytics Engine / Filtering Engine / Export Engine, each
independent of the UI) is deliberate: every "coming soon" page in the sidebar can be built by composing
these same modules with new chart layouts, without touching the data layer.

## Roadmap

The following pages from the full specification have routes and sidebar entries already in place, ready to
be built out on top of the existing analytics/filtering/detection engines: Product Families drill-down,
Location Analysis, Area Analysis, District Analysis, Channel Analysis, Heat Maps (Location × Product
Family), Inventory Intelligence (duplicate/dead-stock/anomaly detection), Reports (multi-report Excel
export), and Settings (visual editor + JSON import/export for the config files above).

## Known limitations

- Performance has been validated up to ~15k rows in this environment; the virtualized table and memoized
  aggregations are built to scale to 100k+ rows, but if you load a much larger workbook and notice slowness,
  the first place to look is the aggregation calls in `src/pages/*.tsx` (they can be moved into a Web Worker
  without changing their signatures).
- Brand/size detection is calibrated against the sample SOH export used to build this app; if you see more
  than a handful of SKUs falling into brand `"Other"`, add the missing prefix(es) to
  `src/config/brandRules.ts`.
