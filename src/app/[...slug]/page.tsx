import { notFound, permanentRedirect } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { findCalculator } from '@/lib/hub-data'
import { resolveHubSlug, resolveCalcSlug, localizedHub, localizedCalc, hubPath, calcPath, crossResolveCalc } from '@/lib/slug-paths'
import { AUTHORS } from '@/lib/authors'
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
  const { routing } = await import('@/i18n/routing')

  const hubs = getAllHubSlugs()
  const locales = routing.locales.filter((l: string) => l !== 'en')
  const params: { slug: string[] }[] = []

  for (const locale of locales) {
    params.push({ slug: [locale] })
  }

  const staticPages = ['about', 'contact', 'privacy', 'terms', 'calculator-builder', 'suggest-calculator', 'author']
  for (const page of staticPages) {
    for (const locale of locales) {
      params.push({ slug: [locale, page] })
    }
  }

  for (const authorId of Object.keys(AUTHORS)) {
    for (const locale of locales) {
      params.push({ slug: [locale, 'author', authorId] })
    }
  }

  for (const hub of hubs) {
    for (const locale of locales) {
      // Pre-render the translated path (the canonical English form 301s to it)
      params.push({ slug: [locale, localizedHub(locale, hub)] })
    }
  }

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
  es: 'Calculat - Calculadoras de Precisión y Conversores de Unidades',
  fr: 'Calculat - Calculatrices et Convertisseurs de Précision',
  de: 'Calculat - Präzisionsrechner und Einheitenumrechner',
  pt: 'Calculat - Calculadoras de Precisão e Conversores de Unidades',
  ru: 'Calculat - Точные калькуляторы и конвертеры единиц',
  ar: 'Calculat - حاسبات دقيقة ومحولات وحدات',
  hi: 'Calculat - सटीक कैलकुलेटर और यूनिट कन्वर्टर',
  ja: 'Calculat - 精密計算機と単位変換',
  'zh-CN': 'Calculat - 精确计算器和单位转换器',
}

const LOCALE_DESCRIPTIONS: Record<string, string> = {
  en: 'Free online calculators for finance, health, math, science, conversion, and everyday life. Fast, accurate, and beautifully designed.',
  es: 'Calculadoras gratuitas en línea para finanzas, salud, matemáticas, ciencias, conversiones y vida cotidiana. Rápidas, precisas y hermosamente diseñadas.',
  fr: 'Calculatrices gratuites pour finances, santé, maths, sciences, conversion et quotidien. Rapides, précises et faciles à utiliser.',
  de: 'Kostenlose Online-Rechner für Finanzen, Gesundheit, Mathematik, Wissenschaft, Umrechnung und Alltag. Schnell, genau und schön gestaltet.',
  pt: 'Calculadoras online gratuitas para finanças, saúde, matemática, ciência, conversão e vida cotidiana. Rápidas, precisas e lindamente projetadas.',
  ru: 'Бесплатные онлайн-калькуляторы для финансов, здоровья, математики, науки, конвертации и повседневной жизни. Быстро, точно и красиво.',
  ar: 'آلات حاسبة مجانية عبر الإنترنت للتمويل والصحة والرياضيات والعلوم والتحويل والحياة اليومية. سريعة ودقيقة ومصممة بشكل جميل.',
  hi: 'वित्त, स्वास्थ्य, गणित, विज्ञान, रूपांतरण और दैनिक जीवन के लिए मुफ्त ऑनलाइन कैलकुलेटर। तेज़, सटीक और खूबसूरती से डिज़ाइन किए गए।',
  ja: '金融、健康、数学、科学、変換、日常生活のための無料オンライン計算機。高速、正確、美しいデザイン。',
  'zh-CN': '免费在线计算器，涵盖金融、健康、数学、科学、转换和日常生活。快速、准确、设计精美。',
}

export async function generateMetadata({ params, searchParams }: { params: Promise<{ slug: string[] }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const { slug: rawSlugEnc } = await params
  const rawSlug = decodeSlug(rawSlugEnc)
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
