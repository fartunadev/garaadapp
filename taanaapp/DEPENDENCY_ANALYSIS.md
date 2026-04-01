# Dependency Analysis Report

**Project:** tanacargo
**Date:** 2026-01-21
**Total Dependencies:** 38 production, 13 dev

---

## 1. Security Vulnerabilities

### Critical Issues (No Fix Available)

| Package | Severity | Vulnerability | Recommendation |
|---------|----------|---------------|----------------|
| `xlsx` v0.18.5 | **HIGH** | Prototype Pollution (GHSA-4r6h-8v6p-xvw6) | Replace with `exceljs` or `xlsx-populate` |
| `xlsx` v0.18.5 | **HIGH** | ReDoS (GHSA-5pgg-2g8v-p4x9) | Replace with `exceljs` or `xlsx-populate` |

### Fixable Vulnerabilities (run `npm audit fix`)

| Package | Severity | Vulnerability | Fix |
|---------|----------|---------------|-----|
| `react-router-dom` | HIGH | XSS via Open Redirects | Update to 6.30.3+ |
| `glob` | HIGH | Command injection via CLI | Update to latest |
| `esbuild`/`vite` | MODERATE | Dev server request vulnerability | Update vite |
| `js-yaml` | MODERATE | Prototype pollution in merge | Update to latest |

**Action Required:**
```bash
npm audit fix
```

---

## 2. Outdated Packages

### Major Version Updates (Breaking Changes Expected)

| Package | Current | Latest | Risk Level |
|---------|---------|--------|------------|
| `@hookform/resolvers` | 3.10.0 | 5.2.2 | Medium |
| `date-fns` | 3.6.0 | 4.1.0 | Medium |
| `react-day-picker` | 8.10.1 | 9.13.0 | High |
| `react-resizable-panels` | 2.1.9 | 4.4.1 | Medium |
| `react-router-dom` | 6.30.1 | 7.12.0 | High |
| `recharts` | 2.15.4 | 3.6.0 | High |
| `sonner` | 1.7.4 | 2.0.7 | Low |
| `tailwind-merge` | 2.6.0 | 3.4.0 | Low |
| `vaul` | 0.9.9 | 1.1.2 | Low |
| `zod` | 3.25.76 | 4.3.5 | High |
| `react` / `react-dom` | 18.3.1 | 19.2.3 | **Critical** |

### Minor/Patch Updates (Safe to Update)

| Package | Current | Latest |
|---------|---------|--------|
| All `@radix-ui/*` packages | Various | Minor bumps |
| `@supabase/supabase-js` | 2.86.0 | 2.91.0 |
| `@tanstack/react-query` | 5.83.0 | 5.90.19 |
| `framer-motion` | 12.25.0 | 12.27.5 |
| `lucide-react` | 0.462.0 | 0.562.0 |
| `next-themes` | 0.3.0 | 0.4.6 |
| `react-hook-form` | 7.61.1 | 7.71.1 |

---

## 3. Unnecessary Bloat (Unused Dependencies)

### Unused UI Components

The following UI component wrappers exist in `src/components/ui/` but are **not used** anywhere in the application:

| Component | Associated Package | Size Impact |
|-----------|-------------------|-------------|
| `accordion.tsx` | `@radix-ui/react-accordion` | ~15KB |
| `aspect-ratio.tsx` | `@radix-ui/react-aspect-ratio` | ~3KB |
| `hover-card.tsx` | `@radix-ui/react-hover-card` | ~12KB |
| `menubar.tsx` | `@radix-ui/react-menubar` | ~25KB |
| `resizable.tsx` | `react-resizable-panels` | ~20KB |
| `input-otp.tsx` | `input-otp` | ~8KB |
| `command.tsx` | `cmdk` | ~15KB |
| `context-menu.tsx` | `@radix-ui/react-context-menu` | ~15KB |

**Estimated Bloat:** ~113KB (uncompressed)

### Packages That Can Be Removed

```json
{
  "@radix-ui/react-accordion": "unused",
  "@radix-ui/react-aspect-ratio": "unused",
  "@radix-ui/react-hover-card": "unused",
  "@radix-ui/react-menubar": "unused",
  "@radix-ui/react-context-menu": "unused",
  "react-resizable-panels": "unused",
  "input-otp": "unused",
  "cmdk": "unused"
}
```

---

## 4. Recommendations

### Immediate Actions (Priority: High)

1. **Replace `xlsx` package** - Critical security vulnerability with no fix
   ```bash
   npm uninstall xlsx
   npm install exceljs
   ```

2. **Run security fixes**
   ```bash
   npm audit fix
   ```

3. **Update react-router-dom** to patch XSS vulnerability
   ```bash
   npm update react-router-dom
   ```

### Short-term Actions (Priority: Medium)

1. **Remove unused dependencies** to reduce bundle size:
   ```bash
   npm uninstall @radix-ui/react-accordion @radix-ui/react-aspect-ratio \
     @radix-ui/react-hover-card @radix-ui/react-menubar \
     @radix-ui/react-context-menu react-resizable-panels input-otp cmdk
   ```

2. **Delete unused UI component files:**
   - `src/components/ui/accordion.tsx`
   - `src/components/ui/aspect-ratio.tsx`
   - `src/components/ui/hover-card.tsx`
   - `src/components/ui/menubar.tsx`
   - `src/components/ui/resizable.tsx`
   - `src/components/ui/input-otp.tsx`
   - `src/components/ui/command.tsx`
   - `src/components/ui/context-menu.tsx`

3. **Update minor/patch versions:**
   ```bash
   npm update
   ```

### Long-term Actions (Priority: Low)

1. **Evaluate React 19 migration** - Significant API changes, requires testing
2. **Evaluate major version updates** for:
   - `zod` v4 (schema changes)
   - `recharts` v3 (API changes)
   - `react-router-dom` v7 (new features)
   - `react-day-picker` v9 (component changes)

---

## 5. Bundle Size Analysis

### Current Estimated Bundle Size

| Category | Packages | Est. Size |
|----------|----------|-----------|
| React Core | react, react-dom | ~130KB |
| UI Library | @radix-ui/* (25 packages) | ~450KB |
| Routing | react-router-dom | ~50KB |
| State | @tanstack/react-query | ~40KB |
| Forms | react-hook-form, zod | ~60KB |
| Styling | tailwind, framer-motion | ~100KB |
| Charts | recharts | ~180KB |
| PDF | jspdf, jspdf-autotable | ~300KB |
| Excel | xlsx | ~400KB |
| Other | supabase, date-fns, etc. | ~150KB |
| **Total (est.)** | | **~1.86MB** |

### Potential Savings

| Action | Savings |
|--------|---------|
| Remove unused Radix packages | ~70KB |
| Remove unused utilities | ~43KB |
| Replace xlsx with exceljs (security + size) | ~100KB |
| **Total Potential Savings** | **~213KB** |

---

## 6. Security Score

| Metric | Score | Status |
|--------|-------|--------|
| Critical vulnerabilities | 0 | Pass |
| High vulnerabilities | 5 | Fail |
| Moderate vulnerabilities | 3 | Warning |
| Overall | **D** | Needs attention |

---

## Summary

1. **Security:** 8 vulnerabilities found, 2 have no fix (xlsx package must be replaced)
2. **Outdated:** 17 packages have major updates available
3. **Bloat:** ~8 unused packages adding ~113KB to bundle
4. **Recommended Actions:**
   - Immediately replace `xlsx` with `exceljs`
   - Run `npm audit fix` to patch 6 vulnerabilities
   - Remove 8 unused Radix/utility packages
   - Plan migration path for major version updates
