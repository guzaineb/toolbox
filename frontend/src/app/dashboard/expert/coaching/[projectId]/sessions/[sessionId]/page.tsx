'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { CalendarClock } from 'lucide-react'
import { ErrorAlert } from '@/components/shared/ui'
import { SessionWorkspace } from '@/components/coaching/SessionWorkspace'

export default function CoachingSessionWorkspacePage() {
  const params = useParams()
  const projectId = params.projectId as string
  const sessionId = params.sessionId as string

  if (!projectId || !sessionId) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <ErrorAlert message="Session introuvable" />
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6 pb-16">
      <nav className="flex items-center gap-1 text-[11px] text-ink3 flex-wrap">
        <Link href="/dashboard/expert/coachings" className="hover:text-moss transition-colors">
          Coachings
        </Link>
        <span>/</span>
        <Link href={`/dashboard/expert/coaching/${projectId}`} className="hover:text-moss transition-colors">
          Projet
        </Link>
        <span>/</span>
        <Link
          href={`/dashboard/expert/coaching/${projectId}?tab=sessions`}
          className="hover:text-moss transition-colors"
        >
          Sessions
        </Link>
        <span>/</span>
        <span className="text-ink font-medium">Espace de session</span>
      </nav>

      <div className="flex items-center gap-3">
        <div className="w-[36px] h-[36px] rounded-[10px] bg-moss-light border border-border flex items-center justify-center">
          <CalendarClock size={16} className="text-moss" />
        </div>
        <div>
          <h1 className="font-syne text-[20px] font-extrabold text-ink leading-tight">Espace de session</h1>
          <p className="text-[11px] text-ink3">
            Préparer · Dérouler · Constats · Décisions · Actions · Clôture — l&apos;IA propose, le coach valide.
          </p>
        </div>
      </div>

      <SessionWorkspace projectId={projectId} sessionId={sessionId} />
    </div>
  )
}
