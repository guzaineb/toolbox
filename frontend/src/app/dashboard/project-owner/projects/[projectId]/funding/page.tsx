'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Check, DollarSign, Lightbulb } from 'lucide-react'
import { fundingService } from '@/services/funding.service'
import { Button, Card, CardHeader, Badge, ErrorAlert, SuccessAlert } from '@/components/shared/ui'
import { PHASE_LABELS } from '@/types/funding'
import { MissingInfoCard } from '@/components/shared/MissingInfoCard'
import { projectContextService } from '@/services/project-context.service'
import type { ChecklistItem, FundingSuggestion } from '@/types/project-context'
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges'

const QUESTIONS = [
  { key: 'q1',  label: 'Problème marché clairement défini ?' },
  { key: 'q2',  label: 'Solution clairement décrite ?' },
  { key: 'q3',  label: 'Idée testée et validée avec clients/parties prenantes ?' },
  { key: 'q4',  label: 'Segments clients définis selon ≥ 2 critères ?' },
  { key: 'q5',  label: 'Métriques business établies et suivies ?' },
  { key: 'q6',  label: 'Produit profitable déjà sur le marché ?' },
  { key: 'q7',  label: 'Équilibre coûts/revenus et burn rate connus ?' },
  { key: 'q8',  label: 'Entreprise déjà profitable ?' },
  { key: 'q9',  label: "Numéro d'enregistrement officiel et statut légal ?" },
  { key: 'q10', label: 'Équipe complète et active ?' },
  { key: 'q11', label: 'Portfolio produits établi en vente ?' },
  { key: 'q12', label: "Marchés d'expansion futurs identifiés ?" },
]

