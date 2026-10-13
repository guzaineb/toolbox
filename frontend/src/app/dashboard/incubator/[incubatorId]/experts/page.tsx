'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ChevronLeft,
  ChevronRight,
  Building2,
  GraduationCap,
  UserPlus,
  Users,
} from 'lucide-react'
import { expertService } from '@/services/expert.service'
import { cohortService } from '@/services/cohort.service'
import {
  Badge,
  Button,
  Card,
  ErrorAlert,
  Field,
  Input,
  LoadingState,
  Select,
  SuccessAlert,
} from '@/components/shared/ui'
import { InviteToCohortModal } from '@/components/incubator/InviteToCohortModal'
import { selectableCohorts } from '@/lib/recommendation-context'
import { getErrorMessage } from '@/lib/utils'
import {
  AVAILABILITY_LABELS,
  LEVEL_LABELS,
  type AvailabilityStatus,
  type ExpertiseArea,
  type ExpertDirectoryPage,
  type ExpertProfile,
} from '@/types/expert'
import type { Cohort, CohortExpertRole } from '@/types/cohort'

const PAGE_SIZE = 12

function expertName(expert: ExpertProfile): string {
  const profile = expert.user?.profile
  const fullName = profile
    ? `${profile.first_name} ${profile.last_name}`.trim()
    : ''
  return fullName || expert.headline || expert.user?.email || 'Expert'
}

function availabilityVariant(
  status: AvailabilityStatus,
): 'green' | 'amber' | 'red' {
  if (status === 'AVAILABLE') return 'green'
  if (status === 'BUSY') return 'amber'
  return 'red'
}

/**
 * Espace incubateur — annuaire des experts inscrits sur la plateforme.
 * Permet de découvrir les profils, leurs domaines d'expertise, puis de les
 * inviter dans une des cohortes de l'incubateur.
 */
