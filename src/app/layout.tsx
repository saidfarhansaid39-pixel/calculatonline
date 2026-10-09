import { Inter, Noto_Sans_Arabic, Noto_Sans_JP, Noto_Sans_SC, Noto_Sans_Devanagari } from 'next/font/google'
import '../styles/globals.css'
import { ClientLocaleWrapper } from '@/components/ClientLocaleWrapper'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister'
import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import { isRtl, routing, type Locale } from '@/i18n/routing'
import { SchemaMarkup, websiteSchema, siteDescriptions } from '@/components/SchemaMarkup'
import { Analytics } from '@/components/analytics/Analytics'
import { WebVitals } from '@/components/analytics/WebVitals'
import { CookieConsent } from '@/components/CookieConsent'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { PopupCalculatorWidget } from '@/components/calculator/PopupCalculatorWidget'
import { Suspense } from 'react'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
  fallback: ['system-ui', 'arial', 'sans-serif'],
  adjustFontFallback: true,
})

const notoArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  display: 'swap',
  preload: false,
  variable: '--font-arabic',
})

const notoJapanese = Noto_Sans_JP({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-japanese',
})

const notoChinese = Noto_Sans_SC({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-chinese',
})

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-devanagari',
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.calculat.online'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  return {
    metadataBase: new URL(siteUrl),
    title: 'Calculat — Free Calculator Online | 4,270+ Tools',
    description: 'Free calculator online for finance, health, math, unit conversion & more. 4,270+ instant calculators online with step-by-step formulas. No sign-up.',
    keywords: [
      'calculator online', 'online calculator', 'free calculator online', 'calculator online free',
      'financial calculator', 'health calculator', 'math calculator', 'unit converter',
      'mortgage calculator online', 'BMI calculator online', 'loan calculator online',
      'tip calculator online', 'scientific calculator online', 'calorie calculator online',
    ],
    openGraph: {
      type: 'website',
      url: siteUrl,
      siteName: 'Calculat',
      title: 'Calculat — Free Calculator Online | 4,270+ Tools',
      description: 'Free calculator online for finance, health, math, unit conversion & more. 4,270+ instant calculators online with step-by-step formulas.',
      locale: locale === 'en' ? 'en_US' : locale === 'zh-CN' ? 'zh_CN' : `${locale}_${locale.toUpperCase()}`,
      images: [{ url: `${siteUrl}/og-image.png`, width: 1200, height: 630, alt: 'Calculat — Free Calculator Online' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Calculat — Free Calculator Online | 4,270+ Tools',
      description: 'Free calculator online for finance, health, math, unit conversion & more. 4,270+ instant calculators online.',
    },
    icons: { icon: '/favicon.svg' },
    robots: { index: true, follow: true },
    alternates: {
      languages: {
        'x-default': siteUrl,
        ...Object.fromEntries(
          routing.locales.map(l => [l, l === routing.defaultLocale ? siteUrl : `${siteUrl}/${l}`])
        ),
      },
    },
  }
}

const fontVariables = `${inter.variable} ${notoArabic.variable} ${notoJapanese.variable} ${notoChinese.variable} ${notoDevanagari.variable}`

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  const messages = (await import(`../i18n/messages/${locale}.json`)).default
  return (
    <html lang={locale} dir={isRtl(locale as Locale) ? 'rtl' : 'ltr'} className={`no-js ${fontVariables}`} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="alternate" type="text/plain" title="LLMs — Calculat" href="/llms.txt" />
        <link rel="preconnect" href="https://i.pravatar.cc" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://plausible.io" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://vitals.vercel-analytics.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://open.er-api.com" />
        <link rel="dns-prefetch" href="https://financialmodelingprep.com" />
        <meta name="theme-color" content="#1a3a8a" />
        <meta name="google-site-verification" content="6JE119hbevVMs4yAVVaMZlrdiM3GLm4TwEsO3IwfitQ" />
        <meta name="trustpilot-one-time-domain-verification-id" content="f084c6c3-a86e-4f6d-91de-5f9833c2d9fe" />
        {process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION && (
          <>
            <meta name="google-site-verification" content={process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION} />
            <meta name="google-adsense-account" content="ca-pub-6655074936089316" />
          </>
        )}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <script dangerouslySetInnerHTML={{ __html: 'document.documentElement.classList.remove("no-js")' }} />
        <script dangerouslySetInnerHTML={{
          __html: `
            try {
              const theme = localStorage.getItem('theme');
              if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
              }
            } catch (e) {}
          `
        }} />
      </head>
      <body className={`${inter.className} flex flex-col min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300`}>
        <SchemaMarkup type="WebSite" data={websiteSchema(locale)} />
        <SchemaMarkup type="Organization" data={{
          name: 'Calculat',
          url: siteUrl,
          logo: `${siteUrl}/favicon.svg`,
          description: siteDescriptions[locale],
          sameAs: ['https://www.calculat.online', 'https://x.com/calculat', 'https://www.linkedin.com/company/calculat'],
          contactPoint: { '@type': 'ContactPoint', contactType: 'customer service', availableLanguage: ['en'] },
          knowsAbout: ['Financial Planning', 'Health Metrics', 'Mathematics', 'Unit Conversion', 'Physics', 'Chemistry', 'Engineering', 'Statistics', 'Education', 'Construction', 'Biology', 'Ecology', 'Sports Science', 'Everyday Calculations'],
          areaServed: { '@type': 'World' },
          foundingDate: '2025',
          vatID: 'US-EIN',
        }} />
        <ClientLocaleWrapper initialMessages={messages} initialLocale={locale}>
          <ServiceWorkerRegister />
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none"
          >
            {messages.common?.skipToContent ?? 'Skip to content'}
          </a>
          <AuthProvider>
            <Header />
            <main id="main-content" className="flex-grow" tabIndex={-1}>
              {children}
            </main>
          </AuthProvider>
          <PopupCalculatorWidget />
          <Footer />
          <CookieConsent />
        </ClientLocaleWrapper>
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
        <WebVitals />
      <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6655074936089316"
     crossOrigin="anonymous"></script>
</body>
    </html>
  )
}
