import { jsPDF } from 'jspdf'
import { autoTable } from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import type { WorkDay } from './types'
import { calculateWorkDay, calculateMonthSummary, formatHours, isSunday, formatDate } from './utils'

export function exportToExcel(workDays: WorkDay[], filename = 'pracovni-hodiny') {
  const rows = [...workDays]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((wd) => {
      const s = calculateWorkDay(wd)
      const date = new Date(wd.id)
      return {
        Datum: formatDate(date),
        Hodiny: formatHours(s.netWorkMinutes),
        'Přestávka': formatHours(s.totalBreakMinutes),
        Drinky: s.drinkCount,
        'Neděle': isSunday(date) ? 'Ano' : 'Ne',
        'Kompletní': s.isComplete ? 'Ano' : 'Ne',
      }
    })

  const summary = calculateMonthSummary(workDays)
  rows.push({ Datum: '', Hodiny: '', 'Přestávka': '', Drinky: '' as unknown as number, 'Neděle': '', 'Kompletní': '' })
  rows.push({
    Datum: 'CELKEM',
    Hodiny: formatHours(summary.netWorkMinutes),
    'Přestávka': formatHours(summary.totalBreakMinutes),
    Drinky: summary.totalDrinks,
    'Neděle': '',
    'Kompletní': '',
  })
  rows.push({ Datum: 'Pracovní dny', Hodiny: String(summary.daysWorked), 'Přestávka': '', Drinky: '' as unknown as number, 'Neděle': '', 'Kompletní': '' })
  rows.push({
    Datum: 'Průměr/den',
    Hodiny: formatHours(summary.averageMinutesPerDay),
    'Přestávka': '',
    Drinky: '' as unknown as number,
    'Neděle': '',
    'Kompletní': '',
  })

  const ws = XLSX.utils.json_to_sheet(rows)
  ws['!cols'] = [{ wch: 15 }, { wch: 12 }, { wch: 10 }, { wch: 8 }, { wch: 10 }, { wch: 12 }]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Pracovní hodiny')
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

export function exportToPDF(workDays: WorkDay[], filename = 'pracovni-hodiny') {
  const pdf = new jsPDF()
  pdf.setFontSize(18)
  pdf.text('Přehled pracovních hodin', 14, 20)

  const body = [...workDays]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((wd) => {
      const s = calculateWorkDay(wd)
      const date = new Date(wd.id)
      return [
        formatDate(date),
        formatHours(s.netWorkMinutes),
        formatHours(s.totalBreakMinutes),
        String(s.drinkCount),
        isSunday(date) ? 'Ano' : 'Ne',
        s.isComplete ? 'Ano' : 'Ne',
      ]
    })

  const summary = calculateMonthSummary(workDays)

  autoTable(pdf, {
    head: [['Datum', 'Hodiny', 'Přestávka', 'Drinky', 'Neděle', 'Kompletní']],
    body,
    startY: 30,
    theme: 'striped',
    headStyles: { fillColor: [245, 158, 11] },
  })

  const finalY = (pdf as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10
  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'bold')
  pdf.text(`Celkem: ${formatHours(summary.netWorkMinutes)}`, 14, finalY)
  pdf.text(`Pracovní dny: ${summary.daysWorked}`, 14, finalY + 7)
  pdf.text(`Průměr/den: ${formatHours(summary.averageMinutesPerDay)}`, 14, finalY + 14)
  pdf.text(`Přestávky celkem: ${formatHours(summary.totalBreakMinutes)}`, 14, finalY + 21)
  pdf.text(`Drinky celkem: ${summary.totalDrinks}`, 14, finalY + 28)
  pdf.save(`${filename}.pdf`)
}
