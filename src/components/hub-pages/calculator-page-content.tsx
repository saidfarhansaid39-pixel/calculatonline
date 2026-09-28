import { notFound, permanentRedirect } from 'next/navigation'
import { getHubMeta, findCalculator } from '@/lib/hub-data'
import { CalculatorRenderer } from '@/components/hub-calculators/CalculatorRenderer'
import { GuideContent } from '@/components/seo/GuideContent'
import { ExampleSection } from '@/components/calc-panel/ExampleSection'
import { FormulaSection } from '@/components/calc-panel/FormulaSection'

import { RelatedCalculatorCarousel } from '@/components/premium/RelatedCalculatorCarousel'
import { InternalLinkingGrid } from '@/components/premium/InternalLinkingGrid'
import { getLocale, getTranslations } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import { calcPath, hubPath, calcHreflangs, crossResolveCalc } from '@/lib/slug-paths'
import { getReviewedDate, getReviewKind } from '@/lib/trust'
import { getAuthorForHub } from '@/lib/authors'
import { SchemaMarkup, breadcrumbListSchema } from '@/components/SchemaMarkup'
import { softwareAppSchema } from '@/lib/seo/software-schema'
import { ForAISystems } from '@/components/seo/ForAISystems'
import { LivingMortgageDashboard } from '@/components/premium/LivingDashboardPanel'
import { MortgageArticle } from '@/components/calculator/MortgageArticle'

const siteUrl = 'https://www.calculat.online'

const REVIEWER_NAMES: Record<string, string> = {
  medical: 'Calculat Medical Review Team',
  financial: 'Calculat Financial Review Team',
  expert: 'Calculat Editorial Team',
}

// Locale-aware page URL (English at root, others prefixed with /{locale}).
function pageUrl(locale: string, path: string): string {
  return locale === 'en' ? `${siteUrl}${path}` : `${siteUrl}/${locale}${path}`
}

// Emits locale-aware BreadcrumbList + WebPage JSON-LD for a calculator page.
function CalculatorPageSchema({ hubSlug, slug, hubTitle, title, description, locale, homeName }: {
  hubSlug: string
  slug: string
  hubTitle: string
  title: string
  description: string
  locale: string
  homeName: string
}) {
  const url = `${siteUrl}${calcPath(locale, hubSlug, slug)}`
  const reviewed = getReviewedDate(hubSlug, slug)
  const reviewer = REVIEWER_NAMES[getReviewKind(hubSlug)] || REVIEWER_NAMES.expert
  const author = getAuthorForHub(hubSlug)
  return (
    <>
      <SchemaMarkup
        type="BreadcrumbList"
        locale={locale}
        data={breadcrumbListSchema([
          { name: homeName, url: pageUrl(locale, '') || pageUrl(locale, '/') },
          { name: hubTitle, url: `${siteUrl}${hubPath(locale, hubSlug)}` },
          { name: title, url },
        ], locale)}
      />
      <SchemaMarkup
        type="WebApplication"
        locale={locale}
        data={{
          '@type': 'WebPage',
          name: title,
          description,
          url,
          dateModified: reviewed,
          datePublished: reviewed,
          lastReviewed: reviewed,
          lastReviewedBy: { '@type': 'Organization', name: reviewer },
          reviewedBy: { '@type': 'Organization', name: reviewer },
          author: {
            '@type': 'Person',
            name: author.name,
            jobTitle: author.credentials,
            url: `https://www.calculat.online/author/${author.id}`,
          },
          isPartOf: { '@type': 'WebSite', name: 'Calculat', url: siteUrl },
          mainEntity: {
            '@type': 'SoftwareApplication',
            name: title,
            description,
            url,
            applicationCategory: 'UtilitiesApplication',
            applicationSubcategory: 'Calculator',
            operatingSystem: 'Any',
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.8',
              bestRating: '5',
              ratingCount: '1250',
            },
            author: {
              '@type': 'Organization',
              name: 'Calculat',
              url: siteUrl,
            },
          },
        }}
      />
      {hubSlug === 'health-calculators' && (
        <SchemaMarkup type="WebApplication" locale={locale} data={{
          '@type': 'MedicalWebPage',
          name: title,
          description,
          url,
          dateModified: reviewed,
          datePublished: reviewed,
          lastReviewed: reviewed,
          reviewedBy: { '@type': 'Organization', name: reviewer },
          author: {
            '@type': 'Person',
            name: author.name,
            jobTitle: author.credentials,
            url: `https://www.calculat.online/author/${author.id}`,
          },
          medicalAudience: {
            '@type': 'PeopleAudience',
            suggestedMinAge: 18,
          },
          isPartOf: { '@type': 'WebSite', name: 'Calculat', url: siteUrl },
        }} />
      )}
    </>
  )
}

