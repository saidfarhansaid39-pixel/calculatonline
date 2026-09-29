'use client'

import { useRef, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  Check,
  Copy,
  Plus,
  Layers,
  MoreHorizontal,
  RefreshCw,
  Sliders,
  History,
} from 'lucide-react'

interface ActionToolbarProps {
  onReset?: () => void
  onReload?: () => void
  onUnitChange?: (unit: string) => void
  unitOptions?: { value: string; label: string }[]
  unitSystem?: string
  onToggleSlider?: () => void
  useSlider?: boolean
  /** @deprecated Export/share actions now live in ExportShareSection ("Export & Share"). */
  onExport?: (format: string) => void
  /** @deprecated Export/share actions now live in ExportShareSection ("Export & Share"). */
  onShare?: () => void
  /** @deprecated Export/share actions now live in ExportShareSection ("Export & Share"). */
  shareCopied?: boolean
  onCopyResult?: () => void
  resultCopied?: boolean
  copyResultText?: string
  inputs?: Record<string, string>
  onSaveScenario?: () => void
  /** @deprecated Export/share actions now live in ExportShareSection ("Export & Share"). */
  showCSV?: boolean
  modeLevel?: number
  tierFeatures?: { export?: boolean; comparison?: boolean }
  showBatch?: boolean
  onToggleBatch?: (show: boolean) => void
  extraActions?: React.ReactNode
  /** @deprecated Export/share actions now live in ExportShareSection ("Export & Share"). */
  shareButtons?: React.ReactNode
  /** @deprecated Export/share actions now live in ExportShareSection ("Export & Share"). */
  embedWidget?: React.ReactNode
  /** @deprecated Export/share actions now live in ExportShareSection ("Export & Share"). */
  citationGenerator?: React.ReactNode
}

const btnBase =
  'min-h-[44px] px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors inline-flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#06b6d4] focus-visible:ring-offset-2'

const primaryBtn = `${btnBase} border-primary text-primary hover:bg-primary/10`
const ghostBtn = `${btnBase} border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800`
const accentBtn = `${btnBase} border-primary bg-primary text-white hover:bg-primary/90`

