import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'

const ROOT = process.cwd()
const MESSAGES_DIR = join(ROOT, 'src', 'i18n', 'messages')
const FRAGMENTS_DIR = join(ROOT, 'src', 'i18n', 'fragments')

const LOCALES = ['en']

function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    const sv = source[key]
    const tv = target[key]
    if (sv && typeof sv === 'object' && !Array.isArray(sv) && tv && typeof tv === 'object' && !Array.isArray(tv)) {
      deepMerge(tv, sv)
    } else {
      target[key] = sv
    }
  }
  return target
}

function countLeaves(o) {
  if (o === null || o === undefined) return 0
  if (typeof o === 'string') return 1
  if (Array.isArray(o)) return o.reduce((n, v) => n + countLeaves(v), 0)
  return Object.values(o).reduce((n, v) => n + countLeaves(v), 0)
}

function collectKeyPaths(o, prefix = '', out = []) {
  for (const [k, v] of Object.entries(o || {})) {
    if (typeof v === 'string') out.push(prefix + k)
    else if (Array.isArray(v)) v.forEach((x, i) => collectKeyPaths(x, prefix + k + '.' + i + '.', out))
    else collectKeyPaths(v, prefix + k + '.', out)
  }
  return out
}

// Gather fragments: {locale: {concern: [frag, ...]}} (multiple per concern merged)
const fragmentsByLocale = {}
if (existsSync(FRAGMENTS_DIR)) {
  for (const concern of readdirSync(FRAGMENTS_DIR)) {
    const concernDir = join(FRAGMENTS_DIR, concern)
    if (!existsSync(concernDir)) continue
    if (statSync(concernDir).isFile()) continue
    for (const file of readdirSync(concernDir)) {
      if (!file.endsWith('.json')) continue
      const locale = file.replace(/\.json$/, '')
      if (!LOCALES.includes(locale)) continue
      const frag = JSON.parse(readFileSync(join(concernDir, file), 'utf8'))
      if (!fragmentsByLocale[locale]) fragmentsByLocale[locale] = {}
      if (!fragmentsByLocale[locale][concern]) fragmentsByLocale[locale][concern] = []
      fragmentsByLocale[locale][concern].push(frag)
    }
  }
}

let report = []
for (const locale of LOCALES) {
  const path = join(MESSAGES_DIR, `${locale}.json`)
  const messages = JSON.parse(readFileSync(path, 'utf8'))
  const frags = fragmentsByLocale[locale] || {}
  const applied = []
  for (const [concern, list] of Object.entries(frags)) {
    for (const frag of list) deepMerge(messages, frag)
    applied.push(`${concern}(${list.length})`)
  }
  if (applied.length) {
    writeFileSync(path, JSON.stringify(messages, null, 2) + '\n', 'utf8')
    report.push(`${locale}: merged [${applied.join(', ')}] (${countLeaves(messages)} leaves)`)
  }
}

console.log(report.join('\n') || 'No fragments found.')

const en = JSON.parse(readFileSync(join(MESSAGES_DIR, 'en.json'), 'utf8'))
let parityFails = 0
for (const locale of LOCALES) {
  if (locale === 'en') continue
  const m = JSON.parse(readFileSync(join(MESSAGES_DIR, `${locale}.json`), 'utf8'))
  const enKeys = collectKeyPaths(en)
  const locKeys = new Set(collectKeyPaths(m))
  const missing = enKeys.filter((k) => !locKeys.has(k))
  if (missing.length) {
    parityFails++
    console.log(`PARITY WARN ${locale}: missing ${missing.length} keys (e.g. ${missing.slice(0, 6).join(', ')})`)
  }
}
if (!parityFails) console.log('Parity OK: every locale contains every EN key.')
console.log('Merge complete.')