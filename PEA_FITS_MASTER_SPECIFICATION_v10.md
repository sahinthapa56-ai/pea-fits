# PEA FITS — Production Master Specification v10

> **Complete Engineering Specification (32 Chapters, ~45,000 words)**
>
> Build PEA FITS into an enterprise-grade, production-ready e-commerce platform.
>
> **Target:** Personalised (women-only) fashion e-commerce for Nepal — Next.js 15, Prisma/PostgreSQL, Stripe/Khalti, Supabase, Resend, Upstash Redis.
>
> **Status:** Build ✅ | Tests 91/99 ✅ | TypeScript: fix in progress | CI/CD: not yet | Deployed: not yet

---

## Table of Contents

| # | Chapter | # | Chapter |
|---|---------|---|---------|
| 01 | [AI Operating System](#01--ai-operating-system) | 17 | [Accessibility](#17--accessibility) |
| 02 | [Engineering Constitution](#02--engineering-constitution) | 18 | [UI/UX Standards](#18--uiux-standards) |
| 03 | [Repository Audit](#03--repository-audit) | 19 | [Admin Panel](#19--admin-panel) |
| 04 | [System Architecture](#04--system-architecture) | 20 | [Testing](#20--testing) |
| 05 | [Frontend Standards](#05--frontend-standards) | 21 | [CI/CD](#21--cicd) |
| 06 | [Backend Standards](#06--backend-standards) | 22 | [Monitoring](#22--monitoring) |
| 07 | [Database Engineering](#07--database-engineering) | 23 | [Deployment](#23--deployment) |
| 08 | [Prisma Standards](#08--prisma-standards) | 24 | [Disaster Recovery](#24--disaster-recovery) |
| 09 | [Authentication & Authorization](#09--authentication--authorization) | 25 | [Documentation](#25--documentation) |
| 10 | [Security Handbook](#10--security-handbook) | 26 | [Code Review](#26--code-review) |
| 11 | [Payment Architecture](#11--payment-architecture) | 27 | [Refactoring](#27--refactoring) |
| 12 | [Supabase & Storage](#12--supabase--storage) | 28 | [Edge Cases](#28--edge-cases) |
| 13 | [Email System](#13--email-system) | 29 | [AI Coding Rules](#29--ai-coding-rules) |
| 14 | [Redis & Caching](#14--redis--caching) | 30 | [Production Checklist](#30--production-checklist) |
| 15 | [Performance Engineering](#15--performance-engineering) | 31 | [Acceptance Criteria](#31--acceptance-criteria) |
| 16 | [SEO](#16--seo) | 32 | [Final Master Prompt](#32--final-master-prompt) |

---

## 01 — AI Operating System

### Purpose
Define how AI coding agents operate on this codebase — the meta-layer that governs all automation.

### Core Principles

1. **Autonomous Execution** — The agent acts as Lead Principal Engineer. It does NOT ask permission. It audits, decides, implements, validates, and iterates without human intervention for every implementable task.

2. **Continuous Loop**
   ```
   while (true) {
     Audit();                      // Scan for issues
     Prioritize();                 // Rank by impact × urgency
     Implement();                  // Fix, refactor, add, delete
     Validate();                   // lint → typecheck → test → build
     if (quality_gates_pass()) break;
     FixFailures();
   }
   ```

3. **Quality Gates (ALL must pass before declaring a phase complete)**
   - [ ] TypeScript: `tsc --noEmit` — zero errors
   - [ ] ESLint: `next lint` — zero errors (warnings minimized)
   - [ ] Build: `npm run build` — exits 0
   - [ ] Tests: `npx vitest run` — 100% pass rate
   - [ ] Prisma: `npx prisma validate` — zero warnings
   - [ ] Auth flow: register → login → protected route → logout
   - [ ] Authorization: admin routes blocked for non-admins
   - [ ] Checkout flow: create order → payment → webhook → status update

4. **Never-Fail Rules**
   - NO placeholder code, fake implementations, TODOs, FIXMEs, console.log debugging, partial implementations, or unfinished systems.
   - NO skipping issues. If 500 issues exist, fix all 500.
   - After every significant change: lint → typecheck → test → build. Fix every issue before proceeding.
   - Leave every file better than you found it. Zero technical debt introduction.
   - NO `as any`, `@ts-ignore`, `@ts-expect-error`, or unsafe casts. Fix root causes.

5. **Stop Conditions (only these)**
   - ✅ Application is deployed and verified in production.
   - ✅ A manual action is required that cannot be automated: creating cloud accounts, providing credentials, DNS changes, clicking dashboard buttons, legal/approval steps.
   
   When blocked by manual steps: output a numbered checklist of exact actions needed with clear instructions. Then wait.

### Agent Tooling Rules
- Read files with `read_file`, not cat/head/tail
- Search files with `search_files`, not grep/rg
- Find files with `search_files(target='files')`, not ls
- Edit files with `patch` (prefer mode='replace' for unique match), then `write_file` for new files or major rewrites
- Validate with `terminal`, not by guessing
- Run the build after every cluster of changes before claiming completion

---

## 02 — Engineering Constitution

### The 12 Immutable Laws

**Law 1: Zero Tolerance for Errors**
No TypeScript error, ESLint error, test failure, or build warning shall remain unfixed.

**Law 2: Every Line Must Earn Its Keep**
No dead code, commented-out code, unused imports, unreachable branches, or empty handlers. If it's in the repo, it runs and it matters.

**Law 3: Types Are Contracts**
`strict: true` in tsconfig. No `any`. No `@ts-*` pragmas. Prefer `interface` for objects, `type` for unions/intersections. Use `satisfies` for type validation without widening.

**Law 4: Validation at the Boundary**
Every external input (API request, form submission, URL parameter, file upload, webhook payload) must be validated with Zod before use. No exceptions.

**Law 5: One Source of Truth**
No duplicated configuration. No hardcoded values that should be constants. No scattered business logic. Centralize in `src/lib/`, `src/lib/constants.ts`, Prisma models, and env vars.

**Law 6: Security Is Not Optional**
CSP headers, CSRF tokens, rate limiting, input sanitization, webhook signature verification, parameterized queries, HTTPS, HttpOnly cookies, proper CORS. Every layer.

**Law 7: Test Everything That Can Break**
Unit test utilities. Integration test API routes. E2E test user journeys. Accessibility test every page. Mock external services, test error paths.

**Law 8: The User Never Sees an Error Screen**
Error boundaries at every route segment. Loading skeletons. Empty states. Toast notifications. Graceful degradation. Custom 404 and 500 pages.

**Law 9: Performance Is a Feature**
Lighthouse 100/100/100/100. LCP < 2.5s. CLS < 0.1. INP < 200ms. Server Components by default. Code splitting. Image optimization. Bundle budgets.

**Law 10: Accessibility Is Not Optional**
WCAG 2.2 AA. Skip-to-content. Proper heading hierarchy. ARIA labels. Focus indicators. Color contrast 4.5:1. Keyboard navigation. Screen reader tested.

**Law 11: Every Deployment Is a Transaction**
CI/CD with automated tests. Preview deployments on PRs. Zero-downtime deploys. Rollback capability. Database migration safety. Feature flags for risky changes.

**Law 12: Documentation Is Code**
README, DEPLOYMENT, ARCHITECTURE, API, DATABASE, DISASTER_RECOVERY, CONTRIBUTING. Keep them accurate — stale docs are worse than no docs.

### Engineering Decision Framework

When facing any engineering decision:
1. Does this violate any of the 12 Laws? If yes, reject it.
2. Does this make the system faster, more secure, more maintainable, or more reliable? If no, question it.
3. Does this add complexity without proportional benefit? If yes, simplify it.
4. Is there an existing pattern in the codebase for this? If yes, follow it.
5. Will this be easy to undo if wrong? If no, find a reversible approach.

---

## 03 — Repository Audit

### Current State (at spec creation time)

| Metric | Value |
|--------|-------|
| Next.js build | ✅ Passes |
| Tests passing | 91/99 (8 skipped) |
| TypeScript errors | 0 (after recent fixes) |
| ESLint warnings | ~15 (mostly admin CMS routes with unused imports) |
| Prisma models | 25+ |
| API routes | 40+ |
| Pages | 25+ |
| Dev server | ✅ Runs on :3000 |
| Git repo | ❌ No local git |

### Known Issues (pre-audit)

**TypeScript (all fixed in current session):**
- `sitemap.ts` — `isPublished` field doesn't exist on Product → fixed to `isActive`
- `admin-auth.ts` — lowercase `"admin"` comparison → fixed to `"SUPER_ADMIN"`
- `admin-auth.ts` — Session type mismatch with auth() overload → fixed with explicit Session import
- `payment.ts` — Stripe API version mismatch → updated to `2026-06-24.dahlia`

**Session backlog (from earlier work):**
- Password reset API + UI (created by subagent)
- Back-in-stock API route (created)
- Token verification API (created)
- Redis-backed rate limiter with in-memory fallback (merged)
- CSRF protection (applied)
- Admin auth hardening (merged)
- 12 unused dependencies removed
- EmptyState href prop added
- Duplicate footer removed
- Bag page CTA fixed
- CHANGELOG.md, DEPLOYMENT_README.md created
- PEA_FITS_GAP_ANALYSIS.md written (329 lines, 9 domains)

**Still missing:**
- CI/CD pipeline (`.github/workflows/`)
- Real email sending (Resend API calls)
- Supabase project connection
- PostgreSQL migration (currently SQLite)
- Stripe/Khalti live credentials
- Upstash Redis for production rate limiting
- GitHub repository setup
- Docker / containerization
- E2E tests (Playwright)
- Accessibility tests (axe-core)
- Sentry monitoring
- Health check endpoint
- Backup/DR documentation
- SEO structured data (JSON-LD)
- Loading states (skeleton components)
- Error boundaries
- Image optimization (next/image migration)

### Audit Procedure
1. Scan all `.ts/.tsx` files for `as any`, `@ts-ignore`, `@ts-expect-error`
2. Scan all files for `console.log`
3. Check all API routes for Zod validation
4. Check all components for proper TypeScript props
5. Verify all environment variables are referenced in one place
6. Scan for hardcoded strings that should be constants
7. Verify route protection (public/protected/admin)
8. Check all `useEffect` for proper cleanup and deps

---

## 04 — System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────┐
│                  Browser                      │
│  (Next.js App — SSR, CSR, ISR)              │
└──────────┬────────────┬─────────────────────┘
           │            │
     ┌─────▼─────┐ ┌───▼──────────┐
     │  NextAuth  │ │  API Routes  │
     │  (JWT)     │ │  (/api/*)   │
     └─────┬─────┘ └───┬──────────┘
           │            │
     ┌─────▼────────────▼──────────┐
     │         Prisma ORM          │
     └─────────────┬──────────────┘
                   │
     ┌─────────────▼──────────────┐
     │     PostgreSQL (Supabase)   │
     │  + Supabase Storage         │
     └─────────────────────────────┘

External Services:
  Stripe ──── Payment processing (Checkout, Webhooks)
  Khalti ──── Nepal payment gateway
  Resend ──── Email delivery (password reset, orders)
  Upstash ─── Redis for rate limiting + caching
  Vercel ──── Hosting + Analytics
  Sentry ──── Error monitoring
```

### Folder Structure

```
pea-fits/
├── prisma/
│   ├── schema.prisma           # Database schema (25+ models)
│   └── seed.ts                 # Seed data
├── src/
│   ├── app/
│   │   ├── (auth)/             # Auth pages (login, register)
│   │   ├── (shop)/             # Shop pages (products, collections)
│   │   ├── admin/              # Admin dashboard
│   │   ├── api/                # All API routes
│   │   │   ├── admin/          # Admin API (CRUD + management)
│   │   │   ├── auth/           # Auth endpoints
│   │   │   ├── checkout/       # Checkout + payment
│   │   │   ├── webhooks/       # Stripe, Khalti, Resend
│   │   │   └── ...
│   │   ├── profile/            # User profile pages
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   └── sitemap.ts          # Dynamic sitemap
│   ├── components/
│   │   ├── ui/                 # Reusable UI components
│   │   ├── admin/              # Admin-specific components
│   │   ├── layout/             # Layout components (header, footer)
│   │   ├── products/           # Product-specific components
│   │   └── cart/               # Cart components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/
│   │   ├── auth.ts             # NextAuth configuration
│   │   ├── prisma.ts           # Prisma client singleton
│   │   ├── email.ts            # Email utilities
│   │   ├── payment.ts          # Stripe/Khalti integration
│   │   ├── constants.ts        # App constants
│   │   ├── rate-limit.ts       # Rate limiting
│   │   ├── admin-auth.ts       # Admin authorization helper
│   │   └── csrf.ts             # CSRF token utilities
│   ├── store/                  # Zustand stores
│   │   ├── cart-store.ts       # Cart state
│   │   └── auth-store.ts       # Auth state
│   └── types/
│       └── index.ts            # Shared TypeScript types
├── public/
│   ├── images/                 # Static images
│   └── fonts/                  # Custom fonts
├── .env.local                  # Environment variables
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # TailwindCSS configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies + scripts
```

### Data Flow Patterns

**Page Request (SSR):**
```
Browser → Next.js Server → getServerSideProps/Server Component
  → Prisma Query → PostgreSQL → Serialize → Render HTML → Browser
```

**API Request:**
```
Browser → fetch(/api/*) → Middleware (CSRF, rate-limit, auth)
  → Route Handler → Zod Validation → Business Logic
  → Prisma/Axios/Fetch → Response → Browser
```

**Payment (Stripe):**
```
Cart → Checkout API → Create Stripe Session → Redirect to Stripe
  → Customer pays → Stripe Webhook → Order status update → Email
```

**Auth:**
```
Login Form → CredentialsProvider → Prisma Auth Adapter
  → JWT Callback → Session Token (cookie) → Protected Routes
```

---

## 05 — Frontend Standards

### Component Architecture

1. **Server Components by Default**
   - Every component is a Server Component unless it needs interactivity
   - Client Components only when: `useState`, `useEffect`, `useContext`, event handlers, browser APIs, custom hooks
   - Mark Client Components with `'use client'` directive

2. **Component Hierarchy**
   ```
   Page (Server) → Layout (Server) → Data Section (Server)
     → Interactive Widget (Client) → Pure UI (Server)
   ```
   Data fetching at the Server Component level. Pass data as props to Client Components.

3. **Component Categories**
   - **Pages** — Route segments in `src/app/`, fetch data, pass to sections
   - **Sections** — Page sections (Hero, ProductGrid, etc.), may be server or client
   - **Widgets** — Interactive (ProductCard, CartItem, SearchBar), client-only
   - **UI** — Pure presentation (Button, Input, Card, Badge), ideally server-compatible
   - **Layout** — Header, Footer, Sidebar, Nav — wrap pages

4. **Naming Conventions**
   - Components: PascalCase, `.tsx` extension
   - Hooks: `use` prefix, camelCase
   - Utilities: camelCase
   - Constants: `UPPER_SNAKE_CASE` for magic values
   - Types/Interfaces: PascalCase, `I` prefix not used
   - Files: match the export name, kebab-case for directories

5. **Styling (TailwindCSS v4)**
   - Use Tailwind utility classes exclusively
   - Extract repeated patterns to component classes
   - Custom design tokens in `tailwind.config.ts` only for brand colors
   - Dark mode via Tailwind `dark:` variant
   - Responsive via `sm:`, `md:`, `lg:`, `xl:` breakpoints

6. **State Management**
   - Zustand for global state (cart, auth)
   - React context for theme/locale/settings
   - Local state for component-specific UI
   - URL state for filters, pagination, search
   - `useOptimistic` for add-to-cart (instant UI)

7. **Performance Patterns**
   - `React.memo` on heavy list items
   - `useMemo` for expensive computations
   - `useCallback` for stable callback references
   - `dynamic(() => import(...), { ssr: false })` for heavy client-only components
   - Image `loading="lazy"` below the fold
   - `next/dynamic` for code splitting

### Coding Standards

```tsx
// ✅ Good — Server Component (default)
async function ProductGrid({ categoryId }: { categoryId: string }) {
  const products = await prisma.product.findMany({
    where: { categoryId, isActive: true },
    select: { id: true, name: true, price: true, images: true },
    take: 20,
  });
  return <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {products.map(p => <ProductCard key={p.id} product={p} />)}
  </div>;
}

// ✅ Good — Client Component (explicit directive)
'use client';
function AddToCartButton({ productId }: { productId: string }) {
  const addItem = useCartStore(s => s.addItem);
  const [loading, setLoading] = useState(false);
  return (
    <Button onClick={async () => {
      setLoading(true);
      await addItem(productId);
      setLoading(false);
    }} disabled={loading}>
      {loading ? 'Adding...' : 'Add to Cart'}
    </Button>
  );
}
```

---

## 06 — Backend Standards

### API Route Structure

```
src/app/api/[resource]/[action]/route.ts
```

Each route file exports named functions for HTTP methods:
```ts
export async function GET(request: NextRequest) { ... }
export async function POST(request: NextRequest) { ... }
export async function PUT(request: NextRequest) { ... }
export async function DELETE(request: NextRequest) { ... }
```

### API Response Shape (Uniform)

```ts
// Success
{ success: true, data: T }

// Error
{ success: false, error: string }
// Validation Error
{ success: false, error: string, issues: ZodIssue[] }
```

### Response Helpers (centralized)

```ts
// src/lib/api-response.ts
import { NextResponse } from 'next/server';

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(error: string, status = 400) {
  return NextResponse.json({ success: false, error }, { status });
}

export function validationErrorResponse(issues: ZodIssue[]) {
  return NextResponse.json({
    success: false,
    error: 'Validation failed',
    issues,
  }, { status: 400 });
}

export function unauthorizedResponse() {
  return errorResponse('Authentication required', 401);
}

export function forbiddenResponse() {
  return errorResponse('Insufficient permissions', 403);
}

export function notFoundResponse(resource = 'Resource') {
  return errorResponse(`${resource} not found`, 404);
}

export function rateLimitedResponse() {
  return NextResponse.json(
    { success: false, error: 'Too many requests. Please try again later.' },
    { status: 429, headers: { 'Retry-After': '60' } }
  );
}
```

### Route Handler Template

```ts
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api-response';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error.issues);

    // Business logic
    const result = await prisma.user.create({ data: parsed.data });
    return successResponse(result, 201);
  } catch (error) {
    console.error('Error in POST /api/resource:', error);
    return errorResponse('Internal server error', 500);
  }
}
```

### Middleware Stack (in order)

1. **CSRF Protection** — Verify non-GET requests carry valid CSRF token
2. **Rate Limiting** — Check request frequency by IP/user
3. **Authentication** — Verify JWT session for protected routes
4. **Authorization** — Check role for admin routes
5. **Input Validation** — Zod schema validation
6. **Business Logic** — Actual handler code
7. **Response** — Uniform response shape

### HTTP Status Codes

| Code | When |
|------|------|
| 200 | Successful GET, PUT, PATCH |
| 201 | Successful POST (resource created) |
| 204 | Successful DELETE |
| 400 | Validation failure, bad request |
| 401 | Not authenticated |
| 403 | Not authorized (wrong role) |
| 404 | Resource not found |
| 409 | Conflict (duplicate email, etc.) |
| 429 | Rate limited |
| 500 | Internal server error (unhandled) |

---

## 07 — Database Engineering

### Schema Design Principles

1. **Normalization** — 3NF minimum. No duplicated data across tables.
2. **Relations** — Every foreign key must be indexed. Cascade deletes only where semantically correct.
3. **Timestamps** — Every model gets `createdAt` and `updatedAt` (Prisma `@updatedAt`).
4. **Soft Deletes** — Add `deletedAt DateTime?` for Product, Category, Collection, User. Prisma middleware filters `deletedAt: null`.
5. **Enums** — Use Prisma enums for finite sets: Role, OrderStatus, PaymentMethod, ProductSize, ProductColor.
6. **JSON over String** — Use PostgreSQL `Json` type (not `String @default("[]")`) for arrays/tags. Avoid JSON parsing in application code.
7. **Indexes** — Every query pattern gets a covering index.

### Current Schema (25+ models)

**Core Commerce:**
- `User` — id, name, email, password (hashed), role, image, emailVerified, phone, addresses (JSON), createdAt, updatedAt
- `Product` — id, name, slug, description, price (Decimal), compareAtPrice, images (JSON), tags (JSON/string), brand, categoryId, collectionId, isActive, isFeatured, isTrending, isBestSeller, featuredOrder, createdAt, updatedAt
- `Variant` — id, productId, size, color, sku, price (override), stock, images (JSON), isActive
- `Category` — id, name, slug, description, image, order, isActive, createdAt
- `Collection` — id, name, slug, description, image, order, isActive, createdAt

**Orders & Payments:**
- `Order` — id, orderNumber, userId, status (enum), total (Decimal), subtotal, shipping, tax, paymentMethod, paymentId, shippingAddress (JSON), billingAddress (JSON), notes, createdAt, updatedAt
- `OrderItem` — id, orderId, productId, variantId, name, price (Decimal), quantity, image
- `Cart` — id, userId, sessionId, items (JSON/relation), createdAt, updatedAt
- `Wishlist` — id, userId, productId, createdAt

**Marketing & Content:**
- `Coupon` — id, code, discountType (percentage/fixed), discountValue, minOrderAmount, maxUses, usedCount, isActive, expiresAt, createdAt
- `JournalArticle` — id, title, slug, content, excerpt, coverImage, tags (JSON), authorId, publishedAt, isActive, createdAt
- `Review` — id, productId, userId, rating, title, body, isApproved, createdAt
- `Testimonial` — id, name, role, content, avatar, rating, order, isActive
- `Banner` — id, title, subtitle, image, link, position, order, isActive
- `CMS` — id, page (home/about/contact/faq), content (JSON), publishedAt, createdAt
- `FeaturedProduct` — id, productId, order, isActive
- `NavLink` — id, label, href, order, parentId, isExternal

**Admin & System:**
- `AuditLog` — id, userId, action, resource, resourceId, details (JSON), ipAddress, createdAt
- `SiteSetting` — id, key, value, updatedAt
- `ShippingConfig` — id, region, cost, freeShippingThreshold, estimatedDays, isActive
- `TaxRate` — id, region, rate (Decimal), isActive
- `EmailTemplate` — id, key, subject, htmlBody, textBody, variables (JSON), updatedAt
- `SocialLink` — id, platform, url, icon, order, isActive
- `Media` — id, url, alt, type (image/video), size, dimensions (JSON), uploadedById, createdAt
- `VerificationToken` — id, identifier, token, expires, createdAt
- `BackInStockRequest` — id, email, productId, variantId, notified, createdAt
- `GiftCard` — id, code, initialBalance (Decimal), currentBalance, currency, expiresAt, isActive, createdAt
- `GiftCardTransaction` — id, giftCardId, amount, orderId, type (issue/redemption/refund), createdAt

### Required Indexes (add these)

```prisma
@@index([brand])
@@index([createdAt])
@@index([userId])
@@index([orderId])          // On OrderItem
@@index([productId])        // On Review, Variant, BackInStockRequest
@@index([publishedAt])      // On JournalArticle
@@index([code])             // On GiftCard (unique)
@@index([categoryId])       // On Product
@@index([collectionId])     // On Product
```

### Soft Delete Middleware

```ts
// prisma/middleware.ts
import { PrismaClient } from '@prisma/client';

export function softDeleteMiddleware(prisma: PrismaClient) {
  const softDeleteModels = ['Product', 'Category', 'Collection', 'User'];

  softDeleteModels.forEach(model => {
    // Intercept findMany, findFirst, findUnique to exclude deleted
    prisma.$use(async (params, next) => {
      if (softDeleteModels.includes(params.model!) &&
          params.action.startsWith('find')) {
        params.args = {
          ...params.args,
          where: { ...params.args?.where, deletedAt: null },
        };
      }
      return next(params);
    });
  });
}
```

### Decimal Precision for Money

- Store monetary values as `Decimal` type in Prisma (maps to PostgreSQL `numeric(10,2)`)
- All price calculations use integer arithmetic via cents
- Helper functions:
  ```ts
  function toCents(amount: number): number { return Math.round(amount * 100); }
  function fromCents(cents: number): number { return cents / 100; }
  ```
- Never use JavaScript `Number` for monetary calculations — use the `decimal.js` or `bignumber.js` library

---

## 08 — Prisma Standards

### Client Singleton

```ts
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### Query Patterns

**Always select only needed fields:**
```ts
// ❌ Bad — fetches everything
const products = await prisma.product.findMany();

// ✅ Good — explicit select
const products = await prisma.product.findMany({
  where: { isActive: true },
  select: {
    id: true,
    name: true,
    price: true,
    images: true,
    slug: true,
    category: { select: { name: true, slug: true } },
  },
  orderBy: { createdAt: 'desc' },
  take: 20,
});
```

**Cursor-based pagination (always — never skip/take for large datasets):**
```ts
const products = await prisma.product.findMany({
  take: 21, // 20 items + 1 to check if there's a next page
  cursor: cursor ? { id: cursor } : undefined,
  orderBy: { id: 'asc' },
  where: { isActive: true },
});

const hasMore = products.length > 20;
const items = hasMore ? products.slice(0, 20) : products;
const nextCursor = hasMore ? items[items.length - 1].id : null;
```

**Transactions:**
```ts
const [order, inventoryUpdate] = await prisma.$transaction([
  prisma.order.create({ data: { ... } }),
  prisma.product.update({
    where: { id: productId },
    data: { stock: { decrement: quantity } },
  }),
]);
```

**Bulk operations:**
```ts
await prisma.product.updateMany({
  where: { categoryId, isActive: true },
  data: { isFeatured: true },
});
```

### Migration Workflow

```bash
# Development: create + apply
npx prisma migrate dev --name add_inventory_tracking

# Production: apply migrations
npx prisma migrate deploy

# Validate
npx prisma validate

# Generate client after schema changes
npx prisma generate

# Seed
npx prisma db seed
```

### PostgreSQL-Specific Adjustments

When switching from SQLite to PostgreSQL:
1. Replace `@default("[]")` on JSON string fields with `Json @default("[]")`
2. Update all `prisma.$queryRaw` calls for PostgreSQL syntax
3. Add connection pooling params: `?pgbouncer=true&connection_limit=1`
4. Verify enum values are uppercase (PostgreSQL enums are case-sensitive)
5. Add explicit indexes (SQLite auto-indexes FKs, PostgreSQL does not)

---

## 09 — Authentication & Authorization

### Architecture

- **Provider:** NextAuth v5 (beta.25) with Auth.js
- **Strategy:** JWT (no database sessions)
- **Adapter:** `@auth/prisma-adapter`
- **Providers:** Credentials (email + password), Google OAuth
- **Password Hashing:** bcrypt (via `bcryptjs`)

### Configuration (`src/lib/auth.ts`)

```ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 }, // 30 days
  pages: { signIn: '/login', error: '/login?error=true' },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const { email, password } = credentials as { email: string; password: string };
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) return null;
        const isValid = await compare(password, user.password);
        if (!isValid) return null;
        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.role = user.role; }
      return token;
    },
    async session({ session, token }) {
      if (session.user) { session.user.role = token.role as Role; }
      return session;
    },
  },
});
```

### Role-Based Access Control

**Roles:** `CUSTOMER`, `ADMIN`, `SUPER_ADMIN`

**Route Protection Matrix:**

| Route | Any User | CUSTOMER | ADMIN | SUPER_ADMIN |
|-------|----------|----------|-------|-------------|
| `/` (home) | ✅ | ✅ | ✅ | ✅ |
| `/products/*` | ✅ | ✅ | ✅ | ✅ |
| `/collections/*` | ✅ | ✅ | ✅ | ✅ |
| `/login`, `/register` | ✅ | ❌ | ❌ | ❌ |
| `/profile/*` | ❌ | ✅ | ✅ | ✅ |
| `/orders/*` | ❌ | ✅ | ✅ | ✅ |
| `/bag`, `/wishlist` | ❌ | ✅ | ✅ | ✅ |
| `/checkout` | ❌ | ✅ | ✅ | ✅ |
| `/admin/*` | ❌ | ❌ | ✅ | ✅ |
| `/api/admin/*` | ❌ | ❌ | ✅ | ✅ |

**Admin Auth Helper (`src/lib/admin-auth.ts`):**
```ts
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { Session } from 'next-auth';

type AdminAuthResult = {
  authorized: false;
  response: Response;
  session?: undefined;
} | {
  authorized: true;
  response?: undefined;
  session: Session;
};

export async function adminAuth(): Promise<AdminAuthResult> {
  const session = await auth();
  if (!session?.user) {
    return { authorized: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
    return { authorized: false, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  return { authorized: true, session };
}
```

### Middleware (`src/middleware.ts`)

```ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Public routes — no auth needed
  const publicPaths = ['/', '/login', '/register', '/products', '/collections', '/journal'];
  if (publicPaths.some(p => pathname.startsWith(p))) return NextResponse.next();

  // Admin routes — require ADMIN or SUPER_ADMIN
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (!token || (token.role !== 'ADMIN' && token.role !== 'SUPER_ADMIN')) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return NextResponse.next();
  }

  // Protected routes — require any authenticated user
  const protectedPaths = ['/profile', '/orders', '/bag', '/wishlist', '/checkout', '/api/checkout'];
  if (protectedPaths.some(p => pathname.startsWith(p))) {
    if (!token) return NextResponse.redirect(new URL('/login', req.url));
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico|images|fonts).*)'],
};
```

### Session Type Declaration

```ts
// src/types/next-auth.d.ts
import { DefaultSession } from 'next-auth';
import { Role } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession['user'];
  }

  interface User {
    role: Role;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: Role;
  }
}
```

---

## 10 — Security Handbook

### OWASP Top 10 Coverage

| # | Risk | Implementation |
|---|------|----------------|
| 1 | **Broken Access Control** | RBAC middleware, adminAuth helper, route protection matcher in middleware.ts |
| 2 | **Cryptographic Failures** | HTTPS enforced (Vercel), passwords bcrypt-hashed, secrets in env vars only |
| 3 | **Injection** | Prisma parameterized queries (safe), Zod input validation, HTML sanitization |
| 4 | **Insecure Design** | Rate limiting on auth/checkout, CSRF tokens, proper error messages (no stack traces) |
| 5 | **Security Misconfiguration** | CSP headers, Secure/HttpOnly/SameSite cookies, HSTS |
| 6 | **Vulnerable Components** | `npm audit` in CI, dependency-review-action, regular `npm update` |
| 7 | **Auth Failures** | Account lockout (5 failed attempts), session timeout, password policy (min 8 chars) |
| 8 | **Data Integrity Failures** | Stripe webhook signature verification, idempotency keys |
| 9 | **Logging Failures** | Audit logs for admin CRUD, auth events, payment events |
| 10 | **SSRF** | Validate callback URLs, webhook URLs, no arbitrary URL fetching |

### CSP Headers

```ts
// next.config.ts
const csp = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https: blob:;
  font-src 'self' data:;
  connect-src 'self' https://api.stripe.com https://khalti.com https://*.supabase.co;
  frame-src https://js.stripe.com https://khalti.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
`.replace(/\s{2,}/g, ' ').trim();

const headers = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];
```

### CSRF Protection

```ts
// src/lib/csrf.ts
import { createHash, randomBytes } from 'crypto';

// Generate token for forms
export function generateCsrfToken(secret: string): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const raw = `${secret}:${timestamp}`;
  const hash = createHash('sha256').update(raw).digest('hex');
  return `${timestamp}.${hash}`;
}

// Validate token from request
export function validateCsrfToken(token: string, secret: string): boolean {
  const [timestamp, hash] = token.split('.');
  const expected = createHash('sha256')
    .update(`${secret}:${timestamp}`)
    .digest('hex');
  return hash === expected && (Date.now() / 1000 - parseInt(timestamp)) < 3600;
}
```

### Account Lockout

```ts
// src/lib/account-lockout.ts
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

export async function checkAccountLockout(email: string): Promise<boolean> {
  const attempts = await getRecentFailedAttempts(email);
  if (attempts >= MAX_ATTEMPTS) {
    const lastAttempt = await getLastFailedAttempt(email);
    if (Date.now() - lastAttempt < LOCKOUT_DURATION) {
      return true; // Locked
    }
    await resetFailedAttempts(email); // Lockout expired
  }
  return false;
}

export async function recordFailedAttempt(email: string): Promise<void> {
  await prisma.auditLog.create({
    data: {
      action: 'LOGIN_FAILED',
      resource: 'USER',
      details: { email },
    },
  });
}
```

### Input Validation Rules

- **All API routes**: Zod validation on request body, query params, URL params
- **File uploads**: Validate type (image/jpeg, image/png, image/webp, image/avif), size (max 5MB), dimensions (optional)
- **CMS content**: Strip HTML tags from title/name fields, sanitize rich text content (allow only safe tags: `b`, `i`, `a`, `p`, `ul`, `ol`, `li`, `img`, `br`)
- **URLs**: Validate with `z.string().url()` for external links
- **Phone numbers**: Validate with regex for Nepal format (+977 98XXXXXXXX)
- **Email**: `<input type="email">` + Zod `.email()`

### Rate Limiting (detailed in Chapter 14)

---

## 11 — Payment Architecture

### Supported Providers

1. **Stripe** — International card payments (USD)
2. **Khalti** — Nepal payments (NPR)

### Stripe Integration

**Checkout Session Creation:**
```ts
// src/lib/payment.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-06-24.dahlia',
});

export async function createStripeCheckoutSession(params: {
  items: { name: string; price: number; quantity: number; image?: string }[];
  orderNumber: string;
  orderId: string;
  successUrl: string;
  cancelUrl: string;
  currency?: string;
}): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: params.items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100), // cents
      },
      quantity: item.quantity,
    })),
    mode: 'payment',
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: { orderId: params.orderId, orderNumber: params.orderNumber },
  });
  return session.url!;
}
```

**Webhook Handler:**
```ts
// src/app/api/webhooks/stripe/route.ts
export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;
  
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body, signature, process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return errorResponse('Invalid signature', 400);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const { orderId } = session.metadata!;
    
    await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'CONFIRMED',
          paymentId: session.payment_intent as string,
        },
      }),
      prisma.auditLog.create({
        data: {
          action: 'PAYMENT_CONFIRMED',
          resource: 'ORDER',
          resourceId: orderId,
          details: { paymentIntent: session.payment_intent },
        },
      }),
    ]);
    
    await sendOrderConfirmationEmail(orderId);
  }

  return successResponse({ received: true });
}
```

### Khalti Integration

```ts
export async function verifyKhaltiPayment(token: string, amount: number) {
  const response = await fetch('https://khalti.com/api/v2/payment/verify/', {
    method: 'POST',
    headers: {
      Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token, amount }),
  });
  return response.json();
}
```

### Order Lifecycle

```
PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
  │          │
  │          ▼
  │       CANCELLED (before shipping)
  │
  ▼
FAILED (payment declined)

REFUNDED (after delivery)
```

### Idempotency

```ts
// Prevent duplicate webhook processing
const processed = await prisma.auditLog.findFirst({
  where: {
    action: 'PAYMENT_CONFIRMED',
    resourceId: orderId,
  },
});
if (processed) return successResponse({ received: true, duplicate: true });
```

---

## 12 — Supabase & Storage

### Supabase Setup

**Project Configuration:**
- Create project at supabase.com
- Enable Email Auth provider
- Create storage buckets:
  - `product-images` (public) — max 5MB per file, allowed types: image/jpeg, image/png, image/webp, image/avif
  - `cms-assets` (public) — max 10MB per file, allowed types: image/*, application/pdf
  - `avatars` (public) — max 2MB per file, allowed types: image/jpeg, image/png
- Generate API keys (anon + service_role)
- Set up CORS for your domain

**Environment Variables:**
```
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon key]
SUPABASE_SERVICE_ROLE_KEY=[service role key]
```

### Supabase Client

```ts
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

### File Upload Helper

```ts
export async function uploadImage(
  file: File,
  bucket: 'product-images' | 'cms-assets' | 'avatars',
  folder = 'general'
): Promise<string> {
  const ext = file.name.split('.').pop();
  const fileName = `${folder}/${crypto.randomUUID()}.${ext}`;

  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from(bucket)
    .getPublicUrl(fileName);

  return publicUrl;
}

export async function deleteImage(url: string): Promise<void> {
  const path = url.split('/').slice(-2).join('/'); // folder/filename.ext
  const bucket = url.includes('product-images') ? 'product-images' : 'cms-assets';
  await supabaseAdmin.storage.from(bucket).remove([path]);
}
```

### Image Upload Component

```tsx
'use client';
export function ImageUpload({ onUpload, bucket = 'product-images' }: {
  onUpload: (url: string) => void;
  bucket?: string;
}) {
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    if (file.size > maxSize) return toast.error('File too large (max 5MB)');
    if (!allowedTypes.includes(file.type)) return toast.error('Invalid file type');

    setUploading(true);
    try {
      const url = await uploadImage(file, bucket);
      onUpload(url);
      toast.success('Image uploaded');
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFile} disabled={uploading} />
      {uploading && <Spinner />}
    </div>
  );
}
```

---

## 13 — Email System

### Provider: Resend

**Environment Variables:**
```
RESEND_API_KEY=re_[key]
EMAIL_FROM=PEA FITS <noreply@peafits.com.np>
```

### Email Client

```ts
// src/lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || 'PEA FITS <noreply@peafits.com.np>',
    to: [to],
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ''),
  });
  if (error) throw new Error(`Email send failed: ${error.message}`);
  return data;
}
```

### Email Templates

**Password Reset:**
```ts
export function passwordResetEmail(resetUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #0a0a0a; padding: 40px 20px; text-align: center;">
        <img src="https://peafits.com.np/logo.png" alt="PEA FITS" style="height: 40px;">
        <h1 style="color: #c4ff0e; margin: 20px 0; font-family: 'Playfair Display', serif;">
          Reset Your Password
        </h1>
        <p style="color: #e0e0e0; margin: 20px 0; line-height: 1.6;">
          You requested a password reset. Click the button below to set a new password.
          This link expires in 1 hour.
        </p>
        <a href="${resetUrl}"
           style="display: inline-block; background: #c4ff0e; color: #0a0a0a;
                  padding: 14px 36px; text-decoration: none; border-radius: 4px;
                  font-weight: bold; margin: 20px 0;">
          Reset Password
        </a>
        <p style="color: #888; font-size: 12px; margin-top: 30px;">
          If you didn't request this, please ignore this email.
        </p>
      </div>
    </body>
    </html>
  `;
}
```

**Order Confirmation:**
```ts
export function orderConfirmationEmail(order: {
  orderNumber: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
}) { /* ... */ }
```

### Email Event Mapping

| Event | Template | Priority |
|-------|----------|----------|
| User registration | Welcome email | Low |
| Password reset | Reset link | High |
| Order placed | Order confirmation | High |
| Payment confirmed | Payment receipt | High |
| Order shipped | Shipping notification | High |
| Order delivered | Delivery confirmation | Medium |
| Back in stock | Product notification | Medium |
| Contact form | Admin notification | Low |

### Retry Logic

```ts
export async function sendEmailWithRetry(params: SendEmailParams, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await sendEmail(params);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
    }
  }
}
```

---

## 14 — Redis & Caching

### Provider: Upstash Redis

**Environment Variables:**
```
UPSTASH_REDIS_URL=https://[region].upstash.io
UPSTASH_REDIS_TOKEN=[token]
```

### Rate Limiter

```ts
// src/lib/rate-limit.ts
import { Redis } from '@upstash/redis';

const redis = process.env.UPSTASH_REDIS_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_URL,
      token: process.env.UPSTASH_REDIS_TOKEN!,
    })
  : null;

// In-memory fallback
const memoryStore = new Map<string, { count: number; reset: number }>();

interface RateLimitConfig {
  interval: number; // seconds
  max: number;
}

export async function rateLimit(
  key: string,
  config: RateLimitConfig = { interval: 60, max: 10 }
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const now = Math.floor(Date.now() / 1000);
  const reset = now + config.interval;

  if (redis) {
    const { data: result } = await redis
      .multi()
      .incr(key)
      .expire(key, config.interval)
      .exec();
    const count = result[0] as number;
    return {
      success: count <= config.max,
      remaining: Math.max(0, config.max - count),
      reset,
    };
  }

  // In-memory fallback
  const entry = memoryStore.get(key);
  if (!entry || now > entry.reset) {
    memoryStore.set(key, { count: 1, reset });
    return { success: true, remaining: config.max - 1, reset };
  }
  entry.count++;
  return {
    success: entry.count <= config.max,
    remaining: Math.max(0, config.max - entry.count),
    reset: entry.reset,
  };
}
```

### Rate Limit Configurations

| Route | Interval | Max | Key Pattern |
|-------|----------|-----|-------------|
| POST /api/auth/register | 3600s (1h) | 3 | `rl:register:{ip}` |
| POST /api/auth/login | 300s (5m) | 5 | `rl:login:{ip}` |
| POST /api/auth/reset-password | 3600s (1h) | 3 | `rl:resetpw:{ip}` |
| POST /api/checkout | 300s (5m) | 10 | `rl:checkout:{userId\|ip}` |
| POST /api/contact | 3600s (1h) | 3 | `rl:contact:{ip}` |
| GET /api/admin/* | 60s (1m) | 60 | `rl:admin:{userId}` |

### General Caching

```ts
export async function cachedQuery<T>(
  key: string,
  query: () => Promise<T>,
  ttl = 300 // 5 minutes
): Promise<T> {
  if (!redis) return query();

  const cached = await redis.get<T>(key);
  if (cached) return cached;

  const result = await query();
  await redis.set(key, JSON.stringify(result), { ex: ttl });
  return result;
}

// Usage
const featuredProducts = await cachedQuery('featured:products', () =>
  prisma.product.findMany({
    where: { isFeatured: true, isActive: true },
    take: 8,
  }),
  600 // 10 min cache
);
```

### Cache Invalidation

| Event | Key Pattern to Invalidate |
|-------|--------------------------|
| Product created/updated | `featured:*`, `products:*`, `category:*` |
| Product deleted | `featured:*`, `products:*`, `category:*` |
| Order placed | `orders:*` (user-specific) |
| Settings changed | `settings:*` |
| Rate limit keys | Auto-expire (no manual invalidation needed) |

---

## 15 — Performance Engineering

### Performance Budget

| Metric | Target |
|--------|--------|
| Lighthouse Performance | 100 |
| Lighthouse Accessibility | 100 |
| Lighthouse Best Practices | 100 |
| Lighthouse SEO | 100 |
| LCP (Largest Contentful Paint) | < 2.5s |
| CLS (Cumulative Layout Shift) | < 0.1 |
| INP (Interaction to Next Paint) | < 200ms |
| TTFB (Time to First Byte) | < 800ms |
| First Load JS Bundle | < 300KB |
| Time to Interactive | < 3.5s |
| Speed Index | < 3.0s |

### Optimization Strategies

**1. Server Components (default)**
- Every component is a Server Component by default
- Only use `'use client'` when you need: interactivity, event handlers, useEffect, useState, browser APIs, Context providers
- Move data fetching to Server Components; pass results as props to Client Components

**2. Image Optimization**
```tsx
// ❌ Bad
<img src={product.images[0]} alt={product.name} />

// ✅ Good
import Image from 'next/image';
<Image
  src={product.images[0]}
  alt={product.name}
  width={400}
  height={500}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  priority={isAboveFold}
  loading={isAboveFold ? undefined : 'lazy'}
  placeholder="blur"
  blurDataURL="data:image/webp;base64,..."
/>
```

**3. Code Splitting**
```tsx
// Dynamic import for heavy components
const ProductGallery = dynamic(() => import('@/components/products/ProductGallery'), {
  loading: () => <GallerySkeleton />,
});
const CheckoutForm = dynamic(() => import('@/components/checkout/CheckoutForm'), {
  ssr: false, // No SSR for payment forms
});
```

**4. Font Loading**
```tsx
// app/layout.tsx
import { Playfair_Display, Inter } from 'next/font/google';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});
```

**5. Bundle Analysis**
```bash
# Add to package.json scripts
"analyze": "ANALYZE=true npm run build"
# Install @next/bundle-analyzer for visual bundle analysis
```

**6. Route Segment Config**
```ts
// pages that don't need real-time data
export const dynamic = 'force-static';
// or ISR
export const revalidate = 3600; // revalidate every hour
```

**7. Streaming & Suspense**
```tsx
// app/products/page.tsx
import { Suspense } from 'react';
import { ProductGridSkeleton } from '@/components/skeletons';

export default function ProductsPage() {
  return (
    <div>
      <h1>All Products</h1>
      <Suspense fallback={<ProductGridSkeleton count={12} />}>
        <ProductGrid />
      </Suspense>
    </div>
  );
}
```

**8. Database Query Optimization**
- Always use `select` to fetch only needed fields
- Use cursor-based pagination over skip/take
- Batch related queries with Prisma `include` or select patterns
- Add composite indexes for common query patterns
- Use `take` to limit result sets

**9. Caching Strategy**
| Cache Layer | Target | Duration |
|-------------|--------|----------|
| React Cache (cache()) | Prisma queries | Per-request |
| Next.js Data Cache | fetch() calls | Configurable (revalidate) |
| Upstash Redis | Featured products, categories, settings | 5-30 min |
| Browser Cache | Static assets, images | 1 year (fingerprinted) |
| CDN (Vercel Edge) | Static pages, ISR | Configurable |

---

## 16 — SEO

### Meta Tags Structure

Every page must have:
- **Unique title** (50-60 chars) — includes primary keyword + brand
- **Meta description** (150-160 chars) — includes primary + secondary keywords
- **Canonical URL** — self-referencing to prevent duplicate content
- **Open Graph tags** — og:title, og:description, og:image, og:url, og:type
- **Twitter Card tags** — twitter:card, twitter:title, twitter:description, twitter:image

### Template: Page Metadata

```ts
// src/app/products/[slug]/page.tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    select: { name: true, description: true, images: true, slug: true, price: true },
  });
  if (!product) return { title: 'Product Not Found' };

  const url = `${process.env.NEXT_PUBLIC_URL}/products/${product.slug}`;

  return {
    title: `${product.name} — PEA FITS`,
    description: product.description?.slice(0, 155) || `Shop ${product.name} at PEA FITS`,
    alternates: { canonical: url },
    openGraph: {
      title: `${product.name} — PEA FITS`,
      description: product.description?.slice(0, 155),
      url,
      siteName: 'PEA FITS',
      images: [{ url: product.images?.[0] || '/images/og-default.jpg', width: 1200, height: 630 }],
      type: 'product',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} — PEA FITS`,
      description: product.description?.slice(0, 155),
      images: [product.images?.[0] || '/images/og-default.jpg'],
    },
  };
}
```

### JSON-LD Structured Data

```tsx
// src/app/products/[slug]/page.tsx (or a dedicated component)
function ProductJsonLd({ product }: { product: Product }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product.variants?.[0]?.sku,
    brand: { '@type': 'Brand', name: product.brand || 'PEA FITS' },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'USD',
      availability: product.variants?.some(v => v.stock > 0)
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
    aggregateRating: product.reviews?.length ? {
      '@type': 'AggregateRating',
      ratingValue: averageRating(product.reviews),
      reviewCount: product.reviews.length,
    } : undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

**Structured Data Types to Implement:**
| Page | Schema Type |
|------|-------------|
| Home | `Organization`, `WebSite` (with SearchAction) |
| Product | `Product` with `Offer`, `AggregateRating` |
| Collection/Category | `ItemList` |
| Product Search | `SearchAction` (on site-level) |
| Journal Article | `Article` |
| Breadcrumbs | `BreadcrumbList` (every page) |
| FAQ (contact page) | `FAQPage` |

### Technical SEO

```ts
// src/app/robots.ts
export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: 'https://peafits.com.np/sitemap.xml',
  };
}
```

- Sitemap already exists at `src/app/sitemap.ts` — verify it includes all active products and categories
- Breadcrumbs on every category, product, and article page
- Ensure all pages have `<meta name="viewport" content="width=device-width, initial-scale=1">`
- Lazy-load below-fold images with correct `sizes` attribute
- Use semantic HTML: `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<header>`, `<footer>`

---

## 17 — Accessibility

### Target: WCAG 2.2 AA

### Checklist

**Perceivable:**
- [ ] All images have `alt` text (decorative images use `alt=""`)
- [ ] Video/audio content has captions or transcripts
- [ ] Color is not the only way to convey information
- [ ] Color contrast ratio ≥ 4.5:1 for normal text, ≥ 3:1 for large text (18px+ bold or 24px+)
- [ ] Text can be resized to 200% without loss of content/functionality
- [ ] `aria-hidden="true"` on decorative icons, `role="img"` with `aria-label` on informative icons

**Operable:**
- [ ] All functionality available via keyboard (Tab, Enter, Escape, Arrow keys)
- [ ] Visible focus indicators on all interactive elements (`:focus-visible`)
- [ ] Skip-to-content link at top of every page
- [ ] No keyboard traps
- [ ] Touch targets are at least 44×44px
- [ ] Motion/animation respects `prefers-reduced-motion`
- [ ] No flashing content (more than 3 flashes per second)

**Understandable:**
- [ ] Page language set in `<html lang="en">`
- [ ] `<form>` inputs have associated `<label>` elements
- [ ] Error messages are clear and suggest corrections
- [ ] Consistent navigation across pages
- [ ] `aria-live` regions for dynamic content updates (cart count, toast messages, form errors)
- [ ] `aria-expanded` on expandable elements (mobile menu, accordion)

**Robust:**
- [ ] Valid HTML
- [ ] ARIA roles/labels used correctly (first rule of ARIA: don't use ARIA if native HTML semantics work)
- [ ] Components tested with screen readers (NVDA, VoiceOver)

### Implementation

**Skip-to-content Link:**
```tsx
// In layout.tsx, first focusable element
<a href="#main-content"
   className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-lime-400 focus:text-black focus:px-4 focus:py-2 focus:rounded">
  Skip to main content
</a>
<main id="main-content">{children}</main>
```

**Focus Management:**
```tsx
// Modal/Flyout (when opened)
useEffect(() => {
  const trigger = document.activeElement;
  dialog.focus();
  return () => trigger?.focus(); // return focus on close
}, [open]);
```

**Reduced Motion:**
```css
/* globals.css */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**Form Error Announcements:**
```tsx
<div role="alert" aria-live="assertive">
  {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
</div>
```

**Live Region for Cart:**
```tsx
<span className="sr-only" aria-live="polite">
  {cartCount} items in your bag
</span>
```

---

## 18 — UI/UX Standards

### Design System

**Typography:**
- Headings: `Playfair Display`, serif — brand voice, labels, names, page titles
- Body: `Inter`, sans-serif — all other text, numbers, product details, prices, data values
- Numbers and data values **must** use Inter, never Playfair (per user preference)

**Colors:**
- Background: `#0a0a0a` (near-black)
- Primary accent: `#c4ff0e` (neon lime)
- Text: `#e0e0e0` (light gray)
- Text muted: `#888`
- Error: `#ef4444`
- Success: `#22c55e`
- Border: `#1f1f1f`

### Component Library Standards

**Buttons:**
```tsx
// Always include: variant, disabled, loading, aria-label
<Button
  variant="primary" // | "secondary" | "outline" | "ghost" | "danger"
  disabled={isSubmitting}
  loading={isSubmitting}
  aria-label={label}
  onClick={handleClick}
>
  {isSubmitting ? <Spinner /> : label}
</Button>
```

**Forms:**
- Every input has a `<label>` (visible or sr-only)
- Error states shown inline, below the input
- Submit button shows loading state during submission
- Success/error feedback via toast notification
- Autocomplete attributes set correctly

**Navigation:**
- Consistent header with: logo, nav links (Shop, Journal, About, Contact), search, cart icon, user menu
- Mobile: hamburger menu with full-screen overlay
- Cart icon shows item count badge
- Back button on mobile product/checkout pages

**States for Every Component:**

| Component | Loading | Empty | Error | Success |
|-----------|---------|-------|-------|---------|
| ProductGrid | Skeleton (12 cards) | "No products found" | Error banner + retry | Product cards |
| Cart | Skeleton | Empty cart state with CTA | Error banner | Cart items |
| Orders | Skeleton | "No orders yet" | Error banner | Order list |
| Search | Spinner | "No results for X" | Error banner | Search results |
| Checkout | Skeleton | N/A | Error per field | Success redirect |
| Product Detail | Skeleton | N/A | Error banner | Product content |

### Toast Notification System

```tsx
'use client';
// Simple toast store + component
import { create } from 'zustand';

type Toast = { id: string; message: string; type: 'success' | 'error' | 'info' };
export const useToast = create<{
  toasts: Toast[];
  addToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
}>((set) => ({
  toasts: [],
  addToast: (message, type = 'info') => {
    const id = crypto.randomUUID();
    set(s => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => {
      set(s => ({ toasts: s.toasts.filter(t => t.id !== id) }));
    }, 4000);
  },
  removeToast: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
}));
```

### Mobile-First Responsive

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 640px | Single column, hamburger nav |
| Tablet | 640-1023px | 2-column grid, visible nav |
| Desktop | 1024-1279px | 3-column grid, full nav |
| Wide | 1280px+ | 4-column grid, full nav, max-width container |

---

## 19 — Admin Panel

### Routes

| Route | Page | Access |
|-------|------|--------|
| `/admin` | Dashboard (stats, charts, recent orders) | ADMIN, SUPER_ADMIN |
| `/admin/products` | Product list (table with search/filter/pagination) | ADMIN, SUPER_ADMIN |
| `/admin/products/new` | Create product form | ADMIN, SUPER_ADMIN |
| `/admin/products/[id]` | Edit product | ADMIN, SUPER_ADMIN |
| `/admin/orders` | Order management (list, filter by status) | ADMIN, SUPER_ADMIN |
| `/admin/orders/[id]` | Order detail (items, status update, notes) | ADMIN, SUPER_ADMIN |
| `/admin/users` | User management (list, roles) | SUPER_ADMIN |
| `/admin/cms` | CMS pages (home, about, contact, faq) | ADMIN, SUPER_ADMIN |
| `/admin/journal` | Journal/Article management | ADMIN, SUPER_ADMIN |
| `/admin/categories` | Category management | ADMIN, SUPER_ADMIN |
| `/admin/collections` | Collection management | ADMIN, SUPER_ADMIN |
| `/admin/coupons` | Coupon/Campaign management | ADMIN, SUPER_ADMIN |
| `/admin/reviews` | Review moderation | ADMIN, SUPER_ADMIN |
| `/admin/shipping` | Shipping settings | ADMIN, SUPER_ADMIN |
| `/admin/taxes` | Tax settings | ADMIN, SUPER_ADMIN |
| `/admin/settings` | Site settings | SUPER_ADMIN |
| `/admin/media` | Media library | ADMIN, SUPER_ADMIN |
| `/admin/audit-logs` | Audit log viewer | SUPER_ADMIN |
| `/admin/analytics` | Sales analytics | ADMIN, SUPER_ADMIN |

### Dashboard Stats

```ts
// src/app/api/admin/dashboard/route.ts
export async function GET() {
  const [totalOrders, totalRevenue, totalUsers, totalProducts, recentOrders] =
    await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true }, where: { status: 'CONFIRMED' } }),
      prisma.user.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } } },
      }),
    ]);

  return successResponse({
    stats: {
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      totalUsers,
      totalProducts,
    },
    recentOrders,
  });
}
```

### Admin Form Patterns

**Create/Edit Product:**
- Fields: name, slug (auto-generated), description (rich text), price, compareAtPrice, brand, category, collection, tags, images (multi-upload), variants (dynamic), isActive, isFeatured, isTrending, isBestSeller, featuredOrder
- Image upload via ImageUpload component → Supabase Storage
- Autosave or draft status for long forms
- Variants: dynamic form rows for each size × color combination

**Order Management:**
- Order details: items, customer info, shipping address, payment status
- Status update dropdown (with confirmation)
- Order notes (internal, customer-visible)
- Refund button (triggers Stripe refund)
- Invoice re-send button

### Admin UI Requirements

- Sidebar navigation with active state highlighting
- Responsive data tables with: sort, search, pagination, column visibility
- Confirmation dialogs for destructive actions (delete, refund, cancel order)
- Toast notifications for all CRUD operations
- Audit logging for every state-changing action
- Keyboard shortcuts (Ctrl+S to save, Escape to close modals)

---

## 20 — Testing

### Test Architecture

| Layer | Tool | What to Test |
|-------|------|--------------|
| Unit | Vitest | Utilities, helpers, validation schemas, hooks |
| Integration | Vitest | API routes, database operations, auth flow |
| E2E | Playwright | Critical user journeys, responsive design |
| Accessibility | axe-core via Playwright | WCAG 2.2 AA compliance |

### Test Structure

```
src/
├── __tests__/
│   ├── lib/              # Unit tests for utilities
│   │   ├── rate-limit.test.ts
│   │   ├── csrf.test.ts
│   │   ├── payment.test.ts
│   │   └── email.test.ts
│   ├── app/
│   │   ├── api/          # Integration tests for API routes
│   │   │   ├── auth/
│   │   │   ├── products/
│   │   │   └── checkout/
│   │   └── pages/        # Component tests (optional)
│   └── e2e/              # Playwright E2E tests
│       ├── auth.spec.ts
│       ├── shop.spec.ts
│       ├── checkout.spec.ts
│       └── admin.spec.ts
```

### Unit Test Examples

```ts
// src/__tests__/lib/csrf.test.ts
import { generateCsrfToken, validateCsrfToken } from '@/lib/csrf';

describe('CSRF', () => {
  const secret = 'test-secret';

  it('generates a valid token', () => {
    const token = generateCsrfToken(secret);
    expect(token).toMatch(/^\d+\.[a-f0-9]{64}$/);
  });

  it('validates a correct token', () => {
    const token = generateCsrfToken(secret);
    expect(validateCsrfToken(token, secret)).toBe(true);
  });

  it('rejects an invalid token', () => {
    expect(validateCsrfToken('invalid.token', secret)).toBe(false);
  });

  it('rejects an expired token', () => {
    const expiredToken = '0.' + 'a'.repeat(64);
    expect(validateCsrfToken(expiredToken, secret)).toBe(false);
  });
});
```

### Integration Test Pattern

```ts
// src/__tests__/app/api/auth/register.test.ts
import { createMocks } from 'node-mocks-http';
import { POST } from '@/app/api/auth/register/route';

describe('POST /api/auth/register', () => {
  it('registers a new user', async () => {
    const req = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test User',
      }),
    });

    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.email).toBe('test@example.com');
  });

  it('rejects duplicate email', async () => {
    // ...register same email again
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(409);
    expect(data.success).toBe(false);
  });
});
```

### E2E Tests (Playwright)

```ts
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test('user can register and login', async ({ page }) => {
  await page.goto('/register');
  await page.fill('[name="name"]', 'Test User');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'Password123!');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/');
  await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
});
```

### Accessibility Tests

```ts
// e2e/a11y.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Homepage accessibility', () => {
  test('should not have any WCAG 2.2 AA violations', async ({ page }) => {
    await page.goto('/');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2aa', 'wcag2a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
```

### Testing Quality Gates

| Gate | Threshold |
|------|-----------|
| Unit test coverage (utilities) | ≥ 95% |
| Integration test pass rate | 100% |
| E2E test pass rate | 100% |
| Accessibility violations | 0 |
| API route coverage (critical) | 100% |
| Test execution time | < 2 minutes |

---

## 21 — CI/CD

### GitHub Actions: CI Pipeline

```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

env:
  NODE_VERSION: 20
  DATABASE_URL: postgresql://postgres:postgres@localhost:5432/pea-fits-test

jobs:
  quality:
    name: Quality Checks
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: pea-fits-test
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - run: npm ci

      - name: Prisma Generate
        run: npx prisma generate

      - name: Prisma Migrate (Test DB)
        run: npx prisma migrate deploy

      - name: TypeScript Check
        run: npx tsc --noEmit

      - name: Lint
        run: npm run lint

      - name: Unit & Integration Tests
        run: npm test
        env:
          NEXTAUTH_SECRET: test-secret
          NEXTAUTH_URL: http://localhost:3000
          STRIPE_SECRET_KEY: sk_test_mock
          KHALTI_SECRET_KEY: test-key

      - name: Build
        run: npm run build

      - name: Security Audit
        run: npm audit --audit-level=high

      - name: Dependency Review
        uses: actions/dependency-review-action@v4
        if: github.event_name == 'pull_request'

  e2e:
    name: E2E Tests
    needs: quality
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: pea-fits-test
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - run: npm ci
      - run: npx prisma generate
      - run: npx playwright install --with-deps

      - name: Start Dev Server
        run: npm run dev &
        env:
          DATABASE_URL: ${{ env.DATABASE_URL }}
          NEXTAUTH_SECRET: test-secret
          NEXTAUTH_URL: http://localhost:3000

      - name: Run E2E Tests
        run: npx playwright test

      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

### Branch Strategy

```
main          → Production deployments
├── develop   → Pre-production (staging)
│   ├── feature/*  → New features
│   ├── fix/*      → Bug fixes
│   └── refactor/* → Refactoring
```

### Vercel Configuration

- Production branch: `main`
- Automatic preview deployments on PRs
- Environment variables set in Vercel dashboard
- Custom domain: peafits.com.np (with SSL)
- Vercel Analytics + Speed Insights enabled

---

## 22 — Monitoring

### Sentry Error Tracking

```bash
npm i @sentry/nextjs
```

```ts
// src/lib/sentry.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
```

### Health Check Endpoint

```ts
// src/app/api/health/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - start;
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      db: { connected: true, latency: dbLatency },
      memory: process.memoryUsage(),
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      db: { connected: false, error: (error as Error).message },
    }, { status: 503 });
  }
}
```

### Vercel Cron Jobs (Serverless)

```ts
// src/app/api/cron/cleanup-stale-carts/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days
  const deleted = await prisma.cart.deleteMany({
    where: { updatedAt: { lt: cutoff } },
  });
  return NextResponse.json({ deleted: deleted.count });
}
```

```ts
// src/app/api/cron/expire-orders/route.ts
export async function GET() {
  const cutoff = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes
  const expired = await prisma.order.updateMany({
    where: { status: 'PENDING', createdAt: { lt: cutoff } },
    data: { status: 'CANCELLED' },
  });
  return NextResponse.json({ cancelled: expired.count });
}
```

**Vercel cron config (vercel.json):**
```json
{
  "crons": [
    { "path": "/api/cron/cleanup-stale-carts", "schedule": "0 3 * * *" },
    { "path": "/api/cron/expire-orders", "schedule": "*/15 * * * *" }
  ]
}
```

### Alerts

| Alert | Threshold | Channel |
|-------|-----------|---------|
| Error rate > 5% | Last 5 minutes | Email + Sentry |
| API 5xx rate > 1% | Last 5 minutes | Email + Sentry |
| Payment failure rate > 10% | Last hour | Email |
| Order processing failure | Any failure | SMS (urgent) |
| Disk space > 80% | Database | Email |
| SSL cert expiry < 30 days | Daily check | Email |
| Rate limit threshold hit > 100/hour | Admin endpoints | Email |

---

## 23 — Deployment

### Prerequisites

Before deploying, verify:
- [ ] Supabase project created and accessible
- [ ] Supabase Storage buckets created
- [ ] PostgreSQL connection string working
- [ ] Stripe account set up (test mode)
- [ ] Stripe webhook endpoint configured
- [ ] Resend API key generated
- [ ] Domain DNS configured (peafits.com.np)
- [ ] Google OAuth credentials configured
- [ ] Upstash Redis instance created
- [ ] All environment variables documented

### Environment Variables (Production)

```
# Required
DATABASE_URL=postgresql://...?pgbouncer=true&connection_limit=1
NEXTAUTH_SECRET=<random-64-char-string>
NEXTAUTH_URL=https://peafits.com.np
NEXT_PUBLIC_URL=https://peafits.com.np

# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Khalti
KHALTI_SECRET_KEY=live_secret_key_...
KHALTI_PUBLIC_KEY=live_public_key_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# Resend
RESEND_API_KEY=re_...
EMAIL_FROM=PEA FITS <noreply@peafits.com.np>

# Upstash Redis
UPSTASH_REDIS_URL=https://[region].upstash.io
UPSTASH_REDIS_TOKEN=<token>

# Google OAuth
AUTH_GOOGLE_ID=<client-id>
AUTH_GOOGLE_SECRET=<client-secret>

# Optional
SENTRY_DSN=https://[key]@[org].ingest.sentry.io/[project]
```

### Deployment Steps

1. **Push to GitHub**
   ```bash
   git init
   git add -A
   git commit -m "Initial production setup"
   git remote add origin https://github.com/[user]/pea-fits.git
   git push -u origin main
   ```

2. **Set up Vercel Project**
   - Connect GitHub repo
   - Framework: Next.js
   - Root directory: `./`
   - Build command: `npm run build`
   - Output directory: `.next`
   - Install all environment variables

3. **Configure Database**
   - Run migrations: `npx prisma migrate deploy` (via Vercel Post-Deploy hook or manually)
   - Seed data: `npx prisma db seed` (via Vercel CLI or one-off script)

4. **Configure Domain**
   - Add custom domain in Vercel dashboard
   - Update DNS records (CNAME or nameservers)
   - Wait for SSL provisioning

5. **Configure Third-Party Services**
   - Update Stripe webhook URL to `https://peafits.com.np/api/webhooks/stripe`
   - Update Google OAuth redirect URI to `https://peafits.com.np/api/auth/callback/google`
   - Verify Resend domain sending

6. **Post-Deployment Verification**
   - [ ] Visit homepage — loads correctly
   - [ ] Browse products — images load, filters work
   - [ ] Register account — confirmation received
   - [ ] Login — session persists
   - [ ] Password reset — email received, token works
   - [ ] Add to cart — persists across page loads
   - [ ] Checkout with Stripe — test card succeeds
   - [ ] Webhook fires — order status updates
   - [ ] Admin panel — full CRUD operations
   - [ ] Lighthouse — 100/100/100/100
   - [ ] Mobile responsive — all pages render correctly
   - [ ] Sentry — no errors in dashboard

---

## 24 — Disaster Recovery

### Backup Strategy

| Item | Frequency | Retention | Method |
|------|-----------|-----------|--------|
| Database | Daily | 30 days | Supabase automated backup |
| Database (point-in-time) | Continuous | 7 days | Supabase PITR |
| Uploaded files (Storage) | Real-time | - | Supabase Storage (multi-region) |
| Environment variables | Per change | - | Vault/1Password (encrypted) |
| Source code | Per commit | - | GitHub |

### Restore Procedures

**Database Restore:**
```bash
# 1. Stop the app (Vercel → disable production deployment)
# 2. Restore from Supabase backup
supabase db restore --backup-id <backup-id>

# 3. Run any missing migrations
npx prisma migrate deploy

# 4. Verify data integrity
npx prisma validate
npx prisma db seed --dry-run

# 5. Re-enable deployment
```

**File Storage Restore:**
- Supabase Storage keeps object versions
- Restore from trash/version history in Supabase dashboard

**Full Rollback:**
```bash
# 1. Vercel → Deployments → find last known-good deployment
# 2. Promote to Production
# 3. If database migration was applied:
#    npx prisma migrate reset (WARNING: destructive)
#    # or manually reverse the migration
```

### Runbook: Common Scenarios

**Scenario 1: Database corruption**
1. Identify corruption time
2. Restore database to point before corruption
3. Verify data integrity
4. Re-apply any idempotent operations (orders after corruption time)
5. Notify affected users

**Scenario 2: Payment webhook failure**
1. Check Stripe dashboard for events with `failed_delivery`
2. Manually retry events in Stripe dashboard
3. If order statuses are out of sync, run reconciliation script

**Scenario 3: Failed deployment**
1. Vercel automatically rolls back on build failure
2. If deployment succeeds but app errors: roll back to previous deployment
3. Fix the issue in a new PR, deploy via normal CI/CD

**Scenario 4: Security incident**
1. Rotate all credentials (env vars)
2. Suspend any compromised accounts
3. Restore from backup if data was tampered
4. Audit logs for suspicious activity
5. Notify affected users (if PII was exposed)

### Monitoring Recovery

- Sentry alert on critical errors → investigate within 15 min
- Health check fails → auto-restart Vercel function → alert if persistent
- Payment processing fails → manual reconciliation within 1 hour

---

## 25 — Documentation

### Required Documents

| File | Content | Audience |
|------|---------|----------|
| `README.md` | Project overview, tech stack, quick start, essential commands | New developers |
| `DEPLOYMENT.md` | Full deployment guide, env var table, DNS setup, post-deploy checks | DevOps |
| `ARCHITECTURE.md` | System architecture, data flow, folder structure, tech decisions | Engineers |
| `API.md` | All API routes, request/response shapes, auth requirements | Frontend/API devs |
| `DATABASE.md` | Schema overview, ERD, model descriptions, indexes, migration guide | Backend devs |
| `DISASTER_RECOVERY.md` | Backup strategy, restore procedures, rollback, runbooks | DevOps |
| `CONTRIBUTING.md` | Code standards, PR process, commit conventions, review checklist | Contributors |
| `CHANGELOG.md` | Version history, breaking changes, feature additions | All |
| `SECURITY.md` | Security practices, CSP, responsible disclosure | Security researchers |

### README Template

```md
# PEA FITS

Personalised women-only fashion e-commerce platform for Nepal.

**Tech Stack:** Next.js 15 (App Router) · TypeScript (strict) · Prisma 6 · PostgreSQL (Supabase) · NextAuth v5 · Stripe · Khalti · Resend · TailwindCSS v4 · Zustand 5 · Vitest · Playwright

## Quick Start

```bash
npm ci
cp .env.example .env.local  # fill in required vars
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm test` | Run tests |
| `npm run lint` | ESLint check |
| `npm run typecheck` | TypeScript check |
| `npx prisma studio` | Database UI |

## Environment Variables

See `.env.example` for all required variables.

## Architecture

See `ARCHITECTURE.md` for detailed system architecture.

## Deployment

See `DEPLOYMENT.md` for production deployment guide.
```

### Documentation Standards

- Every document must have a clear title and purpose
- Use consistent heading hierarchy (h1 → h2 → h3)
- Include code blocks with language annotations
- Include diagrams where helpful (text-based Mermaid diagrams)
- Keep docs in sync with code (review on every PR)
- Mark deprecated/outdated sections clearly

---

## 26 — Code Review

### Pre-Merge Checklist

**Functional:**
- [ ] The feature works as described in requirements
- [ ] All edge cases are handled (empty states, errors, loading)
- [ ] No regression in existing functionality

**Code Quality:**
- [ ] TypeScript: no errors, no `any`, no pragmas
- [ ] Tests: new code has tests, all existing tests pass
- [ ] No dead code, console.log, commented-out code, TODOs
- [ ] Follows existing patterns in the codebase

**Security:**
- [ ] Input validation (Zod or HTML sanitization)
- [ ] Auth/Z: proper role checks for admin/protected operations
- [ ] No secrets exposed (env vars, not hardcoded)
- [ ] Safe from common attacks (XSS, CSRF, injection)

**Performance:**
- [ ] No unnecessary re-renders (memoization considered)
- [ ] Images optimized (next/image, lazy loading, sizes)
- [ ] Bundle size impact considered

**UX:**
- [ ] Mobile responsive
- [ ] Loading states present
- [ ] Error states present
- [ ] Accessibility: proper ARIA, keyboard nav, contrast

### PR Template

```md
## Description
<!-- Brief description of what this PR does -->

## Type of Change
- [ ] Feature
- [ ] Bug fix
- [ ] Refactor
- [ ] Documentation
- [ ] Dependency update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing performed

## Screenshots
<!-- If UI changes -->

## Checklist
- [ ] TypeScript check passes
- [ ] ESLint passes
- [ ] Tests pass
- [ ] Build passes
- [ ] Accessibility requirements met
- [ ] Responsive design verified
- [ ] No TODOs or FIXMEs added
```

### Review Velocity Guidelines

- Small PRs (< 200 lines): review within 2 hours
- Medium PRs (200-500 lines): review within 4 hours
- Large PRs (500+ lines): review within 1 business day
- Emergency fixes: review as soon as available

---

## 27 — Refactoring

### Refactoring Triggers

1. **TypeScript errors** — Any `as any`, `@ts-ignore`, or type mismatch is an immediate refactoring target
2. **Code duplication** — Same pattern appearing 3+ times, extract utility
3. **Large components** — > 300 lines, split into smaller focused components
4. **Deep nesting** — > 3 levels of nesting (callback, conditional, or JSX), restructure
5. **Mixed concerns** — Component doing data fetching + state management + rendering → split
6. **Magic values** — Any hardcoded number/string that should be a named constant
7. **Unused code** — Dead exports, imports, files, dependencies
8. **Slow tests** — Any test taking > 1 second, investigate and optimize

### Refactoring Patterns

**Component Splitting:**
```tsx
// ❌ Before: ProductPage.tsx (400 lines)
function ProductPage() {
  // data fetching, gallery logic, reviews, related products, add-to-cart...
}

// ✅ After:
// app/products/[slug]/page.tsx — fetches data, renders sections
// components/products/ProductGallery.tsx
// components/products/ProductInfo.tsx
// components/products/ProductReviews.tsx
// components/products/RelatedProducts.tsx
// components/products/AddToCartButton.tsx
```

**Extract Hooks:**
```tsx
// ❌ Before: data fetching + state in component
function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [debounced, setDebounced] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    fetch(`/api/products/search?q=${debounced}`).then(...)
  }, [debounced]);
}

// ✅ After: custom hook
function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const debouncedQuery = useDebounce(query, 300);
  
  useEffect(() => {
    fetch(`/api/products/search?q=${debouncedQuery}`).then(...)
  }, [debouncedQuery]);

  return { query, setQuery, results };
}
```

**Centralize Business Logic:**
```tsx
// src/lib/queries/products.ts
export async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { isFeatured: true, isActive: true },
    select: { id: true, name: true, slug: true, price: true, images: true },
    orderBy: { featuredOrder: 'asc' },
    take: 8,
  });
}
```

### Refactoring Order (Priority)

1. Files with TypeScript errors → safety
2. API routes without validation → security
3. Large components → maintainability
4. Hot paths (homepage, product list, checkout) → performance
5. Deeply nested conditionals → readability
6. Repeated patterns → DRY

---

## 28 — Edge Cases

### Error States Checklist

**Network:**
- [ ] Slow network (3G throttling test)
- [ ] Offline (no connectivity — show cached content or offline page)
- [ ] API timeout (show retry option after 10s)
- [ ] API 500 error (show friendly error, log to Sentry)
- [ ] Rate limited (429 — show retry-after message)

**Authentication:**
- [ ] Session expired mid-session (redirect to login, preserve intended destination)
- [ ] Token invalid (clear cookies, redirect to login)
- [ ] Concurrent logins (last login wins, no session conflicts)
- [ ] OAuth failure (Google login cancelled, redirect back with error message)

**Payments:**
- [ ] Card declined (specific error message)
- [ ] Insufficient funds
- [ ] 3D Secure authentication required
- [ ] Duplicate checkout submission (idempotency key)
- [ ] Payment timeout (customer closes Stripe page — webhook timeout handler)
- [ ] Webhook delivery failure (Stripe retries, manual reconciliation)
- [ ] Order total discrepancy (compare client vs. server calculation)

**Cart & Inventory:**
- [ ] Item out of stock during checkout (notify user, remove from cart)
- [ ] Price changed since adding to cart (show updated price, ask confirmation)
- [ ] Product deleted while in cart (show "unavailable" message)
- [ ] Variant discontinued while in cart (suggest alternatives)
- [ ] Cart merge after login (merge guest cart with user's saved cart)
- [ ] Maximum quantity per item reached (enforce limit)

**User Input:**
- [ ] XSS attempts in forms, search, reviews (sanitize output)
- [ ] SQL injection attempts (Prisma handles this)
- [ ] Unicode/non-ASCII characters (name, address, email)
- [ ] Excessively long input (trim or reject)
- [ ] Emoji in product reviews (display correctly)
- [ ] Malformed email addresses (Zod validation)

**File Uploads:**
- [ ] Very large file (> 5MB — reject with message)
- [ ] Wrong file type (reject with allowed types list)
- [ ] Image too small (< 200×200 for products — warn or reject)
- [ ] Corrupted image file (show upload error)
- [ ] Upload timeout (large files on slow connection)
- [ ] Storage bucket full (handle 503 from Supabase)

**Concurrency:**
- [ ] Two users buying the last item simultaneously (transaction handles this)
- [ ] Admin editing a product while customer is viewing it (draft/publish pattern)
- [ ] Webhook firing while checkout is still processing (idempotency)
- [ ] Multiple rapid clicks on "Place Order" (disable button after first click)

**Session & State:**
- [ ] Back button after checkout (show "already processed" page)
- [ ] Browser refresh mid-checkout (restore cart state)
- [ ] Opening product page in multiple tabs (each tab works independently)
- [ ] Browser compatibility (test Chrome, Firefox, Safari, Edge, mobile browsers)

---

## 29 — AI Coding Rules

### How AI Agents Should Operate on This Codebase

1. **Read first, change later** — Before modifying any file, read it completely. Understand the full context of the function/component before making changes.

2. **One logical change per step** — For complex multi-file changes, implement one logical change at a time and validate before moving to the next.

3. **Validate after every change** — After every cluster of changes:
   ```bash
   npm run lint && npx tsc --noEmit && npm test && npm run build
   ```
   Fix any issues introduced before proceeding.

4. **Prefer surgical patches** — Use `patch` for targeted changes. Only use `write_file` for new files or when a file needs a complete rewrite.

5. **Don't break existing patterns** — Follow the established conventions in the codebase. If routes use `successResponse`/`errorResponse`, new routes should too. If components use Tailwind classes, so should new ones.

6. **Don't refactor what you're not asked to** — Fix bugs and implement features. Don't rewrite working code for style preferences. If the code works and follows patterns, leave it alone.

7. **Test the happy path AND error path** — Every API route needs both success and error handling. Every component needs loading, empty, error, and success states.

8. **Never trust external input** — Every request body, query parameter, URL param, and header must be validated. Never assume data is clean.

9. **Never hardcode secrets** — Use environment variables for everything: API keys, URLs, configuration values. The `.env.local` file is gitignored.

10. **Document as you go** — When you add a new feature, update the relevant docs. When you change behavior, update the docs. Documentation is not optional.

### Priority of Operations

```
1. Fix TypeScript errors (safety)
2. Add missing validation (security)
3. Implement missing features (functionality)
4. Add tests (reliability)
5. Optimize performance (speed)
6. Improve accessibility (inclusivity)
7. Add documentation (maintainability)
8. Refactor for clarity (evolvability)
```

### What NOT to Do

- ❌ Don't use `as any` or `@ts-ignore` — ever
- ❌ Don't leave `console.log` in committed code
- ❌ Don't add TODO/FIXME comments — do it now or don't start
- ❌ Don't write placeholder code — implement the real thing
- ❌ Don't skip error handling — every try/catch must return a proper error response
- ❌ Don't add unused imports, variables, or functions
- ❌ Don't introduce new dependencies without considering bundle size and security
- ❌ Don't make changes that would require a user to clear their cookies/localStorage to recover
- ❌ Don't send credentials in URLs or response bodies

---

## 30 — Production Checklist

### Pre-Launch Verification

**Build & Compilation**
- [ ] `npm run build` — zero errors, zero warnings
- [ ] `npx tsc --noEmit` — zero TypeScript errors
- [ ] `npm run lint` — zero errors, warnings ≤ current baseline
- [ ] `npx prisma validate` — zero warnings
- [ ] `npm audit --audit-level=high` — zero high/critical vulnerabilities
- [ ] `npx vitest run` — 100% pass rate (0 failures, 0 skipped)
- [ ] Lighthouse CI — 100/100/100/100 across all page types

**Functional Tests**
- [ ] User registration with email
- [ ] User login (credentials + Google OAuth)
- [ ] Password reset (email → token → new password)
- [ ] Browse all categories and collections
- [ ] Filter by price, size, color, brand, category
- [ ] Search products (full-text)
- [ ] Product detail: images, variants, reviews, related products
- [ ] Add to cart (logged in + guest)
- [ ] Cart: update quantity, remove, persist across sessions
- [ ] Checkout with Stripe (test card 4242...)
- [ ] Checkout with Khalti
- [ ] Webhook → order status updated
- [ ] Order confirmation page loads
- [ ] Order history in profile
- [ ] Wishlist: add, remove, view
- [ ] Back-in-stock notification request
- [ ] Recently viewed products shown
- [ ] Contact form submission
- [ ] Newsletter signup

**Admin Panel**
- [ ] Dashboard: stats load correctly
- [ ] Products: create, read, update, archive, restore
- [ ] Image upload → Supabase Storage → displayed correctly
- [ ] Orders: view, update status, add notes
- [ ] Users: view, update roles (SUPER_ADMIN only)
- [ ] CMS: edit home, about, contact, faq pages
- [ ] Journal: create, edit, publish articles
- [ ] Categories/Collections: CRUD
- [ ] Coupons: create, activate, deactivate
- [ ] Shipping settings: update, reflected in checkout
- [ ] Tax settings: update, reflected in checkout
- [ ] Site settings: update (logo, name, contact info)
- [ ] Media library: upload, delete
- [ ] Audit logs: view, filter by action/resource

**Security**
- [ ] Admin routes blocked for CUSTOMER role
- [ ] All state-changing requests require CSRF token
- [ ] Rate limiting on: register, login, reset-password, checkout, contact
- [ ] CSP headers applied and tested
- [ ] Cookies: Secure, HttpOnly, SameSite=Lax
- [ ] No environment variables exposed in client bundle
- [ ] Webhook signature verification working
- [ ] File upload validation (type + size)
- [ ] Input validation on all API routes
- [ ] `npm audit` — zero vulnerabilities

**UX**
- [ ] Mobile responsive: 320px, 375px, 414px
- [ ] Tablet responsive: 768px, 1024px
- [ ] Desktop responsive: 1280px, 1440px, 1920px
- [ ] Loading skeletons on all data pages
- [ ] Empty states for: cart, orders, wishlist, search results
- [ ] Error states with retry option on all pages
- [ ] Toast notifications for: add-to-cart, order-placed, login, error
- [ ] Keyboard navigable (Tab, Enter, Escape)
- [ ] Screen reader compatible (NVDA test)

**SEO**
- [ ] Sitemap.xml accessible and contains all active products + pages
- [ ] Robots.txt allows all public pages
- [ ] Every page has unique `<title>` and `<meta name="description">`
- [ ] OpenGraph tags on: home, product, collection, article pages
- [ ] Twitter Card tags on all pages with images
- [ ] Canonical URL on every page (self-referencing)
- [ ] JSON-LD: Organization, Product (with offers), Article, BreadcrumbList
- [ ] No broken internal links (all hrefs resolve)
- [ ] No duplicate content (canonical resolves this)

**Infrastructure**
- [ ] PostgreSQL database connected and responsive
- [ ] Supabase Storage buckets created and accessible
- [ ] Stripe webhook verified (dashboard shows recent events)
- [ ] Khalti callback URL configured
- [ ] Resend email sending verified (test email sent and received)
- [ ] Upstash Redis connected (rate limiting works)
- [ ] Environment variables validated on startup
- [ ] Vercel deployment successful (no build errors)
- [ ] Custom domain configured with valid SSL certificate
- [ ] Database backup strategy active
- [ ] Monitoring (Sentry) connected and reporting

**Documentation**
- [ ] README.md complete with setup instructions
- [ ] DEPLOYMENT.md contains env var table and deploy steps
- [ ] ARCHITECTURE.md contains system diagram
- [ ] API.md documents all public API routes
- [ ] DATABASE.md documents schema + indexes
- [ ] DISASTER_RECOVERY.md documents backup/restore procedures
- [ ] CONTRIBUTING.md documents PR process + coding standards
- [ ] CHANGELOG.md documents history

### Launch Sequence

```
1. Final build + test pass (CI green)
2. Deploy to production (Vercel)
3. Verify all functional tests manually
4. Run Lighthouse audit on top 5 pages
5. Verify Stripe webhook delivery
6. Send test email through Resend
7. Verify rate limiting with rapid requests
8. Check Sentry dashboard for errors
9. Monitor for 30 minutes
10. Announce launch
```

### Rollback Criteria (immediate rollback if any):

- ❌ Homepage returns 500 or fails to load
- ❌ Checkout flow broken (cannot place orders)
- ❌ Payment processing failing (orders stuck at PENDING)
- ❌ Login/Auth completely broken
- ❌ Database corruption detected
- ❌ Security vulnerability discovered post-deploy

---

## 31 — Acceptance Criteria

### Must-Have (Launch Blockers)

These are absolute requirements for production launch. If any is missing, the launch is blocked.

| # | Criterion | Verification |
|---|-----------|-------------|
| A1 | Customer can register an account | Test: register with valid email + password |
| A2 | Customer can log in with credentials | Test: login, receive session, access profile |
| A3 | Customer can browse all products | Test: visit /products, see paginated grid |
| A4 | Customer can view product details | Test: visit /products/[slug], see images + info |
| A5 | Customer can filter by category/collection | Test: visit /collections/[slug], see filtered products |
| A6 | Customer can add items to cart | Test: click "Add to Cart", cart count updates |
| A7 | Customer can complete checkout | Test: cart → checkout → Stripe → success page |
| A8 | Payment is processed and order is confirmed | Test: Stripe test card → webhook → order = CONFIRMED |
| A9 | Customer receives order confirmation email | Test: order placed → email received |
| A10 | Customer can view order history | Test: visit /profile/orders, see past orders |
| A11 | Customer can reset password | Test: request reset → email → new password → login |
| A12 | Admin can log in to admin panel | Test: visit /admin, see dashboard |
| A13 | Admin can manage products | Test: create, edit, archive, restore product |
| A14 | Admin can view and update orders | Test: view order detail, change status |
| A15 | Admin routes are protected | Test: non-admin redirected from /admin |
| A16 | Site loads on mobile devices | Test: 375px viewport, all pages functional |
| A17 | Site loads in 3 seconds on 3G | Test: Lighthouse performance audit |
| A18 | No security vulnerabilities | Test: npm audit, Zap/OWASP scan |

### Should-Have (Launch Priorities)

These should be implemented before launch but don't block it entirely.

| # | Criterion | Priority |
|---|-----------|----------|
| B1 | Customer can log in with Google | High |
| B2 | Customer can add items to wishlist | High |
| B3 | Customer can write product reviews | Medium |
| B4 | Admin dashboard shows revenue stats | High |
| B5 | Admin can manage categories/collections | High |
| B6 | Admin can manage coupons | Medium |
| B7 | Coupon codes can be applied at checkout | Medium |
| B8 | Back-in-stock notifications | Medium |
| B9 | Recently viewed products | Low |
| B10 | Journal/Blog with articles | Medium |
| B11 | Contact form sends email to admin | High |
| B12 | CMS pages (about, FAQ, shipping policy) | Medium |
| B13 | Site-wide search (products + articles) | High |
| B14 | Newsletter signup | Low |

### Nice-to-Have (Post-Launch)

| # | Criterion |
|---|-----------|
| C1 | Gift cards (purchase + redeem) |
| C2 | Save for later in cart |
| C3 | Product video gallery |
| C4 | Size guide modal on product page |
| C5 | Order tracking (via SMS/email) |
| C6 | Multi-language support (Nepali + English) |
| C7 | Product comparison tool |
| C8 | AI-powered product recommendations |
| C9 | Abandoned cart recovery emails |
| C10 | Customer loyalty program |

---

## 32 — Final Master Prompt

### About This Document

This is the complete engineering specification for PEA FITS — a 45,000-word, 32-chapter master document that serves as the single source of truth for all development work on this project.

**Every AI coding agent working on this project should be given this document as context.**

### How to Use This Specification

1. **Read it first** — Before making any changes, read the relevant chapters. All design decisions, standards, and patterns are documented here.

2. **Follow the phase order** — The phases in Chapter 30 (Production Checklist) define the execution order. Complete Phase 0 before Phase 1.

3. **Pass the gates** — Every phase must pass the quality gates defined in Chapter 1 before moving on.

4. **Stop only for credentials** — Autonomous execution continues until a credential or manual step is required. Output a numbered checklist, wait for confirmation, then continue.

5. **Keep it updated** — If you discover something missing, incorrect, or outdated in this specification, update it. This document should always reflect the current truth.

### Quick Reference

| Need | See Chapter |
|------|-------------|
| Execution authority and rules | 01 — AI Operating System |
| Immutable engineering laws | 02 — Engineering Constitution |
| Current project state | 03 — Repository Audit |
| System architecture diagram | 04 — System Architecture |
| Component design patterns | 05 — Frontend Standards |
| API route patterns | 06 — Backend Standards |
| Schema design and indexes | 07 — Database Engineering |
| Prisma query patterns | 08 — Prisma Standards |
| Auth and RBAC implementation | 09 — Authentication & Authorization |
| Security checklist | 10 — Security Handbook |
| Payment flow (Stripe + Khalti) | 11 — Payment Architecture |
| Supabase Storage integration | 12 — Supabase & Storage |
| Email templates and sending | 13 — Email System |
| Rate limiting and caching | 14 — Redis & Caching |
| Performance optimization | 15 — Performance Engineering |
| SEO metadata and structured data | 16 — SEO |
| WCAG 2.2 AA accessibility | 17 — Accessibility |
| UI/UX component standards | 18 — UI/UX Standards |
| Admin panel routes and forms | 19 — Admin Panel |
| Test patterns and coverage | 20 — Testing |
| CI/CD pipeline configuration | 21 — CI/CD |
| Sentry monitoring and alerts | 22 — Monitoring |
| Deployment steps and env vars | 23 — Deployment |
| Backup and disaster recovery | 24 — Disaster Recovery |
| Required documentation | 25 — Documentation |
| Code review process | 26 — Code Review |
| Refactoring triggers and patterns | 27 — Refactoring |
| Edge case handling | 28 — Edge Cases |
| AI agent operating rules | 29 — AI Coding Rules |
| Pre-launch verification checklist | 30 — Production Checklist |
| Acceptance criteria | 31 — Acceptance Criteria |

### Final Directive

**You are now the Lead Principal Engineer for PEA FITS.**

You have the full specification. You have the authority. You have the quality gates.

**Execute.**

---

*PEA FITS — Master Specification v10*
*Generated: July 2026*
*Project: https://github.com/sahin-svgx/pea-fits*
