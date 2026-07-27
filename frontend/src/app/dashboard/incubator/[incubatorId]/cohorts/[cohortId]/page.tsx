'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  ChevronRight, Users, UserCheck, FileText, Play, Pause,
  Archive, Trash2, Plus, X, Check, Send,
} from 'lucide-react'
import { cohortService } from '@/services/cohort.service'
import {
  Badge, Button, Card, CardHeader, ErrorAlert, SuccessAlert,
  Field, Input, Select, Textarea,
} from '@/components/shared/ui'
import { SearchAutocomplete } from '@/components/shared/SearchAutocomplete'
import {
  Cohort, CohortParticipation, CohortExpert,
  COHORT_STATUS_LABELS, COHORT_STATUS_COLORS,
  PARTICIPATION_STATUS_LABELS, PARTICIPATION_STATUS_COLORS,
  PARTICIPATION_ORIGIN_LABELS,
  EXPERT_ROLE_LABELS, EXPERT_ROLE_COLORS,
  EXPERT_STATUS_LABELS, EXPERT_STATUS_COLORS,
  CohortStatus,
} from '@/types/cohort'

type Tab = 'info' | 'participations' | 'experts'

interface ProjectSearchResult {
  id: string
  name: string
  description?: string
  owner_id: string
}

interface ExpertSearchResult {
  id: string
  email: string
  profile?: { first_name: string; last_name: string }
  expertProfile?: { headline?: string; availability_status?: string }
}

