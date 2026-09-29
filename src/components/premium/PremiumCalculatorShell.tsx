'use client'

import React, { useState, useMemo, useCallback, useEffect } from 'react'
import Image from 'next/image'
import {
  Calculator, History, RotateCcw, RefreshCw, Plus, Save, Scissors, Trash2,
  Copy, Share2, Printer, DownloadCloud, FileSpreadsheet, FileText, CopyCheck,
  TrendingUp, BarChart3, LineChart, PieChart, BarChart, Activity, Network, GitBranch, Table2, Layers,
  Info, CheckCircle2, X, Check, ExternalLink, ThumbsUp,
  Eye, EyeOff, Lightbulb, Target, Brain, Zap, Sparkles, Edit3, Flag, BookOpen, Sliders,
  Moon, Clock, ClipboardList, HardHat, Globe, Linkedin,
  DollarSign, Droplet, Leaf, Microscope, Dumbbell, Atom, GraduationCap, Ruler,
  Heart, Gauge, ChevronUp, ChevronDown, AlertTriangle
} from 'lucide-react'
import { SchemaMarkup, calculatorSchema, faqSchema, howToSchema, breadcrumbListSchema } from '@/components/SchemaMarkup'
import { buildContentEngineDict, generateCalculatorContent, longFormArticlesReady, type ContentEngineDict } from '@/lib/seo/calculator-content-engine'
import { InformationalSection } from '@/components/content/InformationalSection'
import { CommercialSection } from '@/components/content/CommercialSection'
import { NavigationalSection } from '@/components/content/NavigationalSection'
import { ResultTabs } from '@/components/premium/ResultTabs'
import { ScenarioComparison } from '@/components/premium/ScenarioComparison'
import { CalculationHistory } from '@/components/premium/CalculationHistory'
import { BatchCalculator } from '@/components/premium/BatchCalculator'
import { useCalculatorHistory } from '@/lib/hooks/useCalculatorHistory'
import { generateExplanation } from '@/lib/seo/result-explanation'
import { generateAIExplanation } from '@/lib/seo/ai-explanation'
import type { CalculatorEntry } from '@calcuniverse/calculator-registry'
import { calculatorRegistry } from '@calcuniverse/calculator-registry'
import { CalculatorModeToggle, type CalcMode } from '@/components/premium/CalculatorModeToggle'
import { CalculatorModeProvider } from '@/lib/context/CalculatorModeContext'
import { useAuth } from '@/components/auth/useAuth'
import { CalculatorLayout } from '@/components/CalculatorLayout'
import { InternationalizationPanel } from '@/components/premium/InternationalizationPanel'
import { ExportShareSection } from '@/components/premium/ExportShareSection'
import { EnhancedResultExplanation } from '@/components/premium/EnhancedResultExplanation'
import { DynamicFormulaChart as FormulaChart, DynamicConceptDiagram as ConceptDiagram, DynamicProcessFlowChart as ProcessFlowChart } from '@/components/premium/DynamicCharts'
import { DynamicExampleChartGenerator as ExampleChartGenerator } from '@/components/premium/DynamicCharts'
import { InternalLinkingGrid } from '@/components/premium/InternalLinkingGrid'
import { QualityAuditScore, generateAuditScores } from '@/components/premium/QualityAuditScore'
import { ActionToolbar } from '@/components/premium/ActionToolbar'
import { ExtraFieldInjector } from '@/components/premium/ExtraFieldInjector'
import { ExtraFieldAdjustments } from '@/components/premium/ExtraFieldAdjustments'
import { RangeVisualizer } from '@/components/premium/RangeVisualizer'
import { RelatedCalculatorCarousel } from '@/components/premium/RelatedCalculatorCarousel'
import { VisualPresetCards } from '@/components/premium/VisualPresetCards'
import { ResultQualityBadge } from '@/components/premium/ResultQualityBadge'
import { InputRangeValidator } from '@/components/premium/InputRangeValidator'
import { getQualityInfo, getInputRanges } from '@/lib/quality/calculator-quality'
import { getRangeConfig } from '@/lib/range-visualizer-config'
import { getExtraFieldsForCalculator } from '@/lib/extra-field-pools'
import { getHubTheme } from '@/lib/hub-themes'
import { ExtraFieldsProvider } from '@/lib/context/ExtraFieldsContext'
import { CurrencyProvider } from '@/lib/context/CurrencyContext'
import { useAutoSave } from '@/lib/hooks/useAutoSave'
import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/lib/navigation'
import { getLocalizedCalculator } from '@/lib/localized-registry'

import { CalculatorRating } from '@/components/rating/CalculatorRating'
import { MultiTermComparison } from '@/components/premium/MultiTermComparison'
import { CalculatorIntro } from '@/components/premium/CalculatorIntro'
import { CalculatorErrorBoundary, CalculatorEmptyState, CalculatorLoadingSkeleton } from '@/components/premium/CalculatorStates'
import { generateCalculatorFAQ } from '@/lib/seo/per-calculator-content'
import type { Currency, MeasurementSystem } from '@/lib/i18n/calculator-i18n'
import { formatNumber, localeToCountry, localeToCurrency, countryConfigs } from '@/lib/i18n/calculator-i18n'

export type UnitSystem = 'metric' | 'imperial' | 'us'

export interface Scenario {
  id: string
  label: string
  snapshot: string
  mainValue?: number
}

export interface Preset {
  label: string
  values: Record<string, string>
}

export interface Author {
  name: string
  title: string
  credential?: string
  photoUrl?: string
  linkedIn?: string
}

export interface Reference {
  label: string
  url: string
}

export interface ExampleStep {
  label: string
  value: string
}

interface Benchmark {
  label: string
  value: string
  isGood?: boolean
}

interface NextAction {
  label: string
  description: string
  priority?: 'high' | 'medium' | 'low'
}

interface OptimizationSuggestion {
  label: string
  impact: string
  effort: 'low' | 'medium' | 'high'
}

interface DetailedExplanation {
  whatItMeans?: string
  whyItMatters?: string
  whatAffectsIt?: string[]
  howToImprove?: string[]
  detailedSections?: { title: string; content: string }[]
}

interface EnhancedExplanation {
  goodRange?: { min: number; max: number }
  benchmarks?: Benchmark[]
  nextActions?: NextAction[]
  optimizations?: OptimizationSuggestion[]
  warnings?: string[]
  resultInsights?: string[]
  detailedExplanation?: DetailedExplanation
}

interface FormulaVariable {
  name: string
  value: number
  min: number
  max: number
}

interface ConceptNode { id: string; label: string; x: number; y: number; color?: string }
interface ConceptEdge { from: string; to: string; label?: string }
interface ProcessStep { label: string; description: string; icon?: string }

interface ExampleItem {
  label: string
  inputs: Record<string, string>
  output: string
  outputLabel?: string
  chartData?: { name: string; value: number }[]
  steps?: { label: string; value: string }[]
}

