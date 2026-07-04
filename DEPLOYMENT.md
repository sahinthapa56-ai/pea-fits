# 🚀 PEA FITS — Deployment Guide

## Prerequisites

| Service | Account | Why |
|---------|---------|-----|
| [Vercel](https://vercel.com) | Connected to GitHub | Hosting Next.js app |
| [Supabase](https://supabase.com) | Project: `amececmzgwkoxboaebft` | PostgreSQL + Auth |
| [Resend](https://resend.com) | API key (`re_...`) | Transactional emails |
| [Stripe](https://stripe.com) | Secret + Publishable key | Payment processing |
| [Khalti](https://khalti.com) | Secret key + Merchant code | Nepal payments |
| [Sentry](https://sentry.io) | DSN | Error monitoring (optional) |

## Step 1: Environment Variables

Set these in **Vercel Dashboard → Project Settings → Environment Variables**:

```env
# ── Database ──
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# ── Auth (NextAuth v5) ──
NEXTAUTH_SECRET="generate with: openssl rand -base64 32"
NEXTAUTH_URL="https://peafits.com.np"
NEXT_PUBLIC_URL="https://peafits.com.np"

# ── Email (Resend) ──
RESEND_API_KEY="re_..."
EMAIL_FROM="PEA FITS <noreply@peafits.com.np>"

# ── Payments ──
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
KHALTI_SECRET_KEY="..."
KHALTI_MERCHANT_CODE="..."

# ── Error Tracking (optional) ──
SENTRY_DSN="https://..."
```

> **Note:** `NEXTAUTH_SECRET` must be stable — generate once, use everywhere.

## Step 2: Database Migration

Run this in Vercel's post-deploy hook or locally after connecting:

```bash
npx prisma migrate deploy     # apply pending migrations
npx prisma db push            # if using db push workflow
```

## Step 3: Deploy

```bash
# Push to main — Vercel auto-deploys
git push origin main

# Or manual deploy from Vercel dashboard
```

## Step 4: Post-Deploy Checklist

- [ ] Visit `https://peafits.com.np` — loads without errors
- [ ] Visit `https://peafits.com.np/api/health` — returns `{"status":"ok","db":"connected"}`
- [ ] Register a test account — email verification works
- [ ] Test password reset flow — Reset email arrives
- [ ] Browse products — images load, filters work
- [ ] Add item to cart — Cart updates correctly
- [ ] Proceed to checkout — Stripe/Khalti payment modal opens
- [ ] Complete purchase — Order confirmation email sent
- [ ] Visit `/admin` — Admin panel accessible with admin credentials
- [ ] Check CSP headers (DevTools → Network → Response Headers)
- [ ] Run `npx next lint` — 0 errors (warnings acceptable)
- [ ] Run `npx vitest run` — all tests pass

## Rollback

Vercel supports instant rollback from the dashboard: **Deployments → ⋯ → Rollback to Previous**.

## Domain

- Production: `peafits.com.np` (or your custom domain)
- Vercel preview: `pea-fits-xxxx.vercel.app`

---

> **Developed by Sahin Thapa** — PEA FITS © 2026
