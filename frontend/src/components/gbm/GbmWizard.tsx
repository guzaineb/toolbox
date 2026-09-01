'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, Loader2, Lock, Sparkles } from 'lucide-react'
import { gbmService } from '@/services/gbm.service'
import { getStepGuide } from '@/data/gbm/guides'
import { GBM_STEPS, getStepIndex, getStepMeta, isAiStep, isOneToMany } from '@/data/gbm/steps'
import type { GbmStepMeta } from '@/data/gbm/steps'
import type { GbmProgress } from '@/types/gbm'
import { Badge, Button, Card, CardHeader, ErrorAlert, Progress, SuccessAlert } from '@/components/shared/ui'
import { AiSummaryBadge } from '@/components/shared/AiSummaryBadge'
import { GbmNavbar } from './GbmNavbar'
import { StepForm } from './StepForm'
import { OneToManyManager, type OneToManyManagerHandle } from './OneToManyManager'
import { GuidePanel } from './GuidePanel'
import { GbmChatbot } from './GbmChatbot'
import { cn, getErrorMessage } from '@/lib/utils'

type StepStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED'

const statusLabel: Record<StepStatus, { text: string; variant: 'green' | 'amber' | 'gray' | 'red' }> = {
  COMPLETED: { text: 'Complétée', variant: 'green' },
  IN_PROGRESS: { text: 'En cours', variant: 'amber' },
  BLOCKED: { text: 'Bloquée', variant: 'red' },
  NOT_STARTED: { text: 'À faire', variant: 'gray' },
}

