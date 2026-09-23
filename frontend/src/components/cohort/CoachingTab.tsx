'use client'

import { useEffect, useState, useCallback } from 'react'
import { HeartHandshake, ChevronDown, ChevronUp, Plus } from 'lucide-react'
import { Badge, Button, Card, CardHeader, LoadingState } from '@/components/shared/ui'
import { coachingService } from '@/services/coaching.service'
import { SessionsPanel, ActionsPanel, RecommendationsPanel, AddActionModal } from '@/components/coaching/CoachingPanels'
import { CoachingOverview } from '@/types/coaching'

export function CoachingTab({
  projects,
}: {
  projects: Array<{ id: string; name: string }>
}) {
  const [overviews, setOverviews] = useState<Record<string, CoachingOverview>>({})
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [quickProject, setQuickProject] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const results = await Promise.all(
      projects.map((p) =>
        coachingService
          .getProjectCoachingOverview(p.id)
          .then((o) => ({ id: p.id, o }))
          .catch(() => null),
      ),
    )
    const map: Record<string, CoachingOverview> = {}
    for (const r of results) {
      if (r) map[r.id] = r.o
    }
    setOverviews(map)
    setLoading(false)
  }, [projects])

  useEffect(() => { load() }, [load])

  if (loading) {
    return <LoadingState label="Chargement du suivi coaching…" />
  }

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
      {quickProject && (
        <AddActionModal projectId={quickProject} onClose={() => setQuickProject(null)} onSuccess={load} />
      )}
      {projects.map((p) => {
        const o = overviews[p.id]
        const coaches = o?.assignments.filter((a) => a.role === 'COACH') ?? []
        const isOpen = expanded === p.id
        return (
          <Card key={p.id} className="overflow-hidden">
            <div
              className="flex items-center gap-3 p-[14px_16px] cursor-pointer hover:bg-surface-2 transition-colors"
              onClick={() => setExpanded(isOpen ? null : p.id)}
            >
              <div className="w-[36px] h-[36px] rounded-[10px] bg-moss-light border border-border flex items-center justify-center flex-shrink-0">
                <HeartHandshake size={16} className="text-moss" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-ink truncate">{p.name}</div>
                <div className="text-[11px] text-ink3">
                  {coaches.length > 0
                    ? `Coach : ${coaches.map((c) => {
                        const prof = c.expertUser?.profile
                        return prof ? `${prof.first_name} ${prof.last_name}` : c.expertUser?.email
                      }).join(', ')}`
                    : 'Aucun coach affecté'}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {o && (
                  <>
                    <Badge variant="blue">{o.counts.sessions} sessions</Badge>
                    <Badge variant={o.counts.actions_pending > 0 ? 'amber' : 'green'}>
                      {o.counts.actions_pending} action(s) en cours
                    </Badge>
                  </>
                )}
                {isOpen ? <ChevronUp size={16} className="text-ink3" /> : <ChevronDown size={16} className="text-ink3" />}
              </div>
            </div>
            {isOpen && o && (
              <div className="border-t border-border p-[18px] space-y-5">
                <div className="flex justify-end">
                  <Button size="sm" variant="outline" onClick={() => setQuickProject(p.id)}>
                    <Plus size={12} /> Nouvelle action
                  </Button>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-ink3 uppercase tracking-[0.1em] mb-2">Sessions</div>
                  <SessionsPanel projectId={p.id} sessions={o.sessions} canManage onRefresh={load} />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-ink3 uppercase tracking-[0.1em] mb-2">Actions</div>
                  <ActionsPanel projectId={p.id} actions={o.actions} canManage onRefresh={load} />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-ink3 uppercase tracking-[0.1em] mb-2">Recommandations</div>
                  <RecommendationsPanel projectId={p.id} recommendations={o.recommendations} canManage onRefresh={load} />
                </div>
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}