export interface PremiumCalculatorShellProps {
  calculator: {
    slug: string
    title: string
    description: string
    tier: string
    category: string
    hubSlug: string
    hubName: string
    keywords: string[]
    dataDependent?: boolean
    dataRefreshCadence?: string
  }
  form: React.ReactNode
  result: React.ReactNode
  unitSystem?: UnitSystem
  onUnitChange?: (unit: UnitSystem) => void
  presets?: Preset[]
  onPresetApply?: (preset: Preset) => void
  scenarioLabel?: string
  onSaveScenario?: () => string
  onExportCSV?: () => string
  extraActions?: React.ReactNode
  formula?: string
  steps?: { label: string; value: string }[]
  interpretation?: string
  author?: Author
  reviewer?: Author
  references?: Reference[]
  example?: ExampleStep[]
  userCount?: number
  onReset?: () => void
  lockedFields?: Set<string>
  copyResultText?: string
  inputs?: Record<string, string>
  charts?: React.ReactNode
  breakdown?: React.ReactNode
  schedule?: React.ReactNode
  showTabs?: boolean
  useSlider?: boolean
  onToggleSlider?: () => void
  explanation?: { summary: string; details: string[]; tips: string[] }
  subCalcs?: React.ReactNode
  hubCategory?: string
  mainValue?: number
  mode?: CalcMode
  onModeChange?: (mode: CalcMode) => void
  enhancedExplanation?: EnhancedExplanation
  formulaVariables?: FormulaVariable[]
  conceptNodes?: ConceptNode[]
  conceptEdges?: ConceptEdge[]
  processSteps?: ProcessStep[]
  examples?: { beginner: ExampleItem; typical: ExampleItem; advanced: ExampleItem; realworld?: ExampleItem }
  exampleChartType?: 'bar' | 'line' | 'pie'
  country?: string
  currency?: Currency
  measurementSystem?: MeasurementSystem
  onCountryChange?: (country: string) => void
  onCurrencyChange?: (currency: Currency) => void
  onMeasurementSystemChange?: (system: MeasurementSystem) => void
  onExtraFieldsChange?: (values: Record<string, string>) => void
  rangeVisualizer?: React.ReactNode
  onRestoreValues?: (values: Record<string, string>) => void
  onCalculate?: () => void
  calculatorType?: string
  onSaveCalculation?: () => void
}

const hubIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  financial: DollarSign,
  health: Heart,
  math: Calculator,
  construction: HardHat,
  engineering: Gauge,
  'date-time': Clock,
  everyday: Globe,
  conversion: Ruler,
  statistics: Activity,
  education: GraduationCap,
  physics: Atom,
  chemistry: Atom,
  food: Heart,
  biology: Atom,
  ecology: Activity,
  sports: TrendingUp,
}

const unitOptions: { value: UnitSystem; label: string }[] = []