export default function IncubatorExpertsPage() {
  const { incubatorId } = useParams<{ incubatorId: string }>()

  const [query, setQuery] = useState('')
  const [areaId, setAreaId] = useState('')
  const [availability, setAvailability] = useState('')
  const [page, setPage] = useState(1)

  const [data, setData] = useState<ExpertDirectoryPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [areas, setAreas] = useState<ExpertiseArea[]>([])
  const [cohorts, setCohorts] = useState<Cohort[]>([])

  const [inviteTarget, setInviteTarget] = useState<ExpertProfile | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  // Filtres de référence (une seule requête, réutilisés par le formulaire)
  useEffect(() => {
    expertService
      .getAllExpertiseAreas()
      .then(setAreas)
      .catch(() => setAreas([]))
  }, [])

  useEffect(() => {
    if (!incubatorId) return
    cohortService
      .getIncubatorCohorts(incubatorId)
      .then((result) => setCohorts(selectableCohorts(result ?? [])))
      .catch(() => setCohorts([]))
  }, [incubatorId])

  // Annuaire (recherche différée pour ne pas appeler l'API à chaque frappe)
  useEffect(() => {
    let cancelled = false
    const timer = setTimeout(async () => {
      setLoading(true)
      setError(null)
      try {
        const result = await expertService.listExperts({
          q: query,
          expertiseAreaId: areaId || undefined,
          availability: (availability || undefined) as
            | AvailabilityStatus
            | undefined,
          page,
          limit: PAGE_SIZE,
        })
        if (!cancelled) setData(result)
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err))
          setData(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 300)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query, areaId, availability, page])

  const hasFilters = Boolean(query || areaId || availability)

  const resetFilters = () => {
    setQuery('')
    setAreaId('')
    setAvailability('')
    setPage(1)
  }

  const handleInvite = useCallback(
    async (cohortId: string, role: CohortExpertRole) => {
      const expert = inviteTarget
      const expertUserId = expert?.user?.id
      if (!expert || !expertUserId) {
        throw new Error('Profil expert incomplet : utilisateur introuvable.')
      }

      await cohortService.inviteExpert(cohortId, { expertUserId, role })
      setMessage(
        `Invitation envoyée à ${expertName(expert)} (${role === 'JURY' ? 'jury' : 'coach'}).`,
      )
    },
    [inviteTarget],
  )

  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-5">
      {/* Fil d'Ariane */}
      <div className="flex items-center gap-[5px] text-[11px] text-ink-3 mb-2">
        <Link
          href="/dashboard/incubator"
          className="hover:text-moss transition-colors"
        >
          Incubateurs
        </Link>
        <ChevronRight size={11} />
        <Link
          href={`/dashboard/incubator/${incubatorId}`}
          className="hover:text-moss transition-colors"
        >
          Détail
        </Link>
        <ChevronRight size={11} />
        <span className="text-ink font-medium">Experts</span>
      </div>

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="font-syne text-[22px] font-extrabold text-ink mb-1">
            Annuaire des experts
          </h1>
          <p className="text-[12px] text-ink-2 max-w-[560px] leading-relaxed">
            Découvrez les experts inscrits sur la plateforme, leurs domaines
            d’expertise et leur disponibilité, puis invitez-les à rejoindre une
            de vos cohortes (coach ou jury).
          </p>
        </div>
        <Badge variant="blue" className="text-[11px] px-[10px] py-[4px]">
          <Users size={12} />
          {total} expert{total > 1 ? 's' : ''}
        </Badge>
      </div>

      {message && <SuccessAlert message={message} />}

      {/* Filtres */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <Field label="Rechercher" className="md:col-span-2">
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setPage(1)
              }}
              placeholder="Nom, organisation, domaine d’expertise…"
            />
          </Field>
          <Field label="Domaine d’expertise">
            <Select
              value={areaId}
              onChange={(e) => {
                setAreaId(e.target.value)
                setPage(1)
              }}
            >
              <option value="">Tous les domaines</option>
              {areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                  {area.category ? ` (${area.category})` : ''}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Disponibilité">
            <Select
              value={availability}
              onChange={(e) => {
                setAvailability(e.target.value)
                setPage(1)
              }}
            >
              <option value="">Toutes</option>
              <option value="AVAILABLE">Disponible</option>
              <option value="BUSY">Occupé(e)</option>
              <option value="UNAVAILABLE">Indisponible</option>
            </Select>
          </Field>
        </div>
        {hasFilters && (
          <div className="mt-3">
            <Button size="sm" variant="ghost" onClick={resetFilters}>
              Réinitialiser les filtres
            </Button>
          </div>
        )}
      </Card>

      {/* Liste */}
      {loading ? (
        <LoadingState label="Chargement des experts…" />
      ) : error ? (
        <ErrorAlert message={error} />
      ) : !data || data.items.length === 0 ? (
        <Card className="text-center py-12">
          <Users size={32} className="mx-auto text-ink-3 mb-3" />
          <p className="text-[13px] font-medium text-ink">
            Aucun expert ne correspond à votre recherche.
          </p>
          {hasFilters && (
            <Button className="mt-4" variant="outline" onClick={resetFilters}>
              Réinitialiser les filtres
            </Button>
          )}
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.items.map((expert) => {
              const profile = expert.user?.profile
              const initials = profile
                ? `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`.toUpperCase()
                : 'EX'
              const connections = expert.expertiseConnections ?? []

              return (
                <Card key={expert.id} className="p-[16px_18px]">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-moss-light flex items-center justify-center text-[12px] font-bold text-moss flex-shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[13px] font-semibold text-ink truncate">
                          {expertName(expert)}
                        </span>
                        <Badge
                          variant={availabilityVariant(
                            expert.availability_status,
                          )}
                        >
                          {AVAILABILITY_LABELS[expert.availability_status]}
                        </Badge>
                      </div>
                      <p className="text-[12px] text-ink-2 mt-0.5">
                        {expert.headline}
                      </p>
                      <div className="mt-1 space-y-0.5 text-[11px] text-ink-3">
                        {expert.position && (
                          <div className="flex items-center gap-[5px]">
                            <GraduationCap size={11} />
                            <span className="truncate">{expert.position}</span>
                          </div>
                        )}
                        {expert.organization && (
                          <div className="flex items-center gap-[5px]">
                            <Building2 size={11} />
                            <span className="truncate">
                              {expert.organization}
                            </span>
                          </div>
                        )}
                        {!!expert.years_of_experience &&
                          expert.years_of_experience > 0 && (
                            <div>
                              {expert.years_of_experience} ans d’expérience
                            </div>
                          )}
                      </div>

                      {/* Domaines d'expertise */}
                      {connections.length > 0 ? (
                        <div className="flex flex-wrap gap-[5px] mt-2">
                          {connections.slice(0, 5).map((connection) => (
                            <span
                              key={connection.id ?? connection.expertiseArea.id}
                              className="text-[10px] px-[7px] py-[2px] rounded-full bg-moss-light text-moss font-semibold"
                            >
                              {connection.expertiseArea.name}
                              {connection.level
                                ? ` · ${LEVEL_LABELS[connection.level] ?? connection.level}`
                                : ''}
                            </span>
                          ))}
                          {connections.length > 5 && (
                            <span className="text-[10px] px-[7px] py-[2px] rounded-full bg-ink/[.07] text-ink-2 font-semibold">
                              +{connections.length - 5}
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-[11px] text-ink-3 mt-2 italic">
                          Aucun domaine d’expertise renseigné
                        </p>
                      )}

                      <div className="mt-3 flex justify-end">
                        <Button
                          size="sm"
                          variant="primary"
                          disabled={!expert.user?.id}
                          onClick={() => {
                            setMessage(null)
                            setInviteTarget(expert)
                          }}
                        >
                          <UserPlus size={12} /> Inviter dans une cohorte
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-ink-3">
                Page {data.page} sur {totalPages} — {total} expert
                {total > 1 ? 's' : ''}
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  <ChevronLeft size={12} /> Précédent
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={page >= totalPages}
                  onClick={() =>
                    setPage((current) => Math.min(totalPages, current + 1))
                  }
                >
                  Suivant <ChevronRight size={12} />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {inviteTarget && (
        <InviteToCohortModal
          title="Inviter un expert"
          subject={expertName(inviteTarget)}
          cohorts={cohorts}
          withExpertRole
          submitLabel="Envoyer l’invitation"
          onClose={() => setInviteTarget(null)}
          onConfirm={handleInvite}
        />
      )}
    </div>
  )
}
