'use client'

import { usePathname } from '@/lib/navigation'
import { routing, localeNames, type Locale, isoLangs } from '@/i18n/routing'
import { useLocale, useTranslations } from 'next-intl'
import { Languages, ChevronDown, Check } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

// Country code for each locale's flag image (public/flags/{code}.png).
// Real images instead of emoji: flag emoji don't render on Windows (Segoe UI Emoji).
const localeCountries: Record<Locale, string> = {
  'en': 'us',
  'es': 'es',
  'fr': 'fr',
  'de': 'de',
  'pt': 'pt',
  'ru': 'ru',
  'ar': 'sa',
  'hi': 'in',
  'ja': 'jp',
  'zh-CN': 'cn',
}

function Flag({ locale, className }: { locale: Locale; className?: string }) {
  return (
    <Image
      src={`/flags/${localeCountries[locale]}.png`}
      alt=""
      width={24}
      height={16}
      className={`shrink-0 rounded-[2px] object-cover ${className ?? ''}`}
    />
  )
}

export function LocaleSwitcher({ variant = 'dropdown' }: { variant?: 'dropdown' | 'minimal' }) {
  const pathname = usePathname()
  const currentLocale = useLocale() as Locale
  const tc = useTranslations('chrome')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const switchLocale = (target: Locale) => {
    // Strip any leading locale segment already present in the pathname
    // (e.g. "/fr", or even a legacy double "/de/fr") so the new locale is
    // never stacked on top of an old one.
    const parts = pathname.split('/')
    const localeSegments = routing.locales as readonly string[]
    while (parts.length > 1 && localeSegments.includes(parts[1] as string)) {
      parts.splice(1, 1)
    }
    const cleanPath = parts.join('/').replace(/\/+$/, '')
    setOpen(false)
    if (target === currentLocale) return
    // Remember the choice for prefixless URLs ("/") — parity with the locale
    // cookie next-intl's router used to sync on every switch.
    document.cookie = `NEXT_LOCALE=${target}; path=/; max-age=31536000; samesite=lax`
    // Full page navigation: the root layout (which owns the intl provider and
    // <html lang>) is NOT re-rendered on client-side navigations between
    // locale prefixes, so a soft router.replace keeps the previous locale's
    // messages, flag, and <html lang>. A full load renders everything in the
    // target locale — and a path still carrying the old locale's translated
    // slugs gets the cross-locale 308 from the catch-all route.
    const targetPath = target === 'en' ? (cleanPath || '/') : `/${target}${cleanPath}`
    window.location.assign(targetPath)
  }

  if (variant === 'minimal') {
    return (
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          aria-label={tc('switchLanguage')}
          aria-expanded={open}
        >
          <Flag locale={currentLocale} className="h-3.5 w-5" />
          <span className="hidden sm:inline">{tc(`locale.${currentLocale}`)}</span>
        </button>
        {open && (
          <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg py-1 z-50 max-h-60 overflow-y-auto">
            {routing.locales.map((locale) => (
              <button
                key={locale}
                onClick={() => switchLocale(locale as Locale)}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <span className={`flex items-center gap-1.5 ${locale === currentLocale ? 'text-[#1a3a8a] dark:text-[#06b6d4] font-medium' : ''}`}>
                  <Flag locale={locale as Locale} className="h-3 w-[18px]" />
                  {localeNames[locale as Locale]}
                </span>
                {locale === currentLocale && (
                  <Check className="w-3 h-3 text-[#1a3a8a] dark:text-[#06b6d4] ml-auto" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-[#1a3a8a] dark:hover:text-[#06b6d4] rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
        aria-label={tc('switchLanguage')}
        aria-expanded={open}
      >
        <Flag locale={currentLocale} className="h-4 w-6" />
        <span className="hidden sm:inline">{tc(`locale.${currentLocale}`)}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg py-1 z-50 max-h-72 overflow-y-auto">
          {routing.locales.map((locale) => (
            <button
              key={locale}
              onClick={() => switchLocale(locale as Locale)}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <span className={`flex items-center gap-1.5 ${locale === currentLocale ? 'text-[#1a3a8a] dark:text-[#06b6d4] font-semibold' : ''}`}>
                <Flag locale={locale as Locale} className="h-3.5 w-5" />
                {localeNames[locale as Locale]}
              </span>
              {locale === currentLocale && (
                <Check className="w-3.5 h-3.5 text-[#1a3a8a] dark:text-[#06b6d4] ml-auto" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
