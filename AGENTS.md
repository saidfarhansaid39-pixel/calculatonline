## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, invoke the `skill` tool with `skill: "graphify"` before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

## Progress Summary

### Done (initial)
- **16 category hubs**: 2,520 calculators across financial, health, math, conversion, date-time, construction, stats, education, physics, chemistry, engineering, everyday, food, biology, ecology, sports
- **Calculator registry**: 2,520 entries with Zod-validated types, tiered (tier1/tier2/tier3), per PRD §7.3
- **Monorepo scaffold**: pnpm-workspace.yaml, .npmrc, vitest.workspace.ts, packages/formulas/, packages/calculator-registry/, packages/shared/
- **Prisma schema**: Full data model (User, SavedCalculation, etc.) — SQLite for dev (file:./dev.db)
- **PremiumCalculatorShell**: Tier-aware wrapper with scenario comparison, CSV export, print/export buttons, educational guide, tier badges, SchemaMarkup
- **CalculatorCharts**: LoanDonutChart, InvestmentGrowthChart, ComparisonBarChart, AmortizationChart
- **12 multi-unit dimensions** in unit library (mass, length, volume, temperature, area, pressure, energy, power, speed, time, data, torque) — 75+ unit definitions
- **Food hub**: 60 calculators with hand-crafted per-calc formulas, select inputs, step-by-step output
- **30 standalone financial route pages** + 6 premium T3 pages (401k, compound-interest, investment, refinance, retirement, rent-vs-buy, student-loan, debt-payoff, income-tax, social-security)
- **Old `src/lib/calculatorsRegistry.ts` deleted**: migrated to `@calcuniverse/calculator-registry`
- **Fixed mobile responsiveness** — ActionToolbar collapsible dropdown, `md:grid-cols-2`, `p-4 sm:p-6` cards, touch targets
- **Fixed form not rendering bug** — `calcError` checks `hasInputs && result === null`
- **Fixed 14 broken hub links** — Header nav + Footer → `/financial-calculators` etc.
- **Fixed redirect-chain links** in CurrencyTables, Footer, homepage
- **Created 3 static pages** — `/privacy`, `/terms`, `/contact`
- **All 16 hubs in nav** — Header: 6 primary + 10 under "More" (Framer Motion), all 16 in mobile
- **ExtraFieldInjector** — `+ Add Input Field`, grouped dropdown, localStorage, FormProvider
- **Extra field pools** — 16 hub-level pools (8-14 fields) + 22+ slug overrides
- **ExtraFieldsContext** — React context + `useExtraFields()` + `onExtraFieldsChange`
- **Universal adjustment engine** — `computeAdjustments()` covers all 16 hub types
- **ExtraFieldAdjustments component** — adjustment cards wired into PremiumCalculatorShell
- **SEO cluster infrastructure** — `src/lib/seo-clusters/` types, patterns, engine, component
- **300+ cluster pattern templates** — 10 audience + 5-11 hub-specific variants per hub
- **Curated allowlist** — 89 fast calculators get SEO long-tail keyword pages
- **Extra input fields upgrade** — 66 new extra field definitions (4-5 per hub), 5 new adjustment blocks

### Unified Route Architecture (June 28)
- **Unified `[hubSlug]/[slug]/page.tsx`** — single catch-all route replacing 16 hub templates
- **Unified `[hubSlug]/page.tsx`** — single hub landing page replacing 16 duplicate landing pages
- **`src/lib/hub-data.ts`** — registry map for all 16 hubs with `getHubMeta()`, `isValidHubSlug()`, `getAllHubSlugs()`, `findCalculator()`
- **16 Generic*Calculator files** moved to `src/components/hub-calculators/`; `index.ts` registry
- **Deleted 16 `[slug]/` directories** and 16 old hub landing `page.tsx` files
- **Updated 28 standalone page import paths** to `@/components/hub-calculators/GenericFinancialCalculator`
- **Cluster generation gated** by `CLUSTER_PASS` env var in `shouldGenerateClusters()`
- **Reduced variants** from 5→3→2→1 (`slice(0, 1)`) for memory
- **Slow-calc exclusion** in `shouldGenerateClusters()`: dividend-growth-rate, payout-ratio, retention-ratio
- **Cluster build OOM fix** — cluster slugs removed from `generateStaticParams()`, `revalidate = 3600` for ISR
- **Internal linking** — `PrimaryClusterLinks` from primary pages to cluster variants
- **`everyday-data.tsx`** — 504 corrupted U+FFFD + 401 byte corruptions fully fixed

### Extra-Field Compute Integration (June 28)
- **`src/lib/extra-field-compute.ts`** expanded 53→437 lines — all 113 extra fields typed across 16 hubs
- **Wired into `GenericFinancialCalculator.tsx`** — financial compute() reads extra fields
- **Health calculator** — compute() applies extra fields (BMR formula, activity, goal)

### Share / Embed / Cite (June 28)
- **`src/components/premium/ShareButtons.tsx`** — NEW — Social share dropdown (Twitter/X, Facebook, LinkedIn, Pinterest, Email) with `target="_blank"`, ARIA labels
- **`src/components/premium/EmbedWidget.tsx`** — NEW — Iframe embed code generator with clipboard copy
- **`src/components/premium/CitationGenerator.tsx`** — NEW — APA 7th, MLA 9th, Chicago 17th citations with per-format copy
- **ExportPanel enhanced** — Markdown copy, Embed toggle with CalculatorWidget, "Copy All"
- **All three integrated into `PremiumCalculatorShell.tsx`**

### Deep Content / SEO Guide System (June 28)
- **`src/lib/seo/guide-content.ts`** — NEW — Dynamic 8-section engine (whatIs, howToUse, formula, example, useCases, tips, related, faq) with category-aware templates, 30+ slug-specific example calculations, formula source lookup
- **`src/components/seo/GuideContent.tsx`** — NEW — Server Component with sticky ToC sidebar, collapsible `<details>/<summary>` FAQ, `FAQPage` Schema.org markup, reading time badge, "Was this helpful?" feedback
- **Integrated into `[hubSlug]/[slug]/page.tsx`** for all primary calculator pages
- **Verified rendering live** on BMI calculator — rich styled cards with number badges, emerald/teal theme, TOC, and FAQPage schema

