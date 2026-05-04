'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { Button, Progress } from '@/components/shared/ui';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  href: string;
  check: () => Promise<boolean>;
}

export function IncubatorOnboarding({ incubatorId }: { incubatorId: string }) {
  const router = useRouter();
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const incubator = await api.get(`/incubators/${incubatorId}`);
        const documents = await api.get(`/incubators/${incubatorId}/documents`);
        const members = await api.get(`/incubators/${incubatorId}/members`);

        const hasInfo = incubator.data.name && incubator.data.slug;
        const hasRequiredDocs = documents.data.some((d: any) => 
          ['registre_commerce', 'document_legal'].includes(d.document_type) && 
          d.verification_status === 'approved'
        );
        const hasTeam = members.data.length >= 2;

        const newCompletedSteps: number[] = [];
        if (hasInfo) newCompletedSteps.push(1);
        if (hasRequiredDocs) newCompletedSteps.push(2);
        if (hasTeam) newCompletedSteps.push(3);

        setCompletedSteps(newCompletedSteps);

        setSteps([
          {
            id: 1,
            title: 'Informations de base',
            description: 'Complétez les informations de votre incubateur',
            href: `/dashboard/incubator/${incubatorId}/edit`,
            check: async () => hasInfo,
          },
          {
            id: 2,
            title: 'Documents légaux',
            description: 'Uploadez les documents de vérification',
            href: `/dashboard/incubator/${incubatorId}/documents`,
            check: async () => hasRequiredDocs,
          },
          {
            id: 3,
            title: 'Inviter votre équipe',
            description: 'Ajoutez vos collaborateurs',
            href: `/dashboard/incubator/${incubatorId}/members`,
            check: async () => hasTeam,
          },
        ]);
      } catch (error) {
        console.error('Error fetching onboarding status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [incubatorId]);

  if (loading) return null;
  if (completedSteps.length === steps.length) return null;

  const progress = (completedSteps.length / steps.length) * 100;
  const nextStep = steps.find(s => !completedSteps.includes(s.id));

  return (
    <div className="bg-accent-light rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[13px] font-semibold">Configuration de l'incubateur</h3>
        <span className="text-[11px] text-accent">{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} />
      <p className="text-[12px] text-text-2 mt-2">
        Complétez les étapes pour activer votre incubateur
      </p>
      {nextStep && (
        <Button
          size="sm"
          className="mt-3 text-[12px]"
          onClick={() => router.push(nextStep.href)}
        >
          {nextStep.title} →
        </Button>
      )}
    </div>
  );
}