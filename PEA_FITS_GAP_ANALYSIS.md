# PEA FITS — Ultimate Gap Analysis: The Path #1 E-Commerce Platform

> **Assessment Date:** 2026-06-29
> **Status:** Already a solid Next.js 15 + Supabase e-commerce platform with CMS, auth, admin panel, Stripe/Khalti payments, journal, wishlist, reviews, coupons, and brand book.

## 🏆 Current Strengths (Already Built)
- ✅ Next.js 15 App Router (SSR/SSG/ISR)
- ✅ Full TypeScript + Zod validation everywhere
- ✅ Prisma ORM + PostgreSQL (Supabase)
- ✅ NextAuth v5 (Credentials + Google OAuth)
- ✅ Admin panel with CMS (pages, coupons, nav, testimonials, media, shipping, tax, email templates)
- ✅ Product catalog with variants, images, collections, categories
- ✅ Shopping cart (Zustand + server sync)
- ✅ Checkout flow with Stripe + Khalti webhooks
- ✅ Order management with status tracking
- ✅ Wishlist + Reviews + Rating
- ✅ Blog/Journal with categories
- ✅ Brand book
- ✅ Rate limiting (in-memory)
- ✅ CSRF protection (double-submit cookie)
- ✅ Newsletter subscription
- ✅ SEO basics (sitemap.ts, robots.ts, JsonLd component)
- ✅ Responsive design (mobile-first Tailwind)
- ✅ Empty states, loading skeletons, error boundaries
- ✅ Accessible (aria attributes, semantic HTML)

---

## 🔴 TIER 1 — CRITICAL (Must Fix Before Launch)

### 1.1 Password Reset Is Broken
| Aspect | Detail |
|---|---|
| **Issue** | `POST /api/auth/reset-password` creates a VerificationToken and logs the reset URL to console, but **there is NO endpoint to verify the token and change the password**. The UI only captures email. |
| **Fix** | Create `PUT /api/auth/reset-password?token=xxx` that validates the token, accepts new password, updates `hashedPassword`, and deletes the token. Build the client-side `reset-password?token=xxx` page. |
| **Effort** | 2–3 hours |

### 1.2 In-Memory Rate Limiter Is Serverless-Unsafe
| Aspect | Detail |
|---|---|
| **Issue** | `src/lib/rate-limit.ts` uses an in-process `Map`. On serverless deployments (Vercel/Render), each cold start has its own counter. Rate limiting is effectively disabled. |
| **Fix** | `@upstash/redis` is already in `package.json`. Replace the Map-backed limiter with Upstash Redis rate limiter. |
| **Effort** | 1 hour |

### 1.3 Shipping Constants Are Inconsistent
| Aspect | Detail |
|---|---|
| **Issue** | `src/lib/constants.ts` says free shipping at ₹5,000. API at `src/app/api/shipping/route.ts` says free at ₹15,000. Checkout uses hardcoded ₹250 flat rate. Three different thresholds = three different prices shown to customers. |
| **Fix** | Centralize all shipping logic in `constants.ts`. Make checkout and API routes import from there. |
| **Effort** | 1 hour |

### 1.4 No Automated Tests Are Running
| Aspect | Detail |
|---|---|
| **Issue** | `vitest` and `playwright` are configured but unknown if tests pass. `src/__tests__/` has 7 test files. |
| **Fix** | Run `npm test`, fix all failures. Run `npx playwright test` if browsers installed. |
| **Effort** | 1–2 hours |

---

## 🟠 TIER 2 — HIGH IMPACT (Major Feature Gaps)

### 2.1 Password Reset UI
Build the complete client-side flow: email capture → token verification → new password → success redirect.

### 2.2 Full-Text Product Search
Current search uses basic `LIKE %query%` filtering. For "top 1" e-commerce, you need:
- **PostgreSQL tsvector** (free, no extra infra) on `products.name`, `products.description`, `products.brand`
- Or integrate **Meilisearch**/Algolia for typo-tolerant instant search
- Add faceted search (filter by size, color, price range, brand, category simultaneously)
- Save recent searches per user