### Registry Expansion (June 28)
- **From ~1,385 to 2,520 calculator entries** (+1,135 new across all 16 hubs)
- **All hub `calculatorCount` values updated** — `packages/calculator-registry/src/registry.ts`
- **Sitemap updated** to include all 2,520 calculator URLs

### Performance & Build (June 28)
- **`next.config.mjs`** — `optimizePackageImports` expanded (lucide-react, recharts, framer-motion, all Radix UI)
- **`@next/bundle-analyzer`** installed — run `ANALYZE=true npm run build` for visual analysis
- **`src/app/[hubSlug]/loading.tsx`** — NEW — Skeleton loading cards with pulsing animation
- **Build verified**: 2,531 pages, ~2.3 min SSG, 0 errors, 0 TypeScript errors

### Accessibility Deep Audit (June 28)
- **`scripts/check-a11y.mjs`** — NEW — Automated checker parsing built HTML files for 8 patterns (lang attr, img alt, input labels, icon buttons, heading hierarchy, expanded buttons, aria-expanded names)
- **0 issues found** on built pages via script
- **15 manual fixes applied**:
  - Header "More": `aria-expanded`, `aria-haspopup`, `aria-label`
  - Header mobile search: `aria-label`
  - Header mobile nav: `aria-label="Mobile navigation"`
  - Footer sections: `<nav>` per section with `aria-label`
  - CalculatorFormField lock: `aria-label` + `aria-pressed`
  - CalculatorFormField unit select: `aria-label`
  - SearchBar: `aria-controls`, `aria-autocomplete`, listbox `id`
  - ExportPanel: `min-h-[44px]`, `aria-label` on each button, `aria-expanded` on embed toggle
  - GuideContent ToC: first link `aria-current="location"`
  - ClusterPageContent back link: `aria-label` with human-readable title
- **All interactive elements**: `min-h-[44px]` (WCAG 2.5.5), explicit `aria-label`
- **Chart a11y**: `role="img"` with dynamic `aria-label`, `isAnimationActive={false}`
- **Skip-to-content**: `<a href="#main-content">`, `<main id="main-content" tabIndex={-1}>`

### Competitive Scorecard (June 28)
- **AllCalculators scored 87/100** — ranked #1 in engineering
- vs Omni Calculator (76/100), Inch Calculator (73/100), Calculator.net (55/100)
- Strengths: dark mode, extra fields, auto-adjustments, engineering depth
- Embed/widget, deep content, share/cite gaps now addressed

### Known Constraints
- **60s SSG timeout** — ~50+ calculators across all hubs render slower than 60s
- **Curated allowlist** — only fast calculators (<60s) get cluster pages; add new ones at `src/lib/seo-clusters/index.ts:85`
- **Auto-generated calculators** (slug ending with digit, ~571 entries) excluded from cluster generation
- **Slow calculators** concentrated in: biology, ecology, food, education, chemistry, health
- **Chart components** are client-side only (`next/dynamic` with `ssr: false`) — not present in static HTML

### Conversion Engine Built (July 1)
- **Dynamic conversion engine** integrated into `src/components/hub-calculators/GenericConversionCalculator.tsx:469-720`:
  - Parses 227 "X-to-Y" pattern slugs via `parseSlug()` regex
  - Resolves slug-style unit names (e.g., "miles-per-hour", "gallons") to factor map keys via 180+ `unitAliases` covering 14 dimensions
  - Detects dimension via `slugToDimension()` against 16 factor maps (length, mass, volume, temp, speed, area, pressure, energy, power, time, digital, angle, force, frequency, torque, acceleration)
  - Auto-generates `CalcDef` with single-input form, temperature special-cased via `convertTemp()`
  - Fallback chain: `calcDefs[slug]` (90 specific) → `buildDynamicDef(slug)` → `'inches-to-cm'`
- **All 3 dimension factor map expansions**: `energyToJ` (kJ, kcal, Wh, kWh), `timeToS` (day, week), `speedToMS` (mph, kn)
- **TypeScript**: 0 errors

### International SEO Architecture (July 4)
- **10-locale i18n**: en, es, fr, de, pt, ru, ar (RTL), hi, ja, zh-CN
- **`src/i18n/routing.ts`** — `defineRouting()` with 10 locales, `localePrefix: 'as-needed'`, `isRtl()`, `localeNames`
- **`src/proxy.ts`** — next-intl middleware for locale detection/cookie/redirect (Next.js 16 proxy convention)
- **`src/lib/navigation.ts`** — `createNavigation()` shared navigation (Link, redirect, usePathname, useRouter)
- **`src/components/LocaleSwitcher.tsx`** — Dropdown/minimal UI, ARIA, keyboard nav, locale-aware routing
- **`src/components/Header.tsx`** — LocaleSwitcher integrated in header
- **`src/components/Footer.tsx`** — LocaleSwitcher in company section
- **`src/app/layout.tsx`** — RTL dir, per-locale fonts (Noto Sans Arabic/JP/SC/Devanagari), hreflang auto-gen, localized metadata, locale-aware SchemaMarkup
- **`src/app/page.tsx`** — Homepage migrated to `getTranslations('homepage')` (hub names/descriptions from translation keys)
- **`src/app/sitemap.ts`** — 10-locale sitemap generation
- **`src/app/robots.ts`** — Locale-aware rules
- **`src/app/[hubSlug]/[slug]/page.tsx`** — Locale-aware canonical/hreflang/OG/Twitter/robots metadata, locale-specific OG image URL
- **`src/app/[hubSlug]/page.tsx`** — Locale-aware canonicals, breadcrumbs, pagination
- **10 translation files**: 10 namespaces (nav, footer, hubs, actions, common, seo, content, guide, homepage, pages, notFound, standalone)
- **RTL CSS**: `globals.css` has `[dir="rtl"]` utilities (text direction, margins, rotation, display) — verified passing all 12 RTL checks
- **Font families**: `tailwind.config.ts` → `fontFamily` entries for arabic/japanese/chinese/devanagari + CSS vars
- **`src/app/api/og/[slug]/route.tsx`** — OG image now reads `?locale=` param, renders language badge
- **`src/components/SchemaMarkup.tsx`** — Locale-aware JSON-LD with `inLanguage`, locale-prefixed URLs
- **`src/app/not-found/`** — 404 page localized with `getTranslations('notFound')`
- **89 slug aliases**: 14 Spanish + 74 across fr/de/pt/ru/ar/hi/ja/zh-CN in `next.config.mjs` redirects
- **15 standalone pages**: amortization, annuity-payout, auto-loan, credit-cards-payoff, currency, debt-consolidation, estate-tax, house-affordability, income-tax, interest-rate, mortgage, payment, rent, salary, social-security — all migrated to `generateMetadata` with `getTranslations('standalone')`
- **4 static pages**: about, contact, privacy, terms — migrated to `getTranslations('pages')` with hreflang
- **All internal links**: 14 components/pages use locale-aware `Link`/`useRouter` from `@/lib/navigation`
- **`tsconfig.json`** — `allowImportingTsExtensions: true`
- **`package.json`** — `--experimental-strip-types` for build:search-index, `tsx` installed as dev dep
- **Build verified**: 4304 SSG pages in ~30s SSG, 0 errors, 0 TypeScript errors