export function ActionToolbar({
  onReset,
  onReload,
  onUnitChange,
  unitOptions,
  unitSystem,
  onToggleSlider,
  useSlider,
  onCopyResult,
  resultCopied,
  copyResultText,
  inputs,
  onSaveScenario,
  modeLevel,
  tierFeatures,
  showBatch,
  onToggleBatch,
  extraActions,
}: ActionToolbarProps) {
  const t = useTranslations('calculatorUI')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [])

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Unit toggle */}
      {unitOptions && unitOptions.length > 0 && onUnitChange && (
        <select
          value={unitSystem}
          onChange={(e) => onUnitChange(e.target.value)}
          className={`${btnBase} border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 cursor-pointer`}
          aria-label={t('premium.actionToolbar.unitSystem')}
        >
          {unitOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {/* Slider toggle */}
      {onToggleSlider && (
        <button
          onClick={onToggleSlider}
          className={useSlider ? accentBtn : ghostBtn}
          aria-label={useSlider ? t('premium.actionToolbar.disableSliders') : t('premium.actionToolbar.enableSliders')}
          aria-pressed={useSlider}
        >
          <Sliders className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span className="hidden sm:inline">
            {useSlider ? t('premium.actionToolbar.slidersOn') : t('premium.actionToolbar.sliders')}
          </span>
        </button>
      )}

      {/* Reload (restore last saved) */}
      {onReload && (
        <button onClick={onReload} className={ghostBtn} aria-label={t('premium.actionToolbar.reloadAria')}>
          <History className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span className="hidden sm:inline">{t('premium.actionToolbar.reload')}</span>
        </button>
      )}

      {/* Reset */}
      {onReset && (
        <button onClick={onReset} className={ghostBtn} aria-label={t('premium.actionToolbar.resetAria')}>
          <RefreshCw className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span className="hidden sm:inline">{t('premium.actionToolbar.reset')}</span>
        </button>
      )}

      {/* Desktop group — secondary actions (export/share live in ExportShareSection) */}
      <div className="hidden md:flex items-center gap-2">
        {onCopyResult && (
          <button onClick={onCopyResult} className={ghostBtn} aria-label={resultCopied ? t('premium.actionToolbar.resultCopiedAria') : t('premium.actionToolbar.copyResultAria')}>
            {resultCopied ? (
              <Check className="w-3.5 h-3.5 shrink-0 text-green-500" aria-hidden="true" />
            ) : (
              <Copy className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            )}
            {resultCopied ? t('premium.actionToolbar.copied') : (copyResultText ?? t('premium.enhancedResult.copy'))}
          </button>
        )}
        {modeLevel != null && modeLevel >= 3 && tierFeatures?.comparison && onSaveScenario && (
          <button onClick={onSaveScenario} className={ghostBtn} aria-label={t('premium.actionToolbar.saveScenarioAria')}>
            <Plus className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            {t('premium.actionToolbar.save')}
          </button>
        )}
        {modeLevel != null && modeLevel >= 3 && tierFeatures?.comparison && onToggleBatch && (
          <button
            onClick={() => onToggleBatch(!showBatch)}
            className={showBatch ? accentBtn : ghostBtn}
            aria-label={showBatch ? t('premium.actionToolbar.closeBatchAria') : t('premium.actionToolbar.openBatchAria')}
            aria-pressed={showBatch}
          >
            <Layers className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            {t('premium.actionToolbar.batch')}
          </button>
        )}
        {extraActions}
      </div>

      {/* Mobile dropdown */}
      <div className="relative md:hidden" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((o) => !o)}
          className={ghostBtn}
          aria-label={t('premium.actionToolbar.moreActionsAria')}
          aria-expanded={dropdownOpen}
          aria-haspopup="menu"
        >
          <MoreHorizontal className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{t('premium.actionToolbar.more')}</span>
        </button>

          {dropdownOpen && (
            <div className="absolute bottom-full right-0 mb-2 z-50 flex flex-col gap-1 min-w-[160px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 shadow-lg" role="menu">
            {onReload && (
              <button
                onClick={() => {
                  onReload()
                  setDropdownOpen(false)
                }}
                className={ghostBtn}
                aria-label={t('premium.actionToolbar.reloadAria')}
                role="menuitem"
              >
                <History className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                {t('premium.actionToolbar.reload')}
              </button>
            )}
            {onCopyResult && (
              <button
                onClick={() => {
                  onCopyResult()
                  setDropdownOpen(false)
                }}
                className={ghostBtn}
                aria-label={resultCopied ? t('premium.actionToolbar.resultCopiedAria') : t('premium.actionToolbar.copyResultAria')}
                role="menuitem"
              >
                {resultCopied ? (
                  <Check className="w-3.5 h-3.5 shrink-0 text-green-500" aria-hidden="true" />
                ) : (
                  <Copy className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                )}
                {resultCopied ? t('premium.actionToolbar.copied') : (copyResultText ?? t('premium.enhancedResult.copy'))}
              </button>
            )}
            {modeLevel != null && modeLevel >= 3 && tierFeatures?.comparison && onSaveScenario && (
              <button
                onClick={() => {
                  onSaveScenario()
                  setDropdownOpen(false)
                }}
                className={ghostBtn}
                aria-label={t('premium.actionToolbar.saveScenarioAria')}
                role="menuitem"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                {t('premium.actionToolbar.save')}
              </button>
            )}
            {modeLevel != null && modeLevel >= 3 && tierFeatures?.comparison && onToggleBatch && (
              <button
                onClick={() => {
                  onToggleBatch(!showBatch)
                  setDropdownOpen(false)
                }}
                className={showBatch ? accentBtn : ghostBtn}
                aria-label={showBatch ? t('premium.actionToolbar.closeBatchAria') : t('premium.actionToolbar.openBatchAria')}
                role="menuitem"
              >
                <Layers className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                {t('premium.actionToolbar.batch')}
              </button>
            )}
            {extraActions && (
              <div onClick={() => setDropdownOpen(false)}>{extraActions}</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}