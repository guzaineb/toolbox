'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Send,
  User,
} from 'lucide-react'
import {
  FUNDING_PHASE_LABELS,
  projectService,
  type ProjectDirectoryEntry,
  type ProjectDirectoryPage,
} from '@/services/project.service'
import { cohortService } from '@/services/cohort.service'
import {
  Badge,
  Button,
  Card,
  ErrorAlert,
  Field,
  Input,
  LoadingState,
  SuccessAlert,
} from '@/components/shared/ui'
import { InviteToCohortModal } from '@/components/incubator/InviteToCohortModal'
import { selectableCohorts } from '@/lib/recommendation-context'
import { formatDate, getErrorMessage } from '@/lib/utils'
import {
  PARTICIPATION_STATUS_LABELS,
  type Cohort,
  type ParticipationStatus,
} from '@/types/cohort'

const PAGE_SIZE = 9

function participationVariant(
  status: ParticipationStatus,
): 'green' | 'amber' | 'red' | 'gray' {
  if (status === 'ACCEPTED') return 'green'
  if (status === 'PENDING') return 'amber'
  if (status === 'REJECTED') return 'red'
  return 'gray'
}

/** Résumé de contexte renvoyé par les endpoints d'annuaire. */
function projectDescription(project: ProjectDirectoryEntry): string {
  return (
    project.description?.trim() ||
    project.context_summary?.summary_text?.trim() ||
    ''
  )
}

/**
 * Espace incubateur — annuaire des projets disponibles sur la plateforme.
 * Chaque projet est présenté avec sa description et ses informations clés
 * (porteur, maturité, cohortes), puis peut être invité dans une cohorte.
 */