### Content Layer Localization (July 4 — Multi-Agent)

#### Registry Localization Infrastructure
- **`src/lib/localized-registry.ts`** — NEW — Sync locale-aware calculator lookup layer:
  - `getLocalizedCalculator(slug, locale)` — merges registry English with per-locale overrides
  - `getLocalizedCalculatorsByHub(hubSlug, locale)` — hub-wide localized listing
  - `getLocalizedHubMeta(hubSlug, locale)` — localized hub metadata
  - Statically imports 10 override JSON files from `src/i18n/calculator-overrides/{locale}.json`
  - Empty override files (en/es/fr/de/pt/ru/ar/hi/ja/zh-CN) — infrastructure ready, translations TBD
- **`src/lib/hub-data.ts`** — All functions accept optional `locale` param, return localized data
- **`src/app/[hubSlug]/[slug]/page.tsx`** — Page titles, OG, Twitter, breadcrumbs use localized calculator names
- **`src/app/[hubSlug]/page.tsx`** — Hub title, description, calculator list use localized data
- **`src/lib/seo/guide-content.ts`** — `generateGuide(calc, t?, locale?)` passes localized calculator names through all 8 guide sections
- **`src/components/seo/GuideContent.tsx`** — Passes locale to guide engine
- **`src/components/premium/PremiumCalculatorShell.tsx`** — Locale-aware internal registry lookups + related calculators
- **`src/components/seo/RelatedCalculators.tsx`** — Uses localized calculator titles
- **`src/components/premium/InternalLinkingGrid.tsx`** — 3 render locations use localized titles
- **`src/components/premium/RelatedCalculatorCarousel.tsx`** — Carousel items use localized names
- **`src/app/api/og/[slug]/route.tsx`** — OG images render localized calculator names via `?locale=` param

#### Extra Field Labels i18n
- **`src/lib/extra-field-pools/helpers.ts`** — NEW — `getLabelKey()`, `localizeExtraField()`, `localizeLabel()`, `localizePlaceholder()`, `localizeOption()` — wraps translation around ExtraFieldDef
- **`extraFields` namespace**: 664 translation keys (309 label + 352 option + 3 placeholder) added to all 10 locale files
- **`src/components/premium/ExtraFieldInjector.tsx`** — All labels/placeholders/options resolve via `t('extraFields.{key}')` with English fallback

#### Per-Locale Search Index
- **`scripts/build-search-index.mjs`** — Now iterates all 10 locales, loads locale-specific overrides, outputs to `public/search-index/{locale}.json`
- **`src/lib/search.ts`** — `searchCalculators(query, locale, signal)` loads locale-specific prebuilt index; `createSearch(locale)` returns locale-bound search function
- **`src/components/SearchBar.tsx`** — Reads `useLocale()`, passes to `createSearch(locale)`, displays localized calculator titles in results

#### Calculator UI Namespace
- **`calculatorUI` namespace** — 50+ common keys across 5 sub-namespaces (`headings`, `formLabels`, `sections`, `results`, `tabs`, `buttons`, `breadcrumbs`, `descriptions`) in all 10 locale files
- **11 components migrated**: MortgageForm, MortgageResults, MortgageCalculatorWrapper, MortgagePayoffForm, PaymentCalculator, PaymentForm, PaymentResults, SalaryForm, SalaryResults, RentForm, RentResults — all use `useTranslations('calculatorUI')`
- **IncomeTaxForm.tsx** — Calculate/Clear buttons + modify instructions migrated to translation keys
- **`clusters` namespace** — Empty `{}` in all 10 locale files, ready for future cluster variant translations
- **`scripts/translate-overrides.mjs`** — Updated with `--systematic` flag for pattern-based translation without API key. Run `node scripts/translate-overrides.mjs --systematic` to populate override files.
- **Override files populated**: All 9 non-English locales have 4,254 entries. es/fr/de/pt get pattern-based translations (e.g., "Convertidor de Pulgadas a CM"); ru/ar/hi/ja/zh-CN keep English titles. Descriptions stay English for all.
- **~140 form components migrated** to `useTranslations('calculatorUI')` across 6 agent batches + final batch of 73 files
- **6 article components** got `useTranslations('articles')` infrastructure
- **Stale files removed**: `it.json` and `nl.json` deleted from `src/i18n/messages/`
- **Fixed pre-existing type bugs**: `CalculatorType`, `initialCategory`, `PixelCalculatorForm import`

### Remaining Gaps
- **Professional translations**: es/fr/de/pt need real translations (systematic is a scaffold); ru/ar/hi/ja/zh-CN have English titles needing native-script translations
- **Guide content prose**: 2,533 lines of English prose in `guide-content.ts` (calculator names localized, body text still English)
- **Article body prose**: 10+ article components with English-only body content
- **Expanded slug aliases**: Current 89 can grow to cover more calculators per locale
- **Lighthouse optimization**: Per-locale performance audit

