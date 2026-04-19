import { useState } from 'react'
import { FileText, Table, Loader2 } from 'lucide-react'
import { pdf } from '@react-pdf/renderer'
import { ReportDocument } from './ReportDocument'
import { exportToCSV } from '../lib/utils'
import type { HechoTransito } from '../types'

interface Props {
  data: HechoTransito[]
  filters: {
    flotilla: string
    alcaldia: string | null
    startDate: string
    endDate: string
  }
}

export function ExportCenter({ data, filters }: Props) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  const handleExportPDF = async () => {
    setIsGeneratingPDF(true)
    try {
      const blob = await pdf(<ReportDocument data={data} filters={filters} />).toBlob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Reporte_Seguridad_Vial_${new Date().toISOString().split('T')[0]}.pdf`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error al generar el PDF. Por favor intenta de nuevo.')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const handleExportCSV = () => {
    exportToCSV(data, `Datos_Viales_${new Date().toISOString().split('T')[0]}`)
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleExportCSV}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-700/50 border border-surface-500 text-gray-300 hover:text-white transition-all text-xs font-bold uppercase tracking-wider"
        title="Exportar a CSV"
      >
        <Table className="w-4 h-4" />
        <span className="hidden md:inline">CSV</span>
      </button>
      
      <button
        onClick={handleExportPDF}
        disabled={isGeneratingPDF}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/20 transition-all text-xs font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
        title="Exportar a PDF"
      >
        {isGeneratingPDF ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileText className="w-4 h-4" />
        )}
        <span className="hidden md:inline">{isGeneratingPDF ? 'Generando...' : 'Reporte PDF'}</span>
      </button>
    </div>
  )
}
