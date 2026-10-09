import MiniSearch from 'minisearch'
import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const LOCALES = ['en']

function loadOverrides(locale) {
  const overridePath = join(__dirname, '..', 'src', 'i18n', 'calculator-overrides', `${locale}.json`)
  if (!existsSync(overridePath)) return {}
  try {
    return JSON.parse(readFileSync(overridePath, 'utf-8'))
  } catch {
    return {}
  }
}

async function main() {
  const { calculatorRegistry } = await import('@calcuniverse/calculator-registry')

  const outDir = join(__dirname, '..', 'public', 'search-index')
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

  for (const locale of LOCALES) {
    const overrides = locale === 'en' ? {} : loadOverrides(locale)

    const localizedEntries = calculatorRegistry.map(calc => {
      if (locale === 'en') return calc
      const override = overrides[calc.slug]
      if (!override) return calc
      return { ...calc, title: override.title ?? calc.title, description: override.description ?? calc.description }
    })

    const idx = new MiniSearch({
      fields: ['title', 'keywords', 'slug'],
      storeFields: ['slug', 'hubSlug', 'title'],
      idField: 'slug',
      searchOptions: {
        boost: { title: 5, keywords: 3, slug: 2 },
        prefix: true,
        fuzzy: 0.2,
        maxFuzzy: 3,
      },
    })

    idx.addAll(localizedEntries)

    const outPath = join(outDir, `${locale}.json`)
    const json = JSON.stringify(idx)
    writeFileSync(outPath, json, 'utf-8')
    console.log(`✅ Search index written to public/search-index/${locale}.json (${(Buffer.byteLength(json) / 1024).toFixed(1)} KB, ${localizedEntries.length} entries)`)
  }
}

main().catch(err => {
  console.error('❌ Failed to build search index:', err)
  process.exit(1)
})