### 2.3 Email Automation
- Transactional emails via `src/lib/email.ts` (uses Resend):
  - Order confirmation
  - Shipping update
  - Password reset (blocked by 1.1)
  - Welcome email on registration
  - Abandoned cart recovery (3 automated sequences)
- Admin email preview in CMS

### 2.4 Order Tracking Portal
- Real-time order status page with timeline UI
- Push notifications on status changes
- SMS notifications via Nepal-compatible provider

### 2.5 Back-in-Stock Notifications
- "Notify me when back in stock" button on out-of-stock variants
- Automated email when stock > 0
- Track which users requested which variants

### 2.6 Gift Cards / Store Credit
- Schema: `GiftCard { code, balance, expiresAt, userId? }`
- Purchase gift cards via checkout
- Apply gift card at checkout
- Send gift card via email

### 2.7 Live Chat / Support Widget
- Real-time customer support (Crisp, Tawk.to, or custom WebSocket)
- Order inquiries, product questions
- Knowledge base integration

---

## 🟡 TIER 3 — POLISH (Differentiators)

### 3.1 Product Video & 360° View
- Product videos in gallery (embed YouTube/Vimeo or self-hosted)
- 360° spin view for key products
- Video reviews from customers

### 3.2 AI-Powered Size Recommendation
- Input height, weight, body type → recommend size
- Based on product measurements
- "Fit Finder" widget modal
- Reduce returns = higher trust

### 3.3 Virtual Try-On (AR)
- Supabase Storage for reference images
- AR Quick Look (iOS) / Scene Viewer (Android)
- WebXR for browser-based try-on
- Partnership with AR sizing SDKs

### 3.4 Affiliate / Referral Program
- Referral codes per user
- Commission tracking
- Payout system
- Shareable links with UTM tracking

### 3.5 Lookbook / Outfit Builder
- Curated outfit combinations
- Drag-and-drop builder
- Save and share looks
- "Complete the look" on product pages

### 3.6 Loyalty / Rewards Program
- Points per purchase (₹100 = 1 point)
- Tier system (Bronze → Silver → Gold → Platinum)
- Redeem points for discounts
- Birthday rewards
- Early access for VIP tiers

### 3.7 Flash Sales / Countdown Timers
- `FlashSale { productId, discountPercent, startsAt, endsAt }`
- Countdown timer on product cards
- "Limited time" badges
- Notification before sale starts

### 3.8 Recently Viewed Products
- Store in localStorage + sync to server for logged-in users
- "Continue browsing" rail on product pages

### 3.9 Save for Later (Cart)
- Move items from cart to "Saved for later"
- Separate wishlist vs save-for-later semantics
- Email reminder when saved item goes on sale

---

## 🔵 TIER 4 — SCALE & PERFORMANCE

### 4.1 PWA / Offline Support
- Service worker with Workbox
- Offline product browsing (cached catalog)
- Add to home screen
- Push notifications (order updates, back-in-stock)

### 4.2 Image Optimization
- WebP/AVIF via `next/image` (check if all images use it)
- Responsive image breakpoints
- Blur placeholder / LQIP
- CDN delivery via Supabase Storage transforms
- Bulk image compression script

### 4.3 Caching Strategy
- **ISR**: Revalidate product/collection pages on data change
- **Redis**: Cache product queries, category trees, CMS content
- **Stale-while-revalidate**: For catalog pages
- **CDN**: Cache static assets, images, fonts

### 4.4 Lighthouse Optimization
Target 95+ across all categories:
| Metric | Target |
|---|---|
| Performance | 95+ |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |

### 4.5 Database Optimizations
- Add missing indexes (reviewed: `@@index([categoryId, isActive, isFeatured])`)
- Materialized view for product search
- Connection pooling via Supabase pgBouncer
- Query profiling + N+1 elimination

---

## 🟢 TIER 5 — SECURITY & COMPLIANCE

### 5.1 Admin Audit Trail Enhancement
- Audit log exists (`src/app/api/admin/audit-logs/`) — verify coverage
- Log every action: product create/update/delete, order status change, user role change
- Retention policy for audit logs

