import { notFound, permanentRedirect } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { findCalculator } from '@/lib/hub-data'
import { resolveHubSlug, resolveCalcSlug, localizedCalc, hubPath, calcPath, crossResolveCalc } from '@/lib/slug-paths'
import { CalculatorPageContent, generateCalculatorMetadata } from '@/components/hub-pages/calculator-page-content'
import { HubLandingContent, generateHubLandingMetadata } from '@/components/hub-pages/hub-landing'
import { routing } from '@/i18n/routing'
import { buildHreflang } from '@/lib/buildHreflang'
import HomePage from '../page'
import AboutPage, { generateMetadata as genAboutMeta } from '../about/page'
import ContactPage, { generateMetadata as genContactMeta } from '../contact/page'
import PrivacyPage, { generateMetadata as genPrivacyMeta } from '../privacy/page'
import TermsPage, { generateMetadata as genTermsMeta } from '../terms/page'
import CalculatorBuilderPage, { generateMetadata as genCalcBuilderMeta } from '../calculator-builder/page'
import SuggestCalculatorPage from '../suggest-calculator/page'
import NotFoundPage, { generateMetadata as genNotFoundMeta } from '../not-found/page'
import AuthorListingPage, { generateMetadata as genAuthorListingMeta } from '../author/page'
import AuthorPage, { generateMetadata as genAuthorMeta } from '../author/[id]/page'

export const revalidate = 86400
// NOTE: do NOT use `dynamic = 'force-static'` here — it makes `headers()`
// return empty, which disables next-intl locale detection (the proxy sets
// `x-next-intl-locale`) and forces every page to render in English.
// Locale-correct rendering (ISR via `revalidate`) takes priority.

// Static pre-render is intentionally LIMITED to high-value pages so the build
// fits the Vercel Hobby builder's disk (ENOSPC: .next ~8.9GB at 36,700 pages).
// Every other URL still resolves: `dynamicParams` defaults to true, so it is
// rendered on demand and cached for `revalidate` seconds (ISR). This keeps the
// full sitemap (36k+ URLs) crawlable without pre-building all of it.
export async function generateStaticParams() {
  const { calculatorRegistry } = await import('@calcuniverse/calculator-registry')
  const { getAllHubSlugs } = await import('@/lib/hub-data')

  const hubs = getAllHubSlugs()
  const params: { slug: string[] }[] = []

  for (const hub of hubs) {
    params.push({ slug: [hub] })
  }

  // Pre-render only flagship (tier3) calculators in English (the highest-value
  // SEO pages). Earlier tiers and all localized variants render on demand (ISR),
  // which keeps the static output a tiny fraction of the full registry.
  const calcTiers = (process.env.BUILD_STATIC_CALC_TIERS || 'tier3').split(',').map((t) => t.trim()).filter(Boolean)
  const flagshipCalcs = calculatorRegistry.filter(
    (c: any) => !/\d$/.test(c.slug) && calcTiers.includes(c.tier)
  )
  for (const calc of flagshipCalcs) {
    params.push({ slug: [calc.hubSlug, calc.slug] })
  }

  return params
}

const VALID_LOCALES = routing.locales as readonly string[]
const STATIC_PAGES: Record<string, React.ComponentType<any>> = {
  about: AboutPage,
  contact: ContactPage,
  privacy: PrivacyPage,
  terms: TermsPage,
  'calculator-builder': CalculatorBuilderPage,
  'suggest-calculator': SuggestCalculatorPage,
  'not-found': NotFoundPage,
  author: AuthorListingPage,
}
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.calculat.online'

function stripLocale(slug: string[]): string[] {
  if (slug.length > 0 && VALID_LOCALES.includes(slug[0])) {
    return slug.slice(1)
  }
  return slug
}

// Route params can arrive percent-encoded in the page component (while
// generateMetadata receives them already decoded) — e.g. /ar/%D8%AD... .
// Decode defensively so slug-map lookups always compare plain text; this is
// an identity transform for segments without '%' (already-decoded or ASCII).
function decodeSeg(s: string): string {
  if (!s.includes('%')) return s
  try { return decodeURIComponent(s) } catch { return s }
}

function decodeSlug(slug: string[]): string[] {
  return slug.map(decodeSeg)
}

function getLocaleFromSlug(slug: string[]): string {
  if (slug.length > 0 && VALID_LOCALES.includes(slug[0])) {
    return slug[0]
  }
  return 'en'
}

