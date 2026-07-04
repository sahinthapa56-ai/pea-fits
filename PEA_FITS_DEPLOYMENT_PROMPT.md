# PEA FITS — Final Production Deployment Prompt

> **Target:** Transform PEA FITS from its current state (build ✅, tests ✅, core features working locally) into a fully production-ready, enterprise-grade e-commerce platform deployed on Vercel.
>
> **Current Build Status:** ✅ `npm run build` passes. ✅ All 99 tests pass (91 passed, 8 skipped).
>
> **Current Gaps:** Real credentials needed for Supabase, Stripe, Khalti, Resend, Upstash. No CI/CD pipeline. In-memory rate limiting fallback. Placeholder env vars. Payment integration wired but untested end-to-end.

---

## EXECUTIVE AUTHORITY

You are the Lead Principal Engineer, Architect, and Technical Lead for this project. From this point forward, you own the full technical implementation.

**You are authorized to:**
- Audit every file in the repository
- Refactor, rewrite, reorganize, split, merge, rename, or delete any code
- Add new utilities, services, middleware, hooks, models, migrations, tests, docs, and configs
- Fix every bug, warning, error, anti-pattern, architectural issue, security vulnerability, performance bottleneck, accessibility violation, and SEO problem
- Improve architecture, code quality, security, scalability, performance, accessibility, SEO, testing, CI/CD, documentation, and developer experience
- Prepare all configuration, migrations, environment validation, callback URLs, webhook handlers, storage buckets, and setup documentation

**without asking for confirmation.**

---

## EXECUTION MODE

Operate in **Autonomous Continuous Engineering Mode**.

```
loop:
  Audit → Identify issues → Prioritize → Implement fixes
  → Run lint → Run typecheck → Run tests → Run build
  → Fix failures → Refactor → Optimize → Continue
```

Do NOT stop after completing a single phase. Do NOT ask whether to continue. Continue working until the application is fully production-ready and deployed.

**Only stop when:**
1. The application has been successfully deployed and validated in production, OR
2. A task requires credentials, ownership, legal approval, payment provider activation, domain verification, or another action that only the repository owner can perform.

If blocked by missing credentials, implement everything that can be done locally, prepare all configuration, and output a concise checklist of exact manual actions needed. Then continue automatically once those are completed.

---

## QUALITY GATES

Every major milestone must pass all of these before continuing:
- ✅ TypeScript compilation (zero errors)
- ✅ ESLint (zero errors, warnings may be acceptable but should be minimized)
- ✅ Production build (`npm run build`)
- ✅ Test suite (`npx vitest run`)
- ✅ Prisma validation (`npx prisma validate`)
- ✅ Auth flow (register, login, password reset)
- ✅ Authorization (admin routes protected, RBAC enforced)
- ✅ Checkout flow (create order, payment redirect, webhook callback)
- ✅ API validation (all routes return correct status codes)
- ✅ Middleware (CSRF, rate limiting, origin checks)
- ✅ Route protection (unauthenticated users blocked from protected routes)
- ✅ Responsive layouts (mobile, tablet, desktop)
- ✅ Accessibility checks (WCAG 2.2 AA)

---

## NON-NEGOTIABLE RULES

- **Never produce:** placeholder code, fake implementations, temporary hacks, TODOs, FIXMEs, console.log debugging, mock production logic, partial implementations, unfinished systems.
- **Never skip:** anything. If there are 500 issues, fix all 500. If fixing one creates another, fix the new one too.
- **Always validate:** after every significant change, run lint, typecheck, tests, and build. Fix every issue before proceeding.
- **Leave it better:** whenever you touch code, leave it better than you found it. Reduce technical debt. Never introduce new debt.
- **Verify everything:** never assume something works. Verify with actual test output, build output, or runtime behavior.
- **Strong typing:** remove every `as any`, `@ts-ignore`, `@ts-expect-error`, unsafe cast, implicit any. Fix root causes.

---

## PROJECT CONTEXT

