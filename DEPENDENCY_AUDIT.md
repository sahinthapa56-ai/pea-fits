# Dependency Audit Report — pea-fits

**Generated:** June 28, 2026  
**Project:** `C:/Users/user/Desktop/PEA FITS/pea-fits`  
**Sources examined:** `src/` (all .ts/.tsx), `package.json`, `prisma/schema.prisma`, `next.config.js`

---

## 1. UNUSED DEPENDENCIES (never imported in `src/`)

These packages are declared in `dependencies` but have zero `import` or `require` references in any source file:

| Package | Version | Notes |
|---------|---------|-------|
| **leaflet** | ^1.9.4 | GIS/map library — zero imports |
| **react-leaflet** | ^5.0.0 | React wrapper for Leaflet — zero imports |
| **recharts** | ^2.15.3 | Charting library — zero imports |
| **@tiptap/extension-image** | ^2.11.5 | Rich-text editor extension — zero imports |
| **@tiptap/extension-link** | ^2.11.5 | — zero imports |
| **@tiptap/extension-placeholder** | ^2.11.5 | — zero imports |
| **@tiptap/extension-underline** | ^2.11.5 | — zero imports |
| **@tiptap/html** | ^2.11.5 | — zero imports |
| **@tiptap/react** | ^2.11.5 | — zero imports |
| **@tiptap/starter-kit** | ^2.11.5 | — zero imports |
| **resend** | ^4.2.0 | Only a **commented-out** import in `src/app/api/auth/reset-password/route.ts` (lines 96–98) — not active |
| **@types/leaflet** | ^1.9.17 | Dev-only type for an unused package — remove with leaflet |

**🟥 REMOVE:** These 12 packages can be safely uninstalled, saving ~20+ MB of `node_modules`.

---

## 2. MISSING / UNDECLARED DEPENDENCIES

These packages are **imported in source code** but **not listed** in `package.json`:

| Package | Where used | Status |
|---------|-----------|--------|
| **clsx** | `src/lib/utils.ts` line 1 (`import { type ClassValue, clsx } from "clsx"`) | **🟥 MISSING** — currently resolved transitively via `recharts → clsx`, but as a direct import it MUST be an explicit dependency. Broken if recharts is removed. |
| **@radix-ui/react-icons** | `next.config.js` line 16 (`optimizePackageImports: ["@radix-ui/react-icons"]`) | **🟡 UNCONFIRMED** — referenced in Next config for optimisation but not in `package.json`. If it's expected to exist at build time, it needs to be added. |

**🟥 Action:** Add `clsx` to `dependencies` with a pinned exact version (e.g. `"2.1.1"`).  
**🟡 Action:** Verify `@radix-ui/react-icons` is actually needed; if yes, add it to `dependencies`.

---

## 3. PINNED vs UNPINNED VERSIONS

| Status | Count | Packages |
|--------|-------|----------|
| ✅ **Pinned** (exact) | 2 | `next` (15.3.2), `next-auth` (5.0.0-beta.25) |
| ⚠️ **Unpinned** (^ range) | 30+ | All others use `^` (caret), allowing auto-updates to minor/patch |

**Risk:** `^` ranges mean `npm install` or `npm ci` can pull unexpected minor/patch updates, potentially introducing regressions. For production, pinning exact versions is recommended.

**Action:** Consider pinning critical runtime deps (bcryptjs, zod, @prisma/client, next-auth) to exact versions for reproducible builds.

---

## 4. DEV vs PRODUCTION CLASSIFICATION

✅ **Correctly placed:**

| Category | Packages |
|----------|----------|
| devDependencies | `@types/*`, `eslint`, `eslint-config-next`, `prisma`, `tailwindcss`, `@tailwindcss/postcss`, `tsx`, `typescript` |
| dependencies | `@prisma/client`, `@auth/prisma-adapter`, `@supabase/*`, `next`, `next-auth`, `react`, `react-dom`, `zod`, `zustand`, `react-hook-form`, `bcryptjs` |

✅ All `@types/*` packages are correctly in `devDependencies`.  
✅ `prisma` (the CLI) is correctly in `devDependencies` while `@prisma/client` is in `dependencies`.

---

## 5. OUTDATED PACKAGES (from `npm outdated`)

| Package | Installed | Wanted | Latest | Gap |
|---------|-----------|--------|--------|-----|
| `@prisma/client` | 6.19.3 | 6.19.3 | **7.8.0** | Major |
| `@supabase/ssr` | 0.6.1 | 0.6.1 | **0.12.0** | Major |
| `@tiptap/*` (all 7) | ~2.27.2 | ~2.27.2 | **3.27.1** | Major |
| `eslint` | 9.39.4 | 9.39.4 | **10.6.0** | Major |
| `eslint-config-next` | 15.3.2 | 15.3.2 | **16.2.9** | Major |
| `next` | 15.3.2 | 15.3.2 | **16.2.9** | Major |
| `recharts` | 2.15.4 | 2.15.4 | **3.9.0** | Major |
| `resend` | 4.8.0 | 4.8.0 | **6.16.0** | Major |
| `typescript` | 5.9.3 | 5.9.3 | **6.0.3** | Major |
| `zod` | 3.25.76 | 3.25.76 | **4.4.3** | Major |
| `react` / `react-dom` | 19.2.4 | 19.2.7 | **19.2.7** | Patch |
| `prisma` | 6.19.3 | 6.19.3 | **7.8.0** | Major |

