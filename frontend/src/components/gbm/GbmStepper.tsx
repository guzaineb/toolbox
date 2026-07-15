'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ArrowLeft, ArrowRight, Loader2, Sparkles } from 'lucide-react'
import { gbmService } from '@/services/gbm.service'
import { GBM_STEP_LABELS, type GbmProgress } from '@/types/gbm'
import { Button, Card, CardHeader, Badge, Progress, ErrorAlert, SuccessAlert } from '@/components/shared/ui'
import { StepProgressBar } from '@/components/shared/StepProgressBar'
import { AiSummaryBadge } from '@/components/shared/AiSummaryBadge'
import { cn } from '@/lib/utils'

const PHASES = [
  { phase: 1, name: 'Ébaucher & Définir', color: '#2d7a52' },
  { phase: 2, name: 'Construire', color: '#c9a84c' },
  { phase: 3, name: 'Tester', color: '#4a7db5' },
  { phase: 4, name: 'Mesurer & Améliorer', color: '#8b5cf6' },
  { phase: 5, name: 'Synthèse', color: '#e11d48' },
]

interface GbmStepperProps {
  projectId: string
}

export function GbmStepper({ projectId }: GbmStepperProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState('gbm_1')
  const [progress, setProgress] = useState<GbmProgress | null>(null)
  const [stepData, setStepData] = useState<any>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [reviewing, setReviewing] = useState(false)
  const [reviewDone, setReviewDone] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)

  const stepInfo = GBM_STEP_LABELS[currentStep]
  const isOneToOne = !['gbm_7a','gbm_7b','gbm_8','gbm_10','gbm_12b'].includes(currentStep)
  const isAiStep = ['gbm_6','gbm_15','gbm_18','gbm_21'].includes(currentStep)

  const stepKeys = Object.keys(GBM_STEP_LABELS)

  const loadProgress = useCallback(async () => {
    try {
      const p = await gbmService.getProgress(projectId)
      setProgress(p)
    } catch { /* ignore */ }
  }, [projectId])

  const loadStepData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await gbmService.getStep(projectId, currentStep)
      setStepData(data)
      setFormData(data)
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }, [projectId, currentStep])

  useEffect(() => { loadStepData() }, [loadStepData])
  useEffect(() => { loadProgress() }, [loadProgress])

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      if (isOneToOne) {
        await gbmService.updateStep(projectId, currentStep, formData)
      }
      setSaved(true)
      await loadProgress()
      setTimeout(() => setSaved(false), 2000)
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleGenerateAi = async () => {
    setAiLoading(true)
    try {
      const result = await gbmService.updateStep(projectId, currentStep, formData)
      setStepData(result)
      setFormData(result)
      await loadProgress()
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Erreur IA')
    } finally {
      setAiLoading(false)
    }
  }

  const handleReview = async () => {
    setReviewing(true)
    setError('')
    try {
      const result = await gbmService.reviewGbm(projectId)
      setReviewDone(true)
      await loadProgress()
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.response?.data?.message === 'string'
        ? e.response.data.message
        : e?.response?.data?.message?.missingSteps
          ? `Étapes manquantes : ${e.response.data.message.missingSteps.join(', ')}`
          : 'Erreur lors de la révision')
    } finally {
      setReviewing(false)
    }
  }

  const navigate = (direction: 'prev' | 'next') => {
    const idx = stepKeys.indexOf(currentStep)
    const next = direction === 'next' ? idx + 1 : idx - 1
    if (next >= 0 && next < stepKeys.length) {
      setCurrentStep(stepKeys[next])
    }
  }

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev: Record<string, any>) => ({ ...prev, [field]: value }))
  }

  const stepStatus = (stepKey: string) => {
    return progress?.steps.find(s => s.step_key === stepKey)?.status || 'NOT_STARTED'
  }

  const allStepsForStepper = stepKeys.map(key => ({
    id: key,
    label: GBM_STEP_LABELS[key]?.title || key,
    status: stepStatus(key) as any,
  }))

  if (!stepInfo) return null

  return (
    <div className="space-y-6">
      {/* Step Navigation */}
      <Card className="p-4">
        <StepProgressBar
          steps={allStepsForStepper}
          currentStep={currentStep}
          onStepClick={setCurrentStep}
          phases={PHASES}
        />
      </Card>

      {/* Current Step Form */}
      <Card className="p-0 overflow-hidden">
        <CardHeader
          icon={<span className="text-xs font-bold">{stepInfo.phase}</span>}
          title={`${stepInfo.title}`}
        >
          <div className="flex items-center gap-2">
            <Badge variant={stepInfo.phase === 1 ? 'green' : stepInfo.phase === 2 ? 'amber' : stepInfo.phase === 3 ? 'blue' : 'gray'}>
              Phase {stepInfo.phase}
            </Badge>
            {isAiStep && <AiSummaryBadge generated={stepData?.generated_by_ai} loading={aiLoading} />}
          </div>
        </CardHeader>

        <div className="p-5">
          {error && <ErrorAlert message={error} className="mb-4" />}
          {saved && <SuccessAlert message="Étape sauvegardée ✓" className="mb-4" />}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-moss" />
            </div>
          ) : isOneToOne ? (
            <OneToOneForm
              fields={getStepFields(currentStep)}
              data={formData}
              onChange={handleFieldChange}
            />
          ) : (
            <OneToManyManager
              projectId={projectId}
              stepId={currentStep}
              onUpdate={loadStepData}
            />
          )}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          onClick={() => navigate('prev')}
          disabled={stepKeys.indexOf(currentStep) === 0}
        >
          <ArrowLeft size={14} /> Précédent
        </Button>

        <div className="flex items-center gap-2">
          {isAiStep && (
            <Button variant="ghost" onClick={handleGenerateAi} loading={aiLoading}>
              <Sparkles size={14} /> Générer résumé IA
            </Button>
          )}
          {isOneToOne && (
            <Button variant="primary" onClick={handleSave} loading={saving}>
              {saved ? <><Check size={14} /> Sauvegardé</> : 'Sauvegarder'}
            </Button>
          )}
        </div>

        <Button
          variant="outline"
          onClick={() => navigate('next')}
          disabled={stepKeys.indexOf(currentStep) === stepKeys.length - 1}
        >
          Suivant <ArrowRight size={14} />
        </Button>
      </div>

      {/* Review section — bottom of last phase */}
      {stepInfo.phase === 5 && currentStep === stepKeys[stepKeys.length - 1] && (
        <Card className="p-5 border-2 border-amber/30 bg-amber-light/20">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-bold text-ink text-sm mb-1">Révision GBM</h3>
              <p className="text-xs text-ink2">
                Avant de passer au Plan d&apos;Affaires, révisez l&apos;ensemble de votre GBM sur les 4 phases.
              </p>
            </div>
            <Button
              variant="amber"
              onClick={handleReview}
              loading={reviewing}
              disabled={reviewDone}
            >
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
        <div className="flex items-center gap-3 text-xs text-ink2">
          <span className="font-semibold">Progression GBM :</span>
          <Progress value={progress.percentage} />
          <span className="font-bold text-moss">{progress.percentage}%</span>
          <span className="text-ink3">({progress.completed}/{progress.total} étapes)</span>
        </div>
      )}
    </div>
  )
}

