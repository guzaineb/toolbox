'use client'

import { useState } from 'react'
import { HeartHandshake, ChevronDown, ChevronUp, Plus } from 'lucide-react'
import { Badge, Button, Card, ErrorAlert, LoadingState } from '@/components/shared/ui'
import { SessionsPanel, ActionsPanel, RecommendationsPanel, AddActionModal } from '@/components/coaching/CoachingPanels'
import { useProjectCoachingOverview } from '@/hooks/useCoaching'
import { apiError } from '@/lib/utils'

export function CoachingTab({
  projects,
}: {
  projects: Array<{ id: string; name: string }>
}) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [quickProject, setQuickProject] = useState<string | null>(null)

  if (projects.length === 0) {
    return (
      <Card className="text-center py-12">
        <HeartHandshake size={30} className="mx-auto text-ink3 mb-3" />
        <p className="text-[13px] text-ink3">Aucun projet accepté dans cette cohorte pour le suivi coaching.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {quickProject && <AddActionModal projectId={quickProject} onClose={() => setQuickProject(null)} />}
      {projects.map((p) => (
        <ProjectCoachingCard
          key={p.id}
          project={p}
          isOpen={expanded === p.id}
          onToggle={() => setExpanded(expanded === p.id ? null : p.id)}
          onQuickAction={setQuickProject}
        />
      ))}
    </div>
  )
}

function ProjectCoachingCard({
  project, isOpen, onToggle, onQuickAction,
}: {
  project: { id: string; name: string }
  isOpen: boolean
  onToggle: () => void
  onQuickAction: (id: string) => void
}) {
  const { data: overview, isLoading, error } = useProjectCoachingOverview(project.id)
  const coaches = overview?.assignments.filter((a) => a.role === 'COACH') ?? []

  if (!overview && isLoading) {
    return (
      <Card className="overflow-hidden">
        <div className="p-[18px]"><LoadingState label="Chargement du suivi coaching…" /></div>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <div
        className="flex items-center gap-3 p-[14px_16px] cursor-pointer hover:bg-surface-2 transition-colors"
        onClick={onToggle}
      >
        <div className="w-[36px] h-[36px] rounded-[10px] bg-moss-light border border-border flex items-center justify-center flex-shrink-0">
          <HeartHandshake size={16} className="text-moss" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold text-ink truncate">{project.name}</div>
          <div className="text-[11px] text-ink3">
            {error
              ? 'Chargement indisponible'
              : coaches.length > 0
                ? `Coach : ${coaches.map((c) => {
                    const prof = c.expertUser?.profile
                    return prof ? `${prof.first_name} ${prof.last_name}` : c.expertUser?.email
                  }).join(', ')}`
                : 'Aucun coach affecté'}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {overview && (
            <>
              <Badge variant="blue">{overview.counts.sessions} sessions</Badge>
              <Badge variant={overview.counts.actions_pending > 0 ? 'amber' : 'green'}>
                {overview.counts.actions_pending} action(s) en cours
              </Badge>
            </>
          )}
          {isOpen ? <ChevronUp size={16} className="text-ink3" /> : <ChevronDown size={16} className="text-ink3" />}
        </div>
      </div>
      {isOpen && (
        <div className="border-t border-border p-[18px] space-y-5">
          {error && <ErrorAlert message={apiError(error, 'Erreur de chargement du suivi coaching')} />}
          {overview ? (
            <>
              <div className="flex justify-end">
                <Button size="sm" variant="outline" onClick={() => onQuickAction(project.id)}>
                  <Plus size={12} /> Nouvelle action
                </Button>
              </div>
              <div>
                <div className="text-[11px] font-bold text-ink3 uppercase tracking-[0.1em] mb-2">Sessions</div>
                <SessionsPanel projectId={project.id} sessions={overview.sessions} canManage />
              </div>
              <div>
                <div className="text-[11px] font-bold text-ink3 uppercase tracking-[0.1em] mb-2">Actions</div>
                <ActionsPanel projectId={project.id} actions={overview.actions} canManage />
              </div>
              <div>
                <div className="text-[11px] font-bold text-ink3 uppercase tracking-[0.1em] mb-2">Recommandations</div>
                <RecommendationsPanel projectId={project.id} recommendations={overview.recommendations} canManage />
              </div>
            </>
          ) : (
            <p className="text-[12px] text-ink3">Le suivi coaching de ce projet est momentanément indisponible.</p>
          )}
        </div>
      )}
    </Card>
  )
}