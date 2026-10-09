import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// English-only site (Oct 2026): every URL is English. Legacy /xx/ prefixed
// URLs (including /en/...) are 301-redirected to their English canonicals in
// src/app/[...slug]/page.tsx, which has the registry + slug maps to resolve
// translated slugs. The proxy only tags the locale and sets cache headers.
export default function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-next-intl-locale', 'en')

  const response = NextResponse.next({ request: { headers: requestHeaders } })
  response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
  response.headers.set('Content-Language', 'en')

  return response
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