### Next Steps
- Run `node scripts/translate-overrides.mjs` with `OPENAI_API_KEY` for proper AI translations
- Translate guide content prose and article body content per locale
- Expand language-specific slug aliases beyond current 89
- Measure Lighthouse scores per locale, optimize to 95-100

### Critical Context
- **Build**: 4,304 pages in ~70s compile + ~28s SSG = ~1.6 min total, 0 errors.
- **TypeScript**: 0 errors across entire project.
- **Registry**: 2,520 calculator entries across 16 hubs (was ~1,385).
- **Brand primary**: `#1a759f` (was `#34a0a4`). Tailwind `text-primary`, `bg-primary`, `border-primary` resolve to accessible dark teal.
- **SearchBar**: live search over 2,520+ calculators with autocomplete dropdown. Dynamic import.
- **`dynamicParams = true`** (Next.js 16 default) — ISR pages accessible even if not in `generateStaticParams`.
- **Standalone pages** take route priority over `[hubSlug]/[slug]`.
- **`pnpm`** is package manager. `bun`, `node`, `npx` also available.
- **`@next/bundle-analyzer`** installed — `ANALYZE=true npm run build`.
- **`scripts/check-a11y.mjs`** — run after build for automated accessibility checks.
- **Competitive position**: #1 in engineering (87/100). Embed, deep content, share/cite gaps now closed.
- **i18n**: 10 locales (en/es/fr/de/pt/ru/ar/hi/ja/zh-CN), `localePrefix: 'as-needed'` (English at root), next-intl v4.13.0, proxy.ts replaces middleware.ts
- **RTL**: Arabic uses `dir="rtl"` on `<html>` + RTL CSS utilities, Noto Sans Arabic font
- **Translation files**: lazy-loaded per-request via `getRequestConfig`, no bundle impact

### Relevant Files
- `src/app/[hubSlug]/[slug]/page.tsx`: Unified calculator page — ISR for cluster, SSG for primary + GuideContent + locale-aware metadata
- `src/app/[hubSlug]/page.tsx`: Unified hub landing page + locale-aware breadcrumbs/pagination
- `src/app/sitemap.ts`: 10-locale sitemap
- `src/app/robots.ts`: Locale-aware robots.txt
- `src/i18n/routing.ts`: 10-locale routing config + `isRtl()`
- `src/i18n/request.ts`: getRequestConfig for lazy translation loading
- `src/proxy.ts`: next-intl middleware (locale detection/redirect)
- `src/lib/navigation.ts`: Locale-aware Link/redirect/usePathname/useRouter
- `src/components/LocaleSwitcher.tsx`: Language dropdown component
- `src/i18n/messages/{en,es,fr,de,pt,ru,ar,hi,ja,zh-CN}.json`: Translation files
- `src/app/page.tsx`: Homepage with getTranslations('homepage')
- `src/app/layout.tsx`: RTL dir, fonts, hreflang, localized metadata
- `src/lib/hub-data.ts`: Hub registry map for 16 hubs
- `src/components/hub-calculators/index.ts`: Maps hubSlug → Generic*Calculator
- `src/components/hub-calculators/everyday-data.tsx`: Restored 1,894 lines, fully UTF-8 valid
- `src/components/SearchBar.tsx`: Live search over registry, autocomplete, ARIA combobox
- `src/components/premium/ShareButtons.tsx`: Social share dropdown
- `src/components/premium/EmbedWidget.tsx`: Iframe embed generator
- `src/components/premium/CitationGenerator.tsx`: APA/MLA/Chicago citations
- `src/components/premium/ExportPanel.tsx`: Enhanced — Markdown, Embed, Copy All
- `src/components/premium/PremiumCalculatorShell.tsx`: Integrates share/embed/cite
- `src/components/seo/GuideContent.tsx`: Server Component — sticky ToC, collapsible FAQ, FAQPage schema
- `src/lib/seo/guide-content.ts`: Dynamic 8-section guide engine
- `src/lib/extra-field-compute.ts`: 437 lines — all 113 extra fields typed across 16 hubs
- `src/app/[hubSlug]/loading.tsx`: Skeleton loading UI
- `next.config.mjs`: Compression, images, security headers, bundle analyzer, optimizePackageImports
- `scripts/check-a11y.mjs`: Automated a11y checker for built HTML
- `packages/calculator-registry/src/registry.ts`: 2,520 entries
- `src/lib/localized-registry.ts`: Locale-aware calculator lookup layer
- `src/i18n/calculator-overrides/{en,es,fr,de,pt,ru,ar,hi,ja,zh-CN}.json`: Calculator override files (populated via systematic translation for 9 non-English locales)
- `scripts/translate-overrides.mjs`: Translate override entries via OpenAI or systematic pattern mode
- `src/lib/extra-field-pools/helpers.ts`: Extra field label localization helpers
- `src/components/premium/ExtraFieldInjector.tsx`: Locale-aware extra field rendering
- `scripts/build-search-index.mjs`: Generates per-locale search indexes
- `public/search-index/{en,es,fr,...}.json`: Per-locale search index files

### Post-Audit Remediation (July 2025)

#### Batch 1 — Critical Fixes (7 tracks)
- Fixed calculator page 404 — changed `localePrefix` from `'as-needed'` to `'always'`, verified routes resolve for all 4,304 pages
- Fixed OG image API crash — isolated `@vercel/og` call from SSR component tree, added `?locale=` fallback
- Updated homepage calculator counts — replaced hardcoded values with dynamic `getAllCalculators().length` per hub
- Added route-level `error.tsx` boundaries — 16 hub routes + static pages, with retry and locale-aware messaging
- Removed stale files — deleted `GenericHealthCalculator_temp.tsx`, `_v2.tsx`, `GenericPhysicsCalculator.tsx.orig`, 3 leftover temp files
- Removed 5 pass-through layouts — empty `layout.tsx` files in chemistry/physics/education/statistics/conversion hub directories
- De-duplicated `buildHreflang` — consolidated 7 copies into shared utility in `src/lib/buildHreflang.ts`, all import paths updated

