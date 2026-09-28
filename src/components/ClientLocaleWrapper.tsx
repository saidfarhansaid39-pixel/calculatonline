'use client'

import { useEffect, ReactNode } from 'react'
import { NextIntlClientProvider } from 'next-intl'

export function ClientLocaleWrapper({ children, initialMessages, initialLocale }: { children: ReactNode, initialMessages: Record<string, any>, initialLocale?: string }) {
  // The server is the source of truth: the root layout re-runs for every
  // request, so these props always match the locale of the current URL.
  // Deriving directly from the props (instead of freezing them in useState,
  // which ignored later prop changes) keeps the client-side locale in sync
  // across client-side navigations. That stale state was the root cause of
  // the language-switcher bug that produced URLs like /de/fr.
  const locale = initialLocale || 'en'

  // Keep <html lang> / <html dir> correct after a client-side locale change.
  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
  }, [locale])

  return (
    <NextIntlClientProvider locale={locale} messages={initialMessages} timeZone="UTC">
      {children}
    </NextIntlClientProvider>
  )
}
