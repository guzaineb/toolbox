'use client'

import { useEffect, useState, useCallback } from 'react'
import { Gavel, Plus, X, Check, Scale } from 'lucide-react'
import { Badge, Button, Card, CardHeader, ErrorAlert, Field, Input, Select, Textarea } from '@/components/shared/ui'
import { evaluationService } from '@/services/evaluation.service'
import {
  JurySession, FinalDecisionView, FinalDecisionType,
  JURY_STATUS_LABELS, JURY_STATUS_COLORS,
  DECISION_LABELS, DECISION_COLORS,
  CONDITION_STATUS_LABELS, CONDITION_STATUS_COLORS,
} from '@/types/coaching'
import { CohortExpert } from '@/types/cohort'
import { getErrorMessage } from '@/lib/utils'

interface ProjectRef { id: string; name: string }

const DECISION_TYPES: FinalDecisionType[] = ['ACCEPTED', 'REJECTED', 'CONDITIONAL', 'EXTENDED', 'REEVALUATION_REQUIRED']

/* ═════════════════════════════════════
   MODALE : CRÉER UNE SESSION DE JURY
═════════════════════════════════════ */
function CreateJuryModal({
  projects, juryExperts, onClose, onSuccess,
}: {
  projects: ProjectRef[]
  juryExperts: CohortExpert[]
  onClose: () => void
  onSuccess: () => void
}) {
  const [projectId, setProjectId] = useState('')
  const [title, setTitle] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const handleSubmit = async () => {
    if (!projectId) { setError('Sélectionnez un projet'); return }
    if (selected.length === 0) { setError('Sélectionnez au moins un membre du jury'); return }
    setError(null)
    setLoading(true)
    try {
      await evaluationService.createJurySession(projectId, {
        title: title || undefined,
        memberUserIds: selected,
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
        <CardHeader icon={<Gavel size={15} />} title="Nouvelle session de jury">
          <Button size="sm" variant="ghost" onClick={onClose}><X size={16} /></Button>
        </CardHeader>
        <div className="p-6">
          {error && <div className="mb-5"><ErrorAlert message={error} /></div>}
          <Field label="Projet" required>
            <Select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              <option value="">Sélectionner un projet…</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Titre (optionnel)">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex. Délibération finale" />
          </Field>
          <Field label="Membres du jury" required>
            <div className="space-y-1.5">
              {juryExperts.map((e) => {
                const fn = e.expertUser?.profile?.first_name ?? ''
                const ln = e.expertUser?.profile?.last_name ?? ''
                const isOn = selected.includes(e.expert_user_id)
                return (
                  <button
                    key={e.id}
                    onClick={() => toggle(e.expert_user_id)}
                    className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg border text-[12px] font-medium transition-colors cursor-pointer ${
                      isOn ? 'bg-moss-light text-moss border-moss/30' : 'bg-surface text-ink2 border-border hover:border-moss/30'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${isOn ? 'bg-moss border-moss text-white' : 'border-ink/30'}`}>
                      {isOn && <Check size={11} />}
                    </span>
                    {fn} {ln} <span className="text-ink3 font-normal">({e.expertUser?.email})</span>
                  </button>
                )
              })}
              {juryExperts.length === 0 && (
                <p className="text-[12px] text-ink3">Aucun expert Jury actif disponible.</p>
              )}
            </div>
          </Field>
          <div className="flex gap-3 mt-6">
            <Button className="flex-1" onClick={onClose}>Annuler</Button>
            <Button variant="primary" className="flex-1" loading={loading} onClick={handleSubmit}>Créer</Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

/* ═════════════════════════════════════
   MODALE : RENDRE UNE DÉCISION
═════════════════════════════════════ */
function MakeDecisionModal({
  projects, onClose, onSuccess,
}: {
  projects: ProjectRef[]
  onClose: () => void
  onSuccess: () => void
}) {
  const [projectId, setProjectId] = useState('')
  const [decision, setDecision] = useState<FinalDecisionType>('ACCEPTED')
  const [finalScore, setFinalScore] = useState('')
  const [justification, setJustification] = useState('')
  const [newEndDate, setNewEndDate] = useState('')
  const [conditions, setConditions] = useState<Array<{ description: string; deadline: string }>>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!projectId) { setError('Sélectionnez un projet'); return }
    if (decision === 'CONDITIONAL' && conditions.length === 0) {
      setError('Une décision conditionnelle requiert au moins une condition')
      return
    }
    if (decision === 'EXTENDED' && !newEndDate) {
      setError('Une décision de prolongement requiert une nouvelle date de fin')
      return
    }
    setError(null)
    setLoading(true)
    try {
      await evaluationService.makeDecision(projectId, {
        decision,
        final_score: finalScore ? parseFloat(finalScore) : undefined,
        justification: justification || undefined,
        new_end_date: newEndDate ? new Date(newEndDate).toISOString() : undefined,
        conditions: conditions.length
          ? conditions.map((c) => ({ description: c.description, deadline: c.deadline ? new Date(c.deadline).toISOString() : undefined }))
          : undefined,
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
        <CardHeader icon={<Scale size={15} />} title="Rendre une décision">
          <Button size="sm" variant="ghost" onClick={onClose}><X size={16} /></Button>
        </CardHeader>
        <div className="p-6">
          {error && <div className="mb-5"><ErrorAlert message={error} /></div>}
          <Field label="Projet" required>
            <Select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              <option value="">Sélectionner un projet…</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Décision" required>
            <Select value={decision} onChange={(e) => setDecision(e.target.value as FinalDecisionType)}>
              {DECISION_TYPES.map((d) => (
                <option key={d} value={d}>{DECISION_LABELS[d]}</option>
              ))}
            </Select>
          </Field>
          <Field label="Note finale (optionnel)">
            <Input type="number" min={0} max={20} step={0.5} value={finalScore} onChange={(e) => setFinalScore(e.target.value)} />
          </Field>
          <Field label="Justification">
            <Textarea value={justification} onChange={(e) => setJustification(e.target.value)} rows={3} />
          </Field>

          {decision === 'EXTENDED' && (
            <Field label="Nouvelle date de fin" required>
              <Input type="date" value={newEndDate} onChange={(e) => setNewEndDate(e.target.value)} />
            </Field>
          )}

          {decision === 'CONDITIONAL' && (
            <div>
              <div className="text-[11px] font-bold text-ink3 uppercase tracking-[0.1em] mb-2">Conditions</div>
              <div className="space-y-2">
                {conditions.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      className="flex-1"
                      value={c.description}
                      onChange={(e) => setConditions((prev) => prev.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)))}
                      placeholder={`Condition ${i + 1}`}
                    />
                    <Input
                      className="w-[150px]"
                      type="date"
                      value={c.deadline}
                      onChange={(e) => setConditions((prev) => prev.map((x, j) => (j === i ? { ...x, deadline: e.target.value } : x)))}
                    />
                    <Button size="sm" variant="ghost" className="!text-red" onClick={() => setConditions((prev) => prev.filter((_, j) => j !== i))}>
                      <X size={13} />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="mt-2"
                onClick={() => setConditions((prev) => [...prev, { description: '', deadline: '' }])}
              >
                <Plus size={12} /> Ajouter une condition
              </Button>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <Button className="flex-1" onClick={onClose}>Annuler</Button>
            <Button variant="primary" className="flex-1" loading={loading} onClick={handleSubmit}>Rendre la décision</Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

/* ═════════════════════════════════════
   ONGLET : JURY & DÉCISIONS
═════════════════════════════════════ */
export function JuryTab({
  projects, experts,
}: {
  projects: ProjectRef[]
  experts: CohortExpert[]
}) {
  const [juryByProject, setJuryByProject] = useState<Record<string, JurySession[]>>({})
  const [decisionByProject, setDecisionByProject] = useState<Record<string, FinalDecisionView | null>>({})
  const [loading, setLoading] = useState(true)
  const [showJury, setShowJury] = useState(false)
  const [showDecision, setShowDecision] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const juryExperts = experts.filter((e) => e.status === 'ACTIVE' && e.role === 'JURY')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const j: Record<string, JurySession[]> = {}
      const d: Record<string, FinalDecisionView | null> = {}
      await Promise.all(
        projects.map(async (p) => {
          try {
            j[p.id] = await evaluationService.getProjectJurySessions(p.id)
          } catch {
            j[p.id] = []
          }
          try {
            d[p.id] = await evaluationService.getProjectDecision(p.id)
          } catch {
            d[p.id] = null
          }
        }),
      )
      setJuryByProject(j)
      setDecisionByProject(d)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [projects])

  useEffect(() => { load() }, [load])

  const closeSession = async (id: string) => {
    setError(null)
    try {
      await evaluationService.closeJurySession(id)
      await load()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const validateCondition = async (id: string) => {
    setError(null)
    try {
      await evaluationService.validateCondition(id)
      await load()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-12 text-[12px] text-ink3">Chargement du jury…</div>
  }

  return (
    <div className="space-y-6">
      {showJury && <CreateJuryModal projects={projects} juryExperts={juryExperts} onClose={() => setShowJury(false)} onSuccess={load} />}
      {showDecision && <MakeDecisionModal projects={projects} onClose={() => setShowDecision(false)} onSuccess={load} />}
      {error && <ErrorAlert message={error} />}

      <div className="flex gap-2">
        <Button size="sm" variant="primary" onClick={() => setShowJury(true)}>
          <Gavel size={12} /> Nouvelle session de jury
        </Button>
        <Button size="sm" variant="primary" onClick={() => setShowDecision(true)}>
          <Scale size={12} /> Rendre une décision
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card className="text-center py-12">
          <Gavel size={30} className="mx-auto text-ink3 mb-3" />
          <p className="text-[13px] text-ink3">Aucun projet accepté pour le jury.</p>
        </Card>
      ) : (
        projects.map((p) => {
          const sessions = juryByProject[p.id] ?? []
          const decisionView = decisionByProject[p.id]
          const latest = decisionView?.latest ?? null
          return (
            <Card key={p.id} className="overflow-hidden">
              <div className="px-[18px] py-[12px] border-b border-border bg-surface-2 flex items-center justify-between">
                <span className="font-syne text-[13px] font-bold text-ink">{p.name}</span>
                {latest && <Badge variant={DECISION_COLORS[latest.decision]}>{DECISION_LABELS[latest.decision]}</Badge>}
              </div>
              <div className="p-[18px] space-y-4">
                <div>
                  <div className="text-[11px] font-bold text-ink3 uppercase tracking-[0.1em] mb-2">Sessions ({sessions.length})</div>
                  {sessions.length === 0 ? (
                    <p className="text-[12px] text-ink3">Aucune session de jury.</p>
                  ) : (
                    <div className="space-y-[6px]">
                      {sessions.map((s) => (
                        <div key={s.id} className="flex items-center gap-3 text-[12px]">
                          <div className="flex-1 min-w-0">
                            <span className="text-ink2 font-medium">{s.title || 'Session de jury'}</span>
                            <span className="text-ink3"> · {s.members?.length ?? 0} membre(s)</span>
                            {s.reevaluation_requested && <Badge variant="amber" className="ml-2">Réévaluation requise</Badge>}
                          </div>
                          <Badge variant={JURY_STATUS_COLORS[s.status]}>{JURY_STATUS_LABELS[s.status]}</Badge>
                          {s.status !== 'CLOSED' && (
                            <Button size="sm" variant="ghost" className="!text-ink3" onClick={() => closeSession(s.id)}>
                              Clôturer
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-[11px] font-bold text-ink3 uppercase tracking-[0.1em] mb-2">Décision finale</div>
                  {!latest ? (
                    <p className="text-[12px] text-ink3">Aucune décision rendue.</p>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-[12px] text-ink2">
                        Rendu le {new Date(latest.decided_at).toLocaleDateString('fr-FR')}
                        {latest.final_score !== undefined && latest.final_score !== null && (
                          <> · Note finale : <span className="font-bold text-ink">{latest.final_score}</span></>
                        )}
                        {latest.new_end_date && (
                          <> · Nouvelle date de fin : {new Date(latest.new_end_date).toLocaleDateString('fr-FR')}</>
                        )}
                      </div>
                      {latest.justification && (
                        <div className="text-[12px] text-ink2 bg-surface border border-border rounded-lg p-3 leading-relaxed">{latest.justification}</div>
                      )}
                      {latest.conditions && latest.conditions.length > 0 && (
                        <div className="space-y-[6px]">
                          {latest.conditions.map((c) => (
                            <div key={c.id} className="flex items-center gap-3 text-[12px]">
                              <div className="flex-1 min-w-0">
                                <span className="text-ink2">{c.description}</span>
                                {c.deadline && <span className="text-ink3"> · {new Date(c.deadline).toLocaleDateString('fr-FR')}</span>}
                              </div>
                              <Badge variant={CONDITION_STATUS_COLORS[c.status]}>{CONDITION_STATUS_LABELS[c.status]}</Badge>
                              {c.status !== 'COMPLETED' && (
                                <Button size="sm" variant="outline" onClick={() => validateCondition(c.id)}>
                                  <Check size={12} /> Valider
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )
        })
      )}
    </div>
  )
}
