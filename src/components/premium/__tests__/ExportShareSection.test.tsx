import { describe, expect, it } from 'vitest'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { NextIntlClientProvider } from 'next-intl'
import en from '@/i18n/messages/en.json'
import fr from '@/i18n/messages/fr.json'
import { ExportShareSection } from '@/components/premium/ExportShareSection'

type Messages = Record<string, unknown>
type SectionProps = Partial<React.ComponentProps<typeof ExportShareSection>>

function renderSection(locale: string, messages: Messages, props: SectionProps = {}) {
  return renderToStaticMarkup(
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC">
      <ExportShareSection
        slug="mortgage-calculator"
        title="Mortgage Calculator"
        description="Free mortgage calculator"
        hubSlug="financial-calculators"
        category="financial"
        inputs={{ price: '400000' }}
        resultSummary="$2,500/mo"
        steps={[{ label: 'Principal', value: '$400,000' }]}
        resultValue="$2,500/mo"
        shareUrl="https://www.calculat.online/financial-calculators/mortgage-calculator"
        onExportCSV={() => 'price\n400000'}
        {...props}
      />
    </NextIntlClientProvider>
  )
}

const enUI = (en as { calculatorUI: { premium: Record<string, Record<string, string>> } }).calculatorUI.premium
const frUI = (fr as { calculatorUI: { premium: Record<string, Record<string, string>> } }).calculatorUI.premium

describe('ExportShareSection', () => {
  const html = renderSection('en', en as unknown as Messages)

  it('renders the unified section with heading and collapsible body', () => {
    expect(html).toContain('id="export-share"')
    expect(html).toContain('aria-controls="export-share-body"')
    expect(html).toContain('aria-expanded="true"')
    expect(html).toContain('Export &amp; Share') // heading text + aria-label
  })

  it('contains every export format button (PDF, CSV, Excel, Markdown, Print, Embed)', () => {
    expect(html).toContain(enUI.exportPanel.exportPdfAria)
    expect(html).toContain(enUI.exportPanel.exportCsvAria)
    expect(html).toContain(enUI.exportPanel.exportExcelAria)
    expect(html).toContain(enUI.exportPanel.copyAll)
    expect(html).toContain('Markdown')
    expect(html).toContain(enUI.exportPanel.printAria)
    expect(html).toContain(enUI.exportPanel.embed)
  })

  it('groups social share, iframe embed and citation inside the same section', () => {
    const section = html.slice(html.indexOf('id="export-share"'))
    expect(section).toContain(enUI.shareButtons.openOptions)
    expect(section).toContain(enUI.embedWidget.openOptions)
    expect(section).toContain(enUI.citationGenerator.openOptions)
    // section boundary: nothing from the group leaks outside
    expect(html.indexOf('id="export-share"')).toBeGreaterThanOrEqual(0)
  })

  it('renders the French heading and labels on the fr locale', () => {
    const frHtml = renderSection('fr', fr as unknown as Messages)
    expect(frHtml).toContain('aria-label="Exporter et partager"')
    expect(frHtml).toContain('Exporter et partager')
    expect(frHtml).toContain(frUI.exportPanel.exportPdfAria)
  })

  it('collapses the body when defaultOpen is false', () => {
    const closed = renderSection('en', en as unknown as Messages, { defaultOpen: false })
    expect(closed).toContain('aria-expanded="false"')
    expect(closed).not.toContain('id="export-share-body"')
    expect(closed).not.toContain(enUI.exportPanel.exportPdfAria)
  })
})
