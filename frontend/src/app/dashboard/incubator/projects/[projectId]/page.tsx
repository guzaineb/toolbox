'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, FolderKanban, TrendingUp, MessageSquare, Star, Send,
  Loader2, CheckCircle2, User,
} from 'lucide-react';
import { Button, Card, Badge, Progress, Field, Textarea, ErrorAlert } from '@/components/shared/ui';
import { useProject } from '@/hooks/useProjects';
import { useProjectProgress } from '@/hooks/useProgress';
import { PROJECT_STATUS_LABELS, STEP_STATUS_LABELS, STEP_STATUS_VARIANTS, CreateReviewDto } from '@/types/project';
import { projectService } from '@/services/project.service';

const STATUS_VARIANTS: Record<string, 'green' | 'amber' | 'blue' | 'gray' | 'red'> = {
  draft: 'gray', in_progress: 'blue', submitted: 'amber',
  under_review: 'amber', approved: 'green', rejected: 'red',
};

export default function IncubatorProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { project, loading, refetch } = useProject(projectId);
  const { progress } = useProjectProgress(projectId);
  const [review, setReview] = useState('');
  const [innovationScore, setInnovationScore] = useState(0);
  const [faisabilityScore, setFaisabilityScore] = useState(0);
  const [marketScore, setMarketScore] = useState(0);
  const [teamScore, setTeamScore] = useState(0);
  const [bmScore, setBmScore] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 size={32} className="animate-spin text-moss" /></div>;
  }

  if (!project) {
    return <div className="p-8 text-center"><p className="text-ink3">Projet introuvable</p></div>;
  }

  const userName = project.user?.profile?.first_name
    ? `${project.user.profile.first_name} ${project.user.profile.last_name || ''}`
    : project.user?.email || 'Utilisateur';

  const steps = project.steps?.sort((a, b) => a.step_number - b.step_number) || [];
  const completed = steps.filter(s => s.status === 'approved').length;
  const total = steps.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const handleSubmitReview = async () => {
    if (!review.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const dto: CreateReviewDto = {
        content: review,
        innovation_score: innovationScore || undefined,
        faisability_score: faisabilityScore || undefined,
        market_score: marketScore || undefined,
        team_score: teamScore || undefined,
        business_model_score: bmScore || undefined,
      };
      await projectService.createReview(projectId, dto);
      setReview('');
      await refetch();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-[900px] mx-auto space-y-6">
      <button onClick={() => router.push('/dashboard/incubator/projects')} className="flex items-center gap-1.5 text-[12px] text-ink3 hover:text-ink transition-colors">
        <ArrowLeft size={14} /> Tous les projets
      </button>

      <div className="flex items-center gap-3">
        <div className="w-[44px] h-[44px] rounded-[12px] bg-moss-light text-moss flex items-center justify-center">
          <FolderKanban size={22} />
        </div>
        <div>
          <h1 className="font-syne text-[22px] font-extrabold text-ink">{project.name}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant={STATUS_VARIANTS[project.status]}>{PROJECT_STATUS_LABELS[project.status]}</Badge>
            <span className="text-[12px] text-ink3">Porteur : {userName}</span>
          </div>
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
        <div className="text-[11px] text-ink3 mt-1.5">{completed}/{total} étapes complétées</div>
      </Card>

      {/* Steps */}
      <div>
        <h2 className="font-syne text-[15px] font-bold text-ink mb-3">Étapes du parcours</h2>
        <div className="space-y-2">
          {steps.map(step => (
            <Card key={step.id} className="p-[12px_16px]">
              <div className="flex items-center gap-3">
                <div className={`w-[28px] h-[28px] rounded-full flex items-center justify-center flex-shrink-0 ${
                  step.status === 'approved' ? 'bg-moss-light text-moss' :
                  step.status === 'rejected' ? 'bg-red-light text-red' :
                  'bg-ink/[.07] text-ink3'
                }`}>
                  {step.status === 'approved' ? <CheckCircle2 size={14} /> :
                   step.status === 'rejected' ? <span className="text-[12px]">✕</span> :
                   <span className="text-[11px]">{step.step_number}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-ink">{step.title}</div>
                </div>
                <Badge variant={STEP_STATUS_VARIANTS[step.status]}>{STEP_STATUS_LABELS[step.status]}</Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Reviews */}
      <div>
        <h2 className="font-syne text-[15px] font-bold text-ink mb-3">Évaluations et commentaires</h2>

        {project.reviews && project.reviews.length > 0 && (
          <div className="space-y-3 mb-4">
            {project.reviews.map(r => (
              <Card key={r.id} className="p-[14px_18px]">
                <div className="flex items-start gap-3">
                  <div className="w-[28px] h-[28px] rounded-full bg-moss-light text-moss flex items-center justify-center flex-shrink-0">
                    <User size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[12px] font-semibold text-ink">
                        {r.user?.profile?.first_name || 'Expert'}
                      </span>
                      <span className="text-[10px] text-ink3">
                        {new Date(r.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <p className="text-[13px] text-ink2">{r.content}</p>
                    {(r.innovation_score != null) && (
                      <div className="flex gap-3 mt-2 text-[10px] text-ink3">
                        {r.innovation_score != null && <span>Innovation: {r.innovation_score}</span>}
                        {r.faisability_score != null && <span>Faisabilité: {r.faisability_score}</span>}
                        {r.market_score != null && <span>Marché: {r.market_score}</span>}
                        {r.team_score != null && <span>Équipe: {r.team_score}</span>}
                        {r.business_model_score != null && <span>Modèle: {r.business_model_score}</span>}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Add review */}
        <Card className="p-[16px_18px]">
          <h3 className="text-[13px] font-semibold text-ink mb-3">Ajouter une évaluation</h3>
          <Field label="Commentaire">
            <Textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Votre retour sur ce projet..."
              rows={3}
            />
          </Field>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
            {[
              { label: 'Innovation', value: innovationScore, set: setInnovationScore },
              { label: 'Faisabilité', value: faisabilityScore, set: setFaisabilityScore },
              { label: 'Marché', value: marketScore, set: setMarketScore },
              { label: 'Équipe', value: teamScore, set: setTeamScore },
              { label: 'Modèle éco.', value: bmScore, set: setBmScore },
            ].map((field) => (
              <div key={field.label}>
                <label className="text-[10px] font-semibold text-ink3 block mb-1">{field.label}</label>
                <select
                  value={field.value}
                  onChange={(e) => field.set(parseInt(e.target.value))}
                  className="w-full px-2 py-1.5 font-dm text-[12px] border border-border rounded-lg bg-surface text-ink outline-none"
                >
                  <option value={0}>-</option>
                  {[20, 40, 60, 80, 100].map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <Button variant="primary" size="sm" onClick={handleSubmitReview} loading={saving} disabled={!review.trim()}>
              <Send size={13} /> Publier l'évaluation
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
