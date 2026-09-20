'use client'

import { useState } from 'react'
import { Check, ChevronDown, Leaf, Lock, Play } from 'lucide-react'
import { GBM_PHASES, GBM_STEPS, getStepMeta } from '@/data/gbm/steps'
import type { GbmProgress } from '@/types/gbm'
import { cn } from '@/lib/utils'

type StepStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED'

interface GbmNavbarProps {
  currentStep: string
  statusOf: (key: string) => StepStatus
  lockedOf: (key: string) => boolean
  onStepClick: (key: string) => void
  progress?: GbmProgress | null
}

function StatusIcon({ status, locked }: { status: StepStatus; locked: boolean }) {
  if (locked) return <Lock size={12} />
  if (status === 'COMPLETED') return <Check size={12} strokeWidth={3} />
  if (status === 'IN_PROGRESS') return <Play size={11} />
  return <span className="w-1.5 h-1.5 rounded-full bg-ink/30" />
}

export function GbmNavbar({ currentStep, statusOf, lockedOf, onStepClick, progress }: GbmNavbarProps) {
  const [openPhase, setOpenPhase] = useState<number | null>(null)

  return (
    <nav className="sticky top-0 z-40 bg-surface/95 backdrop-blur border-b border-border">
      <div className="flex items-center gap-1.5 px-3 sm:px-4 py-2 max-w-7xl mx-auto">
        {/* Brand */}
        <div className="flex items-center gap-2 mr-auto min-w-0">
          <div className="w-7 h-7 rounded-lg bg-moss-light text-moss flex items-center justify-center flex-shrink-0">
            <Leaf size={15} />
          </div>
          <div className="hidden sm:block leading-tight min-w-0">
            <div className="text-[12px] font-bold text-ink">GBM</div>
            <div className="text-[10px] text-ink3 truncate">Modèle d&apos;Affaires Vert</div>
          </div>
          <span className="ml-1 text-[11px] font-bold text-moss bg-moss-light border border-moss/20 rounded-full px-2 py-0.5 flex-shrink-0">
            {progress?.percentage ?? 0}%
          </span>
        </div>

        {/* Phase dropdowns */}
        <div className="flex items-center gap-1">
          {GBM_PHASES.map(phase => {
            const steps = GBM_STEPS.filter(s => s.phase === phase.phase)
            const completed = steps.filter(s => statusOf(s.key) === 'COMPLETED').length
            const isActivePhase = getStepMeta(currentStep)?.phase === phase.phase
            const open = openPhase === phase.phase

            return (
              <div key={phase.phase} className="relative">
                <button
                  onClick={() => setOpenPhase(open ? null : phase.phase)}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11.5px] font-semibold transition-all cursor-pointer',
                    open || isActivePhase
                      ? 'border-moss/40 bg-moss-light text-moss'
                      : 'border-border text-ink2 hover:border-moss/30 hover:bg-moss/5',
                  )}
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: phase.color }} />
                  <span className="hidden md:inline">Phase {phase.phase}</span>
                  <span className="md:hidden">P{phase.phase}</span>
                  <span className="text-[10px] text-ink3 font-bold">({completed}/{steps.length})</span>
                  <ChevronDown size={11} className={cn('text-ink3 transition-transform', open && 'rotate-180')} />
                </button>

                {open && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpenPhase(null)} aria-hidden="true" />
                    <div className="absolute right-0 top-full mt-1.5 z-50 w-72 max-w-[calc(100vw-24px)] rounded-xl border border-border bg-surface shadow-lg overflow-hidden">
                      <div
                        className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.1em] border-b border-border"
                        style={{ color: phase.color, backgroundColor: `${phase.color}10` }}
                      >
                        {phase.name}
                      </div>
                      <div className="max-h-[52vh] overflow-y-auto p-1.5">
                        {steps.map(step => {
                          const locked = lockedOf(step.key)
                          const status = statusOf(step.key)
                          const active = currentStep === step.key
                          return (
                            <button
                              key={step.key}
                              onClick={() => {
                                setOpenPhase(null)
                                onStepClick(step.key)
                              }}
                              disabled={locked}
                              title={locked ? 'Complétez d’abord l’étape précédente' : step.title}
                              className={cn(
                                'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left border transition-all',
                                active
                                  ? 'ring-2 ring-moss/40 border-moss bg-moss-light'
                                  : 'border-transparent hover:bg-surface-2',
                                locked && 'opacity-55 cursor-not-allowed hover:bg-transparent',
                              )}
                            >
                              <span
                                className={cn(
                                  'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border',
                                  status === 'COMPLETED' && 'bg-moss text-white border-moss',
                                  status === 'IN_PROGRESS' && 'bg-amber text-white border-amber',
                                  locked && 'bg-red/15 text-red border-red/30',
                                  status === 'NOT_STARTED' && !locked && 'bg-ink/[.07] text-ink3 border-border',
                                )}
                              >
                                <StatusIcon status={status} locked={locked} />
                              </span>
                              <span className={cn('flex-1 text-[11.5px] leading-tight font-medium', active ? 'text-moss' : 'text-ink')}>
                                {step.title}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
