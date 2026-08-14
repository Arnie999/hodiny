import { useState } from 'react'
import { FileSpreadsheet, FileText, Loader2 } from 'lucide-react'
import type { WorkDay } from '../types'
import { exportToExcel, exportToPDF } from '../export'

interface Props {
  workDays: WorkDay[]
}

export function ExportButtons({ workDays }: Props) {
  const [isExportingPDF, setIsExportingPDF] = useState(false)

  const handleExcel = () => {
    exportToExcel(workDays, `pracovni-doba-${new Date().toISOString().split('T')[0]}`)
  }

  const handlePDF = async () => {
    setIsExportingPDF(true)
    try {
      await exportToPDF(workDays, `pracovni-doba-${new Date().toISOString().split('T')[0]}`)
    } finally {
      setIsExportingPDF(false)
    }
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
        onClick={() => void handlePDF()}
        disabled={isExportingPDF}
        className={`
          flex items-center gap-2 px-4 py-2 
          bg-red-600 hover:bg-red-700 
          text-white text-sm font-medium rounded-xl
          transition-all hover:scale-105 active:scale-95
          shadow-md hover:shadow-lg
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        `}
        title="Exportovat do PDF"
      >
        {isExportingPDF ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
        <span className="hidden sm:inline">PDF</span>
      </button>
    </div>
  )
}
