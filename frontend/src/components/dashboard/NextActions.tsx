'use client';

import { useRouter } from 'next/navigation';
import { Card, CardHeader, Button, Badge } from '@/components/shared/ui';
import { ProjectStep, STEP_STATUS_LABELS, STEP_STATUS_VARIANTS } from '@/types/project';
import { STEP_PEDAGOGICAL_CONTENT_V2 } from '@/data/pedagogical-content-v2';
import { ArrowRight, Sparkles } from 'lucide-react';

export function NextActions({
  steps,
  projectId,
}: {
  steps: ProjectStep[];
  projectId: string;
}) {
  const router = useRouter();

  const nextStep = steps.find(
    (s) => s.status === 'not_started' || s.status === 'in_progress'
  );

  if (!nextStep) return null;

  const content = STEP_PEDAGOGICAL_CONTENT_V2[nextStep.step_number];
  const variant = STEP_STATUS_VARIANTS[nextStep.status];
  const label = STEP_STATUS_LABELS[nextStep.status];
  const isInProgress = nextStep.status === 'in_progress';

  return (
    <Card>
      <CardHeader
        icon={<Sparkles size={15} />}
        title="Prochaine action recommandée"
      />
      <div className="p-[18px]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold text-ink3 uppercase tracking-[0.06em]">
            Étape {nextStep.step_number}
          </span>
          <Badge variant={variant}>{label}</Badge>
        </div>
        <h3 className="text-[14px] font-semibold text-ink mt-1">
          {content?.title ?? nextStep.title}
        </h3>
        <p className="text-[12px] text-ink3 mt-2 leading-relaxed">
          {content?.objective ?? nextStep.description}
        </p>
        <Button
          variant="primary"
          size="sm"
          className="mt-4"
          onClick={() =>
            router.push(
              `/dashboard/project-owner/projects/${projectId}/${nextStep.step_number}`
            )
          }
        >
          {isInProgress ? 'Continuer' : 'Commencer'}
          <ArrowRight size={14} />
        </Button>
      </div>
    </Card>
  );
}
