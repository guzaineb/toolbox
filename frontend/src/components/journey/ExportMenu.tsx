'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/shared/ui'
import {
  FileDown, FileText, Leaf, FileSpreadsheet, ChartBar, ShieldCheck,
  ChevronDown, Loader2,
} from 'lucide-react'

interface ExportMenuProps {
  projectId: string
  projectName: string
  onExportBmc: () => void
  onExportGreenBmc: () => void
  onExportValidationReport: () => void
  onExportBusinessPlan: () => void
  onExportImpactReport: () => void
  loading?: boolean
}

interface ExportOption {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  accent: string
  action: () => void
}

export function ExportMenu({
  projectId, projectName,
  onExportBmc, onExportGreenBmc, onExportValidationReport,
  onExportBusinessPlan, onExportImpactReport, loading,
}: ExportMenuProps) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const options: ExportOption[] = [
    {
      id: 'bmc',
      label: 'BMC Canvas',
      description: 'Exportez votre Business Model Canvas au format PDF',
      icon: <FileText size={16} />,
      accent: 'text-moss bg-moss-light/30',
      action: onExportBmc,
    },
    {
      id: 'green-bmc',
      label: 'BMC Green',
      description: 'Exportez votre version écoresponsable du BMC',
      icon: <Leaf size={16} />,
      accent: 'text-emerald bg-emerald-50',
      action: onExportGreenBmc,
    },
    {
      id: 'validation',
      label: 'Rapport de validation',
      description: 'Synthèse des validations et scores d\'évaluation',
      icon: <ShieldCheck size={16} />,
      accent: 'text-blue bg-blue-light',
      action: onExportValidationReport,
    },
    {
      id: 'business-plan',
      label: 'Business Plan Vert',
      description: 'Business plan complet avec analyse d\'impact',
      icon: <FileSpreadsheet size={16} />,
      accent: 'text-purple bg-purple-light',
      action: onExportBusinessPlan,
    },
    {
      id: 'impact',
      label: 'Rapport d\'impact',
      description: 'Analyse d\'impact environnemental et social',
      icon: <ChartBar size={16} />,
      accent: 'text-amber bg-amber-light',
      action: onExportImpactReport,
    },
  ]

  const handleExport = (option: ExportOption) => {
    option.action()
    setOpen(false)
  }

  return (
    <div ref={menuRef} className="relative">
      <Button
        variant="primary"
        size="sm"
        onClick={() => setOpen(!open)}
        loading={loading}
      >
        <FileDown size={12} /> Exporter
        <ChevronDown size={10} className={cn('transition-transform', open && 'rotate-180')} />
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-[280px] bg-surface border border-border rounded-xl shadow-elevated z-50 overflow-hidden animate-fadeIn">
          <div className="px-3 py-2 border-b border-border">
            <span className="text-[10px] font-bold text-ink3 uppercase tracking-[0.06em]">
              Exporter les livrables
            </span>
          </div>
          <div className="p-1.5 space-y-0.5">
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleExport(option)}
                className="w-full flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-moss/[.04] transition-colors text-left group"
              >
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5',
                  option.accent,
                )}>
                  {option.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-[12px] font-semibold text-ink group-hover:text-moss transition-colors">
                    {option.label}
                  </div>
                  <div className="text-[10px] text-ink3 mt-0.5 leading-tight">
                    {option.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="px-3 py-2 border-t border-border bg-surface-2">
            <span className="text-[9px] text-ink3">
              Projet : {projectName}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
