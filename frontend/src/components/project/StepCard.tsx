'use client';

import Link from 'next/link';
import { Badge } from '@/components/shared/ui';
import { ProjectStep, STEP_STATUS_LABELS, STEP_STATUS_VARIANTS } from '@/types/project';
import { CheckCircle2, Circle, Clock, ArrowRight, AlertCircle } from 'lucide-react';

const STATUS_ICONS: Record<string, any> = {
  not_started: Circle,
  in_progress: Clock,
  submitted: AlertCircle,
  approved: CheckCircle2,
  rejected: AlertCircle,
};

export function StepCard({ step, projectId, stepNumber }: { step: ProjectStep; projectId: string; stepNumber: number }) {
  const Icon = STATUS_ICONS[step.status];
  const variant = STEP_STATUS_VARIANTS[step.status];

  return (
    <Link
      href={`/dashboard/project-owner/projects/${projectId}/${stepNumber}`}
      className="block bg-surface border border-border rounded-[12px] p-[14px_16px] hover:shadow-md hover:border-moss/30 transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`w-[32px] h-[32px] rounded-full flex items-center justify-center flex-shrink-0 ${
            step.status === 'approved' ? 'bg-moss-light text-moss' :
            step.status === 'rejected' ? 'bg-red-light text-red' :
            step.status === 'submitted' ? 'bg-amber-light text-amber-dark' :
            'bg-ink/[.07] text-ink3'
          }`}>
            <Icon size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-bold text-ink3 uppercase tracking-[0.06em]">
                Étape {step.step_number}
              </span>
              <Badge variant={variant}>{STEP_STATUS_LABELS[step.status]}</Badge>
            </div>
            <h3 className="text-[14px] font-semibold text-ink truncate">{step.title}</h3>
            {step.description && (
              <p className="text-[12px] text-ink3 mt-1 line-clamp-1">{step.description}</p>
            )}
          </div>
        </div>
        <ArrowRight size={16} className="text-ink3 flex-shrink-0 mt-2" />
      </div>
    </Link>
  );
}