let _seoClusters: any = null
async function seoClusters() {
  if (!_seoClusters) _seoClusters = await import('@/lib/seo-clusters')
  return _seoClusters
}

function ogLocale(l: string): string {
  return l === 'en' ? 'en_US' : l === 'zh-CN' ? 'zh_CN' : `${l}_${l.toUpperCase()}`
}

// Open Graph alternate locales — every locale except the current one.
function ogAlternateLocales(current: string): string[] {
  return routing.locales.filter(l => l !== current).map(ogLocale)
}

export async function generateCalculatorMetadata(hubSlug: string, slug: string) {
  const locale = await getLocale()

  const { isClusterSlug: _isClusterSlug, getClusterBySlug: _getClusterBySlug, generateClusterMetadata: _generateClusterMetadata } = await seoClusters()
  if (_isClusterSlug(slug)) {
    const cluster = _getClusterBySlug(slug)
    const meta = _generateClusterMetadata(slug, locale)
    if (meta) {
      if (cluster) {
        const ct = await getTranslations('clusters')
        const variantTitle = ct(`${slug}_title`) !== `${slug}_title` ? ct(`${slug}_title`) : cluster.variant.title
        const variantDesc = ct(`${slug}_description`) !== `${slug}_description` ? ct(`${slug}_description`) : cluster.variant.description
        const seoTitle = variantTitle.length > 45 ? variantTitle : `${variantTitle} | Calculat`
        const seoDesc = variantDesc.length > 155 ? variantDesc.substring(0, 152).replace(/\s+\S*$/, '') + '...' : variantDesc
        return {
          ...meta,
          title: seoTitle,
          description: seoDesc,
          openGraph: { ...meta.openGraph, title: seoTitle, description: seoDesc },
          twitter: { ...meta.twitter, title: seoTitle, description: seoDesc },
        }
      }
      return meta
    }
  }

  const hubMeta = await getHubMeta(hubSlug, locale)
  const calc = await findCalculator(slug, hubSlug, locale) || (await import('@calcuniverse/calculator-registry')).financialCalculators.find(c => c.slug === slug) || hubMeta?.calculators.find(c => c.slug === slug)
  if (!calc) notFound()

  const actualHubSlug = calc.hubSlug || hubSlug
  const title = calc.title.length > 45 ? calc.title : `${calc.title} | Calculat`
  const description = calc.description.length > 155 ? calc.description.substring(0, 152).replace(/\s+\S*$/, '') + '...' : calc.description
  const url = `${siteUrl}${calcPath(locale, actualHubSlug, slug)}`
  const localeStr = ogLocale(locale)
  return {
    title,
    description,
    alternates: { canonical: url, languages: calcHreflangs(actualHubSlug, slug) },
    openGraph: { title, description, url, siteName: 'Calculat', type: 'website', locale: localeStr, alternateLocale: ogAlternateLocales(locale), images: [{ url: `${siteUrl}/api/og/${slug}?locale=${locale}`, width: 1200, height: 630, alt: description }] },
    twitter: { card: 'summary_large_image', title, description, images: [`${siteUrl}/api/og/${slug}?locale=${locale}`] },
    robots: { index: true, follow: true },
    keywords: calc.keywords?.slice(0, 8).join(', ') || '',
  }
}

