'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Share2, ChevronDown, ChevronUp } from 'lucide-react'
import { ExportPanel } from '@/components/premium/ExportPanel'
import { ShareButtons } from '@/components/premium/ShareButtons'
import { EmbedWidget } from '@/components/premium/EmbedWidget'
import { CitationGenerator } from '@/components/premium/CitationGenerator'

interface ExportShareSectionProps {
  slug: string
  title: string
  description?: string
  hubSlug: string
  category?: string
  inputs?: Record<string, string>
  resultSummary?: string
  steps?: { label: string; value: string }[]
  resultValue?: string
  /** Canonical share URL for social/citation links. */
  shareUrl: string
  /** Calculator-specific CSV export (preserves the old toolbar CSV output). */
  onExportCSV?: () => string
  defaultOpen?: boolean
}

/**
 * Unified "Export & Share" section — a single card placed directly below the
 * calculator panel that groups every export/share affordance in one place:
 *
 *  - Export formats: PDF, CSV, Excel, Markdown, Copy All, Copy link, Print, Embed code
 *  - Social share: X/Twitter, Facebook, LinkedIn, Pinterest, Email
 *  - Iframe embed code + APA/MLA/Chicago citations
 *
 * Replaces the previous scattered placements (top-of-card ExportPanel row +
 * ActionToolbar desktop buttons + mobile "More" dropdown entries).
 */
export function ExportShareSection({
  slug,
  title,
  description,
  hubSlug,
  category,
  inputs,
  resultSummary,
  steps,
  resultValue,
  shareUrl,
  onExportCSV,
  defaultOpen = true,
}: ExportShareSectionProps) {
  const t = useTranslations('calculatorUI')
  const [open, setOpen] = useState(defaultOpen)
  const bodyId = 'export-share-body'
  const label = t('premium.exportPanel.title') // "Export & Share" / "Exporter et partager"

  return (
    <section
      id="export-share"
      aria-label={label}
      className="relative rounded-2xl border border-gray-200 bg-white shadow-soft dark:border-gray-700 dark:bg-gray-800"
    >
      <h2 className="m-0">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={bodyId}
          className="flex min-h-[44px] w-full items-center justify-between gap-2 rounded-t-2xl px-4 py-3 text-left text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06b6d4] focus-visible:ring-offset-2 dark:text-white dark:hover:bg-gray-700/60 sm:px-6 sm:py-4 sm:text-base"
        >
          <span className="flex items-center gap-2">
            <Share2 className="h-4 w-4 shrink-0 text-[#06b6d4]" aria-hidden="true" />
            {label}
          </span>
          {open ? (
            <ChevronUp className="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" aria-hidden="true" />
          ) : (
            <ChevronDown className="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" aria-hidden="true" />
          )}
        </button>
      </h2>

      {open && (
        <div
          id={bodyId}
          className="space-y-4 rounded-b-2xl border-t border-gray-100 px-4 pb-4 pt-4 dark:border-gray-700 sm:px-6 sm:pb-6"
        >
          {/* Export formats: PDF · CSV · Excel · Copy link · Copy All · Markdown · Print · Embed */}
          <ExportPanel
            slug={slug}
            title={title}
            inputs={inputs}
            resultSummary={resultSummary}
            steps={steps}
            resultValue={resultValue}
            category={category}
            hideLabel
            onExportCsv={onExportCSV}
          />

          {/* Social share · iframe embed · citations — grouped under the same heading */}
          <div className="flex flex-wrap items-center gap-1.5 border-t border-gray-100 pt-4 dark:border-gray-700">
            <ShareButtons url={shareUrl} title={title} description={description} />
            <EmbedWidget slug={slug} title={title} hubSlug={hubSlug} />
            <CitationGenerator title={title} url={shareUrl} />
          </div>
        </div>
      )}
    </section>
  )
}
