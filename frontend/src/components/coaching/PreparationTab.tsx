'use client'

import Link from 'next/link'
import {
  AlertTriangle, CheckCircle2, CircleDot, FileText, History, Lightbulb,
  MessageSquareQuote, Sparkles,
} from 'lucide-react'
import { Badge, Button, Card, CardHeader } from '@/components/shared/ui'
import { MaturityCard } from '@/components/coaching/MaturityCard'
import { DeliverablesPanel } from '@/components/coaching/DeliverablesPanel'
import {
  COACHING_SESSION_STATUS_COLORS, COACHING_SESSION_STATUS_LABELS, PRIORITY_LABELS,
} from '@/types/coaching'
import type { CoachingSession, SessionBlocker } from '@/types/coaching'
import type { GbmProgress } from '@/types/gbm'
import type { CoachingBriefPayload } from '@/types/ai-analysis'
import { formatDate } from '@/lib/utils'
import type { PreviousSessionStats } from './session-types'

/**
 * Onglet PRÉPARATION : indicateur global, brief IA, bilan depuis la dernière
 * session, livrables à examiner et historique du coaching.
 */
export function PreparationTab({
  projectId, sessionId, basePath, canManage, isClosed,
  allSessions, previousSession, previousStats, carriedBlockers, progress,
  brief, briefLoading, onGenerateBrief, onAcceptObjective, onGoToRunning,
}: {
  projectId: string
  sessionId: string
  basePath: string
  canManage: boolean
  isClosed: boolean
  allSessions: CoachingSession[]
  previousSession: CoachingSession | null
  previousStats: PreviousSessionStats
  carriedBlockers: SessionBlocker[]
  progress: GbmProgress | null
  brief: CoachingBriefPayload | null
  briefLoading: boolean
  onGenerateBrief: () => void
  onAcceptObjective: () => void
  onGoToRunning: () => void
}) {
  return (
    <div className="space-y-5">
      {/* Indicateur global */}
      <div>
        <p className="text-[11px] text-ink3 mb-1.5 flex items-center gap-1">
          <CircleDot size={11} /> Indicateur global du projet (toutes sources) — ne mesure pas cette session
        </p>
        <MaturityCard projectId={projectId} />
      </div>

      {/* Brief IA */}
      <Card>
        <CardHeader icon={<Sparkles size={13} />} title="Brief IA — préparation de session">
          {canManage && (
            <Button variant="outline" size="sm" onClick={onGenerateBrief} disabled={briefLoading}>
              <Sparkles size={12} className={briefLoading ? 'animate-pulse' : ''} />
              {briefLoading ? 'Génération…' : brief ? 'Régénérer' : 'Générer le brief'}
            </Button>
          )}
        </CardHeader>
        <div className="p-[18px] space-y-4">
          {!brief && !briefLoading && (
            <p className="text-[12px] text-ink3">
              Le brief IA synthétise le contexte projet (évaluations, plan d&apos;amélioration, actions,
              sessions précédentes) pour préparer votre séance. Simple proposition : vous choisissez
              ce que vous retenez — l&apos;IA ne décide rien à votre place.
            </p>
          )}
          {brief && (
            <>
              <div className="border border-border rounded-[10px] p-3 space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-ink3">Objectif proposé</div>
                <p className="text-[13px] text-ink">{brief.objective}</p>
                {canManage && !isClosed && (
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="primary" onClick={onAcceptObjective}>
                      <CheckCircle2 size={12} /> Accepter comme objectif
                    </Button>
                    <Button size="sm" variant="outline" onClick={onGoToRunning}>
                      Modifier moi-même
                    </Button>
                  </div>
                )}
              </div>
              {brief.previousProgress.length > 0 && (
                <BriefList title="Progrès constatés" items={brief.previousProgress} tone="green" />
              )}
              {brief.priorities.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-ink3 mb-2">Priorités suggérées</div>
                  <div className="space-y-2">
                    {brief.priorities.map((p) => (
                      <div key={p.title} className="flex items-start gap-2 border border-border rounded-[10px] p-3">
                        <Badge variant={p.priority === 'HIGH' ? 'red' : p.priority === 'MEDIUM' ? 'blue' : 'gray'}>
                          {PRIORITY_LABELS[p.priority as keyof typeof PRIORITY_LABELS] ?? p.priority}
                        </Badge>
                        <div className="flex-1">
                          <div className="text-[12px] font-semibold text-ink">{p.title}</div>
                          {p.detail && <div className="text-[11px] text-ink3 mt-0.5">{p.detail}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {brief.suggestedQuestions.length > 0 && (
                <BriefList title="Questions à poser" items={brief.suggestedQuestions} tone="blue" />
              )}
              {brief.pointsToDiscuss.length > 0 && (
                <BriefList title="Points à aborder" items={brief.pointsToDiscuss} tone="amber" />
              )}
            </>
          )}
        </div>
      </Card>

      {/* Depuis la dernière session */}
      <Card>
        <CardHeader icon={<History size={13} />} title="Depuis la dernière session" />
        <div className="p-[18px] space-y-4">
          {!previousSession && (
            <p className="text-[12px] text-ink3">C&apos;est la première session de coaching de ce projet.</p>
          )}
          {previousSession && (
            <>
              <div className="flex items-center gap-2 flex-wrap text-[12px] text-ink2">
                <span>Session précédente :</span>
                <Link
                  href={`${basePath}/sessions/${previousSession.id}`}
                  className="font-semibold text-moss hover:underline"
                >
                  {previousSession.title || formatDate(previousSession.scheduled_at, { dateStyle: 'medium' })}
                </Link>
                <span className="text-ink3">({formatDate(previousSession.scheduled_at, { dateStyle: 'medium' })})</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatMini num={`${progress?.percentage ?? 0}%`} label="Parcours GBM" />
                <StatMini num={previousStats.completed} label={`Actions terminées (${previousStats.total})`} tone="green" />
                <StatMini num={previousStats.inFlight + previousStats.submitted} label="En cours / à valider" tone="amber" />
                <StatMini num={previousStats.overdue} label="En retard" tone={previousStats.overdue > 0 ? 'red' : undefined} />
              </div>
              {carriedBlockers.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-ink3 flex items-center gap-1.5">
                    <AlertTriangle size={12} className="text-amber" /> Blocages non résolus reportés
                  </div>
                  {carriedBlockers.map((b) => (
                    <div key={b.id} className="flex items-start gap-2 text-[12px] text-ink2">
                      <AlertTriangle size={12} className="text-amber mt-[2px] shrink-0" />
                      <span>{b.title}{b.detail ? ` — ${b.detail}` : ''}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </Card>

      {/* Livrables à examiner */}
      <Card>
        <CardHeader icon={<FileText size={13} />} title="Livrables à examiner" />
        <DeliverablesPanel projectId={projectId} />
      </Card>

      {/* Historique du coaching */}
      <Card>
        <CardHeader icon={<History size={13} />} title={`Historique du coaching (${allSessions.length})`} />
        <div className="p-[18px]">
          {allSessions.length === 0 && (
            <p className="text-[12px] text-ink3">Aucune autre session pour ce projet.</p>
          )}
          <ol className="space-y-0">
            {[...allSessions]
              .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime())
              .map((s, idx, arr) => (
                <li key={s.id} className="relative flex gap-3 pb-4 last:pb-0">
                  {idx < arr.length - 1 && (
                    <span className="absolute left-[7px] top-[20px] bottom-0 w-px bg-border" aria-hidden />
                  )}
                  <span
                    className={`mt-[5px] w-[15px] h-[15px] rounded-full border-2 shrink-0 ${
                      s.id === sessionId
                        ? 'bg-moss border-moss'
                        : s.status === 'COMPLETED'
                          ? 'bg-moss-light border-moss'
                          : 'bg-surface border-border'
                    }`}
                    aria-hidden
                  />
                  <Link
                    href={`${basePath}/sessions/${s.id}`}
                    className="flex items-center gap-2 flex-wrap group"
                  >
                    <span className={`text-[12px] group-hover:text-moss transition-colors ${s.id === sessionId ? 'font-bold text-ink' : 'text-ink2'}`}>
                      {s.title || 'Session'} — {formatDate(s.scheduled_at, { dateStyle: 'medium' })}
                    </span>
                    <Badge variant={COACHING_SESSION_STATUS_COLORS[s.status]}>
                      {s.id === sessionId ? 'Cette session' : COACHING_SESSION_STATUS_LABELS[s.status]}
                    </Badge>
                  </Link>
                </li>
              ))}
          </ol>
        </div>
      </Card>
    </div>
  )
}

function StatMini({ num, label, tone }: { num: string | number; label: string; tone?: 'green' | 'amber' | 'red' }) {
  const color = tone === 'green' ? 'text-moss' : tone === 'amber' ? 'text-amber' : tone === 'red' ? 'text-red-600' : 'text-ink'
  return (
    <div className="border border-border rounded-[10px] p-2.5">
      <div className={`font-syne text-[16px] font-extrabold ${color}`}>{num}</div>
      <div className="text-[10px] text-ink3 leading-tight">{label}</div>
    </div>
  )
}

function BriefList({ title, items, tone }: { title: string; items: string[]; tone: 'green' | 'amber' | 'blue' }) {
  const dot = tone === 'green' ? 'text-moss' : tone === 'amber' ? 'text-amber' : 'text-blue-600'
  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-ink3 mb-1.5 flex items-center gap-1.5">
        {tone === 'green' ? <CheckCircle2 size={12} /> : tone === 'amber' ? <MessageSquareQuote size={12} /> : <Lightbulb size={12} />}
        {title}
      </div>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.slice(0, 40)} className="text-[12px] text-ink2 flex gap-2">
            <span className={dot}>•</span>{item}
          </li>
        ))}
      </ul>
    </div>
  )
}