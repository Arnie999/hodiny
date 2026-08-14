import { jsPDF } from 'jspdf'
import { autoTable } from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import type { WorkDay } from './types'
import {
  calculateWorkDay,
  calculateMonthSummary,
  formatCurrency,
  formatHours,
  isSunday,
  formatDate,
} from './utils'

type ExportRow = Record<string, string | number>

let pdfFontPromise: Promise<string> | null = null

const excelColumns = [
  'Datum',
  'Odpracováno',
  'Přestávky',
  'Likéry Maria',
  'Recenze',
  'Dýško (Kč)',
  'Neděle',
  'Kompletní',
] as const

function emptyExcelRow(): ExportRow {
  return Object.fromEntries(excelColumns.map((column) => [column, '']))
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  const chunkSize = 0x8000
  let binary = ''
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize))
  }
  return btoa(binary)
}

async function addCzechFont(pdf: jsPDF): Promise<void> {
  pdfFontPromise ??= fetch('/fonts/NotoSans.ttf').then(async (response) => {
    if (!response.ok) throw new Error('Nepodařilo se načíst font pro PDF.')
    return arrayBufferToBase64(await response.arrayBuffer())
  })

  pdf.addFileToVFS('NotoSans.ttf', await pdfFontPromise)
  pdf.addFont('NotoSans.ttf', 'NotoSans', 'normal')
  pdf.setFont('NotoSans', 'normal')
}

export function exportToExcel(workDays: WorkDay[], filename = 'pracovni-doba') {
  const rows: ExportRow[] = [...workDays]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((workDay) => {
      const summary = calculateWorkDay(workDay)
      const date = new Date(workDay.id)
      return {
        Datum: formatDate(date),
        Odpracováno: formatHours(summary.netWorkMinutes),
        Přestávky: formatHours(summary.totalBreakMinutes),
        'Likéry Maria': summary.drinkCount,
        Recenze: summary.reviewCount,
        'Dýško (Kč)': summary.tipAmount,
        Neděle: isSunday(date) ? 'Ano' : 'Ne',
        Kompletní: summary.isComplete ? 'Ano' : 'Ne',
      }
    })

  const monthSummary = calculateMonthSummary(workDays)
  rows.push(emptyExcelRow())
  rows.push({
    ...emptyExcelRow(),
    Datum: 'CELKEM',
    Odpracováno: formatHours(monthSummary.netWorkMinutes),
    Přestávky: formatHours(monthSummary.totalBreakMinutes),
    'Likéry Maria': monthSummary.totalDrinks,
    Recenze: monthSummary.totalReviews,
    'Dýško (Kč)': monthSummary.totalTips,
  })
  rows.push({
    ...emptyExcelRow(),
    Datum: 'Odpracované dny',
    Odpracováno: monthSummary.daysWorked,
  })
  rows.push({
    ...emptyExcelRow(),
    Datum: 'Průměr za den',
    Odpracováno: formatHours(monthSummary.averageMinutesPerDay),
  })

  const worksheet = XLSX.utils.json_to_sheet(rows, { header: [...excelColumns] })
  worksheet['!cols'] = [
    { wch: 18 },
    { wch: 15 },
    { wch: 14 },
    { wch: 15 },
    { wch: 10 },
    { wch: 14 },
    { wch: 10 },
    { wch: 12 },
  ]

  for (let rowNumber = 2; rowNumber <= rows.length + 1; rowNumber++) {
    const cell = worksheet[`F${rowNumber}`]
    if (cell?.t === 'n') cell.z = '#,##0.00 "Kč"'
  }

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Pracovní doba')
  XLSX.writeFile(workbook, `${filename}.xlsx`)
}

export async function exportToPDF(workDays: WorkDay[], filename = 'pracovni-doba') {
  const pdf = new jsPDF({ orientation: 'landscape' })
  await addCzechFont(pdf)
  pdf.setFontSize(18)
  pdf.text('Přehled pracovní doby', 14, 20)

  const body = [...workDays]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((workDay) => {
      const summary = calculateWorkDay(workDay)
      const date = new Date(workDay.id)
      return [
        formatDate(date),
        formatHours(summary.netWorkMinutes),
        formatHours(summary.totalBreakMinutes),
        String(summary.drinkCount),
        String(summary.reviewCount),
        formatCurrency(summary.tipAmount),
        isSunday(date) ? 'Ano' : 'Ne',
        summary.isComplete ? 'Ano' : 'Ne',
      ]
    })

  const monthSummary = calculateMonthSummary(workDays)

  autoTable(pdf, {
    head: [[
      'Datum',
      'Odpracováno',
      'Přestávky',
      'Likéry Maria',
      'Recenze',
      'Dýško',
      'Neděle',
      'Kompletní',
    ]],
    body,
    startY: 30,
    theme: 'striped',
    styles: { font: 'NotoSans', fontStyle: 'normal', fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [245, 158, 11], fontStyle: 'normal' },
  })

  const pageHeight = pdf.internal.pageSize.getHeight()
  const tableEnd = (pdf as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY
  let summaryY = tableEnd + 10
  if (summaryY + 50 > pageHeight) {
    pdf.addPage()
    summaryY = 20
  }

  pdf.setFontSize(11)
  pdf.setFont('NotoSans', 'normal')
  const summaryLines = [
    `Celkem odpracováno: ${formatHours(monthSummary.netWorkMinutes)}`,
    `Odpracované dny: ${monthSummary.daysWorked}`,
    `Průměr za den: ${formatHours(monthSummary.averageMinutesPerDay)}`,
    `Přestávky celkem: ${formatHours(monthSummary.totalBreakMinutes)}`,
    `Likéry Maria celkem: ${monthSummary.totalDrinks} ks`,
    `Recenze celkem: ${monthSummary.totalReviews}`,
    `Dýško celkem: ${formatCurrency(monthSummary.totalTips)}`,
  ]
  summaryLines.forEach((line, index) => pdf.text(line, 14, summaryY + index * 7))
  pdf.save(`${filename}.pdf`)
}
