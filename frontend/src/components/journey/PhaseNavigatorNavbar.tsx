'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PHASES, ProjectStep } from '@/types/project';

const STATUS_ICONS: Record<string, any> = {
  not_started: Circle,
  in_progress: Clock,
  submitted: AlertCircle,
  approved: CheckCircle2,
  rejected: AlertCircle,
};

export function PhaseNavigatorNavbar({
  currentStepNumber,
  steps,
  projectId,
}: {
  currentStepNumber: number;
  steps: ProjectStep[];
  projectId: string;
}) {
  const router = useRouter();
  const [openPhase, setOpenPhase] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentPhase = PHASES.find((p) => p.steps.includes(currentStepNumber));

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenPhase(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      if (step?.status === 'approved' || step?.status === 'submitted') completed++;
    }
    return { completed, total: Math.max(total, phaseSteps.length) };
  };

  return (
    <div ref={dropdownRef} className="flex items-center gap-1">
      {PHASES.map((phase) => {
        const progress = getPhaseProgress(phase.steps);
        const isCurrent = currentPhase?.phaseNumber === phase.phaseNumber;
        const isOpen = openPhase === phase.phaseNumber;

        return (
          <div key={phase.phaseNumber} className="relative">
            <button
              type="button"
              onClick={() => setOpenPhase(isOpen ? null : phase.phaseNumber)}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] text-[11px] font-medium transition-colors',
                isCurrent
                  ? 'bg-moss-light text-moss'
                  : 'text-ink2 hover:bg-moss/[.04] hover:text-ink',
              )}
            >
              <div className={cn(
                'w-[18px] h-[18px] rounded-[4px] flex items-center justify-center text-[9px] font-bold flex-shrink-0',
                isCurrent ? 'bg-moss text-white' : 'bg-ink/[.07] text-ink3',
              )}>
                {phase.phaseNumber}
              </div>
              <span className="hidden xl:inline truncate max-w-[100px]">{phase.name}</span>
              <span className="text-[10px] text-ink3">({progress.completed}/{progress.total})</span>
              <ChevronDown size={10} className={cn('text-ink3 transition-transform', isOpen && 'rotate-180')} />
            </button>

            {isOpen && (
              <div className="absolute top-full left-0 mt-1 w-[220px] bg-surface border border-border rounded-[8px] shadow-lg p-1.5 z-50 space-y-0.5">
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
                      onClick={() => {
                        router.push(`/dashboard/project-owner/projects/${projectId}/${stepNumber}`);
                        setOpenPhase(null);
                      }}
                      className={cn(
                        'w-full flex items-center gap-2 p-[6px_8px] rounded-[6px] text-left transition-colors text-[11px]',
                        isActive
                          ? 'bg-moss-light text-moss font-semibold'
                          : 'hover:bg-ink/[.04] text-ink2',
                      )}
                    >
                      <Icon size={12} className={cn(
                        'flex-shrink-0',
                        (status === 'approved' || status === 'submitted') && 'text-moss',
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
          </div>
        );
      })}
    </div>
  );
}