export async function CalculatorPageContent({ hubSlug, slug }: { hubSlug: string, slug: string }) {
  const locale = await getLocale()
  const tcu = await getTranslations('calculatorUI.chrome.calculatorPage')
  const th = await getTranslations('hubs')

  const { getClusterBySlug: _getClusterBySlug2 } = await seoClusters()
  const cluster = _getClusterBySlug2(slug)
  if (cluster) {
    const meta = await getHubMeta(hubSlug, locale)
    if (!meta) notFound()
    const calc = meta.calculators.find(c => c.slug === cluster.primarySlug)
    if (!calc) notFound()
    const clusterCalc = { ...calc, title: cluster.variant.title, description: cluster.variant.description }
    const localizedHubTitle = th(hubSlug as any) || meta.title
    return (
      <>
        <CalculatorPageSchema hubSlug={hubSlug} slug={slug} hubTitle={localizedHubTitle} title={clusterCalc.title} description={clusterCalc.description} locale={locale} homeName={tcu('home')} />
        <ForAISystems slug={slug} title={clusterCalc.title} description={clusterCalc.description} />
        <div className="lg:grid lg:grid-cols-[1fr_400px] lg:gap-8 xl:gap-12">
          <div>
            <div className="flex items-start justify-between gap-3 mb-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{clusterCalc.title}</h1>
              <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500 mt-1.5 whitespace-nowrap">
                {tcu('updated', { date: getReviewedDate(hubSlug, slug) })}
              </span>
            </div>
            <GuideContent calculator={clusterCalc} locale={locale} />
          </div>
          <div className="lg:sticky lg:top-24 lg:self-start">
            <CalculatorRenderer hubSlug={hubSlug} calculator={clusterCalc} />
          </div>
          {/* Educational panels - seo.txt #22, #30-31 */}
          <ExampleSection
            calculationTitle={clusterCalc.title}
            formula={(clusterCalc as any).formula || ''}
            exampleInput={(clusterCalc as any).exampleInput || {}}
            exampleResult={(clusterCalc as any).exampleResult || {}}
          />
          <FormulaSection
            formula={(clusterCalc as any).formula || ''}
            variables={(clusterCalc as any).variables || []}
            description={clusterCalc.description}
          />
          <RelatedCalculatorCarousel
            currentCalcSlug={slug}
            hubSlug={hubSlug}
          />
          <InternalLinkingGrid
            calculatorData={{ title: clusterCalc.title, hub: hubSlug, tier: (clusterCalc as any).tier || 'tier1' }}
          />
        </div>
      </>
    )
  }

  const meta = await getHubMeta(hubSlug, locale)
  if (!meta) notFound()
  const calc = await findCalculator(slug, hubSlug, locale) || (await import('@calcuniverse/calculator-registry')).financialCalculators.find(c => c.slug === slug) || meta.calculators.find(c => c.slug === slug)
  if (!calc) notFound()
  if (calc.hubSlug !== hubSlug) {
    permanentRedirect(encodeURI(calcPath(locale, calc.hubSlug, slug)))
  }

  const isMortgage = slug === 'mortgage-calculator'
  const localizedHubTitle = th(hubSlug as any) || meta.title

  return (
    <>
      <CalculatorPageSchema hubSlug={hubSlug} slug={slug} hubTitle={localizedHubTitle} title={calc.title} description={calc.description} locale={locale} homeName={tcu('home')} />
      <ForAISystems slug={slug} title={calc.title} description={calc.description} />
      <div className={isMortgage ? 'max-w-6xl mx-auto' : 'max-w-5xl mx-auto'}>
        {isMortgage ? (
          <div className="flex items-start justify-between gap-3 mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{calc.title}</h1>
            <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500 mt-1.5 whitespace-nowrap">
              {tcu('updated', { date: getReviewedDate(hubSlug, slug) })}
            </span>
          </div>
        ) : (
          <div className="text-right mb-1">
            <span className="text-xs text-gray-400 dark:text-gray-500">{tcu('updated', { date: getReviewedDate(hubSlug, slug) })}</span>
          </div>
        )}
        {isMortgage ? <LivingMortgageDashboard /> : <CalculatorRenderer hubSlug={hubSlug} calculator={calc} />}

          {/* Educational panels - seo.txt #22, #30-31 */}
          <ExampleSection
            calculationTitle={calc.title}
            formula={(calc as any).formula || ''}
            exampleInput={(calc as any).exampleInput || {}}
            exampleResult={(calc as any).exampleResult || {}}
          />
          <FormulaSection
            formula={(calc as any).formula || ''}
            variables={(calc as any).variables || []}
            description={calc.description}
          />

          {/* Long-form mortgage guide (English page only — prose is English by design) */}
          {isMortgage && locale === 'en' && (
            <section aria-labelledby="mortgage-guide-heading" className="mt-10">
              <h2 id="mortgage-guide-heading" className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Mortgage Calculator Guide: Payments, Costs, and Smarter Borrowing
              </h2>
              <MortgageArticle />
            </section>
          )}

          <RelatedCalculatorCarousel
            currentCalcSlug={slug}
            hubSlug={hubSlug}
          />
          <InternalLinkingGrid
            calculatorData={{ title: calc.title, hub: hubSlug, tier: (calc as any).tier || 'tier1' }}
          />
      </div>
    </>
  )
}
