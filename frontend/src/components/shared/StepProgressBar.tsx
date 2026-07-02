'use client'

import { cn } from '@/lib/utils'
import { Check, Lock, Play } from 'lucide-react'

type StepStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED'

interface Step {
  id: string
  label: string
  status: StepStatus
}

interface StepProgressBarProps {
  steps: Step[]
  currentStep: string
  onStepClick: (stepId: string) => void
  phases?: { phase: number; name: string; color: string }[]
}

const STATUS_ICON: Record<StepStatus, React.ReactNode> = {
  COMPLETED:  <Check size={12} />,
  IN_PROGRESS: <Play size={12} />,
  NOT_STARTED: <span className="w-2 h-2 rounded-full bg-ink/20" />,
  BLOCKED:    <Lock size={10} />,
}

const STATUS_COLOR: Record<StepStatus, string> = {
  COMPLETED:   'bg-moss text-white',
  IN_PROGRESS: 'bg-amber text-white',
  NOT_STARTED: 'bg-ink/10 text-ink3',
  BLOCKED:     'bg-red/20 text-red',
}

const PHASE_COLORS = ['#2d7a52', '#c9a84c', '#4a7db5', '#8b5cf6']

const PHASE_STEP_MAP: Record<number, string[]> = {
  1: ['gbm_1','gbm_2','gbm_3','gbm_4','gbm_5','gbm_6'],
  2: ['gbm_7a','gbm_7b','gbm_8','gbm_9','gbm_10','gbm_11','gbm_12a','gbm_12b','gbm_13','gbm_14a','gbm_14b','gbm_15','gbm_16','gbm_17','gbm_18'],
  3: ['gbm_19'],
  4: ['gbm_20'],
}

export function StepProgressBar({ steps, currentStep, onStepClick, phases }: StepProgressBarProps) {
  return (
    <div className="space-y-4">
      {phases ? (
        phases.map((phase, pi) => {
          const phaseSteps = steps.filter(s => PHASE_STEP_MAP[phase.phase]?.includes(s.id))
          const phaseCompleted = phaseSteps.filter(s => s.status === 'COMPLETED').length
          const phaseTotal = phaseSteps.length

          return (
            <div key={phase.phase}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PHASE_COLORS[pi] }} />
                <span className="text-xs font-bold text-ink uppercase tracking-wider">{phase.name}</span>
                <span className="text-xs text-ink3 ml-auto">{phaseCompleted}/{phaseTotal}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {steps
                  .filter(s => (PHASE_STEP_MAP[phase.phase] || []).includes(s.id))
                  .map(step => (
                    <button
                      key={step.id}
                      onClick={() => onStepClick(step.id)}
                      className={cn(
                        'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border',
                        currentStep === step.id
                          ? 'ring-2 ring-moss/40 border-moss bg-moss-light'
                          : 'border-border hover:border-moss/30',
                        step.status === 'COMPLETED' && 'bg-moss/5',
                      )}
                    >
                      <span className={cn('w-4 h-4 rounded-full flex items-center justify-center', STATUS_COLOR[step.status])}>
                        {STATUS_ICON[step.status]}
                      </span>
                      <span className={cn(step.status === 'COMPLETED' ? 'text-moss' : 'text-ink2')}>{step.label}</span>
                    </button>
                  ))}
              </div>
            </div>
          )
        })
      ) : (
        // Flat list
        <div className="flex flex-wrap gap-1.5">
          {steps.map(step => (
            <button
              key={step.id}
              onClick={() => onStepClick(step.id)}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border',
                currentStep === step.id
                  ? 'ring-2 ring-moss/40 border-moss bg-moss-light'
                  : 'border-border hover:border-moss/30',
              )}
            >
              <span className={cn('w-4 h-4 rounded-full flex items-center justify-center', STATUS_COLOR[step.status])}>
                {STATUS_ICON[step.status]}
              </span>
              <span>{step.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