### Tech Stack
| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15.3.2 (App Router) |
| UI | React 19, TailwindCSS v4, Zustand 5 |
| Language | TypeScript (strict mode) |
| Database | Prisma 6.6.0 → PostgreSQL (via Supabase) |
| Auth | NextAuth v5 (beta.25) — JWT strategy, Credentials + Google OAuth |
| Payments | Stripe 22.3.0, Khalti (Nepal) |
| Email | Resend |
| Cache/Rate Limit | Upstash Redis |
| Image Storage | Supabase Storage |
| Validation | Zod 3.24.4 |
| Testing | Vitest, Playwright |

### Auth Architecture
- **Roles:** CUSTOMER, ADMIN, SUPER_ADMIN
- **Strategy:** JWT (no database sessions)
- **Adapter:** @auth/prisma-adapter
- **Routes:** Public (products, collections, journal), Protected (profile, orders, bag, wishlist), Admin (dashboard, products, orders, CMS, users, settings)
- **Middleware:** `src/middleware.ts` — route protection + CSRF enforcement

### Database (Prisma Schema)
25+ models including: User, Product, Variant, Order, OrderItem, Cart, Wishlist, Category, Collection, Coupon, JournalArticle, Review, VerificationToken, BackInStockRequest, GiftCard, GiftCardTransaction, AuditLog, FeaturedProduct, Testimonial, CMS, Banner, Media, NavLink, SiteSetting, SocialLink, EmailTemplate, ShippingConfig, TaxRate

### Current Audit Score: ~45/100
17 critical production blockers identified. Full gap analysis in `PEA_FITS_GAP_ANALYSIS.md`.

---

## PHASE 0: INFRASTRUCTURE & CREDENTIAL SETUP

**Priority: CRITICAL — unlocks everything else**

### 0.1 — Supabase Project
- [ ] Create Supabase project at https://supabase.com
- [ ] Note: Project URL, anon key, service_role key
- [ ] Enable Email Auth provider (for password reset)
- [ ] Create storage bucket: `product-images` (public), `cms-assets` (public), `avatars` (public)
- [ ] Set storage bucket CORS and security policies
- **Update `.env.local`:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

### 0.2 — PostgreSQL Migration
- [ ] Change `prisma/schema.prisma` provider from `sqlite` to `postgresql`
- [ ] Update `DATABASE_URL` in `.env` to Supabase PostgreSQL connection string (use connection pooling via `?pgbouncer=true&connection_limit=1`)
- [ ] Run `npx prisma migrate deploy` to apply all migrations
- [ ] Verify schema with `npx prisma validate`
- [ ] Run `npx prisma db seed` to populate test data
- **Prisma schema adjustment needed:** Replace `@default("[]")` for JSON string fields with proper JSON column types for PostgreSQL

### 0.3 — Payment Providers
- [ ] Create Stripe account (test mode) at https://dashboard.stripe.com
- [ ] Get `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] Configure Stripe webhook endpoint pointing to `https://your-domain.com/api/webhooks/stripe`
- [ ] Get `STRIPE_WEBHOOK_SECRET` for signature verification
- [ ] Create Khalti merchant account at https://khalti.com
- [ ] Get `KHALTI_SECRET_KEY` and `KHALTI_PUBLIC_KEY`

