import { calculatorRegistry } from '@calcuniverse/calculator-registry'
import { getAllClusterSlugs, getClusterBySlug } from '@/lib/seo-clusters'
import { routing, isoLangs } from '@/i18n/routing'
import { getReviewedDate } from '@/lib/trust'
import { AUTHORS } from '@/lib/authors'
import { hubSuffix, calcSuffix } from '@/lib/slug-paths'

export const siteUrl = 'https://www.calculat.online'

const BUILD_DATE = new Date()

const locales = routing.locales
const defaultLocale = routing.defaultLocale

export type SitemapChangeFrequency =
  | 'always'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'never'

export interface SitemapEntry {
  url: string
  lastModified?: Date
  changeFrequency?: SitemapChangeFrequency
  priority?: number
  alternates?: { languages?: Record<string, string> }
}

const hubs = [
  'financial-calculators', 'health-calculators', 'math-calculators',
  'conversion-calculators', 'date-time-calculators', 'construction-calculators',
  'statistics-calculators', 'education-calculators', 'physics-calculators',
  'chemistry-calculators', 'engineering-calculators', 'everyday-calculators',
  'food-calculators', 'biology-calculators', 'ecology-calculators', 'sports-calculators',
]

const blogArticles = [
  'mortgage-tips-2026', 'bmi-limitations', 'retirement-savings-guide',
  'currency-exchange-explained', 'improving-credit-score',
  'investment-calculator-guide', 'loan-comparison-guide',
  'calorie-deficit-explained', 'conversion-cooking-guide', 'gpa-strategies',
]

const staticPages = [
  '', '/privacy', '/terms', '/contact', '/about', '/calculator-builder', '/suggest-calculator',
  '/author', ...Object.keys(AUTHORS).map(id => `/author/${id}`),
]

// Pages that only exist in English (no localized variant resolves to a real page).
const enOnlyStaticPages = [
  '/editorial-policy', '/press',
  '/blog', ...blogArticles.map(a => `/blog/${a}`),
  '/a-z-index', '/accessibility',
]

function localeUrl(locale: string, path: string): string {
  return locale === defaultLocale ? `${siteUrl}${path}` : `${siteUrl}/${locale}${path}`
}

// `pathFor` (optional) maps the canonical path to the translated path suffix
// for a given locale — used for hub/calculator URLs, which are localized per
// locale while English stays at the canonical form.
function alternatesFor(path: string, localized = true, pathFor?: (l: string) => string): Record<string, string> {
  const clean = path === '/' ? '' : path
  const langs: Record<string, string> = { 'x-default': `${siteUrl}${clean}` }
  if (localized) {
    for (const locale of locales) {
      const p = pathFor ? pathFor(locale) : clean
      langs[isoLangs[locale]] = localeUrl(locale, p)
    }
  } else {
    langs[isoLangs[defaultLocale]] = localeUrl(defaultLocale, clean)
  }
  return langs
}

interface EntryOpts {
  changeFrequency: SitemapChangeFrequency
  priority: number
  lastModified?: Date
}

// English-only pages that are still listed per-locale in the sitemap array
// (author pages, calculator-builder, suggest-calculator) but must only be
// emitted for the default locale, since the localized variants serve English
// content. Kept here so the same set can drive sitemap filtering.
const englishOnlyStaticPages = new Set([
  '/suggest-calculator',
  '/calculator-builder',
  '/author',
  ...Object.keys(AUTHORS).map(id => `/author/${id}`),
])

function entriesForPath(locale: string, path: string, opts: EntryOpts, localized = true, pathFor?: (l: string) => string): SitemapEntry {
  const ownPath = pathFor ? pathFor(locale) : path
  return {
    url: localeUrl(locale, ownPath),
    lastModified: opts.lastModified || BUILD_DATE,
    changeFrequency: opts.changeFrequency,
    priority: opts.priority,
    alternates: { languages: alternatesFor(pathFor ? pathFor(defaultLocale) : path, localized, pathFor) },
  }
}

/** Max URLs per sitemap shard file. Cloudflare Workers assets are capped at
 *  25 MiB per file, and one full locale shard (~3.7k entries with 11 hreflang
 *  links each, many percent-encoded localized slugs) measures ~26 MiB — so
 *  every locale is split into parts of ENTRIES_PER_SHARD (~14 MiB per file,
 *  with headroom for registry growth). */
const ENTRIES_PER_SHARD = 2000

function buildStaticEntries(): SitemapEntry[] {
  return [
    ...staticPages.map(p => entriesForPath(defaultLocale, p, {
      changeFrequency: 'monthly',
      priority: p === '' ? 1.0 : 0.5,
    }, true)),
    ...enOnlyStaticPages.map(p => entriesForPath(defaultLocale, p, {
      changeFrequency: 'monthly',
      priority: 0.5,
    }, false)),
  ]
}

