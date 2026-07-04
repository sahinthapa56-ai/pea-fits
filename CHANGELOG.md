# Changelog — PEA FITS

## v1.1.0 — 2026-06-28

### 🏗️ Domain Refactor: Gender Removal
The legacy `Gender` enum has been fully removed across the entire stack. PEA FITS is now exclusively a women's fashion store.

- **Schema**: Removed `Gender` enum from Prisma schema; added `brand`, `tags`, `isTrending`, `isBestSeller` fields
- **Types**: Removed `Gender` type from `src/types/index.ts`; cleaned `ProductFilters`
- **API**: All API routes (`/api/products`, `/api/admin/products`, `/api/admin/products/[id]`) stripped of gender query params, filters, and validation
- **Admin UI**: New/edit product forms no longer have gender selector
- **Seed data**: All 9 seed products updated with `brand: "PEA FITS"`, tags, trend/bestseller flags
- **Filter logic**: Public `?gender=` param removed from collection/search endpoints

### 🛡️ Security Hardening
- **CSRF Protection**: Double-submit cookie pattern integrated via `src/lib/csrf.ts` + middleware
  - All state-changing routes (admin, auth, cart, checkout, profile, reviews) now require `X-CSRF-Token` header matching the `csrf-token` cookie
- **Rate Limiting**: Shared utility at `src/lib/rate-limit.ts` applied to:
  - `POST /api/auth/register` — 10 req / 15 min
  - `POST /api/auth/reset-password` — 5 req / 15 min
  - `POST /api/contact` — 5 req / 1 min
  - `POST /api/checkout` — 30 req / 10 min + Origin validation
- **Admin Role Escalation Guard**: Only `SUPER_ADMIN` can now promote users to `ADMIN` or `SUPER_ADMIN`
- **`isArchive` Data Leak Fix**: Public `/api/products` no longer accepts `?isArchive=true` to enumerate inactive products
- **Origin Validation**: Added to checkout endpoint

### 🐛 Critical Bug Fixes
- **Duplicate footer on homepage**: Removed inline "DEVELOPED BY SAHIN THAPA" footer that stacked below the layout's `<Footer />`
- **Broken `/products` links in profile**: Both orders empty state and wishlist empty state linked to non-existent `/products` page — now correctly link to `/collections`
- **Full page reload on bag CTA**: `window.location.href` replaced with `router.push`-compatible `href` prop

### 🧹 Code Cleanup
- **Removed 10 unused components/files**: `Accordion.tsx`, `SEOHead.tsx`, `Tabs.tsx`, `ProductFilters.tsx`, `QuantitySelectorWrapper.tsx`, `RelatedProducts.tsx`, `MobileNav.tsx`, `SearchOverlay.tsx`, `use-scroll-direction.ts`, `use-debounce.ts`
- **Removed 12 unused npm dependencies**: `leaflet`, `react-leaflet`, `recharts`, all 7 `@tiptap/*` packages, `resend`, `@types/leaflet` (saves ~20MB)
- **Added missing dependency**: `clsx` (was transitively resolved, now explicit)
- **Moved Hermes skill artifacts** (`agent/skills/`) out of project root
- Added `/agent/` to `.gitignore`

### 🎨 UI/UX Improvements
- `EmptyState` component now supports `href` prop for Link-based navigation (in addition to `onAction` callback)
- Homepage newsletter section styling refined

### 🏁 Build
- **Zero errors**, compiled in ~11s
- Prisma client regenerated successfully
- All pre-existing warnings only (unused imports, `<img>` tags, `any` types — unchanged by this release)

### 📦 Deployment Checklist
See `DEPLOYMENT_README.md` for full deployment preparation guide.

---

**Full refactor spans**: 35+ files modified, 10 files deleted, 4 new files created, 12 packages removed.
