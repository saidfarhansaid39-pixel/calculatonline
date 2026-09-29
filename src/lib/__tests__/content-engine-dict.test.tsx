import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'
import { NextIntlClientProvider, useTranslations } from 'next-intl'
import {
  generateCalculatorContent,
  buildContentEngineDict,
  CONTENT_DICT_KEYS,
  type ContentEngineDict,
} from '../seo/calculator-content-engine'
import { financialCalculators, type CalculatorEntry } from '@calcuniverse/calculator-registry'

const calc401k = financialCalculators.find((c) => c.slug === '401k-calculator') as CalculatorEntry

const loadLocale = (name: string): Record<string, unknown> =>
  JSON.parse(readFileSync(join(process.cwd(), 'src/i18n/messages', `${name}.json`), 'utf8'))

/**
 * Exactly what next-intl's t.raw() hands back for a MISSING key: the key-path
 * string (never undefined). Before the fix these junk values entered the dict
 * and crashed every English calculator page at hydration:
 * "(intermediate value)(intermediate value)(intermediate value).map is not a function"
 */
const junkDict = (): ContentEngineDict =>
  Object.fromEntries(CONTENT_DICT_KEYS.map((k) => [k, `contentEngine.${k}`])) as unknown as ContentEngineDict

describe('generateCalculatorContent with next-intl key-path junk (empty EN contentEngine)', () => {
  it('regression: does not throw the production ".map is not a function" crash', () => {
    let content!: ReturnType<typeof generateCalculatorContent>
    expect(() => {
      content = generateCalculatorContent(calc401k, junkDict())
    }).not.toThrow()
    expect(Array.isArray(content.prosCons.pros)).toBe(true)
    expect(content.prosCons.pros.length).toBeGreaterThan(0)
    expect(content.prosCons.pros.join(' ')).not.toContain('contentEngine.')
    expect(Array.isArray(content.prosCons.cons)).toBe(true)
    expect(content.alternatives.length).toBeGreaterThan(0)
    expect(Array.isArray(content.expertRecommendations)).toBe(true)
    expect(typeof content.whatIs).toBe('string')
  })

  it('regression: no junk key-path strings leak into list sections', () => {
    const content = generateCalculatorContent(calc401k, junkDict())
    for (const list of [content.useCases, content.glossary, content.relatedConcepts, content.relevantAudience]) {
      expect(JSON.stringify(list)).not.toContain('contentEngine.')
    }
  })
})

describe('buildContentEngineDict', () => {
  it('excludes keys the translator does not have, even when raw() returns a fallback string', () => {
    const lookup = { has: () => false, raw: (k: string) => `contentEngine.${k}` }
    expect(buildContentEngineDict(lookup)).toEqual({})
  })

  it('includes all keys present in a real locale namespace (fr.json has 18)', () => {
    const fr = loadLocale('fr').contentEngine as Record<string, unknown>
    const lookup = { has: (k: string) => k in fr, raw: (k: string) => fr[k] }
    const dict = buildContentEngineDict(lookup)
    expect(Object.keys(dict)).toHaveLength(CONTENT_DICT_KEYS.length)
    expect(Array.isArray(dict.pros)).toBe(true)
  })

  it('treats a throwing raw() as absent', () => {
    const lookup = { has: () => true, raw: () => { throw new Error('boom') } }
    expect(buildContentEngineDict(lookup)).toEqual({})
  })

  it('current design: real en.json has no contentEngine overrides (engine generates English natively)', () => {
    const en = loadLocale('en').contentEngine as Record<string, unknown>
    const lookup = { has: (k: string) => k in en, raw: (k: string) => en[k] }
    expect(buildContentEngineDict(lookup)).toEqual({})
  })
})

describe('real locale dicts keep working (no behavior change for non-EN locales)', () => {
  it('uses fr.json contentEngine values instead of the built-in English fallbacks', () => {
    const fr = loadLocale('fr').contentEngine as unknown as ContentEngineDict
    const withFr = generateCalculatorContent(calc401k, fr)
    const withNone = generateCalculatorContent(calc401k, undefined)
    expect(withFr.prosCons.pros).toHaveLength(fr.pros?.length ?? -1)
    expect(withFr.prosCons.cons).toHaveLength(fr.cons?.length ?? -1)
    expect(withFr.prosCons.pros).not.toEqual(withNone.prosCons.pros)
  })
})

describe('next-intl contract + full production chain (why has() is required)', () => {
  it('t.raw returns the key-path string for missing keys — never undefined; has() reports false', () => {
    let t: { has(key: string): boolean; raw(key: string): unknown } | undefined
    function Probe() {
      t = useTranslations('contentEngine')
      return null
    }
    renderToStaticMarkup(
      <NextIntlClientProvider locale="en" messages={{ contentEngine: {} }} timeZone="UTC" onError={() => {}}>
        <Probe />
      </NextIntlClientProvider>,
    )
    expect(t).toBeDefined()
    expect(t!.has('pros')).toBe(false)
    expect(t!.raw('pros')).toBe('contentEngine.pros') // the junk value that used to reach the engine

    // Full chain: empty EN namespace → helper drops everything → engine renders built-ins.
    const dict = buildContentEngineDict(t!)
    expect(dict).toEqual({})
    expect(() => generateCalculatorContent(calc401k, dict)).not.toThrow()
  })
})
