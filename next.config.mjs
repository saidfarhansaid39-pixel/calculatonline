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
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://plausible.io https://*.vercel-analytics.com https://pagead2.googlesyndication.com https://*.adtrafficquality.google",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data: https:",
              "connect-src 'self' https://open.er-api.com https://financialmodelingprep.com https://*.vercel-analytics.com https://*.googlesyndication.com https://googleads.g.doubleclick.net https://*.adtrafficquality.google https://csi.gstatic.com",
              "frame-src 'self' https://googleads.g.doubleclick.net https://*.googlesyndication.com https://*.adtrafficquality.google https://*.google.com",
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
      ['/es/hipoteca', '//financial-calculators/mortgage-calculator'],
      ['/es/calculo-hipoteca', '//financial-calculators/mortgage-calculator'],
      ['/es/prestamo', '//financial-calculators/loan-calculator'],
      ['/es/prestamo-personal', '//financial-calculators/personal-loan-calculator'],
      ['/es/interes-compuesto', '//financial-calculators/compound-interest-calculator'],
      ['/es/imc', '//health-calculators/bmi-calculator'],
      ['/es/calculadora-imc', '//health-calculators/bmi-calculator'],
      ['/es/ahorro', '//financial-calculators/savings-calculator'],
      ['/es/jubilacion', '//financial-calculators/retirement-calculator'],
      ['/es/salario', '//financial-calculators/salary-calculator'],
      ['/es/impuesto', '//financial-calculators/income-tax-calculator'],
      ['/es/divisas', '//financial-calculators/currency-calculator'],
      ['/es/inversion', '//financial-calculators/investment-calculator'],
      ['/es/amortizacion', '//financial-calculators/amortization-calculator'],
    ].map(([source, dest]) => ({ source, destination: dest, permanent: true }));

    const frenchAliases = [
      ['/fr/hypotheque', '//financial-calculators/mortgage-calculator'],
      ['/fr/pret', '//financial-calculators/loan-calculator'],
      ['/fr/calcul-imc', '//health-calculators/bmi-calculator'],
      ['/fr/interets-composes', '//financial-calculators/compound-interest-calculator'],
      ['/fr/salaire', '//financial-calculators/salary-calculator'],
      ['/fr/retraite', '//financial-calculators/retirement-calculator'],
      ['/fr/amortissement', '//financial-calculators/amortization-calculator'],
      ['/fr/impot', '//financial-calculators/income-tax-calculator'],
      ['/fr/devises', '//financial-calculators/currency-calculator'],
      ['/fr/investissement', '//financial-calculators/investment-calculator'],
    ].map(([source, dest]) => ({ source, destination: dest, permanent: true }));

    const germanAliases = [
      ['/de/hypothek', '//financial-calculators/mortgage-calculator'],
      ['/de/darlehen', '//financial-calculators/loan-calculator'],
      ['/de/bmi-rechner', '//health-calculators/bmi-calculator'],
      ['/de/zinseszins', '//financial-calculators/compound-interest-calculator'],
      ['/de/gehalt', '//financial-calculators/salary-calculator'],
      ['/de/rente', '//financial-calculators/retirement-calculator'],
      ['/de/tilgung', '//financial-calculators/amortization-calculator'],
      ['/de/einkommensteuer', '//financial-calculators/income-tax-calculator'],
      ['/de/wahrung', '//financial-calculators/currency-calculator'],
      ['/de/investition', '//financial-calculators/investment-calculator'],
    ].map(([source, dest]) => ({ source, destination: dest, permanent: true }));

    const portugueseAliases = [
      ['/pt/hipoteca', '//financial-calculators/mortgage-calculator'],
      ['/pt/emprestimo', '//financial-calculators/loan-calculator'],
      ['/pt/imc', '//health-calculators/bmi-calculator'],
      ['/pt/juros-compostos', '//financial-calculators/compound-interest-calculator'],
      ['/pt/salario', '//financial-calculators/salary-calculator'],
      ['/pt/aposentadoria', '//financial-calculators/retirement-calculator'],
      ['/pt/amortizacao', '//financial-calculators/amortization-calculator'],
      ['/pt/imposto', '//financial-calculators/income-tax-calculator'],
      ['/pt/moedas', '//financial-calculators/currency-calculator'],
      ['/pt/investimento', '//financial-calculators/investment-calculator'],
    ].map(([source, dest]) => ({ source, destination: dest, permanent: true }));

    const russianAliases = [
      ['/ru/ipoteka', '//financial-calculators/mortgage-calculator'],
      ['/ru/kredit', '//financial-calculators/loan-calculator'],
      ['/ru/imt', '//health-calculators/bmi-calculator'],
      ['/ru/slozhnyj-procent', '//financial-calculators/compound-interest-calculator'],
      ['/ru/zarplata', '//financial-calculators/salary-calculator'],
      ['/ru/pensija', '//financial-calculators/retirement-calculator'],
      ['/ru/nalog', '//financial-calculators/income-tax-calculator'],
      ['/ru/valjuta', '//financial-calculators/currency-calculator'],
    ].map(([source, dest]) => ({ source, destination: dest, permanent: true }));

    const arabicAliases = [
      ['/ar/rahn', '//financial-calculators/mortgage-calculator'],
      ['/ar/qard', '//financial-calculators/loan-calculator'],
      ['/ar/mutawassit-kutla-jism', '//health-calculators/bmi-calculator'],
      ['/ar/alriba-almarakab', '//financial-calculators/compound-interest-calculator'],
      ['/ar/ratib', '//financial-calculators/salary-calculator'],
      ['/ar/taqaeud', '//financial-calculators/retirement-calculator'],
      ['/ar/dariba', '//financial-calculators/income-tax-calculator'],
      ['/ar/omla', '//financial-calculators/currency-calculator'],
    ].map(([source, dest]) => ({ source, destination: dest, permanent: true }));

    const hindiAliases = [
      ['/hi/girwi', '//financial-calculators/mortgage-calculator'],
      ['/hi/rin', '//financial-calculators/loan-calculator'],
      ['/hi/bmi', '//health-calculators/bmi-calculator'],
      ['/hi/cakrabrdhi-byaj', '//financial-calculators/compound-interest-calculator'],
      ['/hi/vetan', '//financial-calculators/salary-calculator'],
      ['/hi/sevanivrtti', '//financial-calculators/retirement-calculator'],
      ['/hi/kar', '//financial-calculators/income-tax-calculator'],
      ['/hi/mudra', '//financial-calculators/currency-calculator'],
    ].map(([source, dest]) => ({ source, destination: dest, permanent: true }));

    const japaneseAliases = [
      ['/ja/teitou', '//financial-calculators/mortgage-calculator'],
      ['/ja/kashitsuke', '//financial-calculators/loan-calculator'],
      ['/ja/bmi', '//health-calculators/bmi-calculator'],
      ['/ja/fukuri', '//financial-calculators/compound-interest-calculator'],
      ['/ja/kyuyo', '//financial-calculators/salary-calculator'],
      ['/ja/teinen', '//financial-calculators/retirement-calculator'],
      ['/ja/zeikin', '//financial-calculators/income-tax-calculator'],
      ['/ja/kawase', '//financial-calculators/currency-calculator'],
    ].map(([source, dest]) => ({ source, destination: dest, permanent: true }));

    const chineseAliases = [
      ['/zh-CN/diya', '//financial-calculators/mortgage-calculator'],
      ['/zh-CN/daikuan', '//financial-calculators/loan-calculator'],
      ['/zh-CN/bmi', '//health-calculators/bmi-calculator'],
      ['/zh-CN/fuli', '//financial-calculators/compound-interest-calculator'],
      ['/zh-CN/gongzi', '//financial-calculators/salary-calculator'],
      ['/zh-CN/tuixiu', '//financial-calculators/retirement-calculator'],
      ['/zh-CN/shuiwu', '//financial-calculators/income-tax-calculator'],
      ['/zh-CN/huobi', '//financial-calculators/currency-calculator'],
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
