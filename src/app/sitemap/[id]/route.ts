import { buildSitemapEntries, sitemapShardIds, sitemapUrlsetXml } from '@/lib/sitemap-data'
import { routing } from '@/i18n/routing'

export const revalidate = 86400

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await context.params
  const id = rawId.replace(/\.xml$/, '')
  // Legacy pre-split shard URLs (/sitemap/en.xml) → first part of the split
  if ((routing.locales as readonly string[]).includes(id)) {
    return new Response(null, {
      status: 301,
      headers: { Location: `/sitemap/${id}-1.xml` },
    })
  }
  if (!sitemapShardIds.includes(id)) {
    return new Response('Not Found', { status: 404 })
  }
  const entries = await buildSitemapEntries(id)
  return new Response(sitemapUrlsetXml(entries), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    },
  })
}

export function generateStaticParams() {
  return sitemapShardIds.map(id => ({ id: `${id}.xml` }))
}