// ─── One-to-One Dynamic Form ───
function OneToOneForm({
  fields,
  data,
  onChange,
}: {
  fields: { key: string; label: string; type: 'text' | 'textarea' | 'number' }[]
  data: Record<string, any>
  onChange: (key: string, value: any) => void
}) {
  return (
    <div className="space-y-4">
      {fields.map(field => (
        <div key={field.key}>
          <label className="block text-xs font-semibold text-ink2 mb-1">{field.label}</label>
          {field.type === 'textarea' ? (
            <textarea
              className="w-full text-sm px-3 py-2.5 border border-border rounded-lg bg-surface text-ink outline-none focus:border-moss focus:shadow-[0_0_0_3px_rgba(45,122,82,0.09)] min-h-[80px] resize-y"
              value={data[field.key] || ''}
              onChange={e => onChange(field.key, e.target.value)}
              rows={4}
            />
          ) : field.type === 'number' ? (
            <input
              type="number"
              className="w-full text-sm px-3 py-2.5 border border-border rounded-lg bg-surface text-ink outline-none focus:border-moss focus:shadow-[0_0_0_3px_rgba(45,122,82,0.09)]"
              value={data[field.key] || ''}
              onChange={e => onChange(field.key, e.target.valueAsNumber || 0)}
            />
          ) : (
            <input
              type="text"
              className="w-full text-sm px-3 py-2.5 border border-border rounded-lg bg-surface text-ink outline-none focus:border-moss focus:shadow-[0_0_0_3px_rgba(45,122,82,0.09)]"
              value={data[field.key] || ''}
              onChange={e => onChange(field.key, e.target.value)}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── One-to-Many Manager ───
function OneToManyManager({
  projectId,
  stepId,
  onUpdate,
}: {
  projectId: string
  stepId: string
  onUpdate: () => void
}) {
  const [items, setItems] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [newItem, setNewItem] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)

  const loadItems = async () => {
    setLoading(true)
    try {
      const data = await gbmService.listStepItems(projectId, stepId)
      setItems(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadItems() }, [projectId, stepId, onUpdate])

  const handleAdd = async () => {
    try {
      await gbmService.addStepItem(projectId, stepId, newItem)
      setNewItem({})
      setShowForm(false)
      await loadItems()
    } catch { /* ignore */ }
  }

  const handleDelete = async (itemId: string) => {
    try {
      await gbmService.deleteStepItem(projectId, stepId, itemId)
      await loadItems()
    } catch { /* ignore */ }
  }

  const itemFields = getStepFields(stepId)

  if (loading) return <div className="text-center py-8 text-sm text-ink3">Chargement...</div>

  return (
    <div className="space-y-3">
      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((item: any) => (
            <div key={item.id} className="flex items-start justify-between gap-3 p-3 rounded-lg border border-border bg-surface-2">
              <div className="flex-1 min-w-0">
                {itemFields.slice(0, 2).map(f => (
                  <div key={f.key} className="text-sm">
                    <span className="font-medium text-ink">{item[f.key] || '—'}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-red text-xs hover:underline flex-shrink-0"
              >
                Supprimer
              </button>
            </div>
          ))}
        </div>
      )}

      {items.length === 0 && !showForm && (
        <div className="text-center py-8 text-sm text-ink3">Aucun élément. Ajoutez-en un.</div>
      )}

      {showForm ? (
        <div className="space-y-3 p-4 rounded-lg border border-dashed border-moss/30 bg-moss-light/10">
          {itemFields.map(f => (
            <div key={f.key}>
              <label className="block text-xs font-semibold text-ink2 mb-1">{f.label}</label>
              <input
                type="text"
                className="w-full text-sm px-3 py-2 border border-border rounded-lg bg-surface text-ink"
                value={newItem[f.key] || ''}
                onChange={e => setNewItem((prev: any) => ({ ...prev, [f.key]: e.target.value }))}
              />
            </div>
          ))}
          <div className="flex gap-2">
            <Button size="sm" variant="primary" onClick={handleAdd}>Ajouter</Button>
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Annuler</Button>
          </div>
        </div>
      ) : (
        <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
          + Ajouter
        </Button>
      )}
    </div>
  )
}

// ─── Field Registry ───
function getStepFields(stepId: string): { key: string; label: string; type: 'text' | 'textarea' | 'number' }[] {
  const registry: Record<string, { key: string; label: string; type: 'text' | 'textarea' | 'number' }[]> = {
    // ── Phase 1 — Ébaucher & Définir ──
    gbm_1: [
      { key: 'idea_initial', label: "Quelle est votre idée d'entreprise initiale ?", type: 'textarea' },
      { key: 'product_service', label: "Qu'allez-vous offrir (produit, service) ?", type: 'textarea' },
      { key: 'customers', label: 'Qui peuvent être vos clients ?', type: 'textarea' },
      { key: 'partners', label: 'Qui peuvent être vos partenaires ?', type: 'textarea' },
    ],
    gbm_2: [
      { key: 'environmental_challenges', label: 'Votre idée s\'attaque-t-elle à de réels défis environnementaux ? Lesquels ?', type: 'textarea' },
      { key: 'social_challenges', label: 'Votre idée s\'attaque-t-elle à de véritables défis sociaux ? Lesquels ?', type: 'textarea' },
      { key: 'customer_needs', label: 'Quels sont les principaux besoins de vos clients potentiels ?', type: 'textarea' },
      { key: 'team_motivations', label: 'Quels sont les facteurs personnels ou professionnels qui sous-tendent l\'idée d\'entreprise ?', type: 'textarea' },
    ],
    gbm_3: [
      { key: 'political_what', label: 'Politique — Quels aspects politiques peuvent influer sur votre entreprise ?', type: 'textarea' },
      { key: 'political_how', label: 'Politique — Comment cela va-t-il influer et comment y faire face ?', type: 'textarea' },
      { key: 'economic_what', label: 'Économique — Quels aspects économiques peuvent influer ?', type: 'textarea' },
      { key: 'economic_how', label: 'Économique — Comment cela va-t-il influer et comment y faire face ?', type: 'textarea' },
      { key: 'social_what', label: 'Social — Quels aspects sociaux peuvent influer ?', type: 'textarea' },
      { key: 'social_how', label: 'Social — Comment cela va-t-il influer et comment y faire face ?', type: 'textarea' },
      { key: 'technological_what', label: 'Technologique — Quels aspects technologiques peuvent influer ?', type: 'textarea' },
      { key: 'technological_how', label: 'Technologique — Comment cela va-t-il influer et comment y faire face ?', type: 'textarea' },
      { key: 'environmental_what', label: 'Environnemental — Quels aspects environnementaux peuvent influer ?', type: 'textarea' },
      { key: 'environmental_how', label: 'Environnemental — Comment cela va-t-il influer et comment y faire face ?', type: 'textarea' },
      { key: 'legal_what', label: 'Légal — Quels aspects légaux peuvent influer ?', type: 'textarea' },
      { key: 'legal_how', label: 'Légal — Comment cela va-t-il influer et comment y faire face ?', type: 'textarea' },
    ],
    gbm_4: [
      { key: 'environmental_problems', label: 'Défis environnementaux — Quels problèmes votre projet aborde-t-il ?', type: 'textarea' },
      { key: 'environmental_objectives', label: 'Objectifs environnementaux — Que voulez-vous accomplir ?', type: 'textarea' },
      { key: 'social_problems', label: 'Défis sociaux — Quels problèmes votre projet aborde-t-il ?', type: 'textarea' },
      { key: 'social_objectives', label: 'Objectifs sociaux — Que voulez-vous accomplir ?', type: 'textarea' },
      { key: 'customer_problems', label: 'Besoins clients — Quels besoins votre projet satisfait-il ?', type: 'textarea' },
      { key: 'customer_objectives', label: 'Objectifs clients — Que voulez-vous accomplir ?', type: 'textarea' },
      { key: 'team_problems', label: "Motivations d'équipe — Quels facteurs personnels/professionnels ?", type: 'textarea' },
      { key: 'team_objectives', label: "Objectifs d'équipe — Que voulez-vous accomplir ?", type: 'textarea' },
    ],
    gbm_5: [
      { key: 'mission', label: 'Mission — Synthétisez vos objectifs en une phrase globale', type: 'textarea' },
      { key: 'vision', label: 'Vision — Envisagez vos réalisations à moyen-long terme', type: 'textarea' },
      { key: 'values', label: 'Valeurs — Quelles sont les valeurs fondamentales de votre entreprise ?', type: 'textarea' },
    ],
    gbm_6: [
      { key: 'summary_text', label: 'Résumé du contexte et des objectifs', type: 'textarea' },
    ],

    // ── Phase 2 — Construire ──
    gbm_7a: [
      { key: 'name', label: 'Nom de la partie prenante', type: 'text' },
      { key: 'role', label: 'Rôle', type: 'text' },
      { key: 'interest', label: 'Intérêt dans le projet', type: 'text' },
      { key: 'influence', label: "Degré d'influence (faible/moyen/fort)", type: 'text' },
      { key: 'engagement_strategy', label: "Stratégie d'engagement", type: 'text' },
    ],
    gbm_7b: [
      { key: 'stakeholder_name', label: 'Partie prenante', type: 'text' },
      { key: 'contribution', label: 'Contribution (donnant)', type: 'text' },
      { key: 'reward', label: 'Récompense (donnant)', type: 'text' },
    ],
    gbm_8: [
      { key: 'segment_name', label: 'Nom du segment', type: 'text' },
      { key: 'description', label: 'Description générique', type: 'text' },
      { key: 'pains', label: 'Souffrances — Que craint votre client ? (coût, temps, frustrations, risques)', type: 'textarea' },
      { key: 'gains', label: 'Gains — Qu\'attend votre client ? (économies, qualité, statut, rêves)', type: 'textarea' },
      { key: 'functions', label: 'Fonctions — De quoi a besoin votre client ? (besoins fonctionnels, sociaux, émotionnels)', type: 'textarea' },
    ],
    gbm_9: [
      { key: 'environmental_value', label: 'Valeur environnementale — Quels défis environnementaux votre proposition adresse-t-elle ?', type: 'textarea' },
      { key: 'social_value', label: 'Valeur sociale — Quels besoins sociaux votre proposition couvre-t-elle ?', type: 'textarea' },
      { key: 'pain_relievers', label: 'Soulagement des douleurs — Comment votre solution répond-elle aux douleurs des clients ?', type: 'textarea' },
      { key: 'gain_creators', label: 'Créateurs de gains — Comment votre solution crée-t-elle les gains attendus ?', type: 'textarea' },
      { key: 'products_services', label: 'Produits et services — Que fait votre produit/service pour le client ?', type: 'textarea' },
      { key: 'value_added', label: 'Valeur ajoutée — Quelle différence par rapport aux alternatives existantes ?', type: 'textarea' },
      { key: 'innovation_value', label: "Valeur d'innovation — Quelles sont les opportunités de marché ?", type: 'textarea' },
    ],
    gbm_10: [
      { key: 'hypothesis', label: 'Hypothèse', type: 'textarea' },
      { key: 'test_method', label: 'Méthode de test', type: 'text' },
      { key: 'results', label: 'Résultats', type: 'textarea' },
      { key: 'learnings', label: 'Apprentissages', type: 'textarea' },
    ],
    gbm_11: [
      { key: 'initial_assumptions', label: 'Hypothèses initiales', type: 'textarea' },
      { key: 'test_results', label: 'Résultats des tests', type: 'textarea' },
      { key: 'pivot_decision', label: 'Décision de pivot', type: 'textarea' },
      { key: 'new_value_proposition', label: 'Nouvelle proposition de valeur', type: 'textarea' },
    ],
    gbm_12a: [
      { key: 'customer_relationships', label: 'Relations clients', type: 'textarea' },
      { key: 'channels', label: 'Canaux', type: 'textarea' },
      { key: 'distribution_strategy', label: 'Stratégie de distribution', type: 'textarea' },
    ],
    gbm_12b: [
      { key: 'stage_name', label: "Nom de l'étape", type: 'text' },
      { key: 'touchpoints', label: 'Points de contact', type: 'text' },
      { key: 'customer_emotions', label: 'Émotions client', type: 'text' },
      { key: 'improvement_ideas', label: "Idées d'amélioration", type: 'text' },
    ],
    gbm_13: [
      { key: 'key_activities', label: 'Activités clés', type: 'textarea' },
      { key: 'key_resources', label: 'Ressources clés', type: 'textarea' },
      { key: 'strategic_partners', label: 'Partenaires stratégiques', type: 'textarea' },
    ],
    gbm_14a: [
      { key: 'equipe_eco', label: 'Équipe éco-conception', type: 'textarea' },
      { key: 'projet_eco', label: 'Projet — cycle de vie et impact', type: 'textarea' },
      { key: 'contexte_eco', label: 'Contexte environnemental', type: 'textarea' },
      { key: 'vision_durable', label: 'Vision durable', type: 'textarea' },
    ],
    gbm_14b: [
      { key: 'eco_results', label: "Résultats de l'écoconception", type: 'textarea' },
      { key: 'performance_analysis', label: 'Analyse de la performance environnementale', type: 'textarea' },
      { key: 'improvements', label: "Pistes d'amélioration", type: 'textarea' },
    ],
    gbm_15: [
      { key: 'activities_summary', label: "Résumé d'activités et ressources", type: 'textarea' },
      { key: 'key_achievements', label: 'Réalisations clés', type: 'textarea' },
      { key: 'next_steps', label: 'Prochaines étapes', type: 'textarea' },
    ],
    gbm_16: [
      { key: 'fixed_costs', label: 'Coûts fixes', type: 'textarea' },
      { key: 'variable_costs', label: 'Coûts variables', type: 'textarea' },
      { key: 'cost_drivers', label: 'Facteurs de coûts', type: 'textarea' },
      { key: 'breakeven_analysis', label: 'Analyse du seuil de rentabilité', type: 'textarea' },
    ],
    gbm_17: [
      { key: 'revenue_sources', label: 'Sources de revenus', type: 'textarea' },
      { key: 'pricing_strategy', label: 'Stratégie de prix', type: 'textarea' },
      { key: 'revenue_projections', label: 'Projections de revenus', type: 'textarea' },
    ],
    gbm_18: [
      { key: 'cost_summary', label: 'Résumé des coûts', type: 'textarea' },
      { key: 'revenue_summary', label: 'Résumé des revenus', type: 'textarea' },
      { key: 'financial_health', label: 'Santé financière', type: 'textarea' },
    ],

    // ── Phase 3 — Tester ──
    gbm_19: [
      { key: 'test_objectives', label: 'Objectifs du test', type: 'textarea' },
      { key: 'test_method', label: 'Méthode de test', type: 'textarea' },
      { key: 'success_criteria', label: "Critères de succès", type: 'textarea' },
      { key: 'resources_needed', label: 'Ressources nécessaires', type: 'textarea' },
      { key: 'timeline', label: 'Calendrier / échéancier', type: 'textarea' },
    ],

    // ── Phase 4 — Mesurer & Améliorer ──
    gbm_20: [
      { key: 'environmental_kpis', label: "KPIs environnementaux — Indicateurs d'impact écologique", type: 'textarea' },
      { key: 'social_kpis', label: 'KPIs sociaux — Indicateurs de progrès social', type: 'textarea' },
      { key: 'economic_kpis', label: 'KPIs économiques — Indicateurs de performance économique', type: 'textarea' },
      { key: 'measurement_method', label: 'Méthode de mesure — Comment seront collectées les données ?', type: 'textarea' },
      { key: 'review_frequency', label: 'Fréquence de révision — Mensuelle, trimestrielle, annuelle ?', type: 'textarea' },
    ],

    // ── Phase 5 — Synthèse ──
    gbm_21: [
      { key: 'strengths', label: 'Forces — Points forts du projet identifiés par l\'IA', type: 'textarea' },
      { key: 'weaknesses', label: 'Faiblesses — Points de vigilance identifiés par l\'IA', type: 'textarea' },
      { key: 'opportunities', label: 'Opportunités — Leviers de croissance identifiés par l\'IA', type: 'textarea' },
      { key: 'threats', label: 'Menaces — Risques identifiés par l\'IA', type: 'textarea' },
    ],
  }
  return registry[stepId] || []
}
