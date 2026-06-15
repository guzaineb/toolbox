'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, FolderKanban, TrendingUp, FileText, MessageSquare,
  Star, Settings, Trash2, Loader2, Plus, CheckCircle2, AlertCircle,
} from 'lucide-react';
import { Button, Card, Badge, Progress, ErrorAlert } from '@/components/shared/ui';
import { StepCard } from '@/components/project/StepCard';
import { useProject } from '@/hooks/useProjects';
import { useProjectProgress } from '@/hooks/useProgress';
import { PROJECT_STATUS_LABELS, ProjectStatus } from '@/types/project';
import { projectService } from '@/services/project.service';

const STATUS_VARIANTS: Record<string, 'green' | 'amber' | 'blue' | 'gray' | 'red'> = {
  draft: 'gray',
  in_progress: 'blue',
  submitted: 'amber',
  under_review: 'amber',
  approved: 'green',
  rejected: 'red',
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { project, loading, error, refetch } = useProject(projectId);
  const { progress, loading: progressLoading } = useProjectProgress(projectId);
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-moss" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 text-center">
        <AlertCircle size={32} className="mx-auto text-ink3 mb-3" />
        <p className="text-ink3">Projet introuvable</p>
        <Button variant="primary" className="mt-4" onClick={() => router.push('/dashboard/project-owner')}>
          Retour aux projets
        </Button>
      </div>
    );
  }

  const handleSubmitProject = async () => {
    setSaving(true);
    try {
      await projectService.updateStatus(projectId, 'submitted');
      await refetch();
    } catch {} finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await projectService.delete(projectId);
      router.push('/dashboard/project-owner');
    } catch {} finally {
      setSaving(false);
    }
  };

  const steps = project.steps?.sort((a, b) => a.step_number - b.step_number) || [];
  const completed = steps.filter(s => s.status === 'approved').length;
  const total = steps.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="p-6 md:p-8 max-w-[900px] mx-auto space-y-6">
      {/* Back */}
      <button onClick={() => router.push('/dashboard/project-owner')} className="flex items-center gap-1.5 text-[12px] text-ink3 hover:text-ink transition-colors">
        <ArrowLeft size={14} /> Mes projets
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-[44px] h-[44px] rounded-[12px] bg-moss-light text-moss flex items-center justify-center flex-shrink-0">
            <FolderKanban size={22} />
          </div>
          <div className="min-w-0">
            <h1 className="font-syne text-[22px] font-extrabold text-ink truncate">{project.name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant={STATUS_VARIANTS[project.status]}>{PROJECT_STATUS_LABELS[project.status]}</Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {project.status === 'draft' || project.status === 'in_progress' ? (
            <Button variant="primary" size="sm" onClick={handleSubmitProject} loading={saving}>
              <CheckCircle2 size={13} /> Soumettre le projet
            </Button>
          ) : null}
          <Button variant="default" size="sm" onClick={() => setShowDelete(true)}>
            <Trash2 size={13} />
          </Button>
        </div>
      </div>

      {error && <ErrorAlert message={error} />}

      {/* Progress */}
      <Card className="p-[16px_18px]">
        <div className="flex items-center gap-3 mb-2.5">
          <TrendingUp size={14} className="text-moss" />
          <span className="text-[11px] font-bold text-ink3 uppercase tracking-[0.07em]">Progression</span>
          <span className="text-[13px] font-bold text-moss ml-auto">{percentage}%</span>
        </div>
        <Progress value={percentage} />
        <div className="flex justify-between text-[11px] text-ink3 mt-1.5">
          <span>{completed}/{total} étapes complétées</span>
          {project.status === 'submitted' && <span className="text-amber font-semibold">En attente d'évaluation</span>}
        </div>
      </Card>

      {/* Steps */}
      <div>
        <h2 className="font-syne text-[15px] font-bold text-ink mb-3">Parcours entrepreneurial</h2>
        <div className="grid grid-cols-1 gap-2.5">
          {steps.map((step) => (
            <StepCard key={step.id} step={step} projectId={project.id} stepNumber={step.step_number} />
          ))}
        </div>
      </div>

      {/* Delete confirmation */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface rounded-xl p-6 max-w-md w-full mx-4 shadow-lg">
            <h3 className="font-syne text-[16px] font-bold text-ink mb-2">Supprimer le projet</h3>
            <p className="text-[13px] text-ink3 mb-4">
              Êtes-vous sûr de vouloir supprimer <strong>{project.name}</strong> ? Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <Button variant="default" className="flex-1" onClick={() => setShowDelete(false)}>Annuler</Button>
              <Button variant="danger" className="flex-1" onClick={handleDelete} loading={saving}>Supprimer</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