/* ═════════════════════════════════════
   MODALE : INVITER UN PROJET
═════════════════════════════════════ */
function InviteProjectModal({
  cohortId, onClose, onSuccess,
}: {
  cohortId: string; onClose: () => void; onSuccess: () => void
}) {
  const [selectedProject, setSelectedProject] = useState<ProjectSearchResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!selectedProject) { setError('Sélectionnez un projet'); return }
    setError(null)
    setLoading(true)
    try {
      await cohortService.inviteToCohort(cohortId, selectedProject.id)
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Erreur lors de l'invitation")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-6 z-50" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <Card className="w-full max-w-[480px] p-0 overflow-hidden shadow-lg">
        <CardHeader icon={<Send size={15} />} title="Inviter un projet">
          <Button size="sm" variant="ghost" onClick={onClose}><X size={16} /></Button>
        </CardHeader>
        <div className="p-6">
          {error && <div className="mb-5"><ErrorAlert message={error} /></div>}
          <Field label="Rechercher un projet par nom" required>
            <SearchAutocomplete
              onSearch={cohortService.searchProjects.bind(cohortService)}
              onSelect={(item: ProjectSearchResult) => setSelectedProject(item)}
              renderOption={(item: ProjectSearchResult) => (
                <div>
                  <div className="font-medium">{item.name}</div>
                  {item.description && <div className="text-ink3 text-[11px] truncate mt-0.5">{item.description}</div>}
                </div>
              )}
              renderSelected={(item: ProjectSearchResult) => (
                <span className="font-medium">{item.name}</span>
              )}
              placeholder="Tapez le nom d'un projet..."
            />
          </Field>
          <div className="flex gap-3 mt-6">
            <Button className="flex-1" onClick={onClose}>Annuler</Button>
            <Button variant="primary" className="flex-1" loading={loading} onClick={handleSubmit}>Inviter</Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

/* ═════════════════════════════════════
   MODALE : AFFECTER UN EXPERT
═════════════════════════════════════ */
function AssignExpertModal({
  cohortId, onClose, onSuccess,
}: {
  cohortId: string; onClose: () => void; onSuccess: () => void
}) {
  const [selectedExpert, setSelectedExpert] = useState<ExpertSearchResult | null>(null)
  const [role, setRole] = useState<'JURY' | 'COACH'>('JURY')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!selectedExpert) { setError("Sélectionnez un expert"); return }
    setError(null)
    setLoading(true)
    try {
      await cohortService.assignExpert(cohortId, { expertUserId: selectedExpert.id, role })
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Erreur lors de l'affectation")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-6 z-50" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <Card className="w-full max-w-[480px] p-0 overflow-hidden shadow-lg">
        <CardHeader icon={<UserCheck size={15} />} title="Affecter un expert">
          <Button size="sm" variant="ghost" onClick={onClose}><X size={16} /></Button>
        </CardHeader>
        <div className="p-6">
          {error && <div className="mb-5"><ErrorAlert message={error} /></div>}
          <Field label="Rechercher un expert par email" required>
            <SearchAutocomplete
              onSearch={cohortService.searchExperts.bind(cohortService)}
              onSelect={(item: ExpertSearchResult) => setSelectedExpert(item)}
              renderOption={(item: ExpertSearchResult) => {
                const name = item.profile
                  ? `${item.profile.first_name} ${item.profile.last_name}`
                  : item.email
                return (
                  <div>
                    <div className="font-medium">{name}</div>
                    <div className="text-ink3 text-[11px]">{item.email}</div>
                    {item.expertProfile?.headline && (
                      <div className="text-ink3 text-[10px] mt-0.5">{item.expertProfile.headline}</div>
                    )}
                  </div>
                )
              }}
              renderSelected={(item: ExpertSearchResult) => {
                const name = item.profile
                  ? `${item.profile.first_name} ${item.profile.last_name}`
                  : item.email
                return <span className="font-medium">{name} ({item.email})</span>
              }}
              placeholder="Tapez un email..."
            />
          </Field>
          <Field label="Rôle">
            <Select value={role} onChange={(e) => setRole(e.target.value as 'JURY' | 'COACH')}>
              <option value="JURY">Jury</option>
              <option value="COACH">Coach</option>
            </Select>
          </Field>
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
   ONGLET : INFO
═════════════════════════════════════ */
function InfoTab({ cohort, onRefresh }: { cohort: Cohort; onRefresh: () => void }) {
  const handleStatusChange = async (action: () => Promise<any>) => {
    try {
      await action()
      onRefresh()
    } catch {}
  }

  const canPublish = cohort.status === 'DRAFT'
  const canStart = cohort.status === 'OPEN'
  const canClose = cohort.status === 'IN_PROGRESS' || cohort.status === 'OPEN'
  const canArchive = cohort.status !== 'ARCHIVED'

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden">
        <CardHeader icon={<FileText size={13} />} title="Détails" />
        <div className="divide-y divide-border">
          {[
            { label: 'Nom', value: cohort.name },
            { label: 'Programme', value: cohort.program || '—' },
            { label: 'Description', value: cohort.description || '—' },
            { label: 'Capacité', value: cohort.capacity ? `${cohort.current_participants}/${cohort.capacity}` : 'Illimité' },
            { label: 'Date limite candidature', value: cohort.application_deadline ? new Date(cohort.application_deadline).toLocaleDateString('fr-FR') : '—' },
            { label: 'Date de début', value: cohort.start_date ? new Date(cohort.start_date).toLocaleDateString('fr-FR') : '—' },
            { label: 'Date de fin', value: cohort.end_date ? new Date(cohort.end_date).toLocaleDateString('fr-FR') : '—' },
          ].map((f) => (
            <div key={f.label} className="px-[18px] py-[9px]">
              <div className="text-[9px] font-bold text-ink3 uppercase tracking-[0.1em] mb-[2px]">{f.label}</div>
              <div className="text-[12px] font-medium text-ink truncate">{f.value}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <div className="text-[11px] font-bold text-ink3 uppercase tracking-[0.1em] mb-3">Actions de statut</div>
        <div className="flex flex-wrap gap-2">
          {canPublish && (
            <Button variant="primary" size="sm" onClick={() => handleStatusChange(() => cohortService.publishCohort(cohort.id))}>
              <Play size={12} /> Publier
            </Button>
          )}
          {canStart && (
            <Button variant="primary" size="sm" onClick={() => handleStatusChange(() => cohortService.startCohort(cohort.id))}>
              <Play size={12} /> Démarrer
            </Button>
          )}
          {canClose && (
            <Button variant="outline" size="sm" onClick={() => handleStatusChange(() => cohortService.closeCohort(cohort.id))}>
              <Pause size={12} /> Clôturer
            </Button>
          )}
          {canArchive && (
            <Button variant="ghost" size="sm" onClick={() => handleStatusChange(() => cohortService.archiveCohort(cohort.id))}>
              <Archive size={12} /> Archiver
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}

/* ═════════════════════════════════════
   ONGLET : PARTICIPATIONS
═════════════════════════════════════ */
function ParticipationsTab({
  cohortId, participations, onRefresh,
}: {
  cohortId: string; participations: CohortParticipation[]; onRefresh: () => void
}) {
  const [showInvite, setShowInvite] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const handleAccept = async (id: string) => {
    setActionLoading(id)
    try {
      await cohortService.acceptParticipation(id)
      onRefresh()
    } catch {}
    setActionLoading(null)
  }

  const handleReject = async (id: string) => {
    setActionLoading(id)
    try {
      await cohortService.rejectParticipation(id)
      onRefresh()
    } catch {}
    setActionLoading(null)
  }

  return (
    <div>
      {showInvite && (
        <InviteProjectModal cohortId={cohortId} onClose={() => setShowInvite(false)} onSuccess={onRefresh} />
      )}
      <div className="flex items-center justify-between mb-4">
        <div className="text-[12px] text-ink3">{participations.length} candidature(s)</div>
        <Button variant="primary" size="sm" onClick={() => setShowInvite(true)}>
          <Send size={12} /> Inviter un projet
        </Button>
      </div>
      {participations.length === 0 ? (
        <Card className="text-center py-10">
          <FileText size={32} className="mx-auto text-ink3 mb-3" />
          <p className="text-[13px] text-ink3">Aucune candidature pour le moment</p>
        </Card>
      ) : (
        <div className="space-y-[6px]">
          {participations.map((p) => (
            <Card key={p.id} className="p-[14px_16px]">
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-ink truncate">{p.project?.name || 'Projet inconnu'}</div>
                  <div className="text-[11px] text-ink3">
                    {PARTICIPATION_ORIGIN_LABELS[p.origin]} · {new Date(p.applied_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                <Badge variant={PARTICIPATION_STATUS_COLORS[p.status]?.includes('green') ? 'green' : PARTICIPATION_STATUS_COLORS[p.status]?.includes('yellow') ? 'amber' : PARTICIPATION_STATUS_COLORS[p.status]?.includes('red') ? 'red' : 'gray'}>
                  {PARTICIPATION_STATUS_LABELS[p.status]}
                </Badge>
                {p.status === 'PENDING' && (
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="!text-green-600" loading={actionLoading === p.id} onClick={() => handleAccept(p.id)}>
                      <Check size={13} />
                    </Button>
                    <Button size="sm" variant="ghost" className="!text-red" loading={actionLoading === p.id} onClick={() => handleReject(p.id)}>
                      <X size={13} />
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

/* ═════════════════════════════════════
   ONGLET : EXPERTS
═════════════════════════════════════ */
function ExpertsTab({
  cohortId, experts, onRefresh,
}: {
  cohortId: string; experts: CohortExpert[]; onRefresh: () => void
}) {
  const [showAssign, setShowAssign] = useState(false)
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null)

  const handleDeactivate = async (id: string) => {
    setDeactivatingId(id)
    try {
      await cohortService.deactivateCohortExpert(id)
      onRefresh()
    } catch {}
    setDeactivatingId(null)
  }

  const juryExperts = experts.filter((e) => e.role === 'JURY')
  const coachExperts = experts.filter((e) => e.role === 'COACH')

  return (
    <div>
      {showAssign && (
        <AssignExpertModal cohortId={cohortId} onClose={() => setShowAssign(false)} onSuccess={onRefresh} />
      )}
      <div className="flex items-center justify-between mb-4">
        <div className="text-[12px] text-ink3">{experts.filter((e) => e.status === 'ACTIVE').length} expert(s) actif(s)</div>
        <Button variant="primary" size="sm" onClick={() => setShowAssign(true)}>
          <UserCheck size={12} /> Affecter un expert
        </Button>
      </div>
      {experts.length === 0 ? (
        <Card className="text-center py-10">
          <UserCheck size={32} className="mx-auto text-ink3 mb-3" />
          <p className="text-[13px] text-ink3">Aucun expert affecté</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {[
            { label: 'Jury', items: juryExperts },
            { label: 'Coach', items: coachExperts },
          ].map(({ label, items }) => items.length > 0 && (
            <div key={label}>
              <div className="text-[11px] font-bold text-ink3 uppercase tracking-[0.1em] mb-2">{label}</div>
              <div className="space-y-[6px]">
                {items.map((exp) => {
                  const fn = exp.expertUser?.profile?.first_name ?? '?'
                  const ln = exp.expertUser?.profile?.last_name ?? ''
                  return (
                    <Card key={exp.id} className="p-[14px_16px]">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-moss-light flex items-center justify-center text-[11px] font-bold text-moss flex-shrink-0">
                          {fn.charAt(0)}{ln.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-medium text-ink truncate">{fn} {ln}</div>
                          <div className="text-[11px] text-ink3">{exp.expertUser?.email}</div>
                        </div>
                        <Badge variant={EXPERT_STATUS_COLORS[exp.status]?.includes('green') ? 'green' : 'gray'}>
                          {EXPERT_STATUS_LABELS[exp.status]}
                        </Badge>
                        {exp.status === 'ACTIVE' && (
                          <Button size="sm" variant="ghost" className="!text-red" loading={deactivatingId === exp.id} onClick={() => handleDeactivate(exp.id)}>
                            <Trash2 size={13} />
                          </Button>
                        )}
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ═════════════════════════════════════
   PAGE PRINCIPALE
═════════════════════════════════════ */
export default function CohortDetailPage() {
  const { incubatorId, cohortId } = useParams<{ incubatorId: string; cohortId: string }>()
  const [cohort, setCohort] = useState<Cohort | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('info')

  const fetchCohort = useCallback(() => {
    if (!cohortId) return
    setLoading(true)
    cohortService
      .getCohortById(cohortId)
      .then(setCohort)
      .finally(() => setLoading(false))
  }, [cohortId])

  useEffect(() => { fetchCohort() }, [fetchCohort])

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-7 w-72 bg-border rounded-lg" />
          <div className="h-10 w-96 bg-border rounded" />
          <div className="h-48 bg-border rounded-[14px] mt-4" />
        </div>
      </div>
    )
  }

  if (!cohort) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <Card className="text-center py-16">
          <p className="text-ink font-medium">Cohorte introuvable.</p>
          <Link href={`/dashboard/incubator/${incubatorId}/cohorts`}>
            <Button className="mt-4" variant="outline">← Retour</Button>
          </Link>
        </Card>
      </div>
    )
  }

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'info', label: 'Informations', icon: <FileText size={13} /> },
    { key: 'participations', label: `Candidatures (${cohort.participations?.length ?? 0})`, icon: <Users size={13} /> },
    { key: 'experts', label: `Experts (${cohort.experts?.filter((e) => e.status === 'ACTIVE').length ?? 0})`, icon: <UserCheck size={13} /> },
  ]

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-[5px] text-[11px] text-ink3 mb-2">
        <Link href="/dashboard/incubator" className="hover:text-moss transition-colors">Incubateurs</Link>
        <ChevronRight size={11} />
        <Link href={`/dashboard/incubator/${incubatorId}`} className="hover:text-moss transition-colors">Détail</Link>
        <ChevronRight size={11} />
        <Link href={`/dashboard/incubator/${incubatorId}/cohorts`} className="hover:text-moss transition-colors">Cohortes</Link>
        <ChevronRight size={11} />
        <span className="text-ink font-medium truncate">{cohort.name}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="font-syne text-[22px] font-extrabold text-ink mb-1">{cohort.name}</h1>
          <div className="flex gap-[6px] flex-wrap">
            <Badge variant={COHORT_STATUS_COLORS[cohort.status]?.includes('green') ? 'green' : COHORT_STATUS_COLORS[cohort.status]?.includes('blue') ? 'blue' : COHORT_STATUS_COLORS[cohort.status]?.includes('red') ? 'red' : COHORT_STATUS_COLORS[cohort.status]?.includes('yellow') ? 'amber' : 'gray'}>
              {COHORT_STATUS_LABELS[cohort.status]}
            </Badge>
            {cohort.program && <Badge variant="gray">{cohort.program}</Badge>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-[6px] px-4 py-2.5 text-[12px] font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-moss text-moss'
                : 'border-transparent text-ink3 hover:text-ink'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'info' && <InfoTab cohort={cohort} onRefresh={fetchCohort} />}
      {activeTab === 'participations' && (
        <ParticipationsTab cohortId={cohortId} participations={cohort.participations ?? []} onRefresh={fetchCohort} />
      )}
      {activeTab === 'experts' && (
        <ExpertsTab cohortId={cohortId} experts={cohort.experts ?? []} onRefresh={fetchCohort} />
      )}
    </div>
  )
}