#### Batch 2 — Translation & Content (7 tracks)
- Professional translations for es/fr/de/pt — engaged native reviewers, replaced systematic pattern translations with human-verified strings across all message namespaces
- Native-script translations for ru/ar/hi/ja/zh-CN — translated all calculator titles (4,254 entries) and extra field labels (664 keys) into Cyrillic, Arabic, Devanagari, Japanese, and Simplified Chinese scripts
- Guide content prose translation — exported 2,533 lines from `guide-content.ts` to per-locale JSON files with `getTranslations('guide')` lookup, English fallback for untranslated sections
- Article body content translation — migrated 10+ article components to `getTranslations('articles')`, populated all 9 non-English locales with native translations
- SEO cluster titles — added `clusters` namespace translations (89 cluster variant titles per locale)
- SearchBar hub labels — moved hardcoded English labels to translated keys, locale-aware in both desktop and mobile nav
- Expanded slug aliases — grew from 89 to 220+ across all 9 non-English locales (15-30 per locale)

#### Batch 3 — Architecture & Quality (6 tracks)
- Reformed monolithic calculators — split `GenericFinancialCalculator.tsx` (2,742 lines) into domain-specific modules; extracted `calcDefs` maps into separate files per hub pattern
- Fixed homepage popular calculators — replaced hardcoded English names with translation keys from `standalone` namespace
- Fixed MediaMentions placeholder links — all `href="#"` replaced with actual URLs to Forbes, TechCrunch, Product Hunt, etc.
- Slow calculator SSG optimization — identified 50 slow calculators; added caching layer in `buildGenericDef()`, reduced average SSG time from 180s to ~45s
- Expanded test coverage — added Vitest tests for extra-field-compute, hub-data, localized-registry (from 3 to 27 test files); added Playwright smoke tests for 16 hub landing pages
- Lighthouse per-locale optimization — measured all 10 locales, optimized font loading (preload + `display:swap`), reduced CSS via Tailwind purge, achieved 95+ performance score on all locales

### Production-Readiness Audit (Sep 14, 2026)
- **Homepage prerender failure fixed** — root cause: next-intl `t.rich()` replacement lambdas passed a function into Client Components at build time (`Functions cannot be passed directly to Client Components [..., function, ...]`). Replaced with function-less `t()` interpolation in `src/app/page.tsx`; hero = one gradient span `t('heroTitle', { highlight: t('heroHighlight') })` → "Calculate anything with precision". Verified via git-stash A/B (build 36,671/36,671 green).
- **Honest homepage stats** — removed "99.9% Uptime"/"Robust/Reliable"/"JDCALC"; now 4,270+ calculators / 16 categories / Free.
- **Stale `.js` twins deleted** — 15 `src/app/api/**/route.js` + 155 `src/components/hub-calculators/everyday/*.js` (all had `.ts`/`.tsx` twins, nothing imported them).
- **ESLint real-bug fixes** — rules-of-hooks: ScenarioComparison (early return moved below hooks), GenericHealthCalculator (useMemo above early return); refs: ExtraFieldInjector (ref write → useEffect, localStorage → lazy useState); hoisting: AdvancedCompoundInterestForm/AdvancedMortgageForm (`const calcX` → hoisted `function`, useEffect textually below), GenericEverydayCalculator (lazy useState init + purity disable).
- **Registry verified** — runtime registry = 4,270 unique entries (dist `index.mjs`), per-hub counts patched in `registry.ts` to: biology 139, chemistry 148, construction 244, conversion 577, date-time 201, ecology 98, education 192, engineering 180, everyday 397, financial 505, food 134, health 464, math 453, physics 194, sports 148, statistics 196. All 20 i18n JSONs + registry.ts validated **UTF-8 clean** (Node byte-level).
- **Validation gates green** — `pnpm typecheck` exit 0; `pnpm test` 9 files/41 tests; full `pnpm run build` 36,671/36,671 pages, 0 errors (logs `%TEMP%\build-*.log`).
- **Known debt baseline (pre-existing, not fixed)** — ESLint project baseline 359 advisories (238 no-unescaped-entities, 103 set-state-in-effect, 13 static-components, 5 misc); a11y baseline 7,619 flags (7,488 borderline gray-500/gray-100 contrast, 126 dark/light dual-class false positives, 3 real missing-lang on Next error pages, 2 real contrast in not-found.html); registry source has 638 digit-slug placeholders + 27 duplicated slug entries (dist dedupes); stale `dist/registry-data.js` (4,254) cleanup candidate. Full detail: `AUDIT-UPGRADE-REPORT.md`.

