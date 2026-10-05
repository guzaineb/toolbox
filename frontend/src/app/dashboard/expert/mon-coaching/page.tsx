'use client'

import Link from 'next/link'
import { HeartHandshake } from 'lucide-react'
import { ExpertCoachingDashboard } from '@/components/coaching/ExpertCoachingDashboard'
import { useMyCoachingActions, useMyCoachingEvidence, useMyCoachingSessions } from '@/hooks/useCoaching'

export default function ExpertMonCoachingPage() {
  const sessionsQuery = useMyCoachingSessions()
  const actionsQuery = useMyCoachingActions()
  const actions = actionsQuery.data ?? []
  const evidence = useMyCoachingEvidence(actions)

  const isLoading = sessionsQuery.isLoading || actionsQuery.isLoading
  const error = sessionsQuery.error ?? actionsQuery.error
  const onRetry = () => {
    void sessionsQuery.refetch()
    void actionsQuery.refetch()
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <nav className="flex items-center gap-1 text-[11px] text-ink3 flex-wrap">
        <Link href="/dashboard/expert/coachings" className="hover:text-moss transition-colors">
          Coachings
        </Link>
        <span>/</span>
        <span className="text-ink font-medium">Mon coaching</span>
      </nav>

      <div className="flex items-center gap-3">
        <div className="w-[36px] h-[36px] rounded-[10px] bg-moss-light border border-border flex items-center justify-center">
          <HeartHandshake size={16} className="text-moss" />
        </div>
        <div>
          <h1 className="font-syne text-[20px] font-extrabold text-ink leading-tight">Mon coaching</h1>
          <p className="text-[11px] text-ink3">
            Vos prochaines sessions, actions et preuves à valider sur tous vos projets&nbsp;:
            chaque clic ouvre l&apos;onglet existant du projet concerné.
          </p>
        </div>
      </div>

      <ExpertCoachingDashboard
        sessions={sessionsQuery.data ?? []}
        actions={actions}
        pendingEvidences={evidence.pending}
        evidenceLoading={evidence.isLoading}
        evidenceError={evidence.isError}
        isLoading={isLoading}
        error={error}
        onRetry={onRetry}
      />
    </div>
  )
}