export default function FundingPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string
  const [answers, setAnswers] = useState<Record<string, boolean>>({})
  const [assessment, setAssessment] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [opportunites, setOpportunites] = useState('')
  const [suggestions, setSuggestions] = useState<Record<string, FundingSuggestion> | null>(null)
  const [suggestionsLoading, setSuggestionsLoading] = useState(true)
  const [checklist, setChecklist] = useState<ChecklistItem[]>([])
  const [info, setInfo] = useState('')
  const [dirty, setDirty] = useState(false)
  const { guardLeave, modal } = useUnsavedChanges(dirty)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fundingService.getAssessment(projectId)
        setAssessment(data)
        if (data.reponses_questionnaire) {
          setAnswers(data.reponses_questionnaire as Record<string, boolean>)
          setShowResults(true)
        }
        if (data.opportunites_pays) setOpportunites(data.opportunites_pays)
      } catch { /* ignore */ }
      finally { setLoading(false) }
    }
    load()
    projectContextService
      .getPrefill(projectId, 'funding')
      .then(prefill => {
        setSuggestions(prefill.suggestions || null)
        setChecklist(prefill.checklist || [])
      })
      .catch(() => { /* ignore */ })
      .finally(() => setSuggestionsLoading(false))
  }, [projectId])

  const applySuggestions = () => {
    if (!suggestions) return
    const next = { ...answers }
    let applied = 0
    for (const [key, s] of Object.entries(suggestions)) {
      if (s.reason.startsWith('À confirmer')) continue
      next[key] = s.value
      applied += 1
    }
    setAnswers(next)
    setDirty(true)
    setInfo(applied > 0 ? `${applied} réponses préremplies depuis vos données GBM — vérifiez avant de soumettre.` : '')
  }

  const handleSubmit = async () => {
    const missing = QUESTIONS.filter(q => answers[q.key] === undefined)
    if (missing.length > 0) {
      setError(`Répondez à toutes les questions (${missing.length} manquantes)`)
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const result = await fundingService.submitQuestionnaire(projectId, answers)
      setAssessment(result)
      setShowResults(true)
      setDirty(false)
    } catch { setError('Erreur lors de la soumission') }
    finally { setSubmitting(false) }
  }

  const score = assessment.score_maturite ?? Object.values(answers).filter(Boolean).length
  const phase = assessment.phase_maturite ?? ''
  const phaseInfo = PHASE_LABELS[phase]

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-moss" /></div>
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => guardLeave(() => router.back())} className="p-1 hover:bg-moss-light rounded-lg">
          <ArrowLeft size={18} className="text-ink3" />
        </button>
        <h1 className="font-syne text-lg font-extrabold text-ink">Accès au Financement</h1>
      </div>

      {error && <ErrorAlert message={error} />}
      {info && <SuccessAlert message={info} className="mb-4" />}

      <MissingInfoCard checklist={checklist} loading={suggestionsLoading} />

      {/* Suggestions */}
      {suggestions && Object.keys(suggestions).length > 0 && (
        <Card className="p-0 overflow-hidden">
          <CardHeader icon={<Lightbulb size={13} />} title="Suggestions automatiques (basées sur vos données GBM)">
            <Button size="sm" variant="outline" onClick={applySuggestions}>
              Appliquer les suggestions
            </Button>
          </CardHeader>
          <div className="p-5 space-y-2">
            {QUESTIONS.map((q) => {
              const s = suggestions[q.key]
              if (!s) return null
              return (
                <div key={q.key} className="flex items-center gap-3 text-sm">
                  <Badge variant={s.value ? 'green' : 'amber'}>{s.value ? 'Oui' : 'Non'}</Badge>
                  <div className="flex-1">
                    <div className="text-ink font-semibold">{q.label}</div>
                    <div className="text-xs text-ink3">{s.reason}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Results card */}
      {showResults && (
        <Card className="p-4 border-2 border-moss/20">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="text-center">
              <div className="text-3xl font-extrabold text-ink">{score}</div>
              <div className="text-xs text-ink3 font-semibold">/12</div>
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold text-ink3 uppercase tracking-wider mb-1">Score de maturité</div>
              <div className="flex items-center gap-2">
                {Array.from({ length: 12 }, (_, i) => (
                  <div key={i} className={`w-5 h-5 rounded-full ${i < score ? 'bg-moss' : 'bg-ink/10'}`} />
                ))}
              </div>
            </div>
            {phaseInfo && (
              <div className="text-center">
                <div className="text-xs text-ink3 mb-1">Phase</div>
                <Badge variant="green">{phaseInfo.label}</Badge>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Questionnaire */}
      <Card className="p-0 overflow-hidden">
        <CardHeader icon={<Lightbulb size={13} />} title="Questionnaire de maturité (12 questions)">
          {!showResults && <span className="text-xs text-ink3">Répondez Oui/Non</span>}
        </CardHeader>
        <div className="p-5 space-y-3">
          {QUESTIONS.map((q) => (
            <div key={q.key} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border hover:bg-moss-light/20">
              <span className="text-sm text-ink flex-1">{q.key.replace('q', 'Q')}. {q.label}</span>
              <div className="flex gap-1">
                <button
                  onClick={() => { setDirty(true); setAnswers((prev: any) => ({ ...prev, [q.key]: true })) }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                    answers[q.key] === true
                      ? 'bg-moss text-white border-moss'
                      : 'bg-surface text-ink3 border-border hover:border-moss/30'
                  }`}
                >
                  Oui
                </button>
                <button
                  onClick={() => { setDirty(true); setAnswers((prev: any) => ({ ...prev, [q.key]: false })) }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                    answers[q.key] === false
                      ? 'bg-red text-white border-red'
                      : 'bg-surface text-ink3 border-border hover:border-red/30'
                  }`}
                >
                  Non
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Submit */}
      <div className="flex justify-end">
        <Button variant="primary" onClick={handleSubmit} loading={submitting}>
          {showResults ? 'Actualiser le score' : 'Soumettre le questionnaire'}
        </Button>
      </div>

      {/* Opportunities & Strategy */}
      {showResults && (
        <>
          <Card className="p-0 overflow-hidden">
            <CardHeader icon={<DollarSign size={13} />} title="Opportunités de financement" />
            <div className="p-5">
              <label className="block text-xs font-semibold text-ink2 mb-1">Opportunités dans votre pays</label>
              <textarea
                className="w-full text-sm px-3 py-2.5 border border-border rounded-lg bg-surface text-ink outline-none focus:border-moss min-h-[80px] resize-y"
                value={opportunites}
                onChange={e => { setDirty(true); setOpportunites(e.target.value) }}
                rows={3}
                placeholder="Décrivez les opportunités de financement identifiées..."
              />
              <Button
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={async () => {
                  await fundingService.updateAssessment(projectId, { opportunites_pays: opportunites })
                  setDirty(false)
                }}
              >
                <Check size={13} /> Sauvegarder
              </Button>
            </div>
          </Card>

          {assessment.strategie_levee_fonds && (
            <Card className="p-4">
              <h3 className="text-sm font-bold text-ink mb-2">Stratégie de levée de fonds</h3>
              <p className="text-sm text-ink2 whitespace-pre-wrap">{assessment.strategie_levee_fonds}</p>
            </Card>
          )}
        </>
      )}

      {modal}
    </div>
  )
}
