'use client'

import Link from 'next/link'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Progress, Card } from '@/components/shared/ui'
import { TOOL_STEP_MAPPING, ToolKey } from '@/types/switchers'
import { PHASES, ProjectStep } from '@/types/project'
import {
  ChevronDown, ChevronRight,
  Leaf, FileText, FlaskConical, DollarSign, Megaphone, BarChart3,
  Circle, Clock, AlertCircle, CheckCircle2,
} from 'lucide-react'

const TOOL_ICONS: Record<string, any> = {
  modele_affaires_vert: Leaf,
  plan_affaires_vert: FileText,
  eco_conception: FlaskConical,
  acces_financement: DollarSign,
  acces_marche: Megaphone,
  mesure_impact: BarChart3,
};

const TOOL_LABELS: Record<string, string> = {
  modele_affaires_vert: "Modèle d'affaires vert",
  plan_affaires_vert: "Plan d'affaires vert",
  eco_conception: "Éco-conception",
  acces_financement: "Accès au financement",
  acces_marche: "Accès au marché",
  mesure_impact: "Mesure de l'impact",
};

const STEP_ICONS: Record<string, any> = {
  not_started: Circle,
  in_progress: Clock,
  submitted: AlertCircle,
  approved: CheckCircle2,
  rejected: AlertCircle,
};

interface ProjectSidebarProps {
  projectId: string;
  steps: ProjectStep[];
  progress: Record<string, number>;
  currentStepNumber?: number;
}