function BreadcrumbNav({ items, accent }: { items: { label: string; href: string }[]; accent?: string }) {
  return (
    <nav aria-label="breadcrumb" className="mb-4">
      <ol className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && (
              <svg className="w-3 h-3 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            )}
            {i < items.length - 1 ? (
              <Link
                href={item.href}
                className="hover:text-primary dark:hover:text-primary transition-colors"
                style={accent && i === 1 ? { color: accent, fontWeight: 500 } : undefined}
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-600 dark:text-gray-300 font-medium" aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

function AuthorCard({ author, label }: { author: Author; label: string }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
      {author.photoUrl ? (
        <Image src={author.photoUrl} alt={author.name} width={40} height={40} loading="lazy" decoding="async" className="w-10 h-10 rounded-full object-cover shrink-0" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-[#1a3a8a]/10 flex items-center justify-center text-[#06b6d4] font-bold text-sm shrink-0">
          {author.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-900 dark:text-white">{author.name}</p>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          {author.credential && <span>{author.credential}</span>}
          {author.title && <span>· {author.title}</span>}
          {author.linkedIn && (
            <a href={author.linkedIn} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-[#06b6d4] hover:underline">
              <Linkedin className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export function PremiumCalculatorShell({
  calculator, form, result, unitSystem, onUnitChange, presets, onPresetApply,
  scenarioLabel, onSaveScenario, onExportCSV, extraActions,
  formula, steps, interpretation, author, reviewer, references, example, userCount, onReset, copyResultText,
  inputs, charts, breakdown, schedule, showTabs, useSlider, onToggleSlider,
  explanation: explanationProp, subCalcs, hubCategory, mainValue,
  mode: modeProp, onModeChange,
  enhancedExplanation: enhancedExplanationProp,
  formulaVariables, conceptNodes, conceptEdges, processSteps,
  examples, exampleChartType,
  country: countryProp, currency: currencyProp, measurementSystem: measurementSystemProp,
  onCountryChange, onCurrencyChange, onMeasurementSystemChange,
  onExtraFieldsChange,
  rangeVisualizer,
  onRestoreValues,
  onCalculate,
  calculatorType,
  onSaveCalculation,
}: PremiumCalculatorShellProps) {
  const locale = useLocale()
  const t = useTranslations('calculatorUI')
  const th = useTranslations('hubs')
  const tce = useTranslations('contentEngine')
  // Localized hub name for breadcrumbs + structured data (falls back to registry English)
  const hubName = th(calculator.hubSlug as any) || calculator.hubName
  const siteUrl = locale === 'en' ? 'https://www.calculat.online' : `https://www.calculat.online/${locale}`
  const { user: authUser } = useAuth()
  const unitOptions = useMemo(() => [
    { value: 'metric' as UnitSystem, label: t('shell.unitMetric') },
    { value: 'imperial' as UnitSystem, label: t('shell.unitImperial') },
    { value: 'us' as UnitSystem, label: t('shell.unitUS') },
  ], [t])
  const [showContent, setShowContent] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [copied, setCopied] = useState(false)
  const [resultCopied, setResultCopied] = useState(false)
  const [feedback, setFeedback] = useState<'yes' | 'no' | null>(null)
  const [showToC, setShowToC] = useState(false)
  const [loading, setLoading] = useState(true)
  const [calcError, setCalcError] = useState<string | null>(null)
  const [extraFieldValues, setExtraFieldValues] = useState<Record<string, string>>({})
  const shareUrl = useMemo(() => {
    if (typeof window !== 'undefined') return window.location.href
    return `${siteUrl}/${calculator.hubSlug}/${calculator.slug}`
  }, [calculator.hubSlug, calculator.slug, siteUrl])

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(timer)
  }, [])

  React.useEffect(() => {
    try {
      const hasInputs = inputs && Object.keys(inputs).length > 0
      if (hasInputs && result === null) {
        setCalcError(t('shell.noResultAvailable'))
      } else {
        setCalcError(null)
      }
    } catch (e) {
      setCalcError(e instanceof Error ? e.message : t('shell.calculationFailed'))
    }
  }, [result, inputs])
  const [mode, setMode] = useState<CalcMode>(modeProp || 'basic')
  const modeLevel = useMemo(() => {
    const levels: Record<CalcMode, number> = { basic: 0, advanced: 1, professional: 2, expert: 3 }
    return levels[mode] || 0
  }, [mode])
  const [country, setCountry] = useState(countryProp || localeToCountry(locale))
  const [currency, setCurrency] = useState<Currency>(currencyProp || localeToCurrency(locale))
  const [measSystem, setMeasSystem] = useState<MeasurementSystem>(measurementSystemProp || countryConfigs[countryProp || localeToCountry(locale)]?.measurement || 'metric')
  const [showAudit, setShowAudit] = useState(false)
  const [showBatch, setShowBatch] = useState(false)
  const [showRestore, setShowRestore] = useState(false)
  const [restoreDismissed, setRestoreDismissed] = useState(false)
  const [copiedValue, setCopiedValue] = useState<string | null>(null)
  const { history, addEntry, removeEntry, clearHistory, showHistory, setShowHistory, exportCSV, searchQuery, setSearchQuery, clearConfirm, setClearConfirm, calcStats } = useCalculatorHistory(calculator.slug, calculator.title)
  const calcRootRef = React.useRef<HTMLDivElement>(null)
  const autoSave = useAutoSave({ slug: calculator.slug })
  const FORM_HISTORY_MAX = 10
  const [formHistory, setFormHistory] = useState<Record<string, string>[]>([])
  const [formHistoryIndex, setFormHistoryIndex] = useState(-1)
  const prevInputsRef = React.useRef<Record<string, string> | undefined>(undefined)
  const skipTrackingRef = React.useRef(false)
  React.useEffect(() => {
    if (!inputs || skipTrackingRef.current) {
      skipTrackingRef.current = false
      if (!inputs) prevInputsRef.current = undefined
      return
    }
    if (prevInputsRef.current === inputs) return
    prevInputsRef.current = inputs
    setFormHistory(prev => {
      const next = prev.slice(0, Math.max(formHistoryIndex + 1, 0))
      next.push({ ...inputs })
      if (next.length > FORM_HISTORY_MAX) next.shift()
      return next
    })
    setFormHistoryIndex(prev => Math.min(prev + 1, FORM_HISTORY_MAX - 1))
  }, [inputs, formHistoryIndex])
  const hasInputs = inputs && Object.keys(inputs).length > 0

  useEffect(() => {
    if (hasInputs) autoSave.save(inputs!)
  }, [inputs, hasInputs, autoSave.save])

  useEffect(() => {
    if (!restoreDismissed && !hasInputs && autoSave.hasSavedData) {
      setShowRestore(true)
    } else {
      setShowRestore(false)
    }
  }, [restoreDismissed, hasInputs, autoSave.hasSavedData])
  const tier = calculator.tier as 'tier1' | 'tier2' | 'tier3'
  const isMortgageOrLoan = calculatorType === 'mortgage' || calculatorType === 'loan'
  const [reloadKey, setReloadKey] = useState(0)

  const autoRangeConfig = useMemo(() => {
    if (mainValue === undefined || mainValue === null) return null
    return getRangeConfig(calculator.slug, mainValue, inputs)
  }, [calculator.slug, mainValue, inputs])

  const handleReload = useCallback(() => {
    const saved = autoSave.restore()
    if (saved && onRestoreValues) {
      onRestoreValues(saved)
      setShowRestore(false)
      setRestoreDismissed(false)
      setReloadKey(k => k + 1)
    }
  }, [autoSave, onRestoreValues])

  const handleModeChange = useCallback((newMode: CalcMode) => {
    setMode(newMode)
    onModeChange?.(newMode)
  }, [onModeChange])

  const handleCountryChange = useCallback((c: string) => {
    setCountry(c)
    onCountryChange?.(c)
  }, [onCountryChange])

  const handleCurrencyChange = useCallback((c: Currency) => {
    setCurrency(c)
    onCurrencyChange?.(c)
  }, [onCurrencyChange])

  const handleMeasurementChange = useCallback((s: MeasurementSystem) => {
    setMeasSystem(s)
    onMeasurementSystemChange?.(s)
  }, [onMeasurementSystemChange])

  React.useEffect(() => {
    onExtraFieldsChange?.(extraFieldValues)
  }, [extraFieldValues, onExtraFieldsChange])

  const tierFeatures = useMemo(() => {
    switch (tier) {
      case 'tier3':
        return { charts: true, comparison: true, educational: true, export: true, print: true, modes: true, i18n: true, audit: true, examples: true, eduCharts: true }
      case 'tier2':
        return { charts: true, comparison: true, educational: true, export: true, print: true, modes: true, i18n: true, audit: true, examples: true, eduCharts: true }
      default:
        return { charts: true, comparison: true, educational: true, export: true, print: true, modes: true, i18n: true, audit: true, examples: true, eduCharts: true }
    }
  }, [tier])

  const availableModes = useMemo((): CalcMode[] => {
    const modes: CalcMode[] = ['basic']
    const hasAdvanced = showTabs || !!formula || (steps && steps.length > 0) || !!interpretation || !!explanationProp || (example && example.length > 0)
    const hasProfessional = (tierFeatures.eduCharts && (!!formulaVariables || (conceptNodes && conceptNodes.length > 0) || (processSteps && processSteps.length > 0))) || (tierFeatures.examples && !!examples) || !!enhancedExplanationProp
    const hasExpert = tierFeatures.comparison || tierFeatures.audit
    if (hasAdvanced) modes.push('advanced')
    if (hasProfessional) modes.push('professional')
    if (hasExpert) modes.push('expert')
    return modes
  }, [showTabs, formula, steps, interpretation, explanationProp, example, tierFeatures, formulaVariables, conceptNodes, processSteps, examples, enhancedExplanationProp])

  useEffect(() => {
    if (!availableModes.includes(mode)) {
      setMode(availableModes[availableModes.length - 1] || 'basic')
    }
  }, [availableModes, mode])

  const explanation = useMemo(() => {
    if (explanationProp) return explanationProp
    if (hubCategory && mainValue !== undefined && inputs) {
      const parsedInputs: Record<string, number> = {}
      Object.entries(inputs).forEach(([k, v]) => { const n = parseFloat(v); if (!isNaN(n)) parsedInputs[k] = n })
      return generateExplanation(hubCategory, calculator.slug, mainValue, parsedInputs)
    }
    return null
  }, [explanationProp, hubCategory, mainValue, inputs, calculator.slug])

  const [articleTick, setArticleTick] = useState(0)
  useEffect(() => {
    longFormArticlesReady.then(() => setArticleTick(t => t + 1))
  }, [])

  const relatedSlugs = useMemo(() => {
    try {
      return calculatorRegistry
        .filter((entry: { slug: string; category: string }) => entry.slug !== calculator.slug && entry.category === calculator.category)
        .slice(0, 8)
        .map(entry => entry.slug)
    } catch { return [] }
  }, [calculator.slug, calculator.category])
  const [relatedCalculators, setRelatedCalculators] = useState<CalculatorEntry[]>(() =>
    calculatorRegistry
      .filter((entry: { slug: string; category: string }) => entry.slug !== calculator.slug && entry.category === calculator.category)
      .slice(0, 8)
  )
  useEffect(() => {
    (async () => {
      const entries = await Promise.all(
        relatedSlugs.map(async slug => {
          const localized = await getLocalizedCalculator(slug, locale)
          return localized ?? calculatorRegistry.find(c => c.slug === slug)!
        })
      )
      setRelatedCalculators(entries.filter(Boolean) as CalculatorEntry[])
    })()
  }, [relatedSlugs, locale])

  const calcContent = useMemo(() => {
    let dict: ContentEngineDict | undefined
    try {
      // buildContentEngineDict keeps only keys the translator actually has: t.raw()
      // returns the key-path string for missing keys, which would otherwise crash
      // the engine on EN pages (whose contentEngine namespace is intentionally empty).
      const d = buildContentEngineDict(tce)
      if (Object.keys(d).length > 0) dict = d
    } catch { dict = undefined }
    return generateCalculatorContent({
      ...calculator,
      category: calculator.category as CalculatorEntry['category'],
    } as CalculatorEntry, dict)
  }, [calculator, articleTick, tce, locale])

  const HubIcon = hubIcons[calculator.category] || Zap
  const hubTheme = getHubTheme(calculator.hubSlug || calculator.category)

  const handleCopyResult = useCallback(async () => {
    const text = copyResultText || (() => {
      const lines: string[] = [calculator.title]
      if (inputs) Object.entries(inputs).forEach(([k, v]) => lines.push(`${k}: ${v}`))
      return lines.join('\n')
    })()
    try {
      await navigator.clipboard.writeText(text)
      setResultCopied(true)
      setTimeout(() => setResultCopied(false), 2000)
    } catch { /* fallback */ }
  }, [copyResultText, calculator.title, inputs])

  const handleCopyValue = useCallback(async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedValue(label)
      setTimeout(() => setCopiedValue(null), 2000)
    } catch { /* fallback */ }
  }, [])

  const resultLabel = useMemo(() => {
    if (copyResultText) return copyResultText
    if (mainValue !== undefined && !isNaN(mainValue)) return formatNumber(mainValue, locale)
    return undefined
  }, [copyResultText, mainValue, locale])

  const handleSaveScenario = useCallback(() => {
    if (onSaveScenario) {
      const snapshot = onSaveScenario()
      const label = scenarioLabel || t('premium.shell.scenario', { count: scenarios.length + 1 })
      setScenarios(prev => [...prev, { id: crypto.randomUUID(), label, snapshot, mainValue }])
    }
    if (inputs) {
      addEntry(inputs, resultLabel)
    }
  }, [onSaveScenario, scenarioLabel, scenarios.length, inputs, addEntry, mainValue, resultLabel, t])

  const lastAutoSaveRef = React.useRef<string>('')
  useEffect(() => {
    if (!hasInputs || result === null || calcError) return
    const signature = JSON.stringify(inputs) + '|' + (resultLabel ?? '')
    if (lastAutoSaveRef.current === signature) return
    const timer = setTimeout(() => {
      lastAutoSaveRef.current = signature
      addEntry(inputs!, resultLabel)
    }, 800)
    return () => clearTimeout(timer)
  }, [inputs, hasInputs, result, calcError, resultLabel, addEntry])

  const removeScenario = useCallback((id: string) => {
    setScenarios(prev => prev.filter(s => s.id !== id))
  }, [])

  const handleCalculate = useCallback(() => {
    if (onCalculate) {
      onCalculate()
      return
    }
    const root = calcRootRef.current
    if (!root) return
    const form = root.querySelector('form')
    if (form) {
      (form as HTMLFormElement).requestSubmit?.()
      return
    }
    const trigger = root.querySelector<HTMLButtonElement>('[data-calculate-trigger]')
    trigger?.click()
  }, [onCalculate])

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.key === 'Enter' && (e.ctrlKey || e.metaKey))) {
        e.preventDefault()
        handleCalculate()
      }
      if (e.key === 'Escape') {
        const active = document.activeElement as HTMLElement | null
        if (active && active !== document.body) active.blur()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault()
        skipTrackingRef.current = true
        if (e.shiftKey) {
          if (formHistoryIndex < formHistory.length - 1) {
            const nextIdx = formHistoryIndex + 1
            setFormHistoryIndex(nextIdx)
            onRestoreValues?.(formHistory[nextIdx])
          }
        } else {
          if (formHistoryIndex > 0) {
            const prevIdx = formHistoryIndex - 1
            setFormHistoryIndex(prevIdx)
            onRestoreValues?.(formHistory[prevIdx])
          }
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleCalculate, formHistory, formHistoryIndex, onRestoreValues])

  const generatedFAQs = generateCalculatorFAQ(calculator.slug, calculator.category)
  const faqs = generatedFAQs.length > 0 ? generatedFAQs.map(f => ({ q: f.question, a: f.answer })) : (() => {
    const cat = calculator.category;
    const catKey = cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, '');
    const result: { q: string; a: string }[] = [];
    for (let i = 0; i < 4; i++) {
      const qk = 'shell.faq' + catKey + 'Q' + i;
      const ak = 'shell.faq' + catKey + 'A' + i;
      const q = t(qk);
      const a = t(ak);
      if (q && a && q !== qk && a !== ak) {
        result.push({ q, a });
      }
    }
    return result;
  })()

  const hasLongContent = interpretation || faqs.length > 0 || (calculator.keywords.length > 0)

  const tocSections = [
    ...(interpretation ? [{ id: 'what-this-means', label: t('shell.headingWhatThisMeans') }] : []),
    ...(formula || (steps && steps.length > 0) ? [{ id: 'formula', label: t('premium.shell.tocFormulaCalculation') }] : []),
    ...(example && example.length > 0 ? [{ id: 'example', label: t('shell.tocExample') }] : []),
    ...(calcContent.useCases.length > 0 ? [{ id: 'use-cases', label: t('shell.tocUseCases') }] : []),
    ...(calcContent.commonMistakes.length > 0 ? [{ id: 'common-mistakes', label: t('shell.tocCommonMistakes') }] : []),
    ...(calcContent.comparisons.length > 0 ? [{ id: 'comparison-0', label: t('shell.tocComparison') }] : []),
    ...(calcContent.glossary.length > 0 ? [{ id: 'glossary', label: t('shell.tocGlossary') }] : []),
    ...(calcContent.longFormArticle && calcContent.longFormArticle.length > 0 ? [{ id: 'educational-guide', label: t('shell.tocCompleteGuide') }] : []),
    { id: 'guide', label: t('shell.tocEducationalGuide') },
    ...(faqs.length > 0 ? [{ id: 'faq', label: t('shell.tocFAQ') }] : []),
  ]
  const schemaFaqs = faqs.map(f => ({ question: f.q, answer: f.a }))

  const howItWorksKey = 'howItWorks' + calculator.category.charAt(0).toUpperCase() + calculator.category.slice(1).replace(/-/g, '')
  const whatIsExtraKey = 'whatIsExtra' + calculator.category.charAt(0).toUpperCase() + calculator.category.slice(1).replace(/-/g, '')

  return (
    <CalculatorLayout
      title={calculator.title}
      breadcrumbs={[
        { label: t('shell.home'), href: '/' },
        { label: hubName, href: `/${calculator.hubSlug}` },
        { label: calculator.title, href: `/${calculator.hubSlug}/${calculator.slug}` },
      ]}
    >
      <div className="space-y-6 pb-24 sm:pb-0" style={{ '--hub-accent': hubTheme.accent } as React.CSSProperties}>
        <BreadcrumbNav accent={hubTheme.accent} items={[
          { label: t('shell.home'), href: '/' },
          { label: hubName, href: `/${calculator.hubSlug}` },
          { label: calculator.title, href: `/${calculator.hubSlug}/${calculator.slug}` },
        ]} />

        <CalculatorIntro
          title={calculator.title}
          description={calculator.description}
          category={calculator.category}
        />

        {/* Table of Contents */}
        {tocSections.length > 1 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
            <button onClick={() => setShowToC(!showToC)} className="flex items-center justify-between w-full text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('shell.onThisPage')}
              {showToC ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showToC && (
              <nav className="mt-3 space-y-1">
                {tocSections.map(s => (
                  <a key={s.id} href={`#${s.id}`} onClick={() => setShowToC(false)}
                    className="block text-sm text-gray-500 dark:text-gray-400 hover:text-[#06b6d4] transition-colors py-0.5">
                    {s.label}
                  </a>
                ))}
              </nav>
            )}
          </div>
        )}

        {/* Calculator Engine */}
        <CalculatorErrorBoundary>
        {loading ? <CalculatorLoadingSkeleton /> : calcError ? (
          <div
            role="alert"
            className="bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-200 dark:border-red-900/30 p-4 sm:p-6 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500 dark:text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-red-700 dark:text-red-300">
                  {t('shell.pleaseCheckInputs')}
                </h3>
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {calcError}
                </p>
              </div>
            </div>
          </div>
        ) : (
        <CalculatorModeProvider mode={mode}>
        <CurrencyProvider country={country} currency={currency}>
        <div id="calculator" ref={calcRootRef} className="card-handcrafted p-4 sm:p-6">
          {/* Calculator Mode Toggle */}
          {tierFeatures.modes && (
            <div className="mb-6">
              <div className="flex items-center justify-between flex-wrap gap-x-3 gap-y-2">
                <div className="flex items-center gap-3 min-w-0">
                  <CalculatorModeToggle mode={mode} onChange={handleModeChange} availableModes={availableModes} />
                  <span className="hidden sm:inline text-xs text-gray-400 dark:text-gray-500">
                    {mode === 'basic' && t('shell.modeBasic')}
                    {mode === 'advanced' && t('shell.modeAdvanced')}
                    {mode === 'professional' && t('shell.modeProfessional')}
                    {mode === 'expert' && t('shell.modeExpert')}
                  </span>
                </div>
                {tierFeatures.i18n && (
                  <InternationalizationPanel
                    country={country} currency={currency} measurement={measSystem}
                    onCountryChange={handleCountryChange} onCurrencyChange={handleCurrencyChange}
                    onMeasurementChange={handleMeasurementChange}
                  />
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2 lg:gap-6">
            <div className="space-y-4 max-w-full overflow-x-auto">
              <ExtraFieldsProvider extraFields={extraFieldValues}>
              <ExtraFieldInjector
                slug={calculator.slug}
                hubSlug={calculator.hubSlug}
                extraFields={getExtraFieldsForCalculator(calculator.slug, calculator.hubSlug)}
                onFieldsChange={setExtraFieldValues}
              >
                {form}
              </ExtraFieldInjector>
              </ExtraFieldsProvider>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 sm:p-6 flex flex-col justify-center max-w-full overflow-x-auto min-h-[180px]">
              {showTabs && modeLevel >= 1 ? (
                <ResultTabs
                  mainResult={result}
                  charts={charts}
                  breakdown={breakdown}
                  schedule={schedule}
                  inputs={inputs}
                  slug={calculator.slug}
                />
              ) : (
                <div className="space-y-3">
                  {result}
                  <ResultQualityBadge quality={getQualityInfo(calculator.slug, calculator.category)} />
                  <InputRangeValidator ranges={getInputRanges(calculator.slug) || {}} inputs={inputs} />
                </div>
              )}
            </div>
          </div>

          {isMortgageOrLoan && inputs && Object.keys(inputs).length > 0 && (
            <MultiTermComparison
              calculatorType={calculatorType || calculator.slug}
              inputs={inputs}
              currentTerm={inputs?.term ? parseInt(inputs.term) : undefined}
            />
          )}

          {charts && !(showTabs && modeLevel >= 1) && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm">
              {charts}
            </div>
          )}

          {/* Range Visualizer */}
          {rangeVisualizer && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm">
              {rangeVisualizer}
            </div>
          )}
          {!rangeVisualizer && autoRangeConfig && mainValue !== undefined && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm">
              <RangeVisualizer
                value={mainValue}
                ranges={autoRangeConfig.ranges}
                label={autoRangeConfig.label}
                formatValue={autoRangeConfig.formatValue}
              />
            </div>
          )}

          {/* Restore saved values banner */}
          {showRestore && onRestoreValues && (
            <div className="flex items-center justify-between gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl text-sm">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                <RefreshCw className="w-4 h-4 shrink-0" />
                <span>{t('shell.restorePreviousValues')}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    const saved = autoSave.restore()
                    if (saved && onRestoreValues) { onRestoreValues(saved) }
                    setShowRestore(false)
                  }}
                  className="px-3 py-1.5 text-xs font-medium bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors min-h-[44px]"
                >
                  {t('shell.restore')}
                </button>
                <button
                  onClick={() => { setRestoreDismissed(true); autoSave.clear() }}
                  className="px-3 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-800/30 rounded-lg transition-colors min-h-[44px]"
                >
                  {t('shell.dismiss')}
                </button>
              </div>
            </div>
          )}

          {/* Extra Field Adjustments */}
          {Object.keys(extraFieldValues).length > 0 && mainValue !== undefined && (
            <ExtraFieldAdjustments
              hubSlug={calculator.hubSlug}
              mainValue={mainValue}
              extraFields={extraFieldValues}
            />
          )}

          {/* Presets */}
          {presets && presets.length > 0 && onPresetApply && (
            <div className="mt-4">
              <VisualPresetCards presets={presets} onApply={onPresetApply} />
            </div>
          )}

          {/* Tier action bar */}
          {(tierFeatures.export || tierFeatures.comparison || onUnitChange || extraActions || onReset || onToggleSlider || (onSaveCalculation && authUser)) && (
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
              {onSaveCalculation && authUser && (
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={onSaveCalculation}
                    className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-br from-[#1a3a8a] to-[#06b6d4] text-white shadow-md hover:opacity-90 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    {t('shell.saveCalculation')}
                  </button>
                </div>
              )}
              <ActionToolbar
                onReset={onReset}
                onReload={autoSave.hasSavedData ? handleReload : undefined}
                onUnitChange={onUnitChange as ((unit: string) => void) | undefined}
                unitOptions={unitOptions}
                unitSystem={unitSystem}
                onToggleSlider={onToggleSlider}
                useSlider={useSlider}
                onCopyResult={(copyResultText || inputs) ? handleCopyResult : undefined}
                copyResultText={t('shell.copyResult')}
                onSaveScenario={onSaveScenario ? handleSaveScenario : undefined}
                modeLevel={modeLevel}
                tierFeatures={tierFeatures}
                showBatch={showBatch}
                onToggleBatch={setShowBatch}
                extraActions={extraActions}
              />
            </div>
          )}

          {/* Scenario comparison (Expert+) */}
          {modeLevel >= 3 && tierFeatures.comparison && (
            <ScenarioComparison
              scenarios={scenarios.map(s => ({
                ...s,
                inputs: Object.fromEntries(s.snapshot.split('\n').filter(Boolean).map(l => {
                  const [k, ...v] = l.split(': ')
                  return [k, v.join(': ')]
                })),
                mainValue: s.mainValue,
              }))}
              mainValueLabel={calculator.title}
              onRemove={removeScenario}
              onApply={(vals) => {
                if (onRestoreValues) {
                  onRestoreValues(vals)
                } else {
                  for (const [key, val] of Object.entries(vals)) {
                    try { (document.querySelector(`[name="${key}"]`) as HTMLInputElement)?.focus() } catch {}
                  }
                }
              }}
              onSave={handleSaveScenario}
              scenarioLabel={scenarioLabel}
            />
          )}
          </div>
        </CurrencyProvider>
        </CalculatorModeProvider>
        )}
        </CalculatorErrorBoundary>

        {/* Export & Share — unified section directly below the calculator panel */}
        {tierFeatures.export && (
          <ExportShareSection
            slug={calculator.slug}
            title={calculator.title}
            description={calculator.description}
            hubSlug={calculator.hubSlug}
            category={calculator.category}
            inputs={inputs}
            resultSummary={copyResultText}
            steps={steps}
            resultValue={copyResultText}
            shareUrl={shareUrl}
            onExportCSV={onExportCSV}
          />
        )}

        {/* Calculation History */}
          {/* Batch Calculator (Expert+) */}
          {modeLevel >= 3 && tierFeatures.comparison && (
            <BatchCalculator
            title={calculator.title}
            fields={[{ name: 'value1', label: `${t('premium.batch.value')} 1`, type: 'number' }, { name: 'value2', label: `${t('premium.batch.value')} 2`, type: 'number' }]}
            onCalculate={(rows) => rows.map(() => [{ label: t('premium.batch.result'), value: '—' }])}
            show={showBatch}
            onToggle={() => setShowBatch(!showBatch)}
          />
        )}

        {inputs && (
          <CalculationHistory
            entries={history}
            onApply={(vals) => {
              if (onRestoreValues) {
                onRestoreValues(vals)
              } else {
                const inputsEl = document.querySelector('[name]')
                if (inputsEl) inputsEl.closest('form')?.requestSubmit?.()
              }
            }}
            onRemove={removeEntry}
            onClear={clearHistory}
            onExportCSV={exportCSV}
            show={showHistory}
            onToggle={() => setShowHistory(!showHistory)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            clearConfirm={clearConfirm}
            onClearConfirm={setClearConfirm}
            calcStats={calcStats}
          />
        )}

        {/* Data dependent notice */}
        {calculator.dataDependent && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 text-sm text-amber-800 dark:text-amber-200">
            <strong>{t('shell.dataDependent')}</strong> {t('shell.dataDependentDescription')}
            {calculator.dataRefreshCadence && <span> {t('shell.refreshCadence')} {calculator.dataRefreshCadence}.</span>}
          </div>
        )}

        {/* Tier badges & features */}
        <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
          <span className={`px-2 py-0.5 rounded-full font-medium ${
            tier === 'tier3' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300' :
            tier === 'tier2' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300' :
            'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
          }`}>
            {tier === 'tier3' ? t('shell.tierPremium') : tier === 'tier2' ? t('shell.tierStandard') : t('shell.tierEssential')}
          </span>
          {tierFeatures.charts && <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" /> {t('shell.featureCharts')}</span>}
          {tierFeatures.comparison && <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {t('shell.featureComparison')}</span>}
          <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {t('shell.featureGuide')}</span>
          {unitSystem && <span className="flex items-center gap-1"><RotateCcw className="w-3 h-3" /> {unitSystem}</span>}
          <HubIcon className="w-3 h-3 text-gray-300 dark:text-gray-600" />
          {userCount !== undefined && (
            <span className="flex items-center gap-1 text-gray-400">
              <ThumbsUp className="w-3 h-3" /> {t('shell.usersCount', { count: userCount })}
            </span>
          )}
        </div>

        {/* Star Rating */}
        <div className="card-handcrafted p-4 sm:p-6">
          <CalculatorRating />
        </div>

        {/* Formula & Step-by-Step */}
        {modeLevel >= 1 && (formula || (steps && steps.length > 0)) && (
          <div id="formula" className="card-handcrafted p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('shell.headingFormula')}</h2>
            {formula && (
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-mono text-gray-700 dark:text-gray-300">{formula}</p>
              </div>
            )}
            {steps && steps.length > 0 && (
              <div className="space-y-2">
                  {steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#1a3a8a]/10 text-[#06b6d4] flex items-center justify-center text-xs font-bold">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-600 dark:text-gray-400">{step.label}</p>
                      <div className="flex items-center gap-1">
                        <p className="font-mono font-medium text-gray-900 dark:text-white">{step.value}</p>
                        <button onClick={() => handleCopyValue(`${step.label}: ${step.value}`, `step-${i}`)} className="p-1 text-gray-400 hover:text-[#06b6d4] transition-colors" aria-label={t('premium.shell.copyStep', { label: step.label })}>
                          {copiedValue === `step-${i}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Educational Charts (Professional+) */}
        {modeLevel >= 2 && tierFeatures.eduCharts && (formulaVariables || conceptNodes || processSteps) && (
          <div id="educational-charts" className="space-y-4 card-handcrafted p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('shell.headingEduVisualizations')}</h2>
            {formulaVariables && <FormulaChart formula={formula || ''} variables={formulaVariables} />}
            {conceptNodes && conceptNodes.length > 0 && <ConceptDiagram nodes={conceptNodes} edges={conceptEdges || []} />}
            {processSteps && <ProcessFlowChart steps={processSteps} />}
          </div>
        )}

        {/* Worked Example (Advanced+) */}
        {modeLevel >= 1 && example && example.length > 0 && (
          <div id="example" className="card-handcrafted p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('shell.headingExampleCalc')}</h2>
            <div className="space-y-2">
              {example.map((step, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-600 dark:text-gray-400">{step.label}</p>
                    <div className="flex items-center gap-1">
                      <p className="font-mono font-medium text-gray-900 dark:text-white">{step.value}</p>
                      <button onClick={() => handleCopyValue(`${step.label}: ${step.value}`, `example-${i}`)} className="p-1 text-gray-400 hover:text-amber-600 transition-colors" aria-label={t('premium.shell.copyStep', { label: step.label })}>
                        {copiedValue === `example-${i}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Example Chart Generator (Professional+) */}
        {modeLevel >= 2 && tierFeatures.examples && examples && (
          <div id="examples" className="card-handcrafted p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('shell.headingExampleCalcs')}</h2>
            <ExampleChartGenerator
              beginner={examples.beginner} typical={examples.typical}
              advanced={examples.advanced} realworld={examples.realworld}
              chartType={exampleChartType}
            />
          </div>
        )}

        {/* Result Interpretation (Advanced+) */}
        {modeLevel >= 1 && interpretation && (
          <div id="what-this-means" className="card-handcrafted p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('shell.headingWhatThisMeans')}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{interpretation}</p>
          </div>
        )}

        {/* Dynamic Explanation (Advanced+) */}
        {modeLevel >= 1 && explanation && (
          <div className="card-handcrafted p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('shell.headingYourResults')}</h2>
            <div className="prose dark:prose-invert max-w-none text-sm">
              <p className="text-gray-700 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: explanation.summary }} />
              {explanation.details.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {explanation.details.map((d, i) => (
                    <li key={i} className="text-gray-600 dark:text-gray-400" dangerouslySetInnerHTML={{ __html: d }} />
                  ))}
                </ul>
              )}
            </div>
            {explanation.tips.length > 0 && (
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-1.5">{t('shell.tips')}</p>
                <ul className="space-y-1">
                  {explanation.tips.map((tip, i) => (
                    <li key={i} className="text-xs text-amber-600 dark:text-amber-400 flex items-start gap-1.5">
                      <span className="mt-0.5">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Result Explanation (Professional+) */}
        {modeLevel >= 2 && tierFeatures.eduCharts && enhancedExplanationProp && mainValue !== undefined && (
          <div id="enhanced-results" className="card-handcrafted p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('shell.headingYourResults')}</h2>
            <EnhancedResultExplanation
              value={mainValue} label={calculator.title}
              goodRange={enhancedExplanationProp.goodRange}
              benchmarks={enhancedExplanationProp.benchmarks}
              nextActions={enhancedExplanationProp.nextActions}
              optimizations={enhancedExplanationProp.optimizations}
              warnings={enhancedExplanationProp.warnings}
              resultInsights={enhancedExplanationProp.resultInsights}
              detailedExplanation={enhancedExplanationProp.detailedExplanation || (() => {
                const parsedInputs: Record<string, number> = {}
                if (inputs) Object.entries(inputs).forEach(([k, v]) => { const n = parseFloat(v); if (!isNaN(n)) parsedInputs[k] = n })
                const aiExp = generateAIExplanation(calculator.category, calculator.slug, mainValue, parsedInputs)
                return {
                  whatItMeans: aiExp.whatItMeans,
                  whyItMatters: aiExp.whyItMatters,
                  whatAffectsIt: aiExp.whatAffectsIt,
                  howToImprove: aiExp.howToImprove,
                  detailedSections: aiExp.detailedSections,
                }
              })()}
            />
          </div>
        )}

        {/* Sub-Calculations (Advanced+) */}
        {modeLevel >= 1 && subCalcs && (
          <div className="space-y-3">
            {subCalcs}
          </div>
        )}

        {/* Informational Sections (Use Cases, Mistakes, Glossary, Concepts) */}
        <InformationalSection title={calculator.title} description={calculator.description} content={calcContent} />

        {/* Commercial Section (Comparisons, Pros/Cons, Alternatives, Recommendations) */}
        <CommercialSection title={calculator.title} content={calcContent} />

        {/* Navigational Section (Audience, Hub, Related Links) */}
        <NavigationalSection calculator={{ ...calculator, hubName }} content={calcContent} />

        {/* Educational Content (collapsible) */}
        <div id="guide" className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <button
            onClick={() => setShowContent(!showContent)}
            className="w-full flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('shell.headingEduGuide')}</h2>
            {showContent ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          {showContent && (
            <div className="px-4 pb-4 sm:px-6 sm:pb-6">
              <div className="prose dark:prose-invert max-w-none">
                <h3>{t('shell.headingWhatIs', { title: calculator.title })}</h3>
                <p>{calculator.description}{t('shell.' + whatIsExtraKey) || ''}</p>

                <h3>{t('shell.headingHowItWorks')}</h3>
                <p>{t('shell.' + howItWorksKey) || t('shell.howItWorksDefault')}</p>

                <h3>{t('shell.headingTipsBestPractices')}</h3>
                <ul>
                  <li>{t('shell.tipAccurateInputs')}</li>
                  <li>{t('shell.tipReviewAssumptions')}</li>
                  <li>{t('shell.tipPresetExamples')}</li>
                  {tierFeatures.comparison && <li dangerouslySetInnerHTML={{ __html: t('shell.tipSaveScenario') }} />}
                  <li>{t('shell.tipPrintExport')}</li>
                  <li>{t('shell.tipBookmark')}</li>
                </ul>

                {faqs.length > 0 && (
                  <>
                    <h3 id="faq">{t('shell.headingFAQ')}</h3>
                    <div className="space-y-3">
                      {faqs.map((faq, i) => (
                        <div key={i}>
                          <p className="font-medium">{faq.q}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{faq.a}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {calculator.keywords.length > 0 && (
                  <>
                    <h3>{t('shell.headingRelatedTopics')}</h3>
                    <ul>
                      {calculator.keywords.slice(0, 8).map((kw, i) => <li key={i}>{kw}</li>)}
                    </ul>
                  </>
                )}

                <h3>{t('shell.headingQuestions')}</h3>
                <p>{t('shell.questionsParagraph')}</p>
              </div>

              {/* Author & Reviewer bios */}
              {(author || reviewer) && (
                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('shell.headingAboutAuthors')}</h3>
                  {author && <AuthorCard author={author} label={t('shell.authorLabel')} />}
                  {reviewer && <AuthorCard author={reviewer} label={t('shell.reviewerLabel')} />}
                </div>
              )}

              {/* References */}
              {references && references.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    {t('shell.headingReferences', { count: references.length })}
                  </h3>
                  <ol className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
                    {references.map((ref, i) => (
                      <li key={i}>
                        <a href={ref.url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 hover:text-[#06b6d4] transition-colors">
                          <span>[{i + 1}]</span> {ref.label}
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}

          <SchemaMarkup type="WebApplication" locale={locale} data={{
            name: calculator.title,
            description: calculator.description,
            url: `${siteUrl}/${calculator.hubSlug}/${calculator.slug}`,
            category: hubName,
            offers: { '@type': 'Offer', price: '0', priceCurrency: currency },
            applicationCategory: (() => {
              const map: Record<string, string> = { financial: 'FinanceApplication', health: 'HealthApplication', math: 'ScienceApplication', conversion: 'UtilitiesApplication', construction: 'BusinessApplication', statistics: 'DataAnalysisApplication', education: 'EducationalApplication', physics: 'ScienceApplication', chemistry: 'ScienceApplication', engineering: 'EngineeringApplication', everyday: 'LifestyleApplication', food: 'LifestyleApplication', biology: 'ScienceApplication', ecology: 'ScienceApplication', sports: 'SportsApplication', 'date-time': 'UtilitiesApplication' }
              return map[calculator.hubSlug] || 'UtilitiesApplication'
            })(),
            operatingSystem: 'Web',
            browserRequirements: 'Requires JavaScript',
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.8',
              bestRating: '5',
              ratingCount: '1250',
            },
          }} />
          {schemaFaqs.length > 0 && <SchemaMarkup type="FAQPage" data={{
            mainEntity: schemaFaqs.map(f => ({
              '@type': 'Question',
              name: f.question,
              acceptedAnswer: { '@type': 'Answer', text: f.answer },
            })),
          }} />}
          {steps && steps.length > 0 && <SchemaMarkup type="HowTo" locale={locale} data={howToSchema(steps)} />}
          <SchemaMarkup type="BreadcrumbList" locale={locale} data={breadcrumbListSchema([
            { name: t('shell.home'), url: siteUrl },
            { name: hubName, url: `${siteUrl}/${calculator.hubSlug}` },
            { name: calculator.title, url: `${siteUrl}/${calculator.hubSlug}/${calculator.slug}` },
          ], locale)} />
          <SchemaMarkup type="WebApplication" locale={locale} data={{
            name: calculator.title,
            description: calculator.description,
            url: `${siteUrl}/${calculator.hubSlug}/${calculator.slug}`,
            applicationCategory: (() => {
              const map: Record<string, string> = { financial: 'FinanceApplication', health: 'HealthApplication', math: 'ScienceApplication', conversion: 'UtilitiesApplication', construction: 'BusinessApplication', statistics: 'DataAnalysisApplication', education: 'EducationalApplication', physics: 'ScienceApplication', chemistry: 'ScienceApplication', engineering: 'EngineeringApplication', everyday: 'LifestyleApplication', food: 'LifestyleApplication', biology: 'ScienceApplication', ecology: 'ScienceApplication', sports: 'SportsApplication', 'date-time': 'UtilitiesApplication' }
              return map[calculator.hubSlug] || 'UtilitiesApplication'
            })(),
            operatingSystem: 'Web',
            offers: { '@type': 'Offer', price: '0', priceCurrency: currency },
          }} />
          {calcContent.useCases.length > 0 && <SchemaMarkup type="ItemList" data={{
            itemListElement: calcContent.useCases.slice(0, 5).map((uc, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: uc.title,
              description: uc.description,
            })),
          }} />}
          {calcContent.glossary.length > 0 && <SchemaMarkup type="ItemList" data={{
            name: `${calculator.title} Glossary`,
            description: 'Key terms related to this calculator',
            itemListElement: calcContent.glossary.map((g, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: g.term,
              description: g.definition,
            })),
          }} />}
        </div>

        {/* Feedback widget */}
        <div className="card-handcrafted p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('shell.didThisHelp')}</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setFeedback('yes')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  feedback === 'yes' ? 'bg-green-50 dark:bg-green-900/20 border-green-300 text-green-700 dark:text-green-300' : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" /> {t('shell.yes')}
              </button>
              <button
                onClick={() => setFeedback('no')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  feedback === 'no' ? 'bg-red-50 dark:bg-red-900/20 border-red-300 text-red-700 dark:text-red-300' : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5 rotate-180" /> {t('shell.no')}
              </button>
            </div>
          </div>
        </div>

        {/* AI Quality Audit Score (Expert+) */}
        {modeLevel >= 3 && tierFeatures.audit && (
          <div>
            <button
              onClick={() => setShowAudit(!showAudit)}
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#06b6d4] transition-colors"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              {showAudit ? t('shell.hideAudit') : t('shell.showAudit')}
              {showAudit ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            {showAudit && <QualityAuditScore categories={generateAuditScores(calculator, tierFeatures)} />}
          </div>
        )}

        {/* Internal Linking Grid (replaces old Related Calculators) */}
        <InternalLinkingGrid calculatorData={{ title: calculator.title, hub: calculator.hubSlug, tier: calculator.tier }} />

        {/* Related Calculators Carousel */}
        {relatedCalculators.length > 0 && (
          <div className="card-handcrafted p-4 sm:p-6">
            <RelatedCalculatorCarousel
              currentCalcSlug={calculator.slug}
              hubSlug={calculator.hubSlug}
            />
          </div>
        )}
      </div>

      {/* Sticky mobile Calculate CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden border-t border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            {mainValue !== undefined ? (
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wide text-gray-400 dark:text-gray-500">{t('shell.result')}</p>
                <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                  {calculator.title}: <span className="text-[#1a759f] dark:text-[#06b6d4]" suppressHydrationWarning>{typeof mainValue === 'number' ? mainValue.toLocaleString(undefined, { maximumFractionDigits: 2 }) : mainValue}</span>
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('shell.enterValuesAbove')}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleCalculate}
            aria-label={mainValue !== undefined ? t('shell.recalculate') : t('shell.calculate')}
            className="inline-flex touch-target min-w-[44px] flex-shrink-0 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-br from-[#1a3a8a] to-[#06b6d4] px-5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
          >
            <Calculator className="h-4 w-4" />
            {mainValue !== undefined ? t('shell.recalculate') : t('shell.calculate')}
          </button>
        </div>
      </div>
    </CalculatorLayout>
  )
}