### 0.4 — Email (Resend)
- [ ] Create Resend account at https://resend.com
- [ ] Verify domain (or use Resend's test domain `@resend.dev` for initial setup)
- [ ] Get `RESEND_API_KEY`
- [ ] Set `EMAIL_FROM` env var

### 0.5 — Rate Limiting (Upstash Redis)
- [ ] Create Upstash Redis database at https://upstash.com
- [ ] Get `UPSTASH_REDIS_URL` and `UPSTASH_REDIS_TOKEN`

### 0.6 — OAuth (Google)
- [ ] Create Google OAuth credentials at https://console.cloud.google.com
- [ ] Add authorized redirect URI: `https://your-domain.com/api/auth/callback/google`
- [ ] Get `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`

### 0.7 — Vercel Deployment
- [ ] Connect GitHub repository to Vercel
- [ ] Configure all environment variables in Vercel dashboard
- [ ] Set custom domain (peafits.com.np)
- [ ] Configure Vercel Analytics

---

## PHASE 1: CRITICAL PRODUCTION BLOCKERS

**Priority: CRITICAL — must fix before any real customer can use the store**

### 1.1 — Real Email Sending
**Files:** `src/lib/email.ts`
- [ ] Remove `console.log` fallback in all email functions
- [ ] Implement actual Resend API calls with proper error handling
- [ ] Create HTML email templates for: password reset, order confirmation, shipping update, welcome email
- [ ] Add email sending retry logic (3 retries with exponential backoff)
- [ ] Add email sending logging/metrics
- **Validation:** Send a test email and verify delivery

### 1.2 — Real Password Reset Flow
**Files:** `src/app/api/auth/reset-password/route.ts`, `src/app/api/auth/reset-password/[token]/route.ts`, `src/app/reset-password/[token]/page.tsx`
- [ ] Verify token creation endpoint works (generates VerificationToken with expiry)
- [ ] Verify token verification endpoint correctly validates token + updates password
- [ ] Verify password reset email is actually sent via Resend
- [ ] Add proper error handling for expired tokens, invalid tokens, already-used tokens
- **Validation:** Complete end-to-end password reset flow in browser

### 1.3 — Real Payment Processing
**Files:** `src/app/api/checkout/route.ts`, `src/app/api/webhooks/stripe/route.ts`, `src/app/api/webhooks/khalti/route.ts`, `src/lib/payment.ts`
- [ ] Verify Stripe Checkout Session creation with correct line items, amounts, metadata
- [ ] Verify Stripe webhook signature verification (already implemented — verify it works with real secret)
- [ ] Verify Khalti payment verification endpoint
- [ ] Handle payment failure: inventory rollback, order status updates, email notification
- [ ] Handle webhook idempotency (prevent duplicate order processing)
- [ ] Add payment timeout handling (expire unpaid orders after 30 minutes)
- **Validation:** Run a real test payment (Stripe test card `4242 4242 4242 4242`) and verify webhook fires

### 1.4 — Supabase Storage Image Upload
**Files:** `src/components/ui/ImageUpload.tsx`, `src/app/api/admin/products/route.ts`
- [ ] Implement actual file upload to Supabase Storage bucket
- [ ] Add file type validation (only images: jpg, png, webp, avif)
- [ ] Add file size validation (max 5MB)
- [ ] Add image compression/optimization before upload
- [ ] Implement signed URL generation for private buckets
- [ ] Add orphan image cleanup (delete from storage when product image is replaced)
- **Validation:** Upload a product image through admin panel, verify it appears in Supabase Storage

### 1.5 — Production Rate Limiting
**Files:** `src/lib/rate-limit.ts`, `src/lib/rate-limit-prod.ts`, all API routes using rate limiting
- [ ] Ensure Upstash Redis is the primary rate limiter backend
- [ ] Add graceful fallback to in-memory limiter if Redis is unavailable
- [ ] Verify rate limits are applied to: auth (register, login, reset-password), checkout, contact form, admin API
- [ ] Add proper rate limit headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`)
- **Validation:** Send rapid requests to auth endpoints and verify 429 responses

### 1.6 — Centralize Shipping Configuration
**Files:** `src/lib/constants.ts`, checkout routes, order calculation
- [ ] Audit all hardcoded shipping values across the codebase
- [ ] Ensure `SHIPPING_COST_VALLEY`, `SHIPPING_COST_OUTSIDE`, `FREE_SHIPPING_THRESHOLD` from constants.ts are used everywhere
- [ ] Add database-backed `ShippingConfig` model for admin to update shipping settings
- [ ] Add admin UI to manage shipping settings
- **Validation:** Change shipping values in admin panel, verify checkout reflects new values

### 1.7 — Env Validation (Fail Fast)
**Files:** `src/lib/env.ts` (new)
- [ ] Create centralized environment validation using Zod
- [ ] Validate all required env vars at startup: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `RESEND_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `UPSTASH_REDIS_URL`, `UPSTASH_REDIS_TOKEN`
- [ ] Fail fast with clear error message if any required var is missing or malformed
- **Validation:** Remove an env var and verify the app fails with a helpful error

---

## PHASE 2: CODE QUALITY & ARCHITECTURE

**Priority: HIGH — improves maintainability and reliability**

### 2.1 — Fix All TypeScript Errors
- [ ] Scan all files for `as any`, `@ts-ignore`, `@ts-expect-error`
- [ ] Fix every instance with proper types
- [ ] Fix the Stripe apiVersion type in `src/lib/payment.ts` (currently pinned — ensure matches SDK)
- [ ] Fix session type in `src/lib/admin-auth.ts` (verify Session type from NextAuth works correctly)
- **Validation:** `npm run build` must produce zero TypeScript errors

### 2.2 — Remove Dead Code
- [ ] Delete `src/hooks/useTilt3D.ts`, `src/hooks/useScrollParallax.ts` (if unused)
- [ ] Delete `src/components/ui/Tilt3DShell.tsx` (if flattened to static wrapper and no longer needed)
- [ ] Delete `src/components/ui/ParallaxLayer.tsx` (if flattened to static wrapper and no longer needed)
- [ ] Run `npx depcheck` or manual audit for unused dependencies in `package.json`
- **Validation:** Build must still pass after deletions

### 2.3 — Eliminate ESLint Warnings
Target: Zero warnings (or as close as practical)
- [ ] Fix `react-hooks/exhaustive-deps` warnings — add missing deps to useEffect/useCallback
- [ ] Fix `@typescript-eslint/no-unused-vars` — remove or prefix unused variables
- [ ] Fix `@typescript-eslint/no-explicit-any` — replace with proper types
- [ ] Fix `@next/next/no-img-element` — replace `<img>` with `<Image />` from next/image
- Fix admin CMS routes with unused `NextRequest` imports (20+ files)

### 2.4 — Architecture Improvements
- [ ] Split large components (>300 lines) into smaller, focused components
- [ ] Centralize API response helpers (already have `successResponse`/`errorResponse` in admin-auth.ts — extend to all routes)
- [ ] Extract Zod schemas into a shared `src/lib/schemas/` directory
- [ ] Extract Prisma query helpers into `src/lib/queries/` directory
- [ ] Add proper error boundaries at page and layout level

---

## PHASE 3: DATABASE ENGINEERING

**Priority: HIGH — critical for production data integrity**

### 3.1 — Add Missing Indexes
Add indexes for query performance:
- `products.brand`
- `products.createdAt` (for sorting)
- `orders.createdAt` (for admin dashboard)
- `orders.userId`
- `orderItems.orderId`
- `reviews.productId`
- `journal_articles.publishedAt`
- `back_in_stock_requests.productId`
- `audit_logs.createdAt`
- `gift_cards.code` (unique index)

### 3.2 — JSONB for Tags
- [ ] Convert `Product.tags` from `String @default("[]")` to `Json @default("[]")` for PostgreSQL
- [ ] Convert `JournalArticle.tags` from `String @default("[]")` to `Json @default("[]")`
- [ ] Update all API routes to handle Json type instead of string parsing
- [ ] Add Zod schemas for tag validation (array of strings, max 10 tags, max 50 chars each)

### 3.3 — Soft Deletes
- [ ] Add `deletedAt DateTime?` field to Product, Category, Collection, User models
- [ ] Add Prisma middleware that filters `deletedAt: null` on findAll queries
- [ ] Update admin API to allow restore of soft-deleted records
- [ ] Add cascade rules for related models

### 3.4 — Inventory Tracking
- [ ] Create `InventoryLog` model: `id`, `productId`, `variantId?`, `change` (Int, positive for addition, negative for reduction), `reason` (String: "order", "restock", "adjustment", "return"), `orderId?`, `createdBy?`, `createdAt`
- [ ] Add relation to Product and Variant
- [ ] Create API endpoint for admin to view inventory history
- [ ] Integrate with checkout: deduct inventory on order placement, restore on cancellation

### 3.5 — Decimal Precision
- [ ] Ensure `Order.total`, `OrderItem.price`, `Product.price` use Decimal type (or integer cents) for precise financial calculations
- [ ] Add validation in checkout to prevent floating-point rounding errors
- [ ] Add helper functions: `centsToUnits()`, `unitsToCents()`, `formatPrice()`

---

## PHASE 4: TESTING

**Priority: HIGH — required before production deployment**

### 4.1 — Fix Existing Tests
- [ ] Review and fix the 8 skipped tests
- [ ] Ensure all tests are properly isolated (reset database state between tests)
- [ ] Add proper mocks for external services (Stripe, Resend, Supabase, Upstash)

### 4.2 — Unit Tests
- [ ] Auth utilities: CSRF token generation/validation, password hashing, role checks
- [ ] Rate limiter: Redis backend, in-memory fallback, window tracking
- [ ] Validation schemas: Zod schemas for products, orders, auth, contact
- [ ] Email templates: correct content, all variables interpolated
- **Target:** 95%+ coverage on utility functions

### 4.3 — Integration Tests
- [ ] API routes: register, login, reset-password, products CRUD, checkout, webhooks
- [ ] Auth flow: register → verify → login → session → protected route access
- [ ] Admin flow: login → create product → edit product → delete product
- [ ] Payment flow: create checkout → webhook callback → order status update
- [ ] Database operations: CRUD on major models, relation queries, transactions

### 4.4 — End-to-End Tests (Playwright)
- [ ] User registration and login
- [ ] Browse products, filter by category/collection
- [ ] Add to cart, update quantity, remove from cart
- [ ] Complete checkout flow (mock payment)
- [ ] Password reset flow
- [ ] Admin panel: dashboard, product management, order management
- [ ] Responsive design checks (mobile, tablet, desktop breakpoints)
- **Target:** All critical user journeys covered

### 4.5 — Accessibility Tests
- [ ] Add `@axe-core/playwright` for automated accessibility testing
- [ ] Audit all public pages: home, collections, product detail, cart, checkout, login, register
- [ ] Audit all admin pages
- **Target:** Zero WCAG 2.2 AA violations

---

## PHASE 5: CI/CD & DEVOPS

**Priority: HIGH — required for reliable deployment**

### 5.1 — GitHub Actions Workflow
Create `.github/workflows/ci.yml` with:
```yaml
name: CI/CD
on: [push, pull_request]
jobs:
  quality:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: pea-fits-test
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
        ports: [5432:5432]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npx prisma generate
      - run: npm run lint
      - run: npm run typecheck  # if separate script exists
      - run: npm test
      - run: npm run build
      - name: Security audit
        run: npm audit --audit-level=high
      - name: Dependency audit
        uses: actions/dependency-review-action@v4
```

### 5.2 — Preview Deployments
- [ ] Configure Vercel for preview deployments on PRs
- [ ] Add status check that preview deployment succeeds
- [ ] Add comment with preview URL on PRs

### 5.3 — Production Deployment
- [ ] Configure Vercel production deployment from `main` branch
- [ ] Set all environment variables in Vercel dashboard
- [ ] Configure custom domain and SSL
- [ ] Enable Vercel Analytics and Speed Insights

### 5.4 — Monitoring
- [ ] Set up Sentry for error tracking (`npm i @sentry/nextjs`)
- [ ] Create `src/lib/sentry.ts` with Sentry configuration
- [ ] Add health check endpoint: `GET /api/health` returning `{ status: "ok", timestamp, uptime, db: "connected" }`
- [ ] Add Vercel Cron Jobs for: daily backup, stale cart cleanup, expired order cleanup
- **Validation:** Trigger an error and verify it appears in Sentry dashboard

### 5.5 — Backup & Disaster Recovery
- [ ] Configure automated Supabase database backups (built-in)
- [ ] Create disaster recovery document in `DISASTER_RECOVERY.md`
- [ ] Create rollback procedure document
- **Document:** Backup schedule, restore steps, rollback procedure, point-in-time recovery

---

## PHASE 6: UX, SEO & PERFORMANCE

**Priority: MEDIUM — differentiators that make the store competitive**

### 6.1 — Loading States
- [ ] Add `loading.tsx` for every route segment that fetches data
- [ ] Add skeleton components for: product grid, product detail, cart, orders list, admin tables
- [ ] Add Suspense boundaries with fallbacks for streaming SSR

### 6.2 — Empty & Error States
- [ ] Add empty state for: empty cart, no orders, no wishlist items, no search results, no products in category
- [ ] Add error boundaries at page level with retry buttons
- [ ] Add toast notifications for all user actions (added to cart, order placed, etc.)

### 6.3 — Enhanced Error Handling
- [ ] Replace try/catch blocks with proper error responses across all API routes
- [ ] Add Zod validation error formatting (consistent error shape)
- [ ] Add global error handler for uncaught errors in API routes
- [ ] Custom 404 page, 500 page

### 6.4 — Image Optimization
- [ ] Replace all `<img>` tags with `next/image`
- [ ] Configure remote image patterns in `next.config.ts` for Supabase Storage
- [ ] Add blur placeholder data URLs for product images
- [ ] Set proper `sizes` attribute for responsive images

### 6.5 — SEO
- [ ] Add canonical URLs to all pages
- [ ] Add JSON-LD structured data: Product (with offers, reviews), Article, Organization, BreadcrumbList, SearchAction, FAQPage
- [ ] Verify OpenGraph and Twitter Card meta tags on all major pages
- [ ] Generate dynamic sitemap (already exists — verify all routes included)
- [ ] Add `robots.txt` with proper rules
- [ ] Add breadcrumbs to all category/product/article pages

### 6.6 — Accessibility (WCAG 2.2 AA)
- [ ] Add skip-to-content link
- [ ] Ensure proper heading hierarchy (h1 → h2 → h3, never skip levels)
- [ ] Add ARIA labels to interactive elements (buttons, links, form inputs)
- [ ] Ensure focus indicators are visible on all interactive elements
- [ ] Ensure color contrast meets WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
- [ ] Add `aria-live` regions for dynamic content updates (cart count, toast messages)
- [ ] Test with keyboard navigation (Tab, Enter, Escape, Arrow keys)
- **Validation:** Run axe DevTools or Lighthouse accessibility audit

### 6.7 — Performance Budget
Target Lighthouse scores: **100/100/100/100**
- LCP: < 2.5s
- CLS: < 0.1
- INP: < 200ms
- TTFB: < 800ms
- First load JS bundle: < 300KB
- **Actions:** Code splitting, dynamic imports for heavy components, preload critical assets, lazy load below-fold content

---

## PHASE 7: SECURITY HARDENING

**Priority: HIGH — protects customer data and payments**

### 7.1 — CSP Headers
- [ ] Review Content Security Policy in `next.config.ts`
- [ ] Remove `unsafe-inline` and `unsafe-eval` where possible
- [ ] Add strict CSP with nonces for inline scripts
- [ ] Test CSP with real browser to ensure no resources blocked

### 7.2 — Input Validation
- [ ] Add Zod validation to ALL API route inputs (not just product/admin routes)
- [ ] Sanitize HTML in CMS content inputs (prevent stored XSS)
- [ ] Validate file uploads: type, size, dimensions, content-type
- [ ] Add request size limits for API routes

### 7.3 — Authentication Hardening
- [ ] Add account lockout after 5 failed login attempts (temporary, 15 min)
- [ ] Add session timeout (maxAge config in NextAuth)
- [ ] Add "remember me" toggle that controls session duration
- [ ] Add device/ip tracking for suspicious login detection
- [ ] Add email verification requirement before first purchase

### 7.4 — Audit Logging
- [ ] Log all admin CRUD operations (who, what, when, old value, new value)
- [ ] Log all authentication events (login, logout, failed login, password reset)
- [ ] Log all payment events (initiation, success, failure, refund)
- [ ] Make audit logs append-only (no delete, no update)
- [ ] Add admin UI to view/search/filter audit logs

### 7.5 — OWASP Top 10 Coverage
- [ ] Broken Access Control: RBAC enforced at middleware, API, and UI level
- [ ] Cryptographic Failures: HTTPS enforced, secrets in env vars only, passwords bcrypt-hashed
- [ ] Injection: Prisma parameterized queries (already safe), input sanitization
- [ ] Insecure Design: Rate limiting, CSRF tokens, proper error messages
- [ ] Security Misconfiguration: CSP headers, secure cookie flags, HTTPS redirect
- [ ] Vulnerable Components: `npm audit` at CI, dependency review
- [ ] Auth Failures: Account lockout, session management, password policy
- [ ] Data Integrity Failures: Webhook signature verification, idempotency
- [ ] Logging Failures: Audit trails, monitoring alerts
- [ ] SSRF: Validate callback URLs, webhook URLs

---

## PHASE 8: FINAL PRODUCTION AUDIT CHECKLIST

**Before launch, verify EVERY item:**

### Build & Compilation
- [ ] `npm run build` — zero errors
- [ ] `npx vitest run` — zero failures (100% pass rate)
- [ ] `npx prisma validate` — zero warnings
- [ ] `npm audit --audit-level=high` — zero high/critical vulnerabilities
- [ ] Lighthouse CI — 100/100/100/100

### Functional
- [ ] User registration with email verification
- [ ] User login with credentials
- [ ] User login with Google OAuth
- [ ] Password reset end-to-end
- [ ] Browse products (all categories, collections)
- [ ] Filter products (price, size, color, brand, category)
- [ ] Search products
- [ ] Product detail page (images, variants, reviews)
- [ ] Add to cart, update quantity, remove from cart
- [ ] Cart persistence across sessions (database-backed)
- [ ] Checkout with Stripe
- [ ] Checkout with Khalti
- [ ] Webhook callback updates order status
- [ ] Order confirmation page
- [ ] Order history in user profile
- [ ] Order detail page
- [ ] Wishlist add/remove
- [ ] Back-in-stock notification request
- [ ] Recently viewed products
- [ ] Contact form submission
- [ ] Newsletter signup

### Admin Panel
- [ ] Dashboard loads with stats
- [ ] Product CRUD (create, read, update, archive, restore)
- [ ] Image upload to Supabase Storage
- [ ] Order management (view, update status)
- [ ] User management (view, update role)
- [ ] CMS management (pages, testimonials, banners, nav links)
- [ ] Journal/Article CRUD
- [ ] Coupon/Campaign CRUD
- [ ] Shipping settings management
- [ ] Tax settings management
- [ ] Site settings management
- [ ] Media library
- [ ] Audit log viewer
- [ ] Analytics/stats

### Security
- [ ] All admin routes protected (role check)
- [ ] Authentication required for: profile, orders, checkout, wishlist
- [ ] CSRF protection on all state-changing requests
- [ ] Rate limiting on auth/checkout/contact
- [ ] CSP headers applied
- [ ] Secure, HttpOnly, SameSite cookies
- [ ] No credentials exposed client-side
- [ ] Webhook signature verification
- [ ] Input validation on all API routes
- [ ] File upload validation (type, size)

### UX
- [ ] Mobile responsive (320px+)
- [ ] Tablet responsive (768px+)
- [ ] Desktop responsive (1024px+)
- [ ] Loading skeletons appear on data pages
- [ ] Empty states for empty lists
- [ ] Error states with retry option
- [ ] Toast notifications for actions
- [ ] Keyboard navigable
- [ ] Screen reader compatible

### SEO
- [ ] Sitemap.xml valid and complete
- [ ] Robots.txt correct
- [ ] All pages have unique title + description meta
- [ ] OpenGraph tags on all major pages
- [ ] Twitter Card tags on all major pages
- [ ] Canonical URLs on all pages
- [ ] JSON-LD structured data on key pages
- [ ] No duplicate meta tags
- [ ] No broken internal links

### Infrastructure
- [ ] Production PostgreSQL database connected
- [ ] Supabase Storage buckets configured
- [ ] Stripe webhook verified (endpoint receives events)
- [ ] Khalti callback verified
- [ ] Resend email sending verified
- [ ] Upstash Redis connected
- [ ] Rate limiting works with Redis
- [ ] Environment variables validated at startup
- [ ] Vercel deployment successful
- [ ] Custom domain configured with SSL
- [ ] Backup strategy in place
- [ ] Monitoring/alerts configured

### Documentation
- [ ] `README.md` — project overview, setup instructions, architecture
- [ ] `DEPLOYMENT.md` — deployment guide with env vars checklist
- [ ] `ARCHITECTURE.md` — system architecture, folder structure, data flow
- [ ] `API.md` — API routes documentation
- [ ] `DATABASE.md` — schema overview, relationships, indexes
- [ ] `DISASTER_RECOVERY.md` — backup, restore, rollback procedures
- [ ] `CONTRIBUTING.md` — how to contribute, code standards, PR process

---

## ENGINEERING PRINCIPLES

### SOLID
- **S**ingle Responsibility: each module/component has one reason to change
- **O**pen/Closed: extend behavior without modifying existing code
- **L**iskov Substitution: derived types must be substitutable for base types
- **I**nterface Segregation: small, focused interfaces over large, general ones
- **D**ependency Inversion: depend on abstractions, not concretions

### DRY / KISS / YAGNI
- **DRY:** Extract repeated logic into reusable utilities, hooks, components
- **KISS:** Simple solutions over complex ones. Prefer clarity over cleverness
- **YAGNI:** Don't add features/flexibility until they're actually needed

### TypeScript
- `strict: true` in tsconfig
- No `any` — use `unknown` with type guards if type is truly dynamic
- No `@ts-ignore` or `@ts-expect-error` — fix the actual type issue
- Prefer `interface` over `type` for object shapes (extendable, mergeable)
- Use `satisfies` operator for type validation without widening

### Next.js App Router
- Server Components by default, Client Components only when needed (interactivity, browser APIs, context)
- Use `loading.tsx` for every data-fetching segment
- Use `error.tsx` with `ErrorBoundary` for error handling
- Use `generateMetadata` for dynamic SEO
- Use `generateStaticParams` for static generation where possible
- Keep Server Component data fetching at the page/layout level, pass down to Client Components as props

### React
- Minimize `useEffect` — prefer derived state, event handlers, and Server Components
- Memoize expensive computations with `useMemo`
- Memoize callback props with `useCallback` when passed to memoized children
- Keep state as local as possible — lift only when truly shared
- Use Zustand for global state (cart, auth), React context for theme/settings

### Prisma
- Always select only needed fields (never `include: { all: true }`)
- Use `select` over `include` when you need specific relation fields
- Batch operations in transactions for consistency
- Paginate all list queries with cursor-based pagination
- Add proper indexes for all query patterns

### API Design
- Consistent response shape: `{ success: boolean, data?: T, error?: string }`
- Use HTTP status codes correctly (200 success, 201 created, 400 validation, 401 unauthenticated, 403 unauthorized, 404 not found, 429 rate limited, 500 server error)
- Zod validation on all inputs
- Rate limiting on all mutation endpoints
- Proper error messages (helpful but not revealing internals)

---

## STOP CONDITIONS (Read These First)

**Do NOT stop after completing individual phases.**
**Do NOT ask whether to continue.**

**Only stop when:**
1. ✅ The application has been successfully deployed and validated in production, OR
2. ✅ A manual action is required that cannot be performed programmatically:
   - Creating cloud accounts (Supabase, Stripe, Khalti, Resend, Upstash, Vercel)
   - Providing API keys / credentials
   - Verifying domains (DNS changes)
   - Approving payment provider applications
   - Clicking buttons in third-party dashboards

**If blocked (case 2):** Output a concise, numbered checklist of the exact manual actions required, explain why each is needed, and provide clear instructions for completing them. Then wait. Once the user confirms the actions are done, **continue automatically** with the remaining implementation.

**Final responsibility:** Leave this repository in a state where it is secure, scalable, maintainable, fully tested, fully documented, production-ready, and suitable for real-world customers. Continuously audit, improve, validate, refactor, and optimize until no meaningful engineering improvements remain within the scope of the project and all externally dependent steps have been clearly identified or completed.
