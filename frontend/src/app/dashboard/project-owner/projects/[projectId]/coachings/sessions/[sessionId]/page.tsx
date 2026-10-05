'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { CalendarClock } from 'lucide-react'
import { ErrorAlert } from '@/components/shared/ui'
import { OwnerSessionDetail } from '@/components/coaching/OwnerSessionDetail'

export default function OwnerCoachingSessionWorkspacePage() {
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
        <Link href={`/dashboard/project-owner/projects/${projectId}`} className="hover:text-moss transition-colors">
          Projet
        </Link>
        <span>/</span>
        <Link href={`/dashboard/project-owner/projects/${projectId}/coachings`} className="hover:text-moss transition-colors">
          Suivi coaching
        </Link>
        <span>/</span>
        <Link
          href={`/dashboard/project-owner/projects/${projectId}/coachings/sessions`}
          className="hover:text-moss transition-colors"
        >
          Agenda des sessions
        </Link>
        <span>/</span>
        <span className="text-ink font-medium">Détail de la session</span>
      </nav>

      <div className="flex items-center gap-3">
        <div className="w-[36px] h-[36px] rounded-[10px] bg-moss-light border border-border flex items-center justify-center">
          <CalendarClock size={16} className="text-moss" />
        </div>
        <div>
          <h1 className="font-syne text-[20px] font-extrabold text-ink leading-tight">Détail de la session</h1>
          <p className="text-[11px] text-ink3">
            Consultation de la session en lecture seule : notes, constats, décisions, recommandations et
            actions. Le GBM reste accessible depuis son propre module : aucune modification n&apos;est
            possible depuis cette page.
          </p>
        </div>
      </div>

      <OwnerSessionDetail
        projectId={projectId}
        sessionId={sessionId}
        backToCoachingHref={`/dashboard/project-owner/projects/${projectId}/coachings`}
      />
    </div>
  )
}