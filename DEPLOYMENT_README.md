# Deployment Readiness — PEA FITS

## Pre-Deployment Checks

### 1. Environment Variables
All secrets are in `.env` / `.env.local`. Verify these are set in your deployment environment:

```
DATABASE_URL=<production Supabase PostgreSQL URL>
DIRECT_URL=<direct connection URL for migrations>
NEXT_PUBLIC_SUPABASE_URL=<Supabase project URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Supabase anon key>
NEXTAUTH_URL=<production deployment URL>
NEXTAUTH_SECRET=<strong random secret>
NEXT_PUBLIC_SITE_URL=<production URL>
NEXT_PUBLIC_SITE_NAME=PEA FITS
RESEND_API_KEY=<if email is re-enabled>
```

### 2. Database Migrations
```bash
npx prisma migrate deploy    # Apply pending migrations
npx prisma db push            # If using direct push (dev only)
```

**Rollback**: Migrations are reversible. If needed:
```bash
npx prisma migrate resolve --rolled-back "<migration-name>"
```

### 3. Seed Script Safety
- Seed scripts use `upsert` — safe to re-run on existing data
- **DO NOT** run `prisma/seed.ts` on production — it creates test products and categories
- Run only in staging for acceptance testing

### 4. Build Verification
```bash
npm run build                 # Must exit 0 (verified: ✅)
```

### 5. Remaining Known Issues (Not Blockers)
- Password reset flow is incomplete (no token verification endpoint — UI only sends email)
- In-memory rate limiter not suitable for serverless (replace with Redis/Database-backed version for production)
- Shipping cost constants are inconsistent across files (5000 in constants vs 15000 in API)
- `URL.createObjectURL()` for image previews in admin product forms is never revoked (minor memory leak on long sessions)
- Admin product form `tags` field sends string `"[]"` by default with no array parsing

### 6. Post-Deploy Smoke Tests
- [ ] Homepage loads without errors
- [ ] Collection pages display products
- [ ] Product detail page renders correctly
- [ ] Search returns results
- [ ] Admin login → create product → save → edit works
- [ ] Cart add/remove/update works
- [ ] Checkout flow completes
- [ ] Profile page loads with orders/wishlist
- [ ] 404 page renders on invalid routes
- [ ] Mobile responsive (test 3 breakpoints)

### 7. Monitoring
- Monitor `/api/auth/*` for 429 rate limit errors
- Monitor `/api/checkout` for CSRF failures (403)
- Watch server logs for unhandled promise rejections

### 8. Rollback Plan
1. Revert the deployment in your hosting dashboard (Vercel/Render/Railway)
2. If DB migration was applied: `npx prisma migrate resolve --rolled-back <migration-name>`
3. Restore previous `.env` if variables changed
4. Verify rollback with smoke tests

---

## Deployment Order
1. **Staging** → verify smoke tests → fix any issues
2. **Production** → deploy → verify → monitor for 30 min
3. **Post-deploy** → run smoke tests against production URL
