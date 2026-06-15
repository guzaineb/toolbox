'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Save, Send, Loader2, AlertCircle,
  ChevronLeft, ChevronRight, CheckCircle2,
} from 'lucide-react';
import { Button, Card, Badge, ErrorAlert, Progress } from '@/components/shared/ui';
import { useStep } from '@/hooks/useSteps';
import { STEP_STATUS_LABELS, STEP_STATUS_VARIANTS } from '@/types/project';
import { projectService } from '@/services/project.service';
import { STEP_PEDAGOGICAL_CONTENT, SubSectionContent } from '@/data/pedagogical-content';
import { StepGuide } from '@/components/step-editor/StepGuide';
import { SubSectionCard } from '@/components/step-editor/SubSectionCard';
import { AIAssistantPanel } from '@/components/step-editor/AIAssistantPanel';

export default function StepEditorPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const stepNumber = parseInt(params.stepNumber as string);
  const { step, loading, saving, error, updateStep, submitStep, refetch } = useStep(projectId, stepNumber);
  const [formContent, setFormContent] = useState<Record<string, any>>({});
  const [activeSection, setActiveSection] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const pedagogicalContent = STEP_PEDAGOGICAL_CONTENT[stepNumber];
  const subSections: SubSectionContent[] = pedagogicalContent?.subSections || [];

  useEffect(() => {
    if (step?.content) {
      const migrated = migrateContent(step.content, subSections);
      setFormContent(migrated);
    }
  }, [step, stepNumber]);

  const migrateContent = useCallback(
    (raw: Record<string, any>, sections: SubSectionContent[]): Record<string, any> => {
      if (!sections.length) return raw;
      const result = { ...raw };
      for (const section of sections) {
        const existing = result[section.key];
        if (existing !== undefined && typeof existing === 'string' && section.guidedQuestions.length > 0) {
          const firstQ = section.guidedQuestions[0];
          result[section.key] = { [firstQ.question]: existing };
          for (let i = 1; i < section.guidedQuestions.length; i++) {
            result[section.key][section.guidedQuestions[i].question] = '';
          }
        }
      }
      return result;
    },
    [],
  );

  const autoSave = useCallback(async () => {
    if (!step) return;
    setSaveStatus('saving');
    try {
      await updateStep({ content: formContent, status: step.status === 'not_started' ? 'in_progress' : step.status });
      setSaveStatus('saved');
      setLastSaved(new Date());
      setTimeout(() => setSaveStatus((prev) => (prev === 'saved' ? 'idle' : prev)), 2000);
    } catch {
      setSaveStatus('error');
    }
  }, [formContent, step, updateStep]);

  useEffect(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      if (saveStatus !== 'saving') autoSave();
    }, 3000);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [formContent]);

  const handleFieldChange = (sectionKey: string, value: any) => {
    setFormContent((prev) => ({ ...prev, [sectionKey]: value }));
  };

  const handleSave = async () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setSaveStatus('saving');
    try {
      await updateStep({ content: formContent, status: step?.status === 'not_started' ? 'in_progress' : (step?.status || 'in_progress') });
      setSaveStatus('saved');
      setLastSaved(new Date());
      setTimeout(() => setSaveStatus((prev) => (prev === 'saved' ? 'idle' : prev)), 2000);
    } catch {
      setSaveStatus('error');
    }
  };

  const handleSubmit = async () => {
    await handleSave();
    try {
      await submitStep();
    } catch {}
  };

  const scrollToSection = (index: number) => {
    setActiveSection(index);
    sectionRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-moss" />
      </div>
    );
  }

  if (!step || !pedagogicalContent) {
    return (
      <div className="p-8 text-center">
        <AlertCircle size={32} className="mx-auto text-ink3 mb-3" />
        <p className="text-ink3">
          {!step ? 'Étape introuvable' : 'Contenu pédagogique non disponible'}
        </p>
      </div>
    );
  }

  const completedSections = subSections.filter((s) => {
    const sectionContent = formContent[s.key];
    return sectionContent && typeof sectionContent === 'object' && Object.values(sectionContent).some((v) => v && v !== '');
  }).length;

  const totalSections = subSections.length;

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-border">
        <div className="max-w-[1100px] mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push(`/dashboard/project-owner/projects/${projectId}`)}
                className="flex items-center gap-1 text-[12px] text-ink3 hover:text-ink transition-colors"
              >
                <ArrowLeft size={14} /> Retour
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-[11px] text-ink3 mr-2">
                {saveStatus === 'saving' && (
                  <><Loader2 size={12} className="animate-spin" /> Sauvegarde...</>
                )}
                {saveStatus === 'saved' && (
                  <><CheckCircle2 size={12} className="text-moss" /> Sauvegardé</>
                )}
                {saveStatus === 'error' && (
                  <><AlertCircle size={12} className="text-red" /> Erreur</>
                )}
                {lastSaved && saveStatus === 'idle' && (
                  <span>Dernière sauvegarde : {lastSaved.toLocaleTimeString()}</span>
                )}
              </div>

              <Button variant="default" size="sm" onClick={handleSave} loading={saving}>
                <Save size={12} /> Sauvegarder
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmit}
                loading={saving}
                disabled={step.status === 'approved'}
              >
                <Send size={12} /> Soumettre
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-[1100px] mx-auto px-6 py-6">
        {/* Step header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-ink3 uppercase tracking-[0.06em]">
                Étape {step.step_number}/13
              </span>
              <Badge variant={STEP_STATUS_VARIANTS[step.status]}>
                {STEP_STATUS_LABELS[step.status]}
              </Badge>
            </div>
            <h1 className="font-syne text-[24px] font-extrabold text-ink">{step.title}</h1>
            {step.description && (
              <p className="text-[13px] text-ink3 mt-1">{step.description}</p>
            )}
          </div>
        </div>

        {error && <ErrorAlert message={error} className="mb-4" />}

        {/* Progress */}
        <div className="flex items-center gap-3 mb-6">
          <Progress value={totalSections > 0 ? (completedSections / totalSections) * 100 : 0} />
          <span className="text-[11px] text-ink3 whitespace-nowrap">
            {completedSections}/{totalSections} sections
          </span>
        </div>

        {/* Two-column layout */}
        <div className="flex gap-6 items-start">
          {/* Left sidebar - pedagogical guide */}
          <div className="w-[260px] flex-shrink-0 space-y-4 sticky top-[72px]">
            <StepGuide content={pedagogicalContent} />

            {/* Sub-section navigation */}
            <Card className="overflow-hidden">
              <div className="p-[10px_14px] border-b border-border">
                <span className="text-[10px] font-bold text-ink3 uppercase tracking-[0.06em]">Sections</span>
              </div>
              <div className="p-[6px]">
                {subSections.map((s, i) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => scrollToSection(i)}
                    className={`w-full flex items-center gap-2.5 p-[7px_10px] rounded-[6px] text-left transition-colors ${
                      activeSection === i ? 'bg-moss-light text-moss' : 'hover:bg-moss/[.04] text-ink2'
                    }`}
                  >
                    <span className={`w-[5px] h-[5px] rounded-full flex-shrink-0 ${
                      formContent[s.key] && Object.values(formContent[s.key] || {}).some((v: any) => v && v !== '')
                        ? 'bg-moss'
                        : 'bg-ink3/30'
                    }`} />
                    <span className="text-[11px] font-medium truncate">{s.label}</span>
                  </button>
                ))}
              </div>
            </Card>

            {/* Step navigation */}
            <Card className="overflow-hidden">
              <div className="flex divide-x divide-border">
                {stepNumber > 1 ? (
                  <button
                    type="button"
                    onClick={() => router.push(`/dashboard/project-owner/projects/${projectId}/${stepNumber - 1}`)}
                    className="flex-1 flex items-center justify-center gap-1 p-[10px] text-[11px] font-medium text-ink2 hover:bg-moss/[.04] transition-colors"
                  >
                    <ChevronLeft size={13} /> Précédent
                  </button>
                ) : <div className="flex-1" />}

                {stepNumber < 13 ? (
                  <button
                    type="button"
                    onClick={() => router.push(`/dashboard/project-owner/projects/${projectId}/${stepNumber + 1}`)}
                    className="flex-1 flex items-center justify-center gap-1 p-[10px] text-[11px] font-medium text-ink2 hover:bg-moss/[.04] transition-colors"
                  >
                    Suivant <ChevronRight size={13} />
                  </button>
                ) : <div className="flex-1" />}
              </div>
            </Card>
          </div>

          {/* Right - form content */}
          <div className="flex-1 space-y-4">
            {subSections.map((section, i) => (
              <div key={section.key} ref={(el) => { sectionRefs.current[i] = el; }}>
                <SubSectionCard
                  section={section}
                  content={formContent}
                  onChange={handleFieldChange}
                  index={i}
                />
              </div>
            ))}

            {subSections.length === 0 && (
              <Card className="p-[20px_24px] text-center">
                <p className="text-[13px] text-ink3">Aucune section configurée pour cette étape.</p>
              </Card>
            )}

            {/* Bottom actions */}
            <Card className="p-[16px_20px]">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {stepNumber > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/dashboard/project-owner/projects/${projectId}/${stepNumber - 1}`)}
                    >
                      <ChevronLeft size={13} /> Étape précédente
                    </Button>
                  )}
                </div>
                <div className="flex gap-2 items-center">
                  <span className="text-[10px] text-ink3">
                    {saveStatus === 'saved' && 'Sauvegardé'}
                  </span>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSave}
                    loading={saving}
                  >
                    <Save size={12} /> Sauvegarder
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSubmit}
                    loading={saving}
                    disabled={step.status === 'approved'}
                  >
                    <Send size={12} /> Soumettre
                  </Button>
                  {stepNumber < 13 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/dashboard/project-owner/projects/${projectId}/${stepNumber + 1}`)}
                    >
                      Étape suivante <ChevronRight size={13} />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Floating AI Assistant */}
      <AIAssistantPanel
        projectId={projectId}
        stepNumber={stepNumber}
        step={step}
        formContent={formContent}
      />
    </div>
  );
}
