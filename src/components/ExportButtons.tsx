import { FileSpreadsheet, FileText } from 'lucide-react'
import type { WorkDay } from '../types'
import { exportToExcel, exportToPDF } from '../export'

interface Props {
  workDays: WorkDay[]
}

export function ExportButtons({ workDays }: Props) {
  const handleExcel = () => {
    exportToExcel(workDays, `pracovni-hodiny-${new Date().toISOString().split('T')[0]}`)
  }

  const handlePDF = () => {
    exportToPDF(workDays, `pracovni-hodiny-${new Date().toISOString().split('T')[0]}`)
  }

  return (
    <div className="flex flex-wrap gap-2 justify-end">
      <button
        onClick={handleExcel}
        className={`
          flex items-center gap-2 px-4 py-2 
          bg-green-600 hover:bg-green-700 
          text-white text-sm font-medium rounded-xl
          transition-all hover:scale-105 active:scale-95
          shadow-md hover:shadow-lg
        `}
        title="Exportovat do Excelu"
      >
        <FileSpreadsheet size={18} />
        <span className="hidden sm:inline">Excel</span>
      </button>
      <button
        onClick={handlePDF}
        className={`
          flex items-center gap-2 px-4 py-2 
          bg-red-600 hover:bg-red-700 
          text-white text-sm font-medium rounded-xl
          transition-all hover:scale-105 active:scale-95
          shadow-md hover:shadow-lg
        `}
        title="Exportovat do PDF"
      >
        <FileText size={18} />
        <span className="hidden sm:inline">PDF</span>
      </button>
    </div>
  )
}