export function GbmWizard({ projectId }: { projectId: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const stepParam = searchParams.get('step')
  const currentStep = GBM_STEPS.some(s => s.key === stepParam) ? stepParam! : 'gbm_1'
  const stepMeta = getStepMeta(currentStep) as GbmStepMeta
  const stepIndex = getStepIndex(currentStep)

  const [progress, setProgress] = useState<GbmProgress | null>(null)
  const [cache, setCache] = useState<Record<string, unknown>>({})
  const [formData, setFormData] = useState<Record<string, unknown>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [reviewing, setReviewing] = useState(false)
  const [reviewDone, setReviewDone] = useState(false)
  const [lockNotice, setLockNotice] = useState('')
  const managerRef = useRef<OneToManyManagerHandle>(null)

  const refreshProgress = useCallback(async () => {
    try {
      setProgress(await gbmService.getProgress(projectId))
    } catch {
      // ignore
    }
  }, [projectId])

  useEffect(() => { refreshProgress() }, [refreshProgress])

  useEffect(() => {
    const key = currentStep
    if (cache[key] !== undefined) {
      setFormData(cache[key] as Record<string, unknown>)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError('')
    setLockNotice('')
    gbmService.getStep(projectId, key)
      .then(data => {
        if (cancelled) return
        setCache(prev => ({ ...prev, [key]: data }))
        setFormData(data as Record<string, unknown>)
      })
      .catch(e => {
        if (!cancelled) setError(getErrorMessage(e))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [projectId, currentStep, cache])

  const refreshCurrentStep = useCallback(async () => {
    try {
      const data = await gbmService.getStep(projectId, currentStep)
      setCache(prev => ({ ...prev, [currentStep]: data }))
      setFormData(data as Record<string, unknown>)
    } catch {
      // keep current data
    }
  }, [projectId, currentStep])

  const statusOf = useCallback((key: string): StepStatus => {
    return (progress?.steps.find(s => s.step_key === key)?.status as StepStatus) || 'NOT_STARTED'
  }, [progress])

  const dataHasContent = useCallback((key: string): boolean => {
    const meta = getStepMeta(key)
    const data = cache[key]
    if (!meta || data === undefined || data === null) return false
    if (meta.relation === 'one-to-many') return Array.isArray(data) && data.length > 0
    return meta.fields.some(f => {
      const v = (data as Record<string, unknown>)[f.key]
      if (f.type === 'checkbox') return v === true
      if (typeof v === 'string') return v.trim() !== ''
      return v !== undefined && v !== null && v !== ''
    })
  }, [cache])

  const stepValidated = useCallback((key: string): boolean => {
    return statusOf(key) === 'COMPLETED' || dataHasContent(key)
  }, [statusOf, dataHasContent])

  const lockedOf = useCallback((key: string): boolean => {
    const idx = getStepIndex(key)
    if (idx <= 0) return false
    return !stepValidated(GBM_STEPS[idx - 1].key)
  }, [stepValidated])

  const currentStatus = statusOf(currentStep)
  const canContinue = stepValidated(currentStep)

  const navigateTo = useCallback((key: string) => {
    setError('')
    setLockNotice('')
    setSaved(false)
    if (key === currentStep) return
    if (
      !isOneToMany(currentStep) &&
      cache[currentStep] !== undefined &&
      JSON.stringify(formData) !== JSON.stringify(cache[currentStep])
    ) {
      const ok = window.confirm(
        'Vous avez des modifications non sauvegardées dans cette étape. Continuer sans sauvegarder ?',
      )
      if (!ok) return
    }
    router.replace(`?step=${key}`, { scroll: false })
  }, [router, currentStep, cache, formData])

  const goTo = useCallback((key: string) => {
    if (lockedOf(key)) {
      setLockNotice('Complétez d’abord l’étape précédente pour débloquer cette étape.')
      return
    }
    navigateTo(key)
  }, [lockedOf, navigateTo])

  const handleFieldChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const performSave = useCallback(async () => {
    setError('')
    setLockNotice('')
    setSaved(false)
    if (isOneToMany(currentStep)) {
      const ok = await managerRef.current?.savePending() ?? true
      if (!ok) throw new Error('Échec de la sauvegarde des éléments.')
      await refreshCurrentStep()
      await refreshProgress()
      setSaved(true)
      return
    }
    const result = await gbmService.updateStep(projectId, currentStep, formData)
    if (isAiStep(currentStep)) {
      const fresh = await gbmService.getStep(projectId, currentStep)
      setCache(prev => ({ ...prev, [currentStep]: fresh }))
      setFormData(fresh as Record<string, unknown>)
    } else {
      setCache(prev => ({ ...prev, [currentStep]: result }))
      setFormData(result as Record<string, unknown>)
    }
    await refreshProgress()
    setSaved(true)
  }, [projectId, currentStep, formData, refreshProgress, refreshCurrentStep])

  const handleSave = async () => {
    setSaving(true)
    try {
      await performSave()
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setSaving(false)
    }
  }

  const handleGenerateAi = async () => {
    setAiLoading(true)
    setError('')
    setLockNotice('')
    try {
      await gbmService.updateStep(projectId, currentStep, formData)
      const fresh = await gbmService.getStep(projectId, currentStep)
      setCache(prev => ({ ...prev, [currentStep]: fresh }))
      setFormData(fresh as Record<string, unknown>)
      await refreshProgress()
      setSaved(true)
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setAiLoading(false)
    }
  }

  const handleSaveAndContinue = async () => {
    setSaving(true)
    try {
      await performSave()
      if (stepIndex < GBM_STEPS.length - 1) navigateTo(GBM_STEPS[stepIndex + 1].key)
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setSaving(false)
    }
  }

  const handleNext = () => {
    if (!canContinue) {
      setLockNotice(
        isOneToMany(currentStep)
          ? 'Ajoutez au moins un élément pour continuer.'
          : 'Sauvegardez cette étape pour continuer.',
      )
      return
    }
    navigateTo(GBM_STEPS[stepIndex + 1].key)
  }

  const handlePrev = () => {
    if (stepIndex > 0) navigateTo(GBM_STEPS[stepIndex - 1].key)
  }

  const handleReview = async () => {
    setReviewing(true)
    setError('')
    try {
      await gbmService.reviewGbm(projectId)
      setReviewDone(true)
    } catch (e) {
      const err = e as { response?: { data?: { message?: string | { missingSteps?: string[] } } } }
      const msg = err?.response?.data?.message
      setError(
        typeof msg === 'string'
          ? msg
          : msg?.missingSteps
            ? `Étapes manquantes : ${msg.missingSteps.join(', ')}`
            : 'Erreur lors de la révision',
      )
    } finally {
      setReviewing(false)
    }
  }

  const isLastStep = stepIndex === GBM_STEPS.length - 1
  const guide = getStepGuide(currentStep)

  const rightColumn = useMemo(() => (
    <div className="space-y-4">
      <GuidePanel guide={guide} stepMeta={stepMeta} />
      <GbmChatbot projectId={projectId} />
    </div>
  ), [guide, stepMeta, projectId])

  return (
    <div className="space-y-4">
      <GbmNavbar
        currentStep={currentStep}
        statusOf={statusOf}
        lockedOf={lockedOf}
        onStepClick={goTo}
        progress={progress}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_330px]">
        {/* Step content */}
        <div className="min-w-0 space-y-3">
          <Card className="p-0 overflow-hidden">
            <CardHeader
              icon={<stepMeta.icon size={15} />}
              title={stepMeta.subtitle}
            >
              <div className="flex items-center gap-2">
                <Badge variant={stepMeta.phase === 1 ? 'green' : stepMeta.phase === 2 ? 'amber' : stepMeta.phase === 3 ? 'blue' : stepMeta.phase === 4 ? 'blue' : 'red'}>
                  Phase {stepMeta.phase} · {stepMeta.phaseName}
                </Badge>
                <Badge variant={statusLabel[currentStatus].variant}>
                  {statusLabel[currentStatus].text}
                </Badge>
                {isAiStep(currentStep) && (
                  <AiSummaryBadge generated={formData?.generated_by_ai as boolean | undefined} loading={aiLoading} />
                )}
              </div>
            </CardHeader>

            <div className="p-5">
              {error && <ErrorAlert message={error} className="mb-4" />}
              {lockNotice && (
                <div className="flex items-center gap-2 mb-4 text-[12px] text-amber-dark bg-amber-light border border-amber/30 rounded-lg px-3 py-2.5">
                  <Lock size={13} /> {lockNotice}
                </div>
              )}
              {saved && <SuccessAlert message="Étape sauvegardée ✓" className="mb-4" />}

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={24} className="animate-spin text-moss" />
                </div>
              ) : isOneToMany(currentStep) ? (
                <OneToManyManager
                  ref={managerRef}
                  projectId={projectId}
                  stepId={currentStep}
                  fields={stepMeta.fields}
                  onChanged={async () => { await refreshProgress(); await refreshCurrentStep() }}
                />
              ) : (
                <StepForm fields={stepMeta.fields} data={formData} onChange={handleFieldChange} />
              )}
            </div>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3">
            <Button variant="outline" onClick={handlePrev} disabled={stepIndex === 0}>
              <ArrowLeft size={14} /> Précédent
            </Button>

            <div className="flex items-center gap-2">
              {isAiStep(currentStep) && !isOneToMany(currentStep) && (
                <Button variant="ghost" onClick={handleGenerateAi} loading={aiLoading}>
                  <Sparkles size={14} /> Générer résumé IA
                </Button>
              )}
              <Button variant="primary" onClick={handleSave} loading={saving}>
                {saved ? <><Check size={14} /> Sauvegardé</> : 'Sauvegarder'}
              </Button>
              {!isLastStep && (
                <Button variant="secondary" onClick={handleSaveAndContinue} loading={saving}>
                  Sauvegarder & continuer <ArrowRight size={14} />
                </Button>
              )}
            </div>

            <Button variant="outline" onClick={handleNext} disabled={isLastStep}>
              Suivant <ArrowRight size={14} />
            </Button>
          </div>

          {/* Review section — last step */}
          {isLastStep && (
            <Card className="p-5 border-2 border-amber/30 bg-amber-light/20">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-bold text-ink text-sm mb-1">Révision GBM</h3>
                  <p className="text-xs text-ink2">
                    Avant de passer au Plan d&apos;Affaires, révisez l&apos;ensemble de votre GBM sur les 5 phases.
                  </p>
                </div>
                <Button variant="amber" onClick={handleReview} loading={reviewing} disabled={reviewDone}>
                  {reviewDone ? <><Check size={14} /> Révision effectuée</> : 'Valider la révision GBM'}
                </Button>
              </div>
              {reviewDone && (
                <p className="text-xs text-moss mt-3 flex items-center gap-1">
                  <Check size={12} /> GBM révisé et validé — vous pouvez accéder au Plan d&apos;Affaires
                </p>
              )}
            </Card>
          )}

          {/* Progress summary */}
          {progress && (
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-xs text-ink2">
                <span className="font-semibold flex-shrink-0">Progression GBM :</span>
                <Progress value={progress.percentage} />
                <span className="font-bold text-moss flex-shrink-0">{progress.percentage}%</span>
                <span className="text-ink3 flex-shrink-0">({progress.completed}/{progress.total} étapes)</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {progress.phases.map(phase => (
                  <Badge key={phase.phase} variant={phase.completed === phase.total ? 'green' : 'gray'}>
                    Phase {phase.phase} · {phase.completed}/{phase.total}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column (desktop) */}
        <div className="hidden xl:block min-w-0">
          <div className={cn('sticky top-14 max-h-[calc(100vh-96px)] overflow-y-auto pr-0.5')}>
            {rightColumn}
          </div>
        </div>
      </div>

      {/* Guide + chat (below content on smaller screens) */}
      <div className="xl:hidden space-y-4">
        {rightColumn}
      </div>
    </div>
  )
}
