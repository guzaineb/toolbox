'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Users, Calendar, Search, ChevronRight, FileText } from 'lucide-react'
import { TabNav, Badge, Button, Card, Input, Select, ErrorAlert } from '@/components/shared/ui'
import { useAvailableCohorts, useMyCohorts, useApplyToCohort, useAcceptInvitation, useRejectInvitation, useWithdrawParticipation } from '@/hooks/useCohorts'
import {
  Cohort, CohortParticipation,
  PARTICIPATION_STATUS_LABELS, PARTICIPATION_STATUS_COLORS,
  PARTICIPATION_ORIGIN_LABELS,
} from '@/types/cohort'
import api from '@/services/api'
import { useQuery } from '@tanstack/react-query'

const TABS = [
  { id: 'available', label: 'Cohortes disponibles' },
  { id: 'mine', label: 'Mes cohortes' },
]

function AvailableCohorts() {
  const { data: cohorts, isLoading, error } = useAvailableCohorts()
  const [search, setSearch] = useState('')
  const applyMutation = useApplyToCohort()

  const { data: projects } = useQuery({
    queryKey: ['my-projects'],
    queryFn: async () => {
      const res = await api.get('/projects')
      return res.data as Array<{ id: string; name: string }>
    },
  })

  const [selectedProject, setSelectedProject] = useState<Record<string, string>>({})
  const [applyingCohort, setApplyingCohort] = useState<string | null>(null)

  if (isLoading) return <LoadingSkeleton count={3} />
  if (error) return <div className="text-red text-[12px] p-4">Erreur lors du chargement</div>

  const filtered = (cohorts || []).filter((c) => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.description?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  if (filtered.length === 0) {
    return (
      <Card className="text-center py-14">
        <div className="w-14 h-14 rounded-full bg-moss-light text-moss flex items-center justify-center mx-auto mb-4">
          <Users size={24} />
        </div>
        <p className="text-[15px] font-semibold text-ink mb-1">Aucune cohorte disponible</p>
        <p className="text-[12px] text-ink3">Revenez plus tard pour découvrir de nouvelles opportunités.</p>
      </Card>
    )
  }

  const handleApply = async (cohortId: string) => {
    const projectId = selectedProject[cohortId]
    if (!projectId) return
    setApplyingCohort(cohortId)
    try {
      await applyMutation.mutateAsync({ cohortId, projectId })
    } finally {
      setApplyingCohort(null)
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink3" />
          <Input
            placeholder="Rechercher une cohorte..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {applyMutation.error && (
        <div className="mb-4">
          <ErrorAlert message={(applyMutation.error as any)?.response?.data?.message || 'Erreur lors de la candidature'} />
        </div>
      )}

      <div className="space-y-[10px]">
        {filtered.map((cohort) => {
          const projectId = selectedProject[cohort.id] || ''
          return (
            <Card key={cohort.id} className="p-[16px_18px]">
              <div className="flex items-start gap-[14px]">
                <div className="w-[46px] h-[46px] rounded-[12px] bg-moss-light border border-border flex items-center justify-center flex-shrink-0 mt-1">
                  <Users size={22} className="text-moss" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-syne text-[15px] font-bold text-ink mb-[2px] truncate">{cohort.name}</h3>
                  <p className="text-[11px] text-ink3 mb-1">
                    {cohort.incubator?.name || 'Incubateur inconnu'}
                    {cohort.capacity && ` · ${cohort.current_participants}/${cohort.capacity} participants`}
                  </p>
                  {cohort.description && (
                    <p className="text-[12px] text-ink2 mb-[6px] line-clamp-2">{cohort.description}</p>
                  )}
                  <div className="flex gap-[5px] flex-wrap items-center">
                    {cohort.application_deadline && (
                      <Badge variant="amber">
                        <Calendar size={10} className="mr-1" />
                        Limite : {new Date(cohort.application_deadline).toLocaleDateString('fr-FR')}
                      </Badge>
                    )}
                    {cohort.start_date && (
                      <Badge variant="green">
                        Début : {new Date(cohort.start_date).toLocaleDateString('fr-FR')}
                      </Badge>
                    )}
                    {cohort.program && (
                      <Badge variant="blue">{cohort.program}</Badge>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0 flex flex-col items-end gap-2">
                  <Link href={`/dashboard/project-owner/cohorts/${cohort.id}`}>
                    <Button variant="outline" size="sm">
                      Détails <ChevronRight size={11} />
                    </Button>
                  </Link>
                  {projects && projects.length > 0 ? (
                    <div className="flex gap-1 items-center">
                      <select
                        className="text-[11px] px-[8px] py-[4px] border border-border rounded-lg bg-surface text-ink outline-none max-w-[130px]"
                        value={projectId}
                        onChange={(e) => setSelectedProject((prev) => ({ ...prev, [cohort.id]: e.target.value }))}
                      >
                        <option value="">Choisir un projet</option>
                        {projects.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                      <Button
                        size="sm"
                        variant="primary"
                        disabled={!projectId}
                        loading={applyingCohort === cohort.id}
                        onClick={() => handleApply(cohort.id)}
                      >
                        Postuler
                      </Button>
                    </div>
                  ) : (
                    <div className="text-[10px] text-ink3 text-right">
                      <p>Créez d'abord un projet</p>
                      <Link href="/dashboard/project-owner/projects">
                        <span className="text-moss underline">Mes projets</span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function MyCohorts() {
  const { data: myData, isLoading, error } = useMyCohorts()
  const acceptInvite = useAcceptInvitation()
  const rejectInvite = useRejectInvitation()
  const withdraw = useWithdrawParticipation()

  if (isLoading) return <LoadingSkeleton count={2} />
  if (error) return <div className="text-red text-[12px] p-4">Erreur lors du chargement</div>

  const participations = (myData || []) as CohortParticipation[]

  if (participations.length === 0) {
    return (
      <Card className="text-center py-14">
        <div className="w-14 h-14 rounded-full bg-moss-light text-moss flex items-center justify-center mx-auto mb-4">
          <FileText size={24} />
        </div>
        <p className="text-[15px] font-semibold text-ink mb-1">Aucune participation</p>
        <p className="text-[12px] text-ink3 mb-6">Vous n'avez pas encore candidaté à une cohorte.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-[10px]">
      {participations.map((p) => (
        <Card key={p.id} className="p-[16px_18px]">
          <div className="flex items-center gap-[14px]">
            <div className="w-[40px] h-[40px] rounded-[10px] bg-moss-light border border-border flex items-center justify-center flex-shrink-0">
              <FileText size={18} className="text-moss" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium text-ink truncate">
                {p.cohort?.name || 'Cohorte inconnue'}
              </div>
              <div className="text-[11px] text-ink3">
                {p.cohort?.incubator?.name && `${p.cohort.incubator.name} · `}
                {p.project?.name && `${p.project.name} · `}
                {PARTICIPATION_ORIGIN_LABELS[p.origin]} · {new Date(p.applied_at).toLocaleDateString('fr-FR')}
              </div>
            </div>
            <Badge variant={PARTICIPATION_STATUS_COLORS[p.status]?.includes('green') ? 'green' : PARTICIPATION_STATUS_COLORS[p.status]?.includes('yellow') ? 'amber' : PARTICIPATION_STATUS_COLORS[p.status]?.includes('red') ? 'red' : 'gray'}>
              {PARTICIPATION_STATUS_LABELS[p.status]}
            </Badge>
            {p.origin === 'INVITATION' && p.status === 'PENDING' && (
              <div className="flex gap-1">
                <Button size="sm" variant="primary" loading={acceptInvite.isPending} onClick={() => acceptInvite.mutate(p.id)}>
                  Accepter
                </Button>
                <Button size="sm" variant="ghost" loading={rejectInvite.isPending} onClick={() => rejectInvite.mutate(p.id)}>
                  Refuser
                </Button>
              </div>
            )}
            {(p.status === 'PENDING' || p.status === 'ACCEPTED') && (
              <Button
                size="sm"
                variant="ghost"
                className="!text-red"
                loading={withdraw.isPending}
                onClick={() => withdraw.mutate(p.id)}
              >
                Retirer
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}

function LoadingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="animate-pulse space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-20 bg-border rounded-[14px]" />
      ))}
    </div>
  )
}

export default function ProjectOwnerCohortsPage() {
  const [tab, setTab] = useState('available')

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <h1 className="font-syne text-[22px] font-extrabold text-ink mb-[2px]">Cohortes</h1>
      <p className="text-[12px] text-ink3 mb-6">Explorez les cohortes disponibles et suivez vos candidatures</p>

      <TabNav tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'available' && <AvailableCohorts />}
      {tab === 'mine' && <MyCohorts />}
    </div>
  )
}