// Retired locale prefixes (English-only since Oct 2026, plus the legacy /en/
// prefix which never served distinct content). Any URL starting with one is
// permanently redirected to its English canonical so no link equity is lost:
//   /fr → /
//   /fr/about → /about
//   /fr/calculateurs-de-sante/calculatrice-imc → /health-calculators/bmi-calculator
//   /en/mortgage → /mortgage (then the legacyPages redirect takes over)
// Unknown remainders fall through to the English path and 404 there naturally.
const RETIRED_LOCALES = ['en', 'es', 'fr', 'de', 'pt', 'ru', 'ar', 'hi', 'ja', 'zh-CN'] as const

type SearchParams = { [key: string]: string | string[] | undefined }

function redirectRetiredLocale(rawSlug: string[], sp: SearchParams): never {
  const rest = rawSlug.slice(1)
  if (rest.length === 0) permanentRedirect(withQuery('/', sp))
  const hubRes = resolveHubSlug('en', rest[0])
  if (!hubRes) permanentRedirect(withQuery('/' + rest.join('/'), sp))
  if (rest.length === 1) permanentRedirect(withQuery(`/${hubRes.canonical}`, sp))
  if (rest.length === 2) {
    const cross = crossResolveCalc(hubRes.canonical, rest[1])
    permanentRedirect(withQuery(`/${hubRes.canonical}/${cross ?? rest[1]}`, sp))
  }
  permanentRedirect(withQuery('/' + rest.join('/'), sp))
}

function isRetiredLocalePrefix(slug: string[]): boolean {
  return slug.length > 0 && (RETIRED_LOCALES as readonly string[]).includes(slug[0])
}

// Preserve the query string (e.g. ?page=2) across the canonical→translated redirect.
// The path is percent-encoded first: Location headers must be ASCII, and localized
// slugs (e.g. /ja/健康計算ツール) are raw non-ASCII, which makes Node/Vercel reject
// the header with a 500. Query strings from URLSearchParams are already encoded.
function withQuery(path: string, sp: { [key: string]: string | string[] | undefined }): string {
  const encPath = encodeURI(path)
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(sp || {})) {
    if (v === undefined) continue
    if (Array.isArray(v)) v.forEach(x => q.append(k, x))
    else q.append(k, v)
  }
  const s = q.toString()
  return s ? `${encPath}?${s}` : encPath
}

const LOCALE_TITLES: Record<string, string> = {
  en: 'Calculat - Precision Calculators & Unit Converters',
}

const LOCALE_DESCRIPTIONS: Record<string, string> = {
  en: 'Free online calculators for finance, health, math, science, conversion, and everyday life. Fast, accurate, and beautifully designed.',
}

