'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Users, Calendar, Search, ChevronRight } from 'lucide-react'
import { TabNav, Badge, Button, Card, Input, Select } from '@/components/shared/ui'
import { useAvailableCohorts, useMyCohorts, useApplyAsExpert, useAcceptExpertInvitation, useRejectExpertInvitation } from '@/hooks/useCohorts'
import {
  Cohort, CohortExpert,
  EXPERT_ROLE_LABELS, EXPERT_ROLE_COLORS,
  EXPERT_STATUS_LABELS, EXPERT_STATUS_COLORS,
} from '@/types/cohort'

const TABS = [
  { id: 'available', label: 'Cohortes disponibles' },
  { id: 'mine', label: 'Mes cohortes' },
]

function AvailableCohorts({ onRoleSelect }: { onRoleSelect: (cohortId: string, role: string) => void }) {
  const { data: cohorts, isLoading, error } = useAvailableCohorts()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')

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
        <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">Tous les rôles</option>
          <option value="JURY">Jury</option>
          <option value="COACH">Coach</option>
        </Select>
      </div>

      <div className="space-y-[10px]">
        {filtered.map((cohort) => (
          <CohortCard
            key={cohort.id}
            cohort={cohort}
            actions={
              <div className="flex gap-2">
                <Link href={`/dashboard/expert/cohorts/${cohort.id}`}>
                  <Button variant="outline" size="sm">
                    Détails <ChevronRight size={11} />
                  </Button>
                </Link>
                <ApplyButton cohortId={cohort.id} roleFilter={roleFilter} onRoleSelect={onRoleSelect} />
              </div>
            }
          />
        ))}
      </div>
    </div>
  )
}

function ApplyButton({ cohortId, roleFilter, onRoleSelect }: { cohortId: string; roleFilter: string; onRoleSelect: (cohortId: string, role: string) => void }) {
  const [showRoles, setShowRoles] = useState(false)
  const applyMutation = useApplyAsExpert()

  const roles = roleFilter ? [roleFilter] : ['JURY', 'COACH']

  if (showRoles) {
    return (
      <div className="flex gap-1">
        {roles.map((role) => (
          <Button
            key={role}
            size="sm"
            variant="primary"
            loading={applyMutation.isPending}
            onClick={async () => {
              await applyMutation.mutateAsync({ cohortId, role })
              setShowRoles(false)
            }}
          >
            {role === 'JURY' ? 'Jury' : 'Coach'}
          </Button>
        ))}
        <Button size="sm" variant="ghost" onClick={() => setShowRoles(false)}>Annuler</Button>
      </div>
    )
  }

  return (
    <Button variant="primary" size="sm" onClick={() => setShowRoles(true)}>
      Postuler
    </Button>
  )
}

function MyCohorts() {
  const { data: myData, isLoading, error } = useMyCohorts()
  const acceptInvite = useAcceptExpertInvitation()
  const rejectInvite = useRejectExpertInvitation()

  if (isLoading) return <LoadingSkeleton count={2} />
  if (error) return <div className="text-red text-[12px] p-4">Erreur lors du chargement</div>

  const assignments = (myData || []) as CohortExpert[]

  if (assignments.length === 0) {
    return (
      <Card className="text-center py-14">
        <div className="w-14 h-14 rounded-full bg-moss-light text-moss flex items-center justify-center mx-auto mb-4">
          <Users size={24} />
        </div>
        <p className="text-[15px] font-semibold text-ink mb-1">Aucune cohorte</p>
        <p className="text-[12px] text-ink3">Vous n'avez pas encore été affecté à une cohorte.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-[10px]">
      {assignments.map((a) => (
        <Card key={a.id} className="p-[16px_18px]">
          <div className="flex items-center gap-[14px]">
            <div className="w-[40px] h-[40px] rounded-[10px] bg-moss-light border border-border flex items-center justify-center flex-shrink-0">
              <Users size={18} className="text-moss" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium text-ink truncate">
                {a.cohort?.name || 'Cohorte inconnue'}
              </div>
              <div className="text-[11px] text-ink3">
                {a.cohort?.incubator?.name && `${a.cohort.incubator.name} · `}
                {a.status === 'PENDING' ? 'Invitation reçue le ' : 'Affecté le '}
                {new Date(a.assigned_at).toLocaleDateString('fr-FR')}
              </div>
            </div>
            <Badge variant={EXPERT_ROLE_COLORS[a.role]?.includes('purple') ? 'blue' : 'blue'}>
              {EXPERT_ROLE_LABELS[a.role]}
            </Badge>
            <Badge variant={a.status === 'ACTIVE' ? 'green' : a.status === 'PENDING' ? 'amber' : 'gray'}>
              {EXPERT_STATUS_LABELS[a.status]}
            </Badge>
            {a.status === 'PENDING' && (
              <div className="flex gap-1">
                <Button size="sm" variant="primary" loading={acceptInvite.isPending} onClick={() => acceptInvite.mutate(a.id)}>
                  Accepter
                </Button>
                <Button size="sm" variant="ghost" loading={rejectInvite.isPending} onClick={() => rejectInvite.mutate(a.id)}>
                  Refuser
                </Button>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}

function CohortCard({ cohort, actions }: { cohort: Cohort; actions?: React.ReactNode }) {
  const remaining = cohort.capacity ? cohort.capacity - cohort.current_participants : undefined

  return (
    <Card className="p-[16px_18px]">
      <div className="flex items-start gap-[14px]">
        <div className="w-[46px] h-[46px] rounded-[12px] bg-moss-light border border-border flex items-center justify-center flex-shrink-0 mt-1">
          <Users size={22} className="text-moss" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-syne text-[15px] font-bold text-ink mb-[2px] truncate">{cohort.name}</h3>
          <p className="text-[11px] text-ink3 mb-1">
            {cohort.incubator?.name || 'Incubateur inconnu'}
            {cohort.capacity && ` · ${remaining !== undefined ? remaining : 0}/${cohort.capacity} places`}
          </p>
          {cohort.description && (
            <p className="text-[12px] text-ink2 mb-[6px] line-clamp-2">{cohort.description}</p>
          )}
          <div className="flex gap-[5px] flex-wrap">
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
          </div>
        </div>
        {actions && <div className="flex-shrink-0">{actions}</div>}
      </div>
    </Card>
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

export default function ExpertCohortsPage() {
  const [tab, setTab] = useState('available')

  const handleApplyExpert = async (cohortId: string, role: string) => {
    setTab('mine')
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <h1 className="font-syne text-[22px] font-extrabold text-ink mb-[2px]">Cohortes</h1>
      <p className="text-[12px] text-ink3 mb-6">Explorez les cohortes disponibles et suivez vos participations</p>

      <TabNav tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'available' && <AvailableCohorts onRoleSelect={handleApplyExpert} />}
      {tab === 'mine' && <MyCohorts />}
    </div>
  )
}
