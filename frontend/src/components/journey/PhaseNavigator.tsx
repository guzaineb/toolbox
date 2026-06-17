'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronRight, CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/shared/ui';
import { PHASES, ProjectStep } from '@/types/project';

const STATUS_ICONS = {
  not_started: Circle,
  in_progress: Clock,
  submitted: AlertCircle,
  approved: CheckCircle2,
  rejected: AlertCircle,
};

export function PhaseNavigator({
  currentStepNumber,
  steps,
  projectId,
}: {
  currentStepNumber: number;
  steps: ProjectStep[];
  projectId: string;
}) {
  const router = useRouter();
  const currentPhase = PHASES.find((p) => p.steps.includes(currentStepNumber));
  const [expandedPhases, setExpandedPhases] = useState<number[]>(
    currentPhase ? [currentPhase.phaseNumber] : [1],
  );

  const togglePhase = (phaseNumber: number) => {
    setExpandedPhases((prev) =>
      prev.includes(phaseNumber)
        ? prev.filter((p) => p !== phaseNumber)
        : [...prev, phaseNumber],
    );
  };

  const getStepStatus = (stepNumber: number) => {
    const step = steps.find((s) => s.step_number === stepNumber);
    return step?.status || 'not_started';
  };

  const getPhaseProgress = (phaseSteps: number[]) => {
    let completed = 0;
    let total = 0;
    for (const sn of phaseSteps) {
      const step = steps.find((s) => s.step_number === sn);
      if (step) total++;
      if (step?.status === 'approved') completed++;
    }
    return { completed, total: Math.max(total, phaseSteps.length) };
  };

  return (
    <div className="space-y-1.5">
      {PHASES.map((phase) => {
        const isExpanded = expandedPhases.includes(phase.phaseNumber);
        const progress = getPhaseProgress(phase.steps);
        const isCurrentPhase = currentPhase?.phaseNumber === phase.phaseNumber;

        return (
          <Card key={phase.phaseNumber} className={cn(
            'overflow-hidden transition-all duration-200',
            isCurrentPhase && 'ring-1 ring-moss/30',
          )}>
            <button
              type="button"
              onClick={() => togglePhase(phase.phaseNumber)}
              className="w-full flex items-center justify-between p-[10px_12px] hover:bg-moss/[.03] transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className={cn(
                  'w-[22px] h-[22px] rounded-[6px] flex items-center justify-center flex-shrink-0 text-[10px] font-bold',
                  isCurrentPhase ? 'bg-moss text-white' : 'bg-ink/[.07] text-ink3',
                )}>
                  {phase.phaseNumber}
                </div>
                <div className="text-left min-w-0">
                  <span className={cn(
                    'text-[11px] font-bold truncate block',
                    isCurrentPhase ? 'text-moss' : 'text-ink',
                  )}>
                    {phase.name}
                  </span>
                  <span className="text-[9px] text-ink3">
                    {progress.completed}/{progress.total}
                  </span>
                </div>
              </div>
              {isExpanded ? (
                <ChevronDown size={13} className="text-ink3 flex-shrink-0" />
              ) : (
                <ChevronRight size={13} className="text-ink3 flex-shrink-0" />
              )}
            </button>

            {isExpanded && (
              <div className="p-[2px_8px_8px] space-y-0.5">
                {phase.steps.map((stepNumber) => {
                  const status = getStepStatus(stepNumber);
                  const Icon = STATUS_ICONS[status];
                  const isActive = stepNumber === currentStepNumber;
                  const step = steps.find((s) => s.step_number === stepNumber);
                  const stepTitle = step?.title || `Étape ${stepNumber}`;

                  return (
                    <button
                      key={stepNumber}
                      type="button"
                      onClick={() => router.push(`/dashboard/project-owner/projects/${projectId}/${stepNumber}`)}
                      className={cn(
                        'w-full flex items-center gap-2 p-[6px_8px] rounded-[6px] text-left transition-colors text-[11px]',
                        isActive
                          ? 'bg-moss-light text-moss font-semibold'
                          : 'hover:bg-ink/[.04] text-ink2',
                      )}
                    >
                      <Icon size={12} className={cn(
                        'flex-shrink-0',
                        status === 'approved' && 'text-moss',
                        status === 'in_progress' && 'text-blue',
                        status === 'submitted' && 'text-amber-dark',
                        status === 'rejected' && 'text-red',
                        status === 'not_started' && 'text-ink3/40',
                      )} />
                      <span className="truncate">{stepTitle}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
