'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  ClipboardCheck, Plus, X, Check, FilePlus2,
} from 'lucide-react'
import { Badge, Button, Card, CardHeader, ErrorAlert, Field, Input, Select, Textarea } from '@/components/shared/ui'
import { evaluationService } from '@/services/evaluation.service'
import {
  EvaluationTemplate, EvaluationAssignment, EvaluationSummary,
  EVALUATION_STAGE_LABELS,
} from '@/types/coaching'
import { CohortExpert } from '@/types/cohort'
import { getErrorMessage } from '@/lib/utils'

interface ProjectRef { id: string; name: string }

/* ═════════════════════════════════════
   MODALE : CRÉER UNE GRILLE
═════════════════════════════════════ */
function CreateTemplateModal({
  cohortId, onClose, onSuccess,
}: {
  cohortId: string; onClose: () => void; onSuccess: () => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [stage, setStage] = useState<'INTERMEDIATE' | 'FINAL'>('INTERMEDIATE')
  const [criteria, setCriteria] = useState<Array<{ name: string; weight: string; max_score: string }>>([
    { name: '', weight: '100', max_score: '5' },
  ])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Le nom de la grille est requis'); return }
    const parsed = criteria.map((c, i) => ({
      name: c.name.trim(),
      weight: parseFloat(c.weight) || 0,
      max_score: parseInt(c.max_score, 10) || 5,
      sort_order: i,
    }))
    if (parsed.some((c) => !c.name)) { setError('Tous les critères doivent avoir un nom'); return }
    const total = parsed.reduce((s, c) => s + c.weight, 0)
    if (Math.abs(total - 100) > 0.5) {
      setError(`La somme des poids doit être de 100 (actuellement ${total})`)
      return
    }
    setError(null)
    setLoading(true)
    try {
      await evaluationService.createTemplate(cohortId, {
        name: name.trim(),
        description: description || undefined,
        stage,
        criteria: parsed,
      })
      onSuccess()
      onClose()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-6 z-50 overflow-y-auto" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <Card className="w-full max-w-[560px] p-0 overflow-hidden shadow-lg my-8">
        <CardHeader icon={<FilePlus2 size={15} />} title="Nouvelle grille d'évaluation">
          <Button size="sm" variant="ghost" onClick={onClose}><X size={16} /></Button>
        </CardHeader>
        <div className="p-6">
          {error && <div className="mb-5"><ErrorAlert message={error} /></div>}
          <Field label="Nom de la grille" required>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex. Grille finale — Pitch" />
          </Field>
          <Field label="Description">
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </Field>
          <Field label="Étape">
            <Select value={stage} onChange={(e) => setStage(e.target.value as 'INTERMEDIATE' | 'FINAL')}>
              <option value="INTERMEDIATE">Évaluation intermédiaire</option>
              <option value="FINAL">Évaluation finale</option>
            </Select>
          </Field>

          <div className="text-[11px] font-bold text-ink3 uppercase tracking-[0.1em] mb-2">Critères (poids total : {criteria.reduce((s, c) => s + (parseFloat(c.weight) || 0), 0)})</div>
          <div className="space-y-2">
            {criteria.map((c, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  className="flex-1"
                  value={c.name}
                  onChange={(e) => setCriteria((prev) => prev.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
                  placeholder={`Critère ${i + 1}`}
                />
                <Input
                  className="w-[80px]"
                  type="number"
                  min={0}
                  step={0.5}
                  value={c.weight}
                  onChange={(e) => setCriteria((prev) => prev.map((x, j) => (j === i ? { ...x, weight: e.target.value } : x)))}
                  placeholder="Poids"
                  title="Poids (%)"
                />
                <Input
                  className="w-[70px]"
                  type="number"
                  min={1}
                  value={c.max_score}
                  onChange={(e) => setCriteria((prev) => prev.map((x, j) => (j === i ? { ...x, max_score: e.target.value } : x)))}
                  placeholder="Note max"
                  title="Note maximale"
                />
                <Button size="sm" variant="ghost" className="!text-red" onClick={() => setCriteria((prev) => prev.filter((_, j) => j !== i))}>
                  <X size={13} />
                </Button>
              </div>
            ))}
          </div>
          <Button
            size="sm"
            variant="outline"
            className="mt-2"
            onClick={() => setCriteria((prev) => [...prev, { name: '', weight: '', max_score: '5' }])}
          >
            <Plus size={12} /> Ajouter un critère
          </Button>

          <div className="flex gap-3 mt-6">
            <Button className="flex-1" onClick={onClose}>Annuler</Button>
            <Button variant="primary" className="flex-1" loading={loading} onClick={handleSubmit}>Créer la grille</Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

/* ═════════════════════════════════════
   MODALE : AFFECTER DES MEMBRES DU JURY
═════════════════════════════════════ */
function AssignEvaluatorsModal({
  cohortId, projects, juryExperts, templates, onClose, onSuccess,
}: {
  cohortId: string
  projects: ProjectRef[]
  juryExperts: CohortExpert[]
  templates: EvaluationTemplate[]
  onClose: () => void
  onSuccess: () => void
}) {
  const [templateId, setTemplateId] = useState('')
  const [deadline, setDeadline] = useState('')
  const [selections, setSelections] = useState<Record<string, string[]>>({})
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const toggleJuror = (projectId: string, jurorId: string) => {
    setSelections((prev) => {
      const current = prev[projectId] ?? []
      const next = current.includes(jurorId) ? current.filter((x) => x !== jurorId) : [...current, jurorId]
      return { ...prev, [projectId]: next }
    })
  }

  const handleSubmit = async () => {
    const assignments = projects
      .filter((p) => (selections[p.id] ?? []).length > 0)
      .map((p) => ({ projectId: p.id, juryUserIds: selections[p.id] }))
    if (assignments.length === 0) {
      setError('Sélectionnez au moins un membre du jury pour un projet')
      return
    }
    setError(null)
    setLoading(true)
    try {
      await evaluationService.assignEvaluators(cohortId, {
        templateId: templateId || undefined,
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
        assignments,
      })
      onSuccess()
      onClose()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-6 z-50 overflow-y-auto" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <Card className="w-full max-w-[640px] p-0 overflow-hidden shadow-lg my-8">
        <CardHeader icon={<ClipboardCheck size={15} />} title="Affecter des membres du jury">
          <Button size="sm" variant="ghost" onClick={onClose}><X size={16} /></Button>
        </CardHeader>
        <div className="p-6">
          {error && <div className="mb-5"><ErrorAlert message={error} /></div>}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Field label="Grille d'évaluation">
              <Select value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
                <option value="">Dernière grille publiée</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}{t.published ? '' : ' (brouillon)'}</option>
                ))}
              </Select>
            </Field>
            <Field label="Échéance">
              <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </Field>
          </div>

          <div className="text-[11px] font-bold text-ink3 uppercase tracking-[0.1em] mb-2">Membres du jury disponibles</div>
          {juryExperts.length === 0 && (
            <p className="text-[12px] text-ink3 mb-3">Aucun expert Jury actif dans la cohorte. Affectez d'abord des experts au rôle Jury.</p>
          )}

          <div className="space-y-3">
            {projects.map((p) => (
              <div key={p.id} className="border border-border rounded-lg p-3">
                <div className="text-[12px] font-semibold text-ink mb-2">{p.name}</div>
                <div className="flex flex-wrap gap-2">
                  {juryExperts.map((e) => {
                    const fn = e.expertUser?.profile?.first_name ?? ''
                    const ln = e.expertUser?.profile?.last_name ?? ''
                    const selected = (selections[p.id] ?? []).includes(e.expert_user_id)
                    return (
                      <button
                        key={e.id}
                        onClick={() => toggleJuror(p.id, e.expert_user_id)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer ${
                          selected
                            ? 'bg-moss-light text-moss border-moss/30'
                            : 'bg-surface text-ink2 border-border hover:border-moss/30'
                        }`}
                      >
                        {selected && <Check size={11} />}
                        {fn} {ln}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-6">
            <Button className="flex-1" onClick={onClose}>Annuler</Button>
            <Button variant="primary" className="flex-1" loading={loading} onClick={handleSubmit}>Affecter</Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

/* ═════════════════════════════════════
   ONGLET : ÉVALUATION
═════════════════════════════════════ */
export function EvaluationTab({
  cohortId, projects, experts,
}: {
  cohortId: string
  projects: ProjectRef[]
  experts: CohortExpert[]
}) {
  const [templates, setTemplates] = useState<EvaluationTemplate[]>([])
  const [assignments, setAssignments] = useState<EvaluationAssignment[]>([])
  const [summaries, setSummaries] = useState<Record<string, EvaluationSummary | null>>({})
  const [loading, setLoading] = useState(true)
  const [showTemplate, setShowTemplate] = useState(false)
  const [showAssign, setShowAssign] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const juryExperts = experts.filter((e) => e.status === 'ACTIVE' && e.role === 'JURY')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [t, a] = await Promise.all([
        evaluationService.getCohortTemplates(cohortId),
        evaluationService.getCohortEvaluationAssignments(cohortId),
      ])
      setTemplates(t)
      setAssignments(a)
      const s: Record<string, EvaluationSummary | null> = {}
      await Promise.all(
        projects.map(async (p) => {
          try {
            s[p.id] = await evaluationService.getProjectSummary(p.id)
          } catch {
            s[p.id] = null
          }
        }),
      )
      setSummaries(s)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [cohortId, projects])

  useEffect(() => { load() }, [load])

  const publishTemplate = async (id: string) => {
    setError(null)
    try {
      await evaluationService.publishTemplate(id)
      await load()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-12 text-[12px] text-ink3">Chargement des évaluations…</div>
  }

  return (
    <div className="space-y-6">
      {showTemplate && <CreateTemplateModal cohortId={cohortId} onClose={() => setShowTemplate(false)} onSuccess={load} />}
      {showAssign && (
        <AssignEvaluatorsModal
          cohortId={cohortId}
          projects={projects}
          juryExperts={juryExperts}
          templates={templates}
          onClose={() => setShowAssign(false)}
          onSuccess={load}
        />
      )}
      {error && <ErrorAlert message={error} />}

      {/* Grilles */}
      <Card className="overflow-hidden">
        <CardHeader icon={<ClipboardCheck size={13} />} title="Grilles d'évaluation">
          <Button size="sm" variant="primary" onClick={() => setShowTemplate(true)}>
            <Plus size={12} /> Nouvelle grille
          </Button>
        </CardHeader>
        <div className="p-[18px]">
          {templates.length === 0 ? (
            <p className="text-[12px] text-ink3">Aucune grille créée pour cette cohorte.</p>
          ) : (
            <div className="space-y-[8px]">
              {templates.map((t) => (
                <div key={t.id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[13px] font-medium text-ink">{t.name}</span>
                      <Badge variant="gray">{EVALUATION_STAGE_LABELS[t.stage]}</Badge>
                      <Badge variant={t.published ? 'green' : 'amber'}>{t.published ? 'Publiée' : 'Brouillon'}</Badge>
                      <span className="text-[11px] text-ink3">{t.criteria?.length ?? 0} critère(s)</span>
                    </div>
                  </div>
                  {!t.published && (
                    <Button size="sm" variant="outline" onClick={() => publishTemplate(t.id)}>
                      <Check size={12} /> Publier
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Synthèse par projet */}
      <Card className="overflow-hidden">
        <CardHeader icon={<ClipboardCheck size={13} />} title="Synthèse par projet" />
        <div className="p-[18px]">
          {projects.length === 0 ? (
            <p className="text-[12px] text-ink3">Aucun projet accepté.</p>
          ) : (
            <div className="space-y-[6px]">
              {projects.map((p) => {
                const s = summaries[p.id]
                return (
                  <div key={p.id} className="flex items-center gap-3 text-[12px]">
                    <span className="flex-1 text-ink2 truncate">{p.name}</span>
                    {!s || s.submitted === 0 ? (
                      <Badge variant="gray">En attente</Badge>
                    ) : (
                      <>
                        <Badge variant="green">{s.submitted} évaluation(s)</Badge>
                        <span className="font-syne text-[15px] font-extrabold text-moss">{s.average20}/20</span>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </Card>

      {/* Affectations */}
      <Card className="overflow-hidden">
        <CardHeader icon={<ClipboardCheck size={13} />} title="Affectations d'évaluation">
          <Button size="sm" variant="primary" onClick={() => setShowAssign(true)}>
            <Plus size={12} /> Affecter
          </Button>
        </CardHeader>
        <div className="p-[18px]">
          {assignments.length === 0 ? (
            <p className="text-[12px] text-ink3">Aucune affectation d'évaluation pour le moment.</p>
          ) : (
            <div className="space-y-[6px]">
              {assignments.map((a) => {
                const fn = a.juryUser?.profile?.first_name ?? '?'
                const ln = a.juryUser?.profile?.last_name ?? ''
                return (
                  <div key={a.id} className="flex items-center gap-3 text-[12px]">
                    <div className="flex-1 min-w-0">
                      <span className="text-ink2 font-medium">{a.project?.name}</span>
                      <span className="text-ink3"> · {fn} {ln}</span>
                      {a.deadline && <span className="text-ink3"> · {new Date(a.deadline).toLocaleDateString('fr-FR')}</span>}
                    </div>
                    <Badge variant={a.submitted ? 'green' : 'amber'}>{a.submitted ? 'Soumise' : 'En attente'}</Badge>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