export function ProjectSidebar({ projectId, steps, progress, currentStepNumber }: ProjectSidebarProps) {
  const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set(['modele_affaires_vert']));
  const [expandedPhases, setExpandedPhases] = useState<number[]>(
    currentStepNumber
      ? [PHASES.find(p => p.steps.includes(currentStepNumber))?.phaseNumber || 1]
      : [1],
  );

  const toggleTool = (key: string) => {
    setExpandedTools(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key); else next.add(key)
      return next
    })
  }

  const togglePhase = (phaseNumber: number) => {
    setExpandedPhases(prev =>
      prev.includes(phaseNumber)
        ? prev.filter(p => p !== phaseNumber)
        : [...prev, phaseNumber],
    )
  }

  const getStepStatus = (stepNumber: number) => {
    const step = steps.find(s => s.step_number === stepNumber)
    return step?.status || 'not_started'
  }

  const getPhaseProgress = (phaseStepNumbers: number[]) => {
    let completed = 0
    let total = 0
    for (const sn of phaseStepNumbers) {
      const step = steps.find(s => s.step_number === sn)
      if (step) total++
      if (step?.status === 'approved' || step?.status === 'submitted') completed++
    }
    return { completed, total: Math.max(total, phaseStepNumbers.length) }
  }

  const isActive = (stepNumber: number) => currentStepNumber === stepNumber

  return (
    <Card className="overflow-hidden sticky top-[88px]">
      {/* Header */}
      <div className="p-[14px_16px] border-b border-border bg-moss-light/20">
        <h3 className="text-[11px] font-bold text-moss uppercase tracking-[0.06em]">Modules</h3>
      </div>

      <div className="p-[6px_8px] space-y-0.5 max-h-[calc(100vh-180px)] overflow-y-auto scrollbar-thin">
        {(Object.keys(TOOL_STEP_MAPPING) as ToolKey[]).map((key) => {
          const Icon = TOOL_ICONS[key] || Leaf
          const pct = progress[key] ?? 0
          const isToolExpanded = expandedTools.has(key)
          const isMbv = key === 'modele_affaires_vert'
          const toolSteps = TOOL_STEP_MAPPING[key].steps

          return (
            <div key={key}>
              {/* Module header */}
              <button
                type="button"
                onClick={() => toggleTool(key)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium transition-colors',
                  isToolExpanded ? 'bg-moss-light/30 text-moss' : 'text-ink2 hover:bg-moss-light/20',
                )}
              >
                <Icon size={15} className="flex-shrink-0" />
                <span className="truncate flex-1 text-left">{TOOL_LABELS[key] || key}</span>
                <span className="text-[10px] font-semibold text-ink3">{pct}%</span>
                <ChevronDown size={13} className={cn(
                  'flex-shrink-0 text-ink3 transition-transform',
                  !isToolExpanded && '-rotate-90',
                )} />
              </button>

              {/* Module content */}
              {isToolExpanded && (
                <div className="ml-1 mt-0.5 mb-1 space-y-0.5">
                  {isMbv ? (
                    /* MBV: show phases with steps */
                    PHASES.map((phase) => {
                      const phaseProgress = getPhaseProgress(phase.steps)
                      const isPhaseExpanded = expandedPhases.includes(phase.phaseNumber)

                      return (
                        <div key={phase.phaseNumber}>
                          <button
                            type="button"
                            onClick={() => togglePhase(phase.phaseNumber)}
                            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-[6px] text-[11px] text-ink2 hover:bg-moss-light/30 transition-colors"
                          >
                            <span className={cn(
                              'w-[18px] h-[18px] rounded-[4px] flex items-center justify-center text-[9px] font-bold flex-shrink-0',
                              isPhaseExpanded ? 'bg-moss text-white' : 'bg-ink/[.07] text-ink3',
                            )}>
                              {phase.phaseNumber}
                            </span>
                            <span className="truncate flex-1 text-left">{phase.name}</span>
                            <span className="text-[9px] text-ink3">{phaseProgress.completed}/{phaseProgress.total}</span>
                            {isPhaseExpanded ? <ChevronDown size={11} className="text-ink3" /> : <ChevronRight size={11} className="text-ink3" />}
                          </button>

                          {isPhaseExpanded && (
                            <div className="ml-4 space-y-0.5 mt-0.5">
                              {phase.steps.map((stepNumber) => {
                                const status = getStepStatus(stepNumber)
                                const step = steps.find(s => s.step_number === stepNumber)
                                const stepTitle = step?.title || `Étape ${stepNumber}`
                                const SIcon = STEP_ICONS[status] || Circle

                                return (
                                  <Link
                                    key={stepNumber}
                                    href={`/dashboard/project-owner/projects/${projectId}/${stepNumber}`}
                                    className={cn(
                                      'flex items-center gap-2 px-3 py-1.5 rounded-[6px] text-[11px] transition-colors',
                                      isActive(stepNumber)
                                        ? 'bg-moss-light text-moss font-semibold'
                                        : 'text-ink2 hover:bg-moss-light/20',
                                    )}
                                  >
                                    <SIcon size={10} className={cn(
                                      'flex-shrink-0',
                                      (status === 'approved' || status === 'submitted') && 'text-moss',
                                      status === 'in_progress' && 'text-blue',
                                      status === 'submitted' && 'text-amber-dark',
                                      status === 'rejected' && 'text-red',
                                      status === 'not_started' && 'text-ink3/30',
                                    )} />
                                    <span className="truncate">{stepNumber}. {stepTitle}</span>
                                  </Link>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })
                  ) : (
                    /* Other modules: show step list */
                    <div className="ml-4 space-y-0.5">
                      {toolSteps.map((stepNumber) => {
                        const status = getStepStatus(stepNumber)
                        const step = steps.find(s => s.step_number === stepNumber)
                        const stepTitle = step?.title || `Étape ${stepNumber}`
                        const SIcon = STEP_ICONS[status] || Circle

                        return (
                          <Link
                            key={stepNumber}
                            href={`/dashboard/project-owner/projects/${projectId}/${stepNumber}`}
                            className={cn(
                              'flex items-center gap-2 px-3 py-1.5 rounded-[6px] text-[11px] transition-colors',
                              isActive(stepNumber)
                                ? 'bg-moss-light text-moss font-semibold'
                                : 'text-ink2 hover:bg-moss-light/20',
                            )}
                          >
                            <SIcon size={10} className={cn(
                              'flex-shrink-0',
                              (status === 'approved' || status === 'submitted') && 'text-moss',
                              status === 'in_progress' && 'text-blue',
                              status === 'submitted' && 'text-amber-dark',
                              status === 'rejected' && 'text-red',
                              status === 'not_started' && 'text-ink3/30',
                            )} />
                            <span className="truncate">{stepTitle}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}

                  {/* Progress bar */}
                  <div className="px-3 pt-1 pb-0.5">
                    <Progress value={pct} />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}
