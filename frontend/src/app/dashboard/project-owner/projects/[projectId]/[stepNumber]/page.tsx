'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Save, ChevronLeft, ChevronRight,
  Send, Loader2, AlertCircle, CheckCircle2,
  Layers, Share2, Download, FileText,
} from 'lucide-react'
import { Button, Card, Badge, ErrorAlert, SuccessAlert, Progress } from '@/components/shared/ui'
import { PhaseNavigatorNavbar } from '@/components/journey/PhaseNavigatorNavbar'
import { StepGuide } from '@/components/step-editor/StepGuide'
import { SubSectionCard } from '@/components/step-editor/SubSectionCard'
import { AIAssistantPanel } from '@/components/step-editor/AIAssistantPanel'
import { projectService } from '@/services/project.service'
import { STEP_PEDAGOGICAL_CONTENT } from '@/data/pedagogical-content'
import { STEP_PEDAGOGICAL_CONTENT_V2 } from '@/data/pedagogical-content-v2'
import type { StepPedagogicalContent } from '@/data/pedagogical-content'
import type { ProjectStep } from '@/types/project'
import { STEP_STATUS_LABELS, STEP_STATUS_VARIANTS, PHASES } from '@/types/project'

export default function StepEditorPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string
  const stepNumber = parseInt(params.stepNumber as string)
  const [step, setStep] = useState<ProjectStep | null>(null)
  const [allSteps, setAllSteps] = useState<ProjectStep[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formContent, setFormContent] = useState<Record<string, any>>({})
  const [activeSection, setActiveSection] = useState(0)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([])
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [showValidation, setShowValidation] = useState(false)

  const pedagogicalContent: StepPedagogicalContent | undefined =
    STEP_PEDAGOGICAL_CONTENT_V2[stepNumber] || STEP_PEDAGOGICAL_CONTENT[stepNumber]
  const subSections = pedagogicalContent?.subSections || []

  const totalSteps = PHASES.reduce((max, p) => Math.max(max, ...p.steps), 0)

  const fetchStep = useCallback(async () => {
    if (!projectId || !stepNumber) return
    setLoading(true)
    try {
      const [data, stepsData] = await Promise.all([
        projectService.getStep(projectId, stepNumber),
        projectService.getSteps(projectId),
      ])
      setStep(data)
      setAllSteps(stepsData)
      setError(null)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }, [projectId, stepNumber])

  useEffect(() => {
    fetchStep()
  }, [fetchStep])

  useEffect(() => {
    if (step?.content) {
      setFormContent(step.content)
      if (step.validation_errors?.length) {
        setValidationErrors(step.validation_errors)
      }
    }
  }, [step, stepNumber])

  const clearMessages = useCallback(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(() => {
      setSuccess(null)
      setError(null)
    }, 4000)
  }, [])

  const updateStepApi = useCallback(async (data: any) => {
    setSaving(true)
    try {
      const updated = await projectService.updateStep(projectId, stepNumber, data)
      setStep(updated)
      setValidationErrors([])
      return updated
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message
      setError(msg)
      throw err
    } finally {
      setSaving(false)
    }
  }, [projectId, stepNumber])

  const doSave = useCallback(async () => {
    if (!step) return
    setSaveStatus('saving')
    setError(null)
    try {
      const payload: Record<string, any> = { content: formContent }
      if (step.status === 'not_started') {
        payload.status = 'in_progress'
      }
      await updateStepApi(payload)
      setSaveStatus('saved')
      setLastSaved(new Date())
      setSuccess('Sauvegardé avec succès')
      clearMessages()
      setTimeout(() => setSaveStatus(prev => prev === 'saved' ? 'idle' : prev), 2000)
    } catch {
      setSaveStatus('error')
      setError('Erreur lors de la sauvegarde')
    }
  }, [formContent, step, updateStepApi, clearMessages])

  // autoSave désactivé — sauvegarde manuelle uniquement

  const handleFieldChange = (sectionKey: string, value: any) => {
    setFormContent(prev => ({ ...prev, [sectionKey]: value }))
  }

  const handleSave = async () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    await doSave()
  }

  const COMPLEX_TYPES = ['pestel_v2', 'stakeholder_matrix', 'customer_segment', 'value_proposition', 'discovery_card'];

  const isSectionFilled = (section: typeof subSections[0]): boolean => {
    const sectionContent = formContent[section.key]
    if (!sectionContent) return false
    const hasComplexType = section.guidedQuestions.some(gq => COMPLEX_TYPES.includes(gq.type))
    if (hasComplexType) {
      const gq = section.guidedQuestions.find(gq => COMPLEX_TYPES.includes(gq.type))
      if (!gq) return false
      if (gq.type === 'pestel_v2') {
        return typeof sectionContent === 'object' && Object.values(sectionContent).some((d: any) => d?.quoi || d?.comment)
      }
      if (gq.type === 'stakeholder_matrix' || gq.type === 'customer_segment' || gq.type === 'discovery_card') {
        return Array.isArray(sectionContent) && sectionContent.length > 0
      }
      if (gq.type === 'value_proposition') {
        return typeof sectionContent === 'object' && (sectionContent.productsServices?.length > 0 || sectionContent.greenValue || sectionContent.socialValue)
      }
      return false
    }
    return typeof sectionContent === 'object' && Object.values(sectionContent).some((v: any) => v && v !== '')
  }

  const validateBeforeSubmit = (): boolean => {
    const errors: string[] = []
    for (const section of subSections) {
      if (!isSectionFilled(section)) {
        errors.push(`La section "${section.label}" n'est pas remplie`)
        continue
      }
      const sectionContent = formContent[section.key]
      const emptyQuestions = section.guidedQuestions.filter((gq) => {
        if (COMPLEX_TYPES.includes(gq.type)) return false
        const val = sectionContent?.[gq.question]
        return val === undefined || val === '' || (Array.isArray(val) && val.length === 0)
      })
      if (emptyQuestions.length > 0) {
        errors.push(`Section "${section.label}" : ${emptyQuestions.length} question(s) sans réponse`)
      }
    }
    setValidationErrors(errors)
    setShowValidation(errors.length > 0)
    return errors.length === 0
  }

  const handleSubmit = async () => {
    if (!validateBeforeSubmit()) return

    setSaving(true)
    setError(null)
    try {
      if (step?.status === 'submitted' || step?.status === 'approved') {
        await updateStepApi({ content: formContent, status: 'in_progress' })
      } else {
        await doSave()
      }
      const updated = await projectService.submitStep(projectId, stepNumber)
      setStep(updated)
      setSuccess('Étape soumise avec succès !')
      clearMessages()
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message
      setError(msg)
      setShowValidation(true)
    } finally {
      setSaving(false)
    }
  }

  const scrollToSection = (index: number) => {
    setActiveSection(index)
    sectionRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const completedSections = subSections.filter((s) => isSectionFilled(s)).length

  const totalSections = subSections.length

  const currentPhaseIndex = PHASES.findIndex((p) => p.steps.includes(stepNumber))
  const isFirstStep = stepNumber === 1
  const isLastStep = stepNumber >= totalSteps

  const handleExport = async (format: string) => {
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/projects/${projectId}/exports/${format}`
      const token = localStorage.getItem('access_token')
      const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      const blob = await response.blob()
      const downloadUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = `projet-rapport.${format}`
      a.click()
      URL.revokeObjectURL(downloadUrl)
    } catch {}
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-moss" />
      </div>
    )
  }

  if (!step) {
    return (
      <div className="p-8 text-center">
        <AlertCircle size={32} className="mx-auto text-ink3 mb-3" />
        <p className="text-ink3">Étape introuvable</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-border">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push(`/dashboard/project-owner/projects/${projectId}`)}
                className="flex items-center gap-1 text-[12px] text-ink3 hover:text-ink transition-colors"
              >
                <ArrowLeft size={14} /> Retour
              </button>
              <div className="w-[1px] h-[24px] bg-border mx-2" />
              <PhaseNavigatorNavbar
                currentStepNumber={stepNumber}
                steps={allSteps}
                projectId={projectId}
              />
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
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-6">
        <div className="flex gap-6 items-start">
          {/* Center - form content */}
          <div className="flex-1 min-w-0 max-w-[720px]">
            {/* Step header */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-ink3 uppercase tracking-[0.06em]">
                    Étape {step.step_number}/{totalSteps}
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
            {success && <SuccessAlert message={success} className="mb-4" />}

            {showValidation && validationErrors.length > 0 && (
              <Card className="p-[14px_18px] mb-4 border-red/30 bg-red/[.04]">
                <div className="flex items-start gap-2">
                  <AlertCircle size={14} className="text-red flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-bold text-red uppercase tracking-[0.06em] mb-1">
                      Erreurs de validation
                    </p>
                    <ul className="text-[12px] text-red/80 space-y-0.5">
                      {validationErrors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            )}

            {/* Progress */}
            {totalSections > 0 && (
              <div className="flex items-center gap-3 mb-6">
                <Progress value={totalSections > 0 ? (completedSections / totalSections) * 100 : 0} />
                <span className="text-[11px] text-ink3 whitespace-nowrap">
                  {completedSections}/{totalSections} sections
                </span>
              </div>
            )}

            {/* Sections */}
            <div className="space-y-4">
              {subSections.map((section, i) => (
                <div key={section.key} ref={(el) => { sectionRefs.current[i] = el }}>
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
                    {!isFirstStep && (
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
                    {!isLastStep && (
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

          {/* Right sidebar - pedagogical guide */}
          {pedagogicalContent && (
            <div className="w-[260px] flex-shrink-0 sticky top-[72px] space-y-4">
              <StepGuide content={pedagogicalContent} />

              {subSections.length > 0 && (
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
                          isSectionFilled(s)
                            ? 'bg-moss'
                            : 'bg-ink3/30'
                        }`} />
                        <span className="text-[11px] font-medium truncate">{s.label}</span>
                      </button>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Floating action bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <Card className="px-3 py-2 shadow-lg border-moss/20">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => router.push(`/dashboard/project-owner/projects/${projectId}?tab=versions`)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-ink2 hover:bg-moss-light hover:text-ink rounded-lg transition-colors"
            >
              <Layers size={13} /> Version
            </button>
            <div className="w-[1px] h-[20px] bg-border" />
            <button
              onClick={() => projectService.generateBmc(projectId).catch(() => {})}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-ink2 hover:bg-moss-light hover:text-ink rounded-lg transition-colors"
            >
              <FileText size={13} /> BMC
            </button>
            <div className="w-[1px] h-[20px] bg-border" />
            <button
              onClick={() => router.push(`/dashboard/project-owner/projects/${projectId}?tab=share`)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-ink2 hover:bg-moss-light hover:text-ink rounded-lg transition-colors"
            >
              <Share2 size={13} /> Partager
            </button>
            <div className="w-[1px] h-[20px] bg-border" />
            <div className="relative group">
              <button className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-ink2 hover:bg-moss-light hover:text-ink rounded-lg transition-colors">
                <Download size={13} /> Exporter
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block">
                <Card className="p-1 shadow-lg">
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => handleExport('pdf')} className="text-[11px] px-3 py-1.5 hover:bg-moss-light rounded-lg text-left">PDF</button>
                    <button onClick={() => handleExport('html')} className="text-[11px] px-3 py-1.5 hover:bg-moss-light rounded-lg text-left">HTML</button>
                    <button onClick={() => handleExport('markdown')} className="text-[11px] px-3 py-1.5 hover:bg-moss-light rounded-lg text-left">Markdown</button>
                    <button onClick={() => handleExport('csv')} className="text-[11px] px-3 py-1.5 hover:bg-moss-light rounded-lg text-left">CSV</button>
                    <button onClick={() => handleExport('json')} className="text-[11px] px-3 py-1.5 hover:bg-moss-light rounded-lg text-left">JSON</button>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Floating AI Assistant */}
      <AIAssistantPanel
        projectId={projectId}
        stepNumber={stepNumber}
        step={step}
        formContent={formContent}
      />
    </div>
  )
}
