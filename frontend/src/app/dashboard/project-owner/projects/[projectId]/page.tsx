'use client';

import { Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft, FolderKanban, TrendingUp,
  Star, Trash2, Loader2, CheckCircle2, AlertCircle,
  ChevronDown, ChevronRight, Layers, Download,
  FileText, BarChart3, MessageSquare, History,
} from 'lucide-react';
import { Button, Card, Badge, Progress, ErrorAlert, GlassCard } from '@/components/shared/ui';
import { StepCard } from '@/components/project/StepCard';
import { ProjectSidebar } from '@/components/project/ProjectSidebar';
import { useProject } from '@/hooks/useProjects';
import { projectService } from '@/services/project.service';
import { ProjectStep, PROJECT_STATUS_LABELS, PHASES, DetailedProjectStats, ProjectVersion, Review, ScoreInfo, ProgressInfo } from '@/types/project';
import { getToolProgress, TOOL_STEP_MAPPING, ToolKey } from '@/types/switchers';
import { useState, useEffect, useCallback } from 'react';

const STATUS_VARIANTS: Record<string, 'green' | 'amber' | 'blue' | 'gray' | 'red'> = {
  draft: 'gray',
  in_progress: 'blue',
  submitted: 'amber',
  under_review: 'amber',
  approved: 'green',
  rejected: 'red',
};

function ProjectDetailContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = params.projectId as string;
  const { project, loading, error, refetch } = useProject(projectId);
  const [detailedStats, setDetailedStats] = useState<DetailedProjectStats | null>(null);
  const [versions, setVersions] = useState<ProjectVersion[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [scores, setScores] = useState<ScoreInfo | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [expandedPhases, setExpandedPhases] = useState<number[]>([1]);
  const [activeTab, setActiveTab] = useState<string>('phases');
  const [creatingVersion, setCreatingVersion] = useState(false);

  const tab = searchParams.get('tab');

  useEffect(() => {
    if (tab === 'versions') setActiveTab('versions');
    else if (tab === 'share') setActiveTab('share');
  }, [tab]);

  const fetchDetailedStats = useCallback(async () => {
    if (!projectId) return;
    setStatsLoading(true);
    try {
      const [statsData, versionsData, reviewsData, scoresData] = await Promise.all([
        projectService.getDetailedStats(projectId).catch(() => null),
        projectService.getVersions(projectId).catch(() => []),
        projectService.getReviews(projectId).catch(() => []),
        projectService.getScore(projectId).catch(() => null),
      ]);
      setDetailedStats(statsData);
      setVersions(versionsData);
      setReviews(reviewsData);
      setScores(scoresData);
    } catch {} finally {
      setStatsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchDetailedStats();
  }, [fetchDetailedStats]);

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

  const handleCreateVersion = async () => {
    setCreatingVersion(true);
    try {
      await projectService.createVersion(projectId);
      await fetchDetailedStats();
    } catch {} finally {
      setCreatingVersion(false);
    }
  };

  const handleRestoreVersion = async (versionId: string) => {
    try {
      await projectService.restoreVersion(projectId, versionId);
      await fetchDetailedStats();
      await refetch();
    } catch {}
  };

  const steps = project.steps?.sort((a, b) => a.step_number - b.step_number) || [];
  const progress = detailedStats?.progress;
  const completed = progress?.completed || 0;
  const total = progress?.total || steps.length || 0;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const togglePhase = (phaseNumber: number) => {
    setExpandedPhases((prev) =>
      prev.includes(phaseNumber)
        ? prev.filter((p) => p !== phaseNumber)
        : [...prev, phaseNumber],
    );
  };

  const getPhaseSteps = (phaseStepNumbers: number[]) => {
    return phaseStepNumbers
      .map((sn) => steps.find((s) => s.step_number === sn))
      .filter(Boolean)
      .sort((a, b) => a!.step_number - b!.step_number);
  };

  const getPhaseProgress = (phaseStepNumbers: number[]) => {
    const phaseSteps = getPhaseSteps(phaseStepNumbers);
    const completed = phaseSteps.filter((s) => s!.status === 'approved').length;
    return { completed, total: phaseStepNumbers.length };
  };

  const scoreValue = scores?.average || 0;
  const scoreCriteria = scores?.criteria || {};

  const toolProgress: Record<string, number> = {};
  if (steps.length > 0) {
    (Object.keys(TOOL_STEP_MAPPING) as ToolKey[]).forEach((key) => {
      toolProgress[key] = getToolProgress(steps, key);
    });
  }

  return (
    <div className="p-6 md:p-8 mx-auto space-y-6">
      <div className="flex gap-6 items-start">
        {/* Left sidebar – modules */}
        <div className="w-[260px] flex-shrink-0 hidden lg:block">
          <ProjectSidebar
            projectId={projectId}
            steps={steps}
            progress={toolProgress}
          />
        </div>
        {/* Main content */}
        <div className="flex-1 min-w-0 max-w-[800px]">
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
              {scoreValue > 0 && (
                <span className="text-[11px] text-moss font-semibold">Score: {scoreValue}/100</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0 flex-wrap">
          <Button variant="ghost" size="sm" className="text-[11px] gap-1.5" onClick={() => projectService.generateBmc(projectId).catch(() => {})}>
            <FileText size={13} /> Générer BMC
          </Button>
          <Button variant="ghost" size="sm" className="text-[11px] gap-1.5" onClick={handleCreateVersion} loading={creatingVersion}>
            <Layers size={13} /> Créer version
          </Button>
          <Button variant="ghost" size="sm" className="text-[11px] gap-1.5" onClick={() => projectService.exportProject(projectId, 'html')}>
            <Download size={13} /> Export
          </Button>
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

      {/* Stats Grid */}
      {!statsLoading && progress && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <GlassCard className="p-[14px_16px]">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 size={14} className="text-moss" />
              <span className="text-[10px] font-bold text-ink3 uppercase tracking-[0.06em]">Progression</span>
            </div>
            <span className="text-[22px] font-bold text-ink">{percentage}%</span>
            <div className="mt-1"><Progress value={percentage} /></div>
            <span className="text-[10px] text-ink3">{progress.approved}/{total} approuvées</span>
          </GlassCard>
          <GlassCard className="p-[14px_16px]">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 size={14} className="text-moss" />
              <span className="text-[10px] font-bold text-ink3 uppercase tracking-[0.06em]">Soumises</span>
            </div>
            <span className="text-[22px] font-bold text-amber">{progress.submitted}</span>
            <span className="text-[10px] text-ink3">en attente d&apos;évaluation</span>
          </GlassCard>
          <GlassCard className="p-[14px_16px]">
            <div className="flex items-center gap-2 mb-1">
              <Star size={14} className="text-amber-dark" />
              <span className="text-[10px] font-bold text-ink3 uppercase tracking-[0.06em]">Score</span>
            </div>
            <span className="text-[22px] font-bold text-ink">{scoreValue}/100</span>
            <div className="flex gap-1.5 mt-1 flex-wrap">
              {Object.entries(scoreCriteria).map(([key, val]) => (
                <span key={key} className="text-[9px] bg-moss-light text-moss px-1.5 py-0.5 rounded-full">
                  {key}: {val}
                </span>
              ))}
            </div>
          </GlassCard>
          <GlassCard className="p-[14px_16px]">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle size={14} className="text-red" />
              <span className="text-[10px] font-bold text-ink3 uppercase tracking-[0.06em]">Rejetées</span>
            </div>
            <span className="text-[22px] font-bold text-red">{progress.rejected}</span>
            <span className="text-[10px] text-ink3">à reprendre</span>
          </GlassCard>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {[{ id: 'phases', label: 'Parcours', icon: FolderKanban }, { id: 'versions', label: 'Versions', icon: Layers }, { id: 'feedbacks', label: 'Feedbacks', icon: MessageSquare }, { id: 'history', label: 'Historique', icon: History }].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.06em] border-b-2 transition-colors ${
                activeTab === t.id ? 'border-moss text-moss' : 'border-transparent text-ink3 hover:text-ink'
              }`}
            >
              <Icon size={13} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'phases' && (
        <div>
          <h2 className="font-syne text-[15px] font-bold text-ink mb-3">Parcours entrepreneurial</h2>
          <div className="space-y-3">
            {PHASES.map((phase) => {
              const isExpanded = expandedPhases.includes(phase.phaseNumber);
              const phaseSteps = getPhaseSteps(phase.steps);
              const phaseProgress = getPhaseProgress(phase.steps);

              return (
                <Card key={phase.phaseNumber} className="overflow-hidden">
                  <button
                    type="button"
                    onClick={() => togglePhase(phase.phaseNumber)}
                    className="w-full flex items-center justify-between p-[14px_18px] hover:bg-moss/[.03] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-[32px] h-[32px] rounded-[8px] bg-moss-light text-moss flex items-center justify-center font-syne text-[13px] font-extrabold">
                        {phase.phaseNumber}
                      </div>
                      <div className="text-left">
                        <span className="text-[14px] font-bold text-ink">{phase.name}</span>
                        <p className="text-[11px] text-ink3">{phase.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[11px] font-medium text-ink2">
                          {phaseProgress.completed}/{phaseProgress.total}
                        </span>
                        <div className="w-[60px] mt-1">
                          <Progress value={phaseProgress.total > 0 ? (phaseProgress.completed / phaseProgress.total) * 100 : 0} />
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronDown size={16} className="text-ink3 flex-shrink-0" />
                      ) : (
                        <ChevronRight size={16} className="text-ink3 flex-shrink-0" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="p-[0_18px_18px] space-y-2">
                      {phaseSteps.length > 0 ? (
                        phaseSteps.map((step) => (
                          <StepCard key={step!.id} step={step!} projectId={project.id} stepNumber={step!.step_number} />
                        ))
                      ) : (
                        <p className="text-[12px] text-ink3 text-center py-4">
                          Aucune étape dans cette phase
                        </p>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'versions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-syne text-[15px] font-bold text-ink">Versions du projet</h2>
            <Button variant="default" size="sm" onClick={handleCreateVersion} loading={creatingVersion}>
              <Layers size={13} /> Nouvelle version
            </Button>
          </div>
          {versions.length === 0 ? (
            <Card className="p-[20px_24px] text-center">
              <Layers size={24} className="mx-auto text-ink3 mb-2" />
              <p className="text-[13px] text-ink3">Aucune version créée</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {versions.map((v) => (
                <Card key={v.id} className={`p-[14px_18px] flex items-center justify-between ${v.is_current ? 'border-moss' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-[36px] h-[36px] rounded-[8px] bg-moss-light text-moss flex items-center justify-center font-syne text-[12px] font-extrabold">
                      v{v.version_number}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold text-ink">Version {v.version_number}</span>
                        {v.is_current && <Badge variant="green">Actuelle</Badge>}
                        {v.label && <span className="text-[11px] text-ink3">{v.label}</span>}
                      </div>
                      <span className="text-[11px] text-ink3">
                        {new Date(v.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        {v.author?.profile ? ` — par ${v.author.profile.first_name} ${v.author.profile.last_name}` : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!v.is_current && (
                      <Button variant="ghost" size="sm" className="text-[11px]" onClick={() => handleRestoreVersion(v.id)}>
                        Restaurer
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'feedbacks' && (
        <div className="space-y-4">
          <h2 className="font-syne text-[15px] font-bold text-ink">Feedbacks des évaluateurs</h2>
          {reviews.length === 0 ? (
            <Card className="p-[20px_24px] text-center">
              <MessageSquare size={24} className="mx-auto text-ink3 mb-2" />
              <p className="text-[13px] text-ink3">Aucun retour pour le moment</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {reviews.map((r) => (
                <Card key={r.id} className="p-[14px_18px]">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-[28px] h-[28px] rounded-full bg-moss-light text-moss flex items-center justify-center text-[10px] font-bold">
                        {r.user?.profile?.first_name?.charAt(0) || '?'}{r.user?.profile?.last_name?.charAt(0) || ''}
                      </div>
                      <div>
                        <span className="text-[12px] font-semibold text-ink">
                          {r.user?.profile?.first_name} {r.user?.profile?.last_name}
                        </span>
                        <span className="text-[10px] text-ink3 ml-2">
                          {new Date(r.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {r.innovation_score && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-light text-blue">I: {r.innovation_score}</span>}
                      {r.faisability_score && <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-light text-green">F: {r.faisability_score}</span>}
                      {r.market_score && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-light text-amber-dark">M: {r.market_score}</span>}
                    </div>
                  </div>
                  <p className="text-[12px] text-ink2 leading-relaxed">{r.content}</p>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          <h2 className="font-syne text-[15px] font-bold text-ink">Historique des modifications</h2>
          {!detailedStats?.history?.length ? (
            <Card className="p-[20px_24px] text-center">
              <History size={24} className="mx-auto text-ink3 mb-2" />
              <p className="text-[13px] text-ink3">Aucun historique disponible</p>
            </Card>
          ) : (
            <div className="relative pl-6 space-y-3">
              {detailedStats.history.map((h, i) => (
                <div key={h.id || i} className="relative pb-3 border-l-2 border-moss-light pl-4">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-moss-light border-2 border-moss" />
                  <p className="text-[11px] font-medium text-ink">{h.action}</p>
                  <p className="text-[10px] text-ink3">
                    {h.previous_status && `${h.previous_status} → `}{h.new_status}
                    {h.user?.profile && ` — par ${h.user.profile.first_name} ${h.user.profile.last_name}`}
                  </p>
                  <p className="text-[10px] text-ink3">{new Date(h.created_at).toLocaleString('fr-FR')}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      </div>{/* end main content */}
    </div>{/* end flex row */}

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

export default function ProjectDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 size={32} className="animate-spin text-moss" /></div>}>
      <ProjectDetailContent />
    </Suspense>
  );
}