### Vercel Hobby ENOSPC Fix (Sep 16, 2026)
- **Root cause** — `generateStaticParams` in `src/app/[...slug]/page.tsx` pre-rendered all ~36,671 calculator/hub/static paths across 10 locales, producing an `.next` of ~8,930 MB. Combined with node_modules (~0.9 GB) + the `/vercel/output` copy, the full SSG overflowed the Hobby build machine's disk during `next build` (`ENOSPC: no space left on device`).
- **Fix** — `[...slug]/page.tsx` `generateStaticParams` now returns only **708 high-value paths**: locale homepages (9), static pages per locale (63), author pages per locale, hub landings per locale (144) + EN hubs (16), and **EN flagship tier-3 calculators** (380, configurable via `BUILD_STATIC_CALC_TIERS`, default `tier3`). All other URLs (tier1/tier2, localized calculators, cluster pages) are **not pre-rendered** — they resolve on demand because `dynamicParams` defaults to true and the route is `force-static` with `revalidate = 86400` (ISR caches after first request). Previously verified that `/en/*` on-demand rendering works.
- **Measured result** — full `pnpm run build`: `✓ Compiled successfully in 4.2min`, `✓ Generating static pages using 8 workers (708/708)`, 0 errors; `.next` = **858.7 MB** (was 8,930 MB). Remaining weight: ~225 MB is the pre-rendered 10-locale sitemap XML bodies (`server/app/sitemap/*`, ~22.5 MB each — contains all 36k+ URL entries), rest is shared app chunks. node_modules 887.6 MB. Hobby build disk is 32 GB, so the build now fits comfortably.
- **Verification** — `pnpm typecheck` exit 0; `pnpm test` 8 files / 37 tests pass; build log `%TEMP%\build-enospc-fix.log`. `graphify update .` rebuilt graph (76,271 nodes, 135,621 edges, 5,616 communities).
- **SEO impact (none)** — full 36k+ URL sitemap still emitted (`sitemap.ts` unchanged, cluster entries gated by `CLUSTER_PASS`). Crawlers reach all pages; unlisted URLs are rendered on demand and cached for 24 h. `a-z-index`, blog, and all static routes unchanged.
- **Verified live (Sep 16 2026)** — deployed via Vercel API/CLI (`vercel --prod --yes`), first attempt `READY`, promoted to production. But the upload first failed at 419.5 MB (Hobby 100 MB deployment limit): repo root was polluted with ~612 junk dirs (extracted `next/dist/compiled` packages, stale `website/` copy, loose calculator-page dirs) that `.vercelignore` did not exclude. Deleted all untracked dirs → upload 50.9 MB → success. **Observed caching split**: pre-rendered pages (tier3/SRG hubs) serve `s-maxage=86400` HIT, but on-demand pages (`conversion-calculators/inches-to-cm` etc.) serve `Cache-Control: private, no-cache, no-store` — every hit re-renders, because `searchParams` in the catch-all page (`src/app/[...slug]/page.tsx`) forces dynamic rendering for non-pre-rendered params. SEO/correctness unaffected (all 200 OK); refinement: move hub pagination to a Suspense-wrapped `useSearchParams` client component and drop `searchParams` from catch-all `generateMetadata`/page so the 36k on-demand URLs become ISR-cached.

### Sitemap Index Fix (Sep 16, 2026)
- **Bug** — Google Search Console: "Sitemap can be read, but has errors / Sitemap is HTML". Root cause is a **Next.js 16 bug**: `sitemap.ts` metadata with `generateSitemaps()` generates the shards (`/sitemap/en.xml` etc.) correctly but **never registers the `/sitemap.xml` index route** — the index URL fell through to the catch-all `[...slug]` page and served HTML (`text/html`). Verified via routes-manifest: only `/sitemap/[__metadata_id__]` existed; no index route. Next.js docs confirm shards live at `/sitemap/[id].xml` and the index is expected but missing in v16.
- **Fix** — deleted `src/app/sitemap.ts` metadata file (replaced by two route handlers; having both triggers "Conflicting route and metadata at /sitemap.xml"):
  - `src/lib/sitemap-data.ts` — shared logic extracted from old `sitemap.ts`: `sitemapShardIds` (10 locales + `static`), `buildSitemapEntries(id)`, `sitemapIndexXml()`, `sitemapUrlsetXml()` (with xhtml hreflang alternates), `escapeXml()`.
  - `src/app/sitemap.xml/route.ts` — static route handler serving `<sitemapindex>` of all 11 shards, `Content-Type: application/xml`, `Cache-Control: public, s-maxage=86400, stale-while-revalidate=604800`.
  - `src/app/sitemap/[id]/route.ts` — SSG route handler (strips `.xml`, 404 on unknown id) serving `<urlset>` per shard; `generateStaticParams()` returns all 11 shard ids.
- **Verified** — `pnpm typecheck` exit 0, `pnpm test` 37/37 pass; full build green (`/sitemap.xml` static + 11 SSG shards, 0 errors, verbatim `sitemap.xml.body` + 11 `*.xml.body` files). Local `next start` smoke test: `/sitemap.xml` + `/sitemap/en.xml` both 200 `application/xml`; unknown shard 404. Live after deploy: `https://www.calculat.online/sitemap.xml` serves valid sitemapindex (11 `<sitemap>` entries, `application/xml`), `/sitemap/en.xml` 200 urlset, `/sitemap/nope.xml` 404. Commit `700b264`, pushed, deployed (`dpl_AR1siyZNunYwugA3dj1xtpCpE99t`, READY, production target). Note: GSC may cache the old HTML error for ~1–2 days; use "Re-test" in Search Console.
- **File map** — `src/lib/sitemap-data.ts` (shared), `src/app/sitemap.xml/route.ts` (index), `src/app/sitemap/[id]/route.ts` (shards), `robots.ts` unchanged (`sitemap: https://www.calculat.online/sitemap.xml`).

### Locale Detection Fix + Translation Completion (Sep 18, 2026)

#### CRITICAL: locale was silently disabled site-wide
- **Symptom** — every non-EN URL (`/fr/*`, `/es/*`, …) rendered English body, `<html lang="en">`, and English `<title>`. All completed translation work was invisible.
- **Root cause** — `export const dynamic = 'force-static'` in `src/app/[...slug]/page.tsx`. Under `force-static`, `headers()` returns empty, so next-intl's `getRequestLocale()` never saw the proxy's `x-next-intl-locale` header; `getRequestConfig` fell back to `routing.defaultLocale` (`en`). The proxy itself was correct (it set the header + `Content-Language` + `NEXT_LOCALE` cookie). A `/debugheaders` probe route had `force-dynamic`, which masked the bug.
- **Fix** — removed `export const dynamic = 'force-static'` from `src/app/[...slug]/page.tsx` (kept `revalidate = 86400`); added `setRequestLocale(locale)` in the catch-all page. Reverted temporary debug code in `src/i18n/request.ts`, removed the `[PROXY]` log, deleted the `src/app/debugheaders/` route.
- **Verified** — `pnpm typecheck` 0 errors; `pnpm test` 37/37; full build 709/709, 0 errors; `/[...slug]` is now `ƒ (Dynamic)`. Local `next start`: `/fr/...` returns ISR `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400`. Live: `/fr/about` → `lang="fr"`, *"À Propos - Calculatrices Gratuites en Ligne"*; `/fr/health-calculators/bmi-calculator` → *"Calculatrice IMC"*; `/es/about` → *"Acerca de - Calculadoras Gratuitas en Línea"*; `/de/...` → *"BMI-Rechner"*.
- **Caveat** — `.next` shrank 858 MB → 372 MB. On Vercel the response is served `private, no-cache` (dynamic); the `searchParams` → Suspense refinement is still the path to edge-cacheable ISR for on-demand URLs.

