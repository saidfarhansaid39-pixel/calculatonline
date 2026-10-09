import { Link } from '@/lib/navigation'
import { Calculator } from 'lucide-react'
import { getLocale, getTranslations } from 'next-intl/server'

export async function Footer() {
  const locale = await getLocale()
  const t = await getTranslations('footer')
  const s = await getTranslations('seo')
  const tc = await getTranslations('chrome')

  const sections = [
    {
      title: t('calculators'),
      links: [
        { label: t('financial'), href: '/financial-calculators' },
        { label: t('healthFitness'), href: '/health-calculators' },
        { label: t('math'), href: '/math-calculators' },
        { label: t('conversion'), href: '/conversion-calculators' },
        { label: t('dateTime'), href: '/date-time-calculators' },
        { label: t('construction'), href: '/construction-calculators' },
        { label: t('statistics'), href: '/statistics-calculators' },
        { label: t('education'), href: '/education-calculators' },
        { label: t('physics'), href: '/physics-calculators' },
        { label: t('chemistry'), href: '/chemistry-calculators' },
        { label: t('engineering'), href: '/engineering-calculators' },
        { label: t('everyday'), href: '/everyday-calculators' },
        { label: t('foodNutrition'), href: '/food-calculators' },
        { label: t('biology'), href: '/biology-calculators' },
        { label: t('ecology'), href: '/ecology-calculators' },
        { label: t('sports'), href: '/sports-calculators' },
        { label: tc('allCalculatorsAz'), href: '/a-z-index' },
      ],
    },
    {
      title: t('popular'),
      links: [
        { label: t('mortgage'), href: '/financial-calculators/mortgage-calculator' },
        { label: t('bmi'), href: '/health-calculators/bmi-calculator' },
        { label: t('calorie'), href: '/health-calculators/calorie-calculator' },
        { label: t('compoundInterest'), href: '/financial-calculators/compound-interest-calculator' },
        { label: t('scientificNotation'), href: '/math-calculators/scientific-notation' },
      ],
    },
    {
      title: t('company'),
      links: [
        { label: s('about'), href: '/about' },
        { label: s('privacy'), href: '/privacy' },
        { label: s('terms'), href: '/terms' },
        { label: s('contact'), href: '/contact' },
        { label: s('editorialPolicy'), href: '/editorial-policy' },
        { label: s('press'), href: '/press' },
        { label: tc('suggestCalculator'), href: '/suggest-calculator' },
      ],
    },
  ]

  return (
    <footer className="w-full border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#1a3a8a] to-[#06b6d4] flex items-center justify-center">
                <Calculator className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-bold">
                <span className="text-gray-900 dark:text-white">Calcu</span>
                <span className="text-[#06b6d4]">lat</span>
              </span>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-300 mb-4 max-w-xs">
              {t('tagline')}
            </p>
          </div>

          {sections.map((section) => (
            <nav key={section.title} aria-label={section.title}>
              <h3 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 dark:text-gray-300 hover:text-[#1a3a8a] dark:hover:text-[#06b6d4] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400 dark:text-gray-400">
            {t('copyright', { year: new Date().getFullYear() })}
          </p>
          <div className="flex items-center gap-4">
            <p className="text-xs text-gray-400 dark:text-gray-400">
              {t('motto')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