export async function generateMetadata({ params, searchParams }: { params: Promise<{ slug: string[] }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const { slug: rawSlugEnc } = await params
  const rawSlug = decodeSlug(rawSlugEnc)
  if (isRetiredLocalePrefix(rawSlug)) {
    redirectRetiredLocale(rawSlug, await searchParams)
  }
  const locale = getLocaleFromSlug(rawSlug)
  setRequestLocale(locale)
  const slug = stripLocale(rawSlug)

  if (slug.length === 0) {
    const title = LOCALE_TITLES[locale] || LOCALE_TITLES.en
    const description = LOCALE_DESCRIPTIONS[locale] || LOCALE_DESCRIPTIONS.en
    const url = locale === 'en' ? siteUrl : `${siteUrl}/${locale}`
    return {
      title,
      description,
      alternates: { canonical: url, languages: buildHreflang('/') },
      openGraph: { title, description, url, siteName: 'Calculat', type: 'website', locale: locale === 'en' ? 'en_US' : `${locale}_${locale.toUpperCase()}`, images: [{ url: `${siteUrl}/og-image.png`, width: 1200, height: 630 }] },
      twitter: { card: 'summary_large_image', title, description },
    }
  }

  if (slug.length === 1) {
    if (slug[0] in STATIC_PAGES) {
      switch (slug[0]) {
        case 'about': return genAboutMeta()
        case 'contact': return genContactMeta()
        case 'privacy': return genPrivacyMeta()
        case 'terms': return genTermsMeta()
        case 'calculator-builder': {
          const meta = await genCalcBuilderMeta()
          return {
            ...meta,
            robots: locale === 'en' ? { index: true, follow: true } : { index: false, follow: true },
          }
        }
        case 'suggest-calculator': {
          return {
            title: 'Suggest a Calculator | Calculat',
            description: 'Have an idea for a new calculator? Submit your suggestion to Calculat and help us build the tools you need.',
            alternates: { canonical: `${siteUrl}/suggest-calculator` },
            robots: locale === 'en' ? { index: true, follow: true } : { index: false, follow: true },
          }
        }
        case 'not-found': return genNotFoundMeta()
        case 'author': {
          const meta = await genAuthorListingMeta()
          return {
            ...meta,
            robots: locale === 'en' ? { index: true, follow: true } : { index: false, follow: true },
          }
        }
      }
    }
    const hubRes = resolveHubSlug(locale, slug[0])
    if (!hubRes) notFound()
    const sp = await searchParams
    const metadataPage = Math.max(1, parseInt(sp.page as string) || 1)
    return generateHubLandingMetadata(hubRes.canonical, metadataPage)
  }
  if (slug[0] === 'author') {
    const meta = await genAuthorMeta({ params: Promise.resolve({ id: slug[1] }) })
    return {
      ...meta,
      robots: locale === 'en' ? { index: true, follow: true } : { index: false, follow: true },
    }
  }
  if (slug.length !== 2) notFound()
  const metaHubRes = resolveHubSlug(locale, slug[0])
  if (!metaHubRes) notFound()
  const metaCalcRes = resolveCalcSlug(locale, metaHubRes.canonical, slug[1])
  return generateCalculatorMetadata(metaHubRes.canonical, metaCalcRes.canonical)
}

export default async function CatchAllPage({ params, searchParams }: { params: Promise<{ slug: string[] }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const { slug: rawSlugEnc } = await params
  const rawSlug = decodeSlug(rawSlugEnc)
  if (isRetiredLocalePrefix(rawSlug)) {
    redirectRetiredLocale(rawSlug, await searchParams)
  }
  const locale = getLocaleFromSlug(rawSlug)
  setRequestLocale(locale)
  const slug = stripLocale(rawSlug)

  if (slug.length === 0) {
    return <HomePage />
  }

  if (slug.length === 1) {
    if (slug[0] in STATIC_PAGES) {
      const Page = STATIC_PAGES[slug[0]]
      return <Page />
    }
    const hubRes = resolveHubSlug(locale, slug[0])
    if (!hubRes) notFound()
    if (slug[0] !== hubRes.localized) {
      // Redirects canonical segments on non-EN locales to their translated form
      // and cross-locale segments (e.g. an FR slug under /de) to this locale's
      // translation. For `en`, localized === canonical, so this only fires for
      // cross-locale input, targeting the prefixless root path.
      const sp = await searchParams
      permanentRedirect(withQuery(hubPath(locale, hubRes.canonical), sp))
    }
    return <HubLandingContent hubSlug={hubRes.canonical} searchParams={searchParams} />
  }

  if (slug[0] === 'author') {
    return <AuthorPage params={Promise.resolve({ id: slug[1] })} />
  }
  if (slug.length !== 2) notFound()
  const hubRes = resolveHubSlug(locale, slug[0])
  if (!hubRes) notFound()
  const calcRes = resolveCalcSlug(locale, hubRes.canonical, slug[1])
  if (/\d$/.test(calcRes.canonical)) notFound()
  let canonicalCalc = calcRes.canonical
  let calc = await findCalculator(canonicalCalc, hubRes.canonical)
  if (!calc) {
    // The calculator segment may be another locale's translation (the language
    // switcher keeps the old locale's slugs under the new prefix) — resolve it
    // to canonical so we redirect instead of 404.
    const cross = crossResolveCalc(hubRes.canonical, slug[1])
    if (cross && cross !== canonicalCalc && !/\d$/.test(cross)) {
      const crossCalc = await findCalculator(cross, hubRes.canonical)
      if (crossCalc) {
        calc = crossCalc
        canonicalCalc = cross
      }
    }
  }
  if (!calc) notFound()
  if (slug[0] !== hubRes.localized || slug[1] !== localizedCalc(locale, hubRes.canonical, canonicalCalc)) {
    // Redirects canonical segments on non-EN locales to their translated form
    // and cross-locale segments (e.g. an FR slug under /de) to this locale's
    // translation. For `en`, localized === canonical, so this only fires for
    // cross-locale input, targeting the prefixless root path.
    const sp = await searchParams
    permanentRedirect(withQuery(calcPath(locale, hubRes.canonical, canonicalCalc), sp))
  }
  return <CalculatorPageContent hubSlug={hubRes.canonical} slug={canonicalCalc} />
}