export default function IncubatorProjectsPage() {
  const { incubatorId } = useParams<{ incubatorId: string }>()

  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  const [data, setData] = useState<ProjectDirectoryPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [cohorts, setCohorts] = useState<Cohort[]>([])
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const [inviteTarget, setInviteTarget] = useState<ProjectDirectoryEntry | null>(
    null,
  )
  const [message, setMessage] = useState<string | null>(null)
  const [sentIds, setSentIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!incubatorId) return
    cohortService
      .getIncubatorCohorts(incubatorId)
      .then((result) => setCohorts(selectableCohorts(result ?? [])))
      .catch(() => setCohorts([]))
  }, [incubatorId])

  useEffect(() => {
    let cancelled = false
    const timer = setTimeout(async () => {
      setLoading(true)
      setError(null)
      try {
        const result = await projectService.listDirectory({
          q: query,
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
  }, [query, page])

  const toggleExpanded = (projectId: string) => {
    setExpanded((current) => {
      const next = new Set(current)
      if (next.has(projectId)) next.delete(projectId)
      else next.add(projectId)
      return next
    })
  }

  const handleInvite = useCallback(
    async (cohortId: string) => {
      const project = inviteTarget
      if (!project) throw new Error('Projet introuvable.')

      await cohortService.inviteToCohort(cohortId, project.id)
      setMessage(`Invitation envoyée au projet « ${project.name} ».`)
      setSentIds((current) => new Set(current).add(project.id))
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
        <span className="text-ink font-medium">Projets</span>
      </div>

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="font-syne text-[22px] font-extrabold text-ink mb-1">
            Annuaire des projets
          </h1>
          <p className="text-[12px] text-ink-2 max-w-[560px] leading-relaxed">
            Explorez les projets disponibles sur la plateforme, évaluez leur
            pertinence à partir de leur description et de leur maturité, puis
            invitez ceux qui vous intéressent à rejoindre une cohorte.
          </p>
        </div>
        <Badge variant="blue" className="text-[11px] px-[10px] py-[4px]">
          <FolderOpen size={12} />
          {total} projet{total > 1 ? 's' : ''}
        </Badge>
      </div>

      {message && <SuccessAlert message={message} />}

      {/* Filtres */}
      <Card className="p-4">
        <Field label="Rechercher">
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(1)
            }}
            placeholder="Nom du projet, description…"
          />
        </Field>
      </Card>

      {/* Liste */}
      {loading ? (
        <LoadingState label="Chargement des projets…" />
      ) : error ? (
        <ErrorAlert message={error} />
      ) : !data || data.items.length === 0 ? (
        <Card className="text-center py-12">
          <FolderOpen size={32} className="mx-auto text-ink-3 mb-3" />
          <p className="text-[13px] font-medium text-ink">
            Aucun projet ne correspond à votre recherche.
          </p>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {data.items.map((project) => {
              const description = projectDescription(project)
              const isExpanded = expanded.has(project.id)
              const alreadyInvited = sentIds.has(project.id)

              return (
                <Card key={project.id} className="p-[16px_18px]">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-[14px] font-semibold text-ink">
                          {project.name}
                        </h2>
                        {project.is_gbm_reviewed && (
                          <Badge variant="green">GBM validé</Badge>
                        )}
                        {project.business_plan_status === 'FINAL' && (
                          <Badge variant="violet">Business plan final</Badge>
                        )}
                        {project.funding_assessment?.phase_maturite && (
                          <Badge variant="blue">
                            {
                              FUNDING_PHASE_LABELS[
                                project.funding_assessment.phase_maturite
                              ]
                            }
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-1 text-[11px] text-ink-3 flex-wrap">
                        <span className="flex items-center gap-[4px]">
                          <User size={11} />
                          {project.ownerName}
                        </span>
                        <span>Créé le {formatDate(project.created_at)}</span>
                        {project.funding_assessment?.score_maturite != null && (
                          <span>
                            Score de maturité :{' '}
                            {project.funding_assessment.score_maturite}/100
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      {description ? (
                        <>
                          <p
                            className={`text-[12px] text-ink-2 mt-2 leading-relaxed whitespace-pre-line ${
                              isExpanded ? '' : 'line-clamp-4'
                            }`}
                          >
                            {description}
                          </p>
                          {description.length > 260 && (
                            <button
                              type="button"
                              onClick={() => toggleExpanded(project.id)}
                              className="text-[11px] text-moss font-semibold mt-1 hover:underline"
                            >
                              {isExpanded ? 'Voir moins' : 'Voir plus'}
                            </button>
                          )}
                        </>
                      ) : (
                        <p className="text-[12px] text-ink-3 mt-2 italic">
                          Aucune description renseignée.
                        </p>
                      )}

                      {/* Mission & vision */}
                      {(project.mission_vision?.mission ||
                        project.mission_vision?.vision) && (
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {project.mission_vision?.mission && (
                            <div className="bg-moss-light/60 rounded-[10px] p-[10px_12px]">
                              <div className="text-[9px] font-bold text-ink-3 uppercase tracking-[0.1em] mb-[3px]">
                                Mission
                              </div>
                              <p className="text-[11px] text-ink-2 leading-relaxed whitespace-pre-line line-clamp-3">
                                {project.mission_vision.mission}
                              </p>
                            </div>
                          )}
                          {project.mission_vision?.vision && (
                            <div className="bg-moss-light/60 rounded-[10px] p-[10px_12px]">
                              <div className="text-[9px] font-bold text-ink-3 uppercase tracking-[0.1em] mb-[3px]">
                                Vision
                              </div>
                              <p className="text-[11px] text-ink-2 leading-relaxed whitespace-pre-line line-clamp-3">
                                {project.mission_vision.vision}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Cohortes */}
                      {project.cohort_participations.length > 0 && (
                        <div className="flex items-center gap-[5px] mt-3 flex-wrap">
                          <span className="text-[10px] font-bold text-ink-3 uppercase tracking-[0.08em]">
                            Cohortes
                          </span>
                          {project.cohort_participations.map(
                            (participation) => (
                              <Badge
                                key={participation.id}
                                variant={participationVariant(
                                  participation.status,
                                )}
                              >
                                {participation.cohort?.name ?? 'Cohorte'}
                                {' · '}
                                {
                                  PARTICIPATION_STATUS_LABELS[
                                    participation.status
                                  ]
                                }
                              </Badge>
                            ),
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action */}
                    <div className="flex sm:flex-col items-stretch gap-2 flex-shrink-0">
                      {alreadyInvited ? (
                        <Badge variant="green" className="justify-center py-[6px]">
                          Invitation envoyée
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => {
                            setMessage(null)
                            setInviteTarget(project)
                          }}
                        >
                          <Send size={12} /> Inviter dans une cohorte
                        </Button>
                      )}
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
                Page {data.page} sur {totalPages} — {total} projet
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
          title="Inviter un projet"
          subject={inviteTarget.name}
          cohorts={cohorts}
          submitLabel="Envoyer l’invitation"
          onClose={() => setInviteTarget(null)}
          onConfirm={handleInvite}
        />
      )}
    </div>
  )
}
