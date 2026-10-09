import { TrendingUp, Star, Calculator, ArrowRight, ChevronRight, Sparkles, BarChart3, Heart, RefreshCw, Clock, DollarSign, Brain, UtensilsCrossed, Microscope, Leaf, Trophy } from 'lucide-react';
import { Link } from '@/lib/navigation';
import { MediaMentions } from '@/components/MediaMentions';
import { ScientificCalculatorForm } from '@/components/calculators/ScientificCalculatorForm';
import { SearchBarWrapper } from '@/components/SearchBarWrapper';
import { HubNav } from '@/components/hub/HubNav';
import { HubIcon } from '@/components/hub/HubIcon';
import { SchemaMarkup, organizationSchema, siteDescriptions, faqSchema } from '@/components/SchemaMarkup';
import { softwareAppSchema } from '@/lib/seo/software-schema';

export const dynamic = 'force-static'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.calculat.online'

export async function generateMetadata() {
  const { getLocale, getTranslations } = await import('next-intl/server')
  const locale = await getLocale()
  const t = await getTranslations('homepage')
  const title = locale === 'en' ? 'Calculator Online — Free | 4,270+ Tools | Calculat' : `Calculat - ${t('heroBadge')}`
  const description = locale === 'en'
    ? 'Free calculator online for finance, health, math, unit conversion & more. 4,270+ instant calculators with step-by-step formulas. No sign-up needed.'
    : t('heroSubtitle')
  const routing = (await import('@/i18n/routing')).routing
  const languages: Record<string, string> = { 'x-default': siteUrl }
  for (const l of routing.locales) {
    languages[l] = l === 'en' ? siteUrl : `${siteUrl}/${l}`
  }
  return {
    title,
    description,
    keywords: locale === 'en' ? [
      'calculator online', 'online calculator', 'free calculator', 'calculator online free',
      'financial calculator', 'health calculator', 'math calculator', 'unit converter',
      'mortgage calculator', 'BMI calculator', 'loan calculator', 'tip calculator',
      'scientific calculator', 'calorie calculator', 'salary calculator',
    ] : undefined,
    alternates: { canonical: siteUrl, languages },
    openGraph: {
      title: locale === 'en' ? 'Calculator Online — Free | 4,270+ Tools | Calculat' : title,
      description,
      url: siteUrl,
      siteName: 'Calculat',
      type: 'website',
      locale: locale === 'en' ? 'en_US' : locale === 'zh-CN' ? 'zh_CN' : `${locale}_${locale.toUpperCase()}`,
      images: [{ url: `${siteUrl}/og-image.png`, width: 1200, height: 630, alt: 'Calculat — Free Online Calculator Platform' }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [`${siteUrl}/og-image.png`] },
  }
}

export default async function Home() {
  const { getLocale, getTranslations } = await import('next-intl/server')
  const locale = await getLocale()
  const t = await getTranslations('homepage')
  const th = await getTranslations('hubs')
  const { calculatorRegistry } = await import('@calcuniverse/calculator-registry')
  // SINGLE SOURCE OF TRUTH: use calculatorRegistry for all counts
  // Filter out auto-generated calculators (those with digits in slug) for indexable count
  function getCalculatorCount(hubSlug: string): number {
    return calculatorRegistry.filter(
      c => c.hubSlug === hubSlug && !/\d$/.test(c.slug)
    ).length
  }

  const hubDefs = [
    { hubSlug: 'financial-calculators', href: '/financial-calculators', icon: DollarSign },
    { hubSlug: 'health-calculators', href: '/health-calculators', icon: Heart },
    { hubSlug: 'math-calculators', href: '/math-calculators', icon: BarChart3 },
    { hubSlug: 'conversion-calculators', href: '/conversion-calculators', icon: RefreshCw },
    { hubSlug: 'date-time-calculators', href: '/date-time-calculators', icon: Clock },
    { hubSlug: 'construction-calculators', href: '/construction-calculators', icon: Calculator },
    { hubSlug: 'statistics-calculators', href: '/statistics-calculators', icon: BarChart3 },
    { hubSlug: 'education-calculators', href: '/education-calculators', icon: Star },
    { hubSlug: 'physics-calculators', href: '/physics-calculators', icon: TrendingUp },
    { hubSlug: 'chemistry-calculators', href: '/chemistry-calculators', icon: Brain },
    { hubSlug: 'engineering-calculators', href: '/engineering-calculators', icon: TrendingUp },
    { hubSlug: 'everyday-calculators', href: '/everyday-calculators', icon: RefreshCw },
    { hubSlug: 'food-calculators', href: '/food-calculators', icon: UtensilsCrossed },
    { hubSlug: 'biology-calculators', href: '/biology-calculators', icon: Microscope },
    { hubSlug: 'ecology-calculators', href: '/ecology-calculators', icon: Leaf },
    { hubSlug: 'sports-calculators', href: '/sports-calculators', icon: Trophy },
  ]
  const hubs = hubDefs.map((d) => {
    const short = d.hubSlug.replace('-calculators', '')
    return {
      ...d,
      name: th(`name_${short}`),
      desc: th(`desc_${short}`),
      count: getCalculatorCount(d.hubSlug),
    }
  })

  const regBySlug = new Map(calculatorRegistry.map((c: any) => [c.slug, c]))
  const POPULAR_SLUGS = [
    'mortgage-calculator',
    'bmi-calculator',
    'loan-calculator',
    'compound-interest-calculator',
    'retirement-calculator',
    'salary-calculator',
    'calorie-calculator',
    'tip-calculator',
    'currency-calculator',
    'gpa-calculator',
    'body-fat-calculator',
    'age-difference-calculator',
  ]
  const { getLocalizedCalculator } = await import('@/lib/localized-registry')
  const popular = (await Promise.all(POPULAR_SLUGS.map(async (slug) =>
    (await getLocalizedCalculator(slug, locale)) || regBySlug.get(slug)
  ))).filter(Boolean)
    .map((c: any) => ({ slug: c.slug, hubSlug: c.hubSlug, title: c.title, desc: c.description || '' }))

  const trending = [
    { name: t('trendAutoLoanName'), href: '/financial-calculators/auto-loan-calculator', desc: t('trendAutoLoanDesc'), icon: DollarSign },
    { name: t('trend401kName'), href: '/financial-calculators/401k-calculator', desc: t('trend401kDesc'), icon: Brain },
    { name: t('trendHouseName'), href: '/financial-calculators/house-affordability-calculator', desc: t('trendHouseDesc'), icon: Calculator },
    { name: t('trendStudentName'), href: '/financial-calculators/student-loan-calculator', desc: t('trendStudentDesc'), icon: Heart },
  ];

  return (
    <div className="min-h-screen">
      <SchemaMarkup
        type="SoftwareApplication"
        data={softwareAppSchema({ title: 'Calculat', description: siteDescriptions[locale] || siteDescriptions.en, slug: '' }, locale, siteUrl)}
        locale={locale}
      />
      <SchemaMarkup type="Organization" data={organizationSchema(locale)} locale={locale} />
      <SchemaMarkup type="FAQPage" data={faqSchema([
        { question: t('faqQ1'), answer: t('faqA1') },
        { question: t('faqQ2'), answer: t('faqA2') },
        { question: t('faqQ3'), answer: t('faqA3') },
        { question: t('faqQ4'), answer: t('faqA4') },
      ])} />
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-[#e0e7ff]/10 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="absolute inset-0 bg-mesh-light dark:bg-mesh-dark pointer-events-none" />
        <div className="absolute inset-0 bg-dot-grid opacity-50 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-br from-[#06b6d4]/5 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-gradient-to-br from-[#1a3a8a]/5 to-transparent blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-20 sm:pb-24">
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-[#c7d2fe]/40 to-[#e0e7ff]/40 text-[#1a3a8a] dark:from-[#1a3a8a]/20 dark:to-[#06b6d4]/10 dark:text-[#06b6d4] border border-[#c7d2fe]/20 dark:border-[#06b6d4]/20 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              {t('heroBadge')}
            </span>
          </div>

          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
              {t('heroTitlePre')}<span className="text-gradient">{t('heroHighlight')}</span>{t('heroTitlePost')}
            </h1>
            <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              {t('heroSubtitle', { count: `${indexableCalculators.length}+` })}
            </p>

            <div className="relative max-w-xl mx-auto mb-8">
              <SearchBarWrapper />
            </div>

            <div className="flex justify-center gap-8 sm:gap-12">
              {[
                { value: `${calculatorRegistry.length}+`, label: t('statCalculators') },
                { value: '16', label: t('statCategories') },
                { value: 'Free', label: t('statFree') },
              ].map((stat) => (
                <div key={stat.label} className="text-center relative">
                  <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-b from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">{stat.value}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-300">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SEO Content: Calculator Online */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('seoTitle')}</h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
            {t('seoIntro')}
          </p>
          <div className="grid sm:grid-cols-3 gap-4 text-left">
            {[
              { title: `${th('financial-calculators')} ${t('seoCardSuffix')}`, desc: t('seoCard1Desc') },
              { title: `${th('health-calculators')} ${t('seoCardSuffix')}`, desc: t('seoCard2Desc') },
              { title: `${th('math-calculators')} ${t('seoCardSuffix')}`, desc: t('seoCard3Desc') },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">{item.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category quick-nav */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2 relative z-10">
        <HubNav />
      </section>

      {/* Category Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 px-1 heading-flourish">{t('allCategories')}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {hubs.map((hub, i) => {
            const Icon = hub.icon;
            return (
              <div key={i}>
                <a
                  href={hub.href}
                  className="group card-handcrafted p-4 flex items-start gap-3 hover:translate-y-[-2px] block"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#06b6d4] to-[#1a3a8a] flex items-center justify-center flex-shrink-0 shadow-sm group-hover:shadow-md transition-all duration-300">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-[#1a3a8a] dark:group-hover:text-[#06b6d4] transition-colors">{hub.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-300 mt-0.5">{hub.desc}</p>
                    <span className="inline-block mt-1.5 text-[10px] font-medium text-[#1a3a8a] dark:text-[#06b6d4] bg-[#1a3a8a]/5 dark:bg-[#06b6d4]/10 px-2 py-0.5 rounded-full">{hub.count} {t('statCalculators')}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-[#1a3a8a] dark:group-hover:text-[#06b6d4] group-hover:translate-x-0.5 transition-all mt-1 flex-shrink-0" />
                </a>
              </div>
            );
          })}
        </div>
      </section>

      {/* Popular Calculators */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-[#1a3a8a]" />
              <span className="heading-flourish">{t('popularTitle')}</span>
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">{t('popularSubtitle')}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {popular.map((calc, i) => (
            <div key={i}>
              <a
                href={`/${calc.hubSlug}/${calc.slug}`}
                className="group card-handcrafted p-4 hover:translate-y-[-2px] block"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#06b6d4] to-[#1a3a8a] flex items-center justify-center mb-2 shadow-sm group-hover:shadow-md transition-shadow duration-300">
                  <HubIcon slug={calc.hubSlug} className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-[#1a3a8a] dark:group-hover:text-[#06b6d4] transition-colors">{calc.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-300 mt-1 line-clamp-2">{calc.desc}</p>
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Now */}
      <section className="bg-gradient-to-r from-[#e0e7ff]/20 to-[#c7d2fe]/20 dark:from-[#0a1d4f]/20 dark:to-[#0a1d4f]/20 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-[#1a3a8a]" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('trendingTitle')}</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {trending.map((tool, i) => {
              const Icon = tool.icon;
              return (
                <div key={i}>
                  <a
                    href={tool.href}
                    className="flex items-center gap-3 card-premium dark:bg-gray-800 dark:border-gray-700 p-4 hover:translate-y-[-2px]"
                  >
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#06b6d4] to-[#1a3a8a] flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-gray-900 dark:text-white">{tool.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-300">{tool.desc}</p>
                    </div>
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="absolute inset-0 bg-dot-grid opacity-30 pointer-events-none" />
        <div className="relative text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white"><span className="heading-flourish">{t('featuresTitle')}</span></h2>
          <p className="text-gray-500 dark:text-gray-300 mt-1">{t('featuresSubtitle')}</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: 'Zap', title: t('featureFastTitle'), desc: t('featureFastDesc') },
            { icon: 'Sparkles', title: t('featureAITitle'), desc: t('featureAIDesc') },
            { icon: 'Target', title: t('featurePrecisionTitle'), desc: t('featurePrecisionDesc') },
            { icon: 'Palette', title: t('featureDesignTitle'), desc: t('featureDesignDesc') },
          ].map((f, i) => (
            <div key={i} className="card-handcrafted p-6 text-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#06b6d4] to-[#1a3a8a] flex items-center justify-center mx-auto mb-3 shadow-sm">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{f.title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-300">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Scientific Calculator */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-[#1a3a8a]" />
              {t('sciTitle')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-300 mt-1 mb-4">
              {t('sciIntro')}
            </p>
            <p className="text-gray-500 dark:text-gray-300">
              {t('sciNote')}
            </p>
          </div>
          <div className="card-premium dark:bg-gray-800 dark:border-gray-700 p-4 sm:p-6 lg:col-span-2 overflow-x-auto">
            <ScientificCalculatorForm />
          </div>
        </div>
      </section>

      <MediaMentions />

      {/* FAQ Section - Calculator Online */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">Frequently Asked Questions About Our Calculator Online</h2>
          <div className="space-y-4">
            {[
              {
                q: 'What is the best calculator online for finance?',
                a: 'Calculat offers over 500 financial calculators online including mortgage, loan, investment, retirement, and tax calculators. Each provides instant results with step-by-step explanations and expert-reviewed formulas.',
              },
              {
                q: 'Is this calculator online free to use?',
                a: 'Yes, Calculat is 100% free. All 4,270+ calculators online are available without sign-up, no ads, and no hidden fees. Use our calculator online as much as you need.',
              },
              {
                q: 'Can I use this calculator online on my phone?',
                a: 'Absolutely. Our calculator online is fully responsive and works perfectly on phones, tablets, and desktops. Every calculator online adapts to your screen size.',
              },
              {
                q: 'How accurate is your calculator online?',
                a: 'Our calculators online use industry-standard formulas and are accurate to 15 decimal places. Each calculator online is reviewed by qualified experts (CFA, MD, PE, PhD) for accuracy.',
              },
            ].map((faq, i) => (
              <details key={i} className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 group">
                <summary className="font-semibold text-gray-900 dark:text-white text-sm cursor-pointer list-none flex items-center justify-between">
                  {faq.q}
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="rounded-2xl bg-gradient-to-br from-[#1a3a8a] via-[#3d61b0] to-[#0a1d4f] p-8 sm:p-12 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-dot-grid opacity-10 pointer-events-none" />
          <div className="absolute inset-0 bg-mesh-light opacity-10" />
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-gradient-to-br from-[#06b6d4]/10 to-transparent blur-3xl pointer-events-none" />
          <div className="relative">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">{t('ctaTitle')}</h2>
            <p className="text-[#c7d2fe] mb-6 max-w-md mx-auto">{t('ctaSubtitle')}</p>
            <Link
              href="/financial-calculators"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-[#1a3a8a] font-semibold hover:bg-[#e0e7ff] hover:shadow-xl transition-all duration-200 shadow-lg active:scale-[0.98]"
            >
              {t('ctaButton')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