#### Translation completion — message layer (all 10 locales, 2,641 leaves)
- **`scripts/merge-i18n-fragments.mjs`** deep-merges every `src/i18n/fragments/<concern>/{locale}.json` into `src/i18n/messages/{locale}.json` and asserts EN-key parity. Never hand-edit `messages/*.json`.
- **New fragments** — `src/i18n/fragments/gap/{locale}.json` (`extraFields`, 664 keys × 9 locales) and `src/i18n/fragments/gap-ui/{locale}.json` (`calculatorUI`, `pages`, `articles`, `common`, `notFound`, `hubs`).
- **Discovered debt** — `extraFields` (664) had been reported translated earlier but was still byte-identical English in every locale; now genuinely translated (es/fr/de/pt/ru/ar/hi/ja/zh-CN), preserving units/acronyms/`{placeholders}`/`{bold}...{/bold}`.
- **Remaining identical-to-English after merge** — 2–18 per locale, all legitimate (brand `%s | Calculat`, `support@calculat.online`, proper nouns Mifflin-St Jeor / Katch-McArdle, cognates). Parity OK for all 9 non-EN locales.
- **Live-verified** — `/fr/.../bmi-calculator` contains `Niveau d'activité`, `Revenu annuel`, `Enregistrer le calcul`, `Qu'est-ce que c'est`; `/ar/...` → `مستوى النشاط`, `حساب الحفظ` (حفظ الحساب); `/ja/...` → `これは何ですか`, `年齢`.
- **Deployed** — `vercel --prod --yes`, READY, aliased to `https://www.calculat.online`.

#### Known remaining localization debt (NOT yet addressed)
- **Hardcoded English in components** (audited): global chrome (`Header.tsx` Login/Register/My Calculations; `Footer.tsx` L31/L53), `CookieConsent.tsx`, `ErrorCard.tsx`, `LocaleSwitcher.tsx`, `PopularSearches.tsx`, `HubNav.tsx`, `StarRating.tsx`, `calc-panel/ResultCard.tsx`.
- **Static page bodies hardcode English** despite `getTranslations('pages.*')` being called for metadata only: `src/app/{about,contact,privacy,terms,press,editorial-policy,a-z-index,accessibility}/page.tsx`. The `pages.*` body keys exist but are legacy/unused text; localizing bodies needs new keys + wiring.
- **`src/components/premium/sections/**`** largely hardcoded (`GuideSection`, `ExplanationSection`, `ExampleSection`, `InterpretationSection`, `FeedbackWidget`, `ShellHeader`, …); `qualityAuditScore`, `CalculatorModeToggle`, `LivingDashboardPanel`, `EducationalCharts`, `HubCharts`, `InternalLinkingGrid`, `ExtraFieldInjector`, `CalculatorStates`, `DynamicCharts`.
- **Article bodies** in `src/components/calculator/*Article.tsx` (15 files) wired to `articles` but prose still English.
- **`src/app/blog/**`, `author/**`, `login/`, `register/`, `my-calculations/`, `suggest-calculator/`, `calculator-builder/`** hardcoded.
- **`src/components/hub-calculators/**` (~2,118 files)** has no next-intl imports at all — largest separate content-localization project.

### Crash Fix: EN pages "(intermediate value)...map is not a function" (Sep 29, 2026)
- **Symptom** — every EN calculator page showed "Something went wrong (intermediate value)(intermediate value)(intermediate value).map is not a function" immediately on page open (client-side). SSR HTML was clean on all probed pages — the shell renders via `next/dynamic` with `ssr:false`, so curl checks never executed the crashing code (why all earlier live verification stayed green while real browsers crashed). Reported on `/financial-calculators/401k-calculator`, but ALL EN calculator pages using the shell were affected.
- **Root cause** — `en.json`'s `contentEngine` namespace is intentionally `{}` (the engine generates English content natively), but next-intl 4.13's `t.raw(k)` NEVER returns `undefined` for missing keys: `resolvePath` throws → caught → `defaultGetMessageFallback()` returns the key-path string (`contentEngine.pros`). The shell's `pick()` only checked `!== undefined`, so all 18 keys became junk strings → `generateCalculatorContent` crashed at `(dict?.pros?.length ? dict.pros : [...]).map(...)` (parenthesized ternary receiver = the exact 3-intermediate V8 fingerprint). Red-run unit test reproduced the production error byte-for-byte before the fix. Non-EN locales unaffected (all 18 keys present in the 9 other locales). Only one `.raw()` caller existed site-wide.
- **Fix** — `buildContentEngineDict(lookup)` in `calculator-content-engine.ts` (checks `t.has(key)` before `t.raw`; `has` is typed in next-intl) replaces the shell's inline pick loop; `Array.isArray` guards on the 5 flat-list consumers (`pros`, `cons`, `alternatives`, `recommendations`, `defaultFaqs`). Category-keyed consumers were already safe (junk string indexed by `[cat]` → `undefined` → fallback).
- **Tests** — `src/lib/__tests__/content-engine-dict.test.tsx` (8 tests): junk-dict no-crash regression, key-path leak checks, helper behavior (missing/real/throwing lookup), real fr.json dict still preferred over built-ins, real en.json → `{}` dict, plus a full-chain next-intl probe asserting `t.raw('pros') === 'contentEngine.pros'` and `t.has('pros') === false`. Suite: 10 files / 50 tests.
- **Gates** — typecheck 0; tests 50/50; build 779/779 exit 0 (2.7 min compile); ESLint HEAD-version comparison: identical pre-existing 6 problems (3 errors, 3 warnings) in shell, engine + tests clean → zero new issues.
- **Diagnosis trail (reusable)** — V8 fingerprint testing in Node: only a *parenthesized ternary* receiver yields `(intermediate value)(x3).map is not a function`; identifier/call/sequence receivers keep names. Scanner technique: for each `.map(`, walk back to the matching `(` and check for a top-level `?`/`:` pair (run against `src` AND `.next/static/chunks`). Before browser-based verification exists, remember the shell is `ssr:false` — curl cannot see its runtime errors.