### 5.2 GDPR / Privacy Compliance
- Cookie consent banner
- Data export endpoint (user can download their data)
- Account deletion endpoint
- Privacy policy (exists but ensure it's comprehensive)

### 5.3 Rate Limiting Hardening
- Redis-backed rate limiter (from 1.2)
- Per-IP + per-user rate limiting
- Distributed rate limiting across regions
- Rate limit headers in response (`X-RateLimit-Remaining`)

### 5.4 Secrets Management
- All env vars documented
- No secrets in source code (verified ✅)
- Rotate keys before production
- Restrict Supabase RLS policies

---

## 🟣 TIER 6 — DEVEX & OPERATIONS

### 6.1 CI/CD Pipeline
- **GitHub Actions** config:
  - `on: push/PR` → lint → typecheck → test → build
  - `on: release` → deploy to staging → smoke tests → deploy to production
  - Secret scanning
  - Bundle size analysis
- **Vercel/Railway/Render** deployment config

### 6.2 Monitoring & Observability
- **Error tracking**: Sentry (free tier)
- **Performance**: Vercel Analytics or PostHog
- **Logging**: Structured logging in API routes
- **Uptime**: Better Uptime or Pingdom
- **Database monitoring**: Supabase dashboard

### 6.3 Docker Containerization
```dockerfile
# Multi-stage build for production
FROM node:20-alpine AS builder
FROM node:20-alpine AS runner
# Reduce image size by 70%
```

### 6.4 Automated Backups
- Supabase daily backups (built-in)
- Database snapshot before each migration
- Media assets backup (Supabase Storage)
- Recovery drill quarterly

### 6.5 Developer Experience
- Add `.husky` pre-commit hooks (lint-staged)
- Storybook for UI component catalog
- API documentation (OpenAPI/Swagger)
- Playwright component tests
- Performance regression CI check

---

## ⚪ TIER 7 — BUSINESS GROWTH FEATURES

### 7.1 Multi-Currency / International
- Display prices in NPR, USD, EUR, AUD
- Currency switcher in header
- Geo-IP detection for default currency
- International shipping rates + customs info

### 7.2 Social Commerce
- Instagram shopping integration
- TikTok product sync
- Pinterest product pins
- Facebook shop sync

### 7.3 Analytics & Personalization
- **Product recommendations** based on:
  - Browsing history (collaborative filtering)
  - Purchase history (frequently bought together)
  - Similar products (category + price range)
- **Personalized homepage** (different hero for new vs returning users)
- **Abandoned cart** analytics

### 7.4 B2B / Wholesale
- Bulk order form
- Wholesale pricing tier
- Minimum order quantity
- Invoice generation
- Net 30 payment terms

### 7.5 Mobile App
- React Native / Expo companion app
- Shared API with web
- Push notifications
- Camera-based size measurement
- AR try-on (native)

---

## 📊 EFFORT MATRIX

| Tier | Category | Items | Est. Effort | Impact |
|---|---|---|---|---|
| 🔴 | **Critical** | 4 | 5–6 hrs | Launch blocker |
| 🟠 | **High Impact** | 6 | 40–60 hrs | Competitive necessity |
| 🟡 | **Differentiators** | 9 | 80–120 hrs | Market leader |
| 🔵 | **Scale & Perf** | 5 | 20–30 hrs | User retention |
| 🟢 | **Security** | 4 | 8–12 hrs | Trust & compliance |
| 🟣 | **DevEx & Ops** | 5 | 16–24 hrs | Velocity |
| ⚪ | **Business Growth** | 5 | 100+ hrs | Revenue growth |
| | **TOTAL** | **38** | **~270–350 hrs** | |

---

## 🎯 IMMEDIATE EXECUTION PLAN (This Session)

I will now execute Tier 1 and Tier 2 items that can be completed in this session:

1. ✅ Password reset — Build the complete flow (API + UI)
2. ✅ Redis-backed rate limiter — Swap from in-memory to Upstash
3. ✅ Centralize shipping constants — Fix inconsistencies
4. ✅ Run test suite — Fix failures
5. ✅ CI/CD pipeline — GitHub Actions config
6. ✅ Back-in-stock notifications — Schema + API + UI
7. ✅ Recently viewed — localStorage + UI component