**🟡 Note:** Upgrading to major versions may introduce breaking changes — test before bumping.
**🟡 Note:** Many of the "outdated" packages above are **unused** (tiptap, recharts, resend) and should be removed rather than updated.

---

## 6. VULNERABILITIES (from `npm audit`)

| Severity | Count | Package | Issue |
|----------|-------|---------|-------|
| **CRITICAL** | 1 | **next** 15.3.2 | Multiple critical CVEs including RCE in React flight protocol, cache poisoning, SSRF, XSS, DoS — **22 advisories total** |
| **MODERATE** | 1 | **next-auth** 5.0.0-beta.25 | Email misdelivery vulnerability |
| **MODERATE** | 1 | **postcss** (via next) | XSS via unescaped `</style>` |

**Total: 3 vulnerabilities (1 critical, 2 moderate)** — but the `next` package alone has 22+ CVEs.

**🟥 CRITICAL:** `next` 15.3.2 has critical vulnerabilities. Recommended fix via `npm audit fix --force` would install next@15.5.19 (a patch within the same major). However, this would change from a pinned exact version to a range. Consider upgrading to the latest 15.x patch OR to 16.2.9 after compatibility testing.

**🟡 MODERATE:** `next-auth` 5.0.0-beta.25 — update to 5.0.0-beta.31 when available.

---

## 7. PEER DEPENDENCY CONFLICTS

Checked all installed packages for peer dependency compatibility:

| Package | Requires | Status |
|---------|----------|--------|
| `next` 15.3.2 | react 18.x or 19.x | ✅ react 19.2.4 satisfies |
| `next-auth` 5.0.0-beta.25 | react 18.x or 19.x | ✅ |
| `react-leaflet` 5.0.0 | react 18.x or 19.x | ✅ (but unused) |
| `recharts` 2.15.4 | react ^16.0.0 \|\| ^17.0.0 \|\| ^18.0.0 | ⚠️ react 19.x NOT in range (but unused, so no runtime impact) |
| `@tiptap/react` 2.x | react 18.x | ⚠️ react 19.x not officially in range (but unused) |
| `@auth/prisma-adapter` 2.x | prisma client | ✅ |
| `@hookform/resolvers` 5.x | react-hook-form | ✅ |

**🟡 Peer conflicts exist for recharts and tiptap with React 19, but both packages are unused so this is a non-issue until/unless they're used.**

---

## 8. DUPLICATE / OVERLAPPING PACKAGES

No duplicate packages or overlapping functionality detected in declared dependencies.

---

## SUMMARY OF ACTION ITEMS

### 🟥 MUST FIX (Production impact)

1. **Remove 12 unused packages** (save ~20+ MB):
   ```
   npm uninstall leaflet react-leaflet recharts \
     @tiptap/extension-image @tiptap/extension-link \
     @tiptap/extension-placeholder @tiptap/extension-underline \
     @tiptap/html @tiptap/react @tiptap/starter-kit \
     resend @types/leaflet
   ```

2. **Add missing dependency**: `clsx` — it's directly imported but only available transitively.
   ```
   npm install clsx
   ```

3. **Update `next` from 15.3.2** to address critical vulnerabilities. Recommended: `next@15.5.19` (safe patch) or test upgrade to `16.2.9`.
   ```
   npm install next@15.5.19   # safe fix for critical CVEs
   ```
   Or force-upgrade:
   ```
   npm audit fix --force
   ```

### 🟡 SHOULD FIX (Best practice)

4. **Pin critical runtime dependencies** to exact versions (remove `^` from `bcryptjs`, `zod`, `@prisma/client`, `@auth/prisma-adapter`, `zustand`) for reproducible builds.

5. **Verify `@radix-ui/react-icons`** — referenced in next.config.js but not in package.json. Either add it or remove the experimental config option.

6. **Update `next-auth`** from 5.0.0-beta.25 to latest beta (5.0.0-beta.31) for the email misdelivery fix.

### 🔵 NICE TO HAVE (Maintainability)

7. **Review all major-outdated packages** after removing unused ones. Major version bumps may introduce breaking changes.

8. **Consider `react-dom`**: Not directly imported anywhere in `src/` but is a required peer dependency of `react` and used internally by Next.js — this is normal.

---

## COMMANDS EXECUTED

- `npm outdated` — to identify stale packages
- `npm audit` — to identify known vulnerabilities
- `npm ls --depth=0` — to verify the installed dependency tree
- File content search across `src/` for all `import ... from "package"` statements
- Reviewed `package.json`, `tsconfig.json`, `next.config.js`, `prisma/schema.prisma`

---

*End of Report*
