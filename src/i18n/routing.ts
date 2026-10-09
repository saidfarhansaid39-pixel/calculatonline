import { defineRouting } from 'next-intl/routing'

// English-only site (Oct 2026): the 9 translated locales were removed —
// their machine-translated content could not rank and created scaled-content
// risk, 10x maintenance, and repeated i18n bugs. Legacy /xx/ URLs 301 to
// their English canonicals in src/app/[...slug]/page.tsx so no equity is lost.
export const routing = defineRouting({
  locales: ['en'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
})

export type Locale = (typeof routing.locales)[number]

export const isRtl = (_locale: Locale) => false

// Maps each app locale to its BCP-47 hreflang code used in sitemaps and
// <link rel="alternate" hreflang="..."> tags.
export const isoLangs: Record<string, string> = {
  'en': 'en',
}

export const localeNames: Record<string, string> = {
  'en': 'English',
}
