'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ClipboardCheck,
  CalendarClock,
  FolderOpen,
  FileText,
  CheckCircle2,
} from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardHeader,
  LoadingState,
  ErrorAlert,
} from '@/components/shared/ui'
import { evaluationService } from '@/services/evaluation.service'
import type { EvaluationAssignment } from '@/types/coaching'
import { getErrorMessage } from '@/lib/utils'

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'À traiter',
  DRAFT: 'Brouillon en cours',
  SUBMITTED: 'Soumise',
}

export default function ExpertEvaluationsTodoPage() {
  const [assignments, setAssignments] = useState<EvaluationAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await evaluationService.getMyTodo()
      setAssignments(data || [])
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <nav className="flex items-center gap-1 text-[11px] text-ink3 flex-wrap">
        <Link href="/dashboard/expert" className="hover:text-moss transition-colors">
          Expertise
        </Link>
        <span>/</span>
        <span className="text-ink font-medium">Évaluations à traiter</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-syne text-[22px] font-extrabold text-ink mb-1">
            Évaluations à traiter
          </h1>
          <p className="text-[13px] text-ink2">
            Les grilles que vous devez remplir avant la délibération
          </p>
        </div>
        <Link href="/dashboard/expert/evaluations">
          <Button variant="outline">
            <ArrowLeft size={14} /> Historique
          </Button>
        </Link>
      </div>

      {error && <ErrorAlert message={error} />}

      {loading ? (
        <LoadingState label="Chargement de vos évaluations…" />
      ) : assignments.length === 0 ? (
        <Card className="text-center py-14">
          <ClipboardCheck size={40} className="mx-auto mb-3 text-ink3" />
          <h3 className="font-syne text-lg font-bold text-ink">
            Aucune évaluation en attente
          </h3>
          <p className="text-[13px] text-ink2 mt-1">
            Vous serez notifié(e) dès qu&apos;une grille vous sera affectée.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {assignments.map((assignment) => {
            const status = assignment.evaluation_status
            const alreadyStarted = !!assignment.evaluation_id
            return (
              <Card key={assignment.id} className="p-5 flex flex-col gap-3">
                <CardHeader
                  title={assignment.project?.name ?? 'Projet'}
                  icon={
                    status === 'SUBMITTED' ? (
                      <CheckCircle2 className="text-green-600" />
                    ) : (
                      <FolderOpen className="text-accent" />
                    )
                  }
                />

                {assignment.cohort?.name && (
                  <p className="text-[12px] text-ink3 -mt-2">
                    {assignment.cohort.name}
                  </p>
                )}

                {assignment.project?.description && (
                  <p className="text-[13px] text-ink2 line-clamp-2">
                    {assignment.project.description}
                  </p>
                )}

                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <Badge variant={status === 'SUBMITTED' ? 'green' : 'amber'}>
                    {STATUS_LABELS[status ?? 'PENDING'] ?? 'À traiter'}
                  </Badge>
                  {assignment.deadline && (
                    <span className="inline-flex items-center gap-1 text-ink3">
                      <CalendarClock size={12} />
                      {new Date(assignment.deadline).toLocaleDateString('fr-FR')}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-ink3">
                    <FileText size={12} />
                    Version {assignment.version ?? 1}
                  </span>
                </div>

                <div className="mt-auto pt-2">
                  <Link href={`/dashboard/expert/evaluations-todo/${assignment.id}`}>
                    <Button variant="primary" size="sm" fullWidth>
                      {alreadyStarted ? 'Reprendre la saisie' : 'Commencer lévaluation'}
                    </Button>
                  </Link>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}