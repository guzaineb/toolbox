'use client'

import Link from 'next/link'
import { ChevronRight, FileText, Flag, ListTodo, PlayCircle, Sparkles, Target } from 'lucide-react'
import { Badge, Button, Card, CardHeader, Field, Textarea } from '@/components/shared/ui'
import { COACHING_SESSION_STATUS_COLORS, COACHING_SESSION_STATUS_LABELS } from '@/types/coaching'
import type { CoachingSession } from '@/types/coaching'
import type { GbmProgress } from '@/types/gbm'
import { formatDateTime } from '@/lib/utils'
import type { SessionDraft, SetSessionField } from './session-types'

/**
 * Onglet CLÔTURE : remisage du résumé de fin de session, objectifs pour la
 * prochaine session et prochaine étape.
 */
export function ClosureTab({
  basePath, canManage, nextSession, progress, draft, setField, summaryLoading, onGenerateSummary,
}: {
  basePath: string
  canManage: boolean
  nextSession: CoachingSession | null
  progress: GbmProgress | null
  draft: SessionDraft
  setField: SetSessionField
  summaryLoading: boolean
  onGenerateSummary: () => void
}) {
  return (
    <div className="grid lg:grid-cols-2 gap-5 items-start">
      <div className="space-y-5">
        <Card>
          <CardHeader icon={<FileText size={13} />} title="Résumé de fin de session">
            <div className="flex gap-2">
              {canManage && (
                <Button variant="outline" size="sm" onClick={onGenerateSummary} disabled={summaryLoading}>
                  <Sparkles size={12} className={summaryLoading ? 'animate-pulse' : ''} />
                  {summaryLoading ? 'Génération…' : 'Proposer un résumé (IA)'}
                </Button>
              )}
            </div>
          </CardHeader>
          <div className="p-[18px] space-y-3">
            <div className="border border-amber/40 bg-amber/[.06] rounded-[10px] p-3 text-[11px] text-ink2 flex items-start gap-2">
              <Sparkles size={13} className="text-amber shrink-0 mt-[1px]" />
              Ce résumé est une proposition générée par l&apos;IA. Le coach doit le vérifier, le modifier si
              besoin, puis sauvegarder : seul le texte validé par le coach fait foi.
            </div>
            <Field label="Résumé">
              <Textarea
                value={draft.summary}
                onChange={(e) => setField('summary', e.target.value)}
                rows={6}
                disabled={!canManage}
              />
            </Field>
          </div>
        </Card>

        <Card>
          <CardHeader icon={<ListTodo size={13} />} title="Objectifs pour la prochaine session" />
          <div className="p-[18px] space-y-2">
            <Textarea
              value={draft.nextObjectives}
              onChange={(e) => setField('nextObjectives', e.target.value)}
              rows={4}
              disabled={!canManage}
              placeholder={'Un objectif par ligne\nEx. Vérifier les résultats des interviews\nValider les nouveaux segments clients'}
            />
          </div>
        </Card>
      </div>

      <NextStepCard basePath={basePath} canManage={canManage} nextSession={nextSession} progress={progress} />
    </div>
  )
}

function NextStepCard({
  basePath, canManage, nextSession, progress,
}: {
  basePath: string
  canManage: boolean
  nextSession: CoachingSession | null
  progress: GbmProgress | null
}) {
  return (
    <div className="space-y-5">
      <Card>
        <CardHeader icon={<PlayCircle size={13} />} title="Prochaine étape" />
        <div className="p-[18px] space-y-3">
          {nextSession ? (
            <>
              <div className="border border-border rounded-[10px] p-3 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[12px] font-bold text-ink">
                    Prochaine session : {formatDateTime(nextSession.scheduled_at, { dateStyle: 'long', timeStyle: 'short' })}
                  </span>
                  <Badge variant={COACHING_SESSION_STATUS_COLORS[nextSession.status]}>
                    {COACHING_SESSION_STATUS_LABELS[nextSession.status]}
                  </Badge>
                </div>
                {nextSession.title && <p className="text-[12px] text-ink2">{nextSession.title}</p>}
                {nextSession.objective && (
                  <p className="text-[12px] text-ink3 flex items-start gap-1.5">
                    <Target size={12} className="text-moss mt-[2px] shrink-0" />
                    {nextSession.objective}
                  </p>
                )}
                <Link
                  href={`${basePath}/sessions/${nextSession.id}`}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-moss hover:underline"
                >
                  Ouvrir la session <ChevronRight size={11} />
                </Link>
              </div>
            </>
          ) : (
            <p className="text-[12px] text-ink3">
              Aucune session suivante planifiée. Planifiez la prochaine séance depuis le suivi du projet
              pour entretenir la boucle de coaching.
            </p>
          )}
          {!nextSession && canManage && (
            <Link href={basePath} className="inline-flex">
              <Button variant="outline" size="sm">
                Planifier une session <ChevronRight size={12} />
              </Button>
            </Link>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader icon={<Flag size={13} />} title="Progression globale du projet" />
        <div className="p-[18px] space-y-2">
          <p className="text-[11px] text-ink3">
            Indicateur global (parcours GBM) — partagé avec toutes les sessions du projet.
          </p>
          <div className="flex items-baseline gap-2">
            <span className="font-syne text-[24px] font-extrabold text-ink">{progress?.percentage ?? 0}%</span>
            <span className="text-[11px] text-ink3">du parcours GBM complété</span>
          </div>
          {progress?.phases?.map((ph) => (
            <div key={ph.phase} className="flex items-center gap-2 text-[11px] text-ink2">
              <span className="w-[70px] shrink-0">Phase {ph.phase}</span>
              <div className="flex-1 h-[6px] bg-border rounded-full overflow-hidden">
                <div className="h-full bg-moss rounded-full" style={{ width: `${Math.round((ph.completed / Math.max(ph.total, 1)) * 100)}%` }} />
              </div>
              <span className="w-[36px] text-right text-ink3">{ph.completed}/{ph.total}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}