function buildLocaleEntries(locale: string): SitemapEntry[] {
  const entries: SitemapEntry[] = []

  for (const p of staticPages) {
    if (locale !== defaultLocale && englishOnlyStaticPages.has(p)) continue
    entries.push(entriesForPath(locale, p, {
      changeFrequency: 'monthly',
      priority: p === '' ? 1.0 : 0.5,
    }))
  }

  for (const hub of hubs) {
    entries.push(entriesForPath(locale, `/${hub}`, {
      changeFrequency: 'weekly',
      priority: 0.8,
    }, true, (l) => hubSuffix(l, hub)))
  }

  const filteredCalcs = calculatorRegistry.filter(c => !/\d$/.test(c.slug))

  for (const calc of filteredCalcs) {
    const path = `/${calc.hubSlug}/${calc.slug}`
    const priority = calc.tier === 'tier1' ? 0.9 : calc.tier === 'tier2' ? 0.75 : 0.64
    const reviewedDate = getReviewedDate(calc.hubSlug, calc.slug)
    entries.push(entriesForPath(locale, path, {
      changeFrequency: 'monthly',
      priority,
      lastModified: new Date(reviewedDate),
    }, true, (l) => calcSuffix(l, calc.hubSlug, calc.slug)))
  }

  const clusterPaths: string[] = []
  if (process.env.CLUSTER_PASS === 'true' || process.env.NEXT_PUBLIC_CLUSTER_PASS === 'true') {
    try {
      for (const slug of getAllClusterSlugs()) {
        const cluster = getClusterBySlug(slug)
        if (!cluster) continue
        clusterPaths.push(`/${cluster.hubSlug}/${slug}`)
      }
    } catch {
      // cluster registry not available — skip cluster sitemap entries
    }
  }

  for (const path of clusterPaths) {
    const match = path.match(/^\/([^/]+)\/([^/]+)$/)
    const lastModified = match ? new Date(getReviewedDate(match[1], match[2])) : BUILD_DATE
    const [clusterHub, clusterSlug] = match ? [match[1], match[2]] : ['', '']
    entries.push(entriesForPath(locale, path, {
      changeFrequency: 'weekly',
      priority: 0.5,
      lastModified,
    }, true, match ? (l) => calcSuffix(l, clusterHub, clusterSlug) : undefined))
  }

  return entries
}

function localeShardIds(locale: string): string[] {
  const count = buildLocaleEntries(locale).length
  const parts = Math.max(1, Math.ceil(count / ENTRIES_PER_SHARD))
  return Array.from({ length: parts }, (_, i) => `${locale}-${i + 1}`)
}

/** ids emitted at /sitemap/{id}.xml and referenced from /sitemap.xml
 *  (each locale is split into numbered parts — see ENTRIES_PER_SHARD) */
export const sitemapShardIds: readonly string[] = [
  ...locales.flatMap(locale => localeShardIds(locale)),
  'static',
]

export async function buildSitemapEntries(id: string): Promise<SitemapEntry[]> {
  if (id === 'static') return buildStaticEntries()
  const match = id.match(/^(.+)-(\d+)$/)
  if (!match) return []
  const [, locale, partStr] = match
  if (!(locales as readonly string[]).includes(locale)) return []
  const part = Number(partStr)
  const all = buildLocaleEntries(locale)
  return all.slice((part - 1) * ENTRIES_PER_SHARD, part * ENTRIES_PER_SHARD)
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function sitemapIndexXml(): string {
  const sitemaps = sitemapShardIds
    .map(id => {
      return `  <sitemap>\n    <loc>${escapeXml(`${siteUrl}/sitemap/${id}.xml`)}</loc>\n    <lastmod>${BUILD_DATE.toISOString()}</lastmod>\n  </sitemap>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemaps}\n</sitemapindex>`
}

export function sitemapUrlsetXml(entries: SitemapEntry[]): string {
  const urls = entries
    .map(entry => {
      const lines = [`      <loc>${escapeXml(entry.url)}</loc>`]
      if (entry.lastModified) {
        lines.push(`      <lastmod>${entry.lastModified.toISOString()}</lastmod>`)
      }
      if (entry.changeFrequency) {
        lines.push(`      <changefreq>${entry.changeFrequency}</changefreq>`)
      }
      if (entry.priority !== undefined) {
        lines.push(`      <priority>${entry.priority}</priority>`)
      }
      if (entry.alternates?.languages) {
        for (const [lang, href] of Object.entries(entry.alternates.languages)) {
          lines.push(`      <xhtml:link rel="alternate" hreflang="${escapeXml(lang)}" href="${escapeXml(href)}" />`)
        }
      }
      return `    <url>\n${lines.join('\n')}\n    </url>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>`
}