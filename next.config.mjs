const withBundleAnalyzer = process.env.ANALYZE === 'true' ? (await import('@next/bundle-analyzer')).default() : (x) => x
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()

// Cloudflare Workers build (OpenNext adapter). Set CF_PLATFORM=cloudflare
// when running the cf:* scripts so the adapter gets `output: 'standalone'`
// (what it bundles) and unoptimized images (workerd has no Node image
// optimizer and no IMAGES binding is configured). Non-Cloudflare builds
// (next start, Vercel) keep the exact previous behavior.
const isCloudflare = process.env.CF_PLATFORM === 'cloudflare'

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(isCloudflare ? { output: 'standalone' } : {}),
  compress: true,
  turbopack: {
    root: '.',
  },
  webpack: (config) => {
    config.resolve = config.resolve || {}
    config.resolve.fallback = { ...(config.resolve.fallback || {}), fs: false }
    config.cache = false
    return config
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 3600,
    remotePatterns: [
      { protocol: 'https', hostname: 'i.pravatar.cc' },
    ],
    unoptimized: isCloudflare,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  poweredByHeader: false,
  reactStrictMode: true,
  staticPageGenerationTimeout: 180,
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'framer-motion', 'minisearch', '@radix-ui/react-accordion', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select', '@radix-ui/react-tabs', '@radix-ui/react-tooltip', '@heroicons/react'],
    cpus: Number(process.env.NEXT_BUILD_CPUS) || 8,
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://plausible.io https://*.vercel-analytics.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data: https:",
              "connect-src 'self' https://open.er-api.com https://financialmodelingprep.com https://*.vercel-analytics.com",
              "frame-ancestors *",
              "form-action 'self'",
              "base-uri 'self'",
            ].join('; '),
          },
        ],
      },
      {
        source: '/favicon.svg',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400' },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400' },
        ],
      },
      {
        source: '/robots.txt',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400' },
        ],
      },
      {
        source: '/sitemap.xml',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400' },
        ],
      },
      {
        source: '/:path(.+\\.(?:woff2?|ttf|otf|eot))',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/search-index/:path*.json',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/:path(.+\\.json)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800' },
        ],
      },
    ]
  },

  async redirects() {
    const legacyPages = [
      ['/mortgage', '/financial-calculators/mortgage-calculator'],
      ['/salary', '/financial-calculators/salary-calculator'],
      ['/student-loan', '/financial-calculators/student-loan-calculator'],
      ['/payment', '/financial-calculators/payment-calculator'],
      ['/rent', '/financial-calculators/rent-calculator'],
      ['/income-tax', '/financial-calculators/income-tax-calculator'],
      ['/house-affordability', '/financial-calculators/house-affordability-calculator'],
      ['/interest-rate', '/financial-calculators/interest-rate-calculator'],
      ['/amortization', '/financial-calculators/amortization-calculator'],
      ['/annuity-payout', '/financial-calculators/annuity-payout-calculator'],
      ['/auto-loan', '/financial-calculators/auto-loan-calculator'],
      ['/credit-cards-payoff', '/financial-calculators/credit-card-payoff-calculator'],
      ['/debt-consolidation', '/financial-calculators/debt-consolidation-calculator'],
      ['/estate-tax', '/financial-calculators/estate-tax-calculator'],
      ['/social-security', '/financial-calculators/social-security-calculator'],
      ['/currency', '/financial-calculators/currency-calculator'],
    ].map(([source, dest]) => ({ source, destination: dest, permanent: true }));

    const spanishAliases = [
      ['/es/hipoteca', '/es/financial-calculators/mortgage-calculator'],
      ['/es/calculo-hipoteca', '/es/financial-calculators/mortgage-calculator'],
      ['/es/prestamo', '/es/financial-calculators/loan-calculator'],
      ['/es/prestamo-personal', '/es/financial-calculators/personal-loan-calculator'],
      ['/es/interes-compuesto', '/es/financial-calculators/compound-interest-calculator'],
      ['/es/imc', '/es/health-calculators/bmi-calculator'],
      ['/es/calculadora-imc', '/es/health-calculators/bmi-calculator'],
      ['/es/ahorro', '/es/financial-calculators/savings-calculator'],
      ['/es/jubilacion', '/es/financial-calculators/retirement-calculator'],
      ['/es/salario', '/es/financial-calculators/salary-calculator'],
      ['/es/impuesto', '/es/financial-calculators/income-tax-calculator'],
      ['/es/divisas', '/es/financial-calculators/currency-calculator'],
      ['/es/inversion', '/es/financial-calculators/investment-calculator'],
      ['/es/amortizacion', '/es/financial-calculators/amortization-calculator'],
    ].map(([source, dest]) => ({ source, destination: dest, permanent: true }));

    const frenchAliases = [
      ['/fr/hypotheque', '/fr/financial-calculators/mortgage-calculator'],
      ['/fr/pret', '/fr/financial-calculators/loan-calculator'],
      ['/fr/calcul-imc', '/fr/health-calculators/bmi-calculator'],
      ['/fr/interets-composes', '/fr/financial-calculators/compound-interest-calculator'],
      ['/fr/salaire', '/fr/financial-calculators/salary-calculator'],
      ['/fr/retraite', '/fr/financial-calculators/retirement-calculator'],
      ['/fr/amortissement', '/fr/financial-calculators/amortization-calculator'],
      ['/fr/impot', '/fr/financial-calculators/income-tax-calculator'],
      ['/fr/devises', '/fr/financial-calculators/currency-calculator'],
      ['/fr/investissement', '/fr/financial-calculators/investment-calculator'],
    ].map(([source, dest]) => ({ source, destination: dest, permanent: true }));

    const germanAliases = [
      ['/de/hypothek', '/de/financial-calculators/mortgage-calculator'],
      ['/de/darlehen', '/de/financial-calculators/loan-calculator'],
      ['/de/bmi-rechner', '/de/health-calculators/bmi-calculator'],
      ['/de/zinseszins', '/de/financial-calculators/compound-interest-calculator'],
      ['/de/gehalt', '/de/financial-calculators/salary-calculator'],
      ['/de/rente', '/de/financial-calculators/retirement-calculator'],
      ['/de/tilgung', '/de/financial-calculators/amortization-calculator'],
      ['/de/einkommensteuer', '/de/financial-calculators/income-tax-calculator'],
      ['/de/wahrung', '/de/financial-calculators/currency-calculator'],
      ['/de/investition', '/de/financial-calculators/investment-calculator'],
    ].map(([source, dest]) => ({ source, destination: dest, permanent: true }));

    const portugueseAliases = [
      ['/pt/hipoteca', '/pt/financial-calculators/mortgage-calculator'],
      ['/pt/emprestimo', '/pt/financial-calculators/loan-calculator'],
      ['/pt/imc', '/pt/health-calculators/bmi-calculator'],
      ['/pt/juros-compostos', '/pt/financial-calculators/compound-interest-calculator'],
      ['/pt/salario', '/pt/financial-calculators/salary-calculator'],
      ['/pt/aposentadoria', '/pt/financial-calculators/retirement-calculator'],
      ['/pt/amortizacao', '/pt/financial-calculators/amortization-calculator'],
      ['/pt/imposto', '/pt/financial-calculators/income-tax-calculator'],
      ['/pt/moedas', '/pt/financial-calculators/currency-calculator'],
      ['/pt/investimento', '/pt/financial-calculators/investment-calculator'],
    ].map(([source, dest]) => ({ source, destination: dest, permanent: true }));

    const russianAliases = [
      ['/ru/ipoteka', '/ru/financial-calculators/mortgage-calculator'],
      ['/ru/kredit', '/ru/financial-calculators/loan-calculator'],
      ['/ru/imt', '/ru/health-calculators/bmi-calculator'],
      ['/ru/slozhnyj-procent', '/ru/financial-calculators/compound-interest-calculator'],
      ['/ru/zarplata', '/ru/financial-calculators/salary-calculator'],
      ['/ru/pensija', '/ru/financial-calculators/retirement-calculator'],
      ['/ru/nalog', '/ru/financial-calculators/income-tax-calculator'],
      ['/ru/valjuta', '/ru/financial-calculators/currency-calculator'],
    ].map(([source, dest]) => ({ source, destination: dest, permanent: true }));

    const arabicAliases = [
      ['/ar/rahn', '/ar/financial-calculators/mortgage-calculator'],
      ['/ar/qard', '/ar/financial-calculators/loan-calculator'],
      ['/ar/mutawassit-kutla-jism', '/ar/health-calculators/bmi-calculator'],
      ['/ar/alriba-almarakab', '/ar/financial-calculators/compound-interest-calculator'],
      ['/ar/ratib', '/ar/financial-calculators/salary-calculator'],
      ['/ar/taqaeud', '/ar/financial-calculators/retirement-calculator'],
      ['/ar/dariba', '/ar/financial-calculators/income-tax-calculator'],
      ['/ar/omla', '/ar/financial-calculators/currency-calculator'],
    ].map(([source, dest]) => ({ source, destination: dest, permanent: true }));

    const hindiAliases = [
      ['/hi/girwi', '/hi/financial-calculators/mortgage-calculator'],
      ['/hi/rin', '/hi/financial-calculators/loan-calculator'],
      ['/hi/bmi', '/hi/health-calculators/bmi-calculator'],
      ['/hi/cakrabrdhi-byaj', '/hi/financial-calculators/compound-interest-calculator'],
      ['/hi/vetan', '/hi/financial-calculators/salary-calculator'],
      ['/hi/sevanivrtti', '/hi/financial-calculators/retirement-calculator'],
      ['/hi/kar', '/hi/financial-calculators/income-tax-calculator'],
      ['/hi/mudra', '/hi/financial-calculators/currency-calculator'],
    ].map(([source, dest]) => ({ source, destination: dest, permanent: true }));

    const japaneseAliases = [
      ['/ja/teitou', '/ja/financial-calculators/mortgage-calculator'],
      ['/ja/kashitsuke', '/ja/financial-calculators/loan-calculator'],
      ['/ja/bmi', '/ja/health-calculators/bmi-calculator'],
      ['/ja/fukuri', '/ja/financial-calculators/compound-interest-calculator'],
      ['/ja/kyuyo', '/ja/financial-calculators/salary-calculator'],
      ['/ja/teinen', '/ja/financial-calculators/retirement-calculator'],
      ['/ja/zeikin', '/ja/financial-calculators/income-tax-calculator'],
      ['/ja/kawase', '/ja/financial-calculators/currency-calculator'],
    ].map(([source, dest]) => ({ source, destination: dest, permanent: true }));

    const chineseAliases = [
      ['/zh-CN/diya', '/zh-CN/financial-calculators/mortgage-calculator'],
      ['/zh-CN/daikuan', '/zh-CN/financial-calculators/loan-calculator'],
      ['/zh-CN/bmi', '/zh-CN/health-calculators/bmi-calculator'],
      ['/zh-CN/fuli', '/zh-CN/financial-calculators/compound-interest-calculator'],
      ['/zh-CN/gongzi', '/zh-CN/financial-calculators/salary-calculator'],
      ['/zh-CN/tuixiu', '/zh-CN/financial-calculators/retirement-calculator'],
      ['/zh-CN/shuiwu', '/zh-CN/financial-calculators/income-tax-calculator'],
      ['/zh-CN/huobi', '/zh-CN/financial-calculators/currency-calculator'],
    ].map(([source, dest]) => ({ source, destination: dest, permanent: true }));

    return [
      ...legacyPages,
      ...spanishAliases,
      ...frenchAliases,
      ...germanAliases,
      ...portugueseAliases,
      ...russianAliases,
      ...arabicAliases,
      ...hindiAliases,
      ...japaneseAliases,
      ...chineseAliases,
      ...['/financial-calculator.html', '/fitness-and-health-calculator.html', '/math-calculator.html', '/other-calculator.html', '/conversion-calculator.html'].map(p => ({
        source: p,
        destination: '/',
        permanent: true,
      })),
    ];
  }
};

export default withNextIntl(withBundleAnalyzer(nextConfig));