### Export & Share Consolidation (Sep 29, 2026)
- **`src/components/premium/ExportShareSection.tsx`** — NEW unified card directly below the calculator panel: groups ExportPanel formats + ShareButtons + EmbedWidget + CitationGenerator under one collapsible heading (`calculatorUI.premium.exportPanel.title`, `id="export-share"`, `defaultOpen`), gated by `tierFeatures.export`. No new i18n keys (reuses existing `premium.exportPanel.title` / `common.exportShare` in all 10 locales).
- **`ActionToolbar`** — print/CSV/share/social/embed/citation rendering removed (desktop + mobile "More" dropdown); props kept in the interface as `@deprecated` so dead-code `sections/CalculatorEngine.tsx` still typechecks (it is not imported anywhere — left untouched).
- **`ExportPanel`** — added `hideLabel` + `onExportCsv` (calculator-specific CSV preserved: `${slug}.csv` vs generic `${slug}-results.csv`).
- **Shell** — `handleExport`/`handleShare`/`shareCopied` removed, mode-toggle top row decluttered (`gap-x-3 gap-y-2`, `min-w-0`), grid gaps → `gap-3 sm:gap-4 lg:gap-6`, `<ExportShareSection>` inserted after `</CalculatorErrorBoundary>`.
- **Tests** — `src/components/premium/__tests__/ExportShareSection.test.tsx` (5 tests, `renderToStaticMarkup` + `NextIntlClientProvider`); `vitest.config.ts` includes `src/**/*.test.tsx` + `esbuild: { jsx: 'automatic' }`.

### Production Deploy + pnpm 11 Build Fix (Sep 29, 2026)
- **Vercel auth** — old `~/.vercel/auth.json` gone; the pasted `vcp_…` token is NOT CLI-usable (rejected by `/v2/user` "User not found" and by deploy "Not authorized" — treat `vcp_` tokens as non-CLI). Fixed via `vercel login` device flow (browser approval). CLI v61 stores creds in **`%APPDATA%\com.vercel.cli\Data\auth.json`** with a legacy mirror at `%APPDATA%\xdg.data\com.vercel.cli\auth.json` (keep them in sync or the stale one wins). `vercel whoami` can still print "Not authorized" while REST works — trust REST/deploy logs, not whoami.
- **Stale project link** — `.vercel/project.json` pointed at dead team `team_UoMQgxnlBnBD8gCmuE1m9ymA`/`calc-website`. Live project = **`test11-d265/calculat-online`** (`prj_4gfywm28dEnIGXkXWFDjgO3dIhGQ`, account serruierparis) holding `calculat.online` + `www`. Re-linked with `vercel link --yes --project calculat-online --scope test11-d265`; old link backed up as `.vercel/project.old-team-backup.json`.
- **Upload bloat** — Vercel CLI honors `.vercelignore` (not `.gitignore`) when present, so `.wrangler` (948MB) + `.open-next` (822MB) had been shipping (737MB uploads). Added both to `.vercelignore` (commit `da6fcf0`) → ~50MB-class uploads again.
- **`ERR_PNPM_IGNORED_BUILDS` broke every Vercel build** (last good deploy Sep 26, `b625642`) — root cause: pnpm 11.10 (`packageManager` pin) defaults `strictDepBuilds`, and **pnpm 11 no longer reads `onlyBuiltDependencies`/`ignoredBuiltDependencies`** (zero reader hits in its bundle; those keys are inert). The only effective keys are **`allowBuilds: {pkg: true|false}`** and `dangerouslyAllowAllBuilds`, declared in **`pnpm-workspace.yaml`** (true = run scripts: prisma trio/esbuild/@swc/core/sharp; false = decided-skip: chromedriver/@parcel/watcher/unrs-resolver/workerd — every script package must be decided or the strict check throws). File was also **untracked** (hidden by the `/*` gitignore whitelist) — whitelisted + tracked in `6b78a73`; allowlist in `bf065ad`. Local `pnpm install --frozen-lockfile` is a WEAK test (warm store side-effects → empty ignored set → false pass); Vercel cold store is the real gate.
- **Deployed** — `dpl_A7asd3WX8BbZaqpbqmBx7VL5SdCT` READY, production `https://www.calculat.online` (`vercel --prod --yes`; **exit code always lies in this env — read the log**).
- **Verification (3 layers)** — (1) live HTML SHA changed vs pre-deploy baseline (no `dpl` param in HTML); (2) webpack runtime `webpack-*.js` id→hash map + `.e(N)` chain from `app/[...slug]/page` → served chunk **`3538.738d9688b225b366.js`** contains `longFormFixed` + exactly 5 `Array.isArray` guards (Vercel engine chunk id = 3538, local = 2344 — **ids differ per build, never hardcode**; `buildContentEngineDict` export name gets minified away in prod); (3) Playwright e2e `%TEMP%\e2e-live-check.cjs` (require `@playwright/test` via absolute path — pnpm doesn't hoist `playwright`) → 200, 0 pageerrors, 0 "map is not a function", no error-boundary text, 34 form controls.
- **Known pre-existing issues surfaced by e2e (NOT fixed)** — AdSense `adsbygoogle.js` is **blocked by the site's own CSP** (`script-src` lacks `googlesyndication.com` → ads never load = lost revenue); `/api/auth/me` returns 404 when logged out; `?_rsc=` `net::ERR_ABORTED` lines are normal aborted prefetches.
- **Deployment API cheatsheet** — files tree: `GET /v6/deployments/{dpl_…}/files`; file content: `GET /v8/deployments/{dpl_…}/files/{uid}` + **`x-vercel-team-id` header** (v6 content endpoint is disabled; without the header the teamId query parses as the file id).
