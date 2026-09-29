'use client'

import React, { useCallback, useState } from 'react'
import { useTranslations } from 'next-intl'
import { FileText, FileSpreadsheet, Printer, Share2, Download, Check, Copy, FileDown, Code } from 'lucide-react'
import { CalculatorWidget } from '@/components/premium/CalculatorWidget'

interface ExportPanelProps {
  slug: string
  title: string
  inputs?: Record<string, string>
  resultSummary?: string
  steps?: { label: string; value: string }[]
  resultValue?: string
  category?: string
  /** Hide the built-in "Export & Share" label (used when embedded in ExportShareSection, which provides its own heading). */
  hideLabel?: boolean
  /** Calculator-specific CSV generator (falls back to the generic inputs/result CSV). */
  onExportCsv?: () => string
}

function generateCSV(inputs: Record<string, string> | undefined, resultSummary: string | undefined, steps: { label: string; value: string }[] | undefined, fieldLabel: string, valueLabel: string, resultLabel: string): string {
  const rows: string[] = [`${fieldLabel},${valueLabel}`]
  if (inputs) Object.entries(inputs).filter(([, v]) => v).forEach(([k, v]) => rows.push(`"${k}","${v}"`))
  if (resultSummary) rows.push(`"${resultLabel}","${resultSummary}"`)
  if (steps) steps.forEach(s => rows.push(`"${s.label}","${s.value}"`))
  return rows.join('\n')
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function ExportPanel({ slug, title, inputs, resultSummary, steps, resultValue, category, hideLabel, onExportCsv }: ExportPanelProps) {
  const t = useTranslations('calculatorUI')
  const [copied, setCopied] = useState(false)
  const [showEmbed, setShowEmbed] = useState(false)

  const csvField = t('premium.exportPanel.csvField')
  const csvValue = t('premium.exportPanel.csvValue')
  const csvResult = t('premium.exportPanel.csvResult')

  const handleExportCSV = useCallback(() => {
    if (onExportCsv) {
      // Prefer the calculator-specific CSV generator (same output the old toolbar button produced).
      const blob = new Blob([onExportCsv()], { type: 'text/csv;charset=utf-8;' })
      downloadBlob(blob, `${slug}.csv`)
      return
    }
    const csv = generateCSV(inputs, resultSummary, steps, csvField, csvValue, csvResult)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    downloadBlob(blob, `${slug}-results.csv`)
  }, [slug, inputs, resultSummary, steps, csvField, csvValue, csvResult, onExportCsv])

  const handleExportExcel = useCallback(async () => {
    const csv = generateCSV(inputs, resultSummary, steps, csvField, csvValue, csvResult)
    const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:x='urn:schemas-microsoft-com:office:excel' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset="UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
      <x:Name>Results</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>
      <body><table>${csv.split('\n').map(row => `<tr>${row.split(',').map(c => `<td>${c.replace(/"/g, '')}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' })
    downloadBlob(blob, `${slug}-results.xls`)
  }, [slug, inputs, resultSummary, steps, csvField, csvValue, csvResult])

  const handleExportPDF = useCallback(async () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    const style = `
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
        h1 { color: #06b6d4; font-size: 18px; border-bottom: 2px solid #06b6d4; padding-bottom: 8px; }
        table { width: 100%; border-collapse: collapse; margin: 12px 0; }
        th, td { padding: 6px 10px; text-align: left; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
        th { background: #f9fafb; font-weight: 600; }
        .result { font-size: 16px; font-weight: bold; color: #06b6d4; margin: 12px 0; }
        .footer { margin-top: 20px; font-size: 10px; color: #9ca3af; text-align: center; }
      </style>`
    const inputsHtml = inputs ? Object.entries(inputs).filter(([, v]) => v)
      .map(([k, v]) => `<tr><td>${k.replace(/([A-Z])/g, ' $1')}</td><td>${v}</td></tr>`).join('') : ''
    const stepsHtml = steps ? steps.map(s => `<tr><td>${s.label}</td><td>${s.value}</td></tr>`).join('') : ''
    printWindow.document.write(`<!DOCTYPE html><html><head><title>${t('premium.exportPanel.pdfTitle', { title })}</title>${style}</head><body>
      <h1>${title}</h1>
      ${resultValue ? `<div class="result">${t('premium.exportPanel.pdfResult', { value: resultValue })}</div>` : ''}
      ${inputsHtml ? `<h2>${t('premium.exportPanel.pdfInputs')}</h2><table>${inputsHtml}</table>` : ''}
      ${stepsHtml ? `<h2>${t('premium.exportPanel.pdfSteps')}</h2><table>${stepsHtml}</table>` : ''}
      <div class="footer">${t('premium.exportPanel.pdfGeneratedBy')}</div></body></html>`)
    printWindow.document.close()
    setTimeout(() => printWindow.print(), 500)
  }, [slug, title, inputs, resultSummary, steps, resultValue, t])

  const handleCopyAll = useCallback(async () => {
    const text = [title, '', t('premium.exportPanel.textInputs'), ...(inputs ? Object.entries(inputs).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`) : []),
      ...(resultSummary ? ['', t('premium.exportPanel.textResult', { value: resultSummary })] : []),
      ...(steps ? ['', t('premium.exportPanel.textSteps'), ...steps.map(s => `${s.label}: ${s.value}`)] : []),
    ].join('\n')
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }, [title, inputs, resultSummary, steps, t])

  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }, [])

  const handleCopyMarkdown = useCallback(async () => {
    const lines = [`## ${title}`, '']
    if (inputs) {
      Object.entries(inputs)
        .filter(([, v]) => v)
        .forEach(([k, v]) => lines.push(`- **${k.replace(/([A-Z])/g, ' $1').trim()}**: ${v}`))
    }
    if (resultSummary) {
      lines.push('', `**${t('premium.exportPanel.mdResult', { value: resultSummary })}**`)
    }
    if (steps) {
      lines.push('', `### ${t('premium.exportPanel.mdSteps')}`)
      steps.forEach((s) => lines.push(`- **${s.label}**: ${s.value}`))
    }
    lines.push('', '---', t('premium.exportPanel.mdGeneratedBy'))
    try {
      await navigator.clipboard.writeText(lines.join('\n'))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }, [title, inputs, resultSummary, steps, t])

  return (
    <div className="space-y-2">
      {!hideLabel && (
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('premium.exportPanel.title')}</p>
      )}
      <div className="flex flex-wrap gap-1.5">
        <button onClick={handleExportPDF} className="inline-flex items-center gap-1.5 min-h-[44px] px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300" aria-label={t('premium.exportPanel.exportPdfAria')}>
          <FileDown className="w-3.5 h-3.5" /> PDF
        </button>
        <button onClick={handleExportCSV} className="inline-flex items-center gap-1.5 min-h-[44px] px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300" aria-label={t('premium.exportPanel.exportCsvAria')}>
          <FileText className="w-3.5 h-3.5" /> CSV
        </button>
        <button onClick={handleExportExcel} className="inline-flex items-center gap-1.5 min-h-[44px] px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300" aria-label={t('premium.exportPanel.exportExcelAria')}>
          <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
        </button>
        <button onClick={handleShare} className="inline-flex items-center gap-1.5 min-h-[44px] px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300" aria-label={copied ? t('premium.exportPanel.linkCopiedAria') : t('premium.exportPanel.copyLinkAria')}>
          {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Share2 className="w-3.5 h-3.5" />}
          {copied ? t('premium.exportPanel.copied') : t('premium.exportPanel.share')}
        </button>
        <button onClick={handleCopyAll} className="inline-flex items-center gap-1.5 min-h-[44px] px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300" aria-label={t('premium.exportPanel.copyAllAria')}>
          <Copy className="w-3.5 h-3.5" /> {t('premium.exportPanel.copyAll')}
        </button>
        <button onClick={handleCopyMarkdown} className="inline-flex items-center gap-1.5 min-h-[44px] px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300" aria-label={t('premium.exportPanel.copyMarkdownAria')}>
          <FileText className="w-3.5 h-3.5" /> Markdown
        </button>
        <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 min-h-[44px] px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300" aria-label={t('premium.exportPanel.printAria')}>
          <Printer className="w-3.5 h-3.5" /> {t('premium.exportPanel.print')}
        </button>
        <button onClick={() => setShowEmbed(!showEmbed)} className="inline-flex items-center gap-1.5 min-h-[44px] px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300" aria-expanded={showEmbed} aria-label={t('premium.exportPanel.toggleEmbedAria')}>
          <Code className="w-3.5 h-3.5" /> {t('premium.exportPanel.embed')}
        </button>
      </div>
      {showEmbed && category && (
        <CalculatorWidget slug={slug} title={title} category={category} />
      )}
    </div>
  )
}
