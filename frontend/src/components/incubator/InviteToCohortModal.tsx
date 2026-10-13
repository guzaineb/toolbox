'use client'

import { useState } from 'react'
import { Send, X } from 'lucide-react'
import {
  Button,
  Card,
  CardHeader,
  ErrorAlert,
  Field,
  Select,
} from '@/components/shared/ui'
import {
  COHORT_STATUS_LABELS,
  type Cohort,
  type CohortExpertRole,
} from '@/types/cohort'
import { getErrorMessage } from '@/lib/utils'

interface InviteToCohortModalProps {
  /** Titre de la modale (ex. « Inviter un expert »). */
  title: string
  /** Entité invitée (expert ou projet), rappelée pour confirmation. */
  subject: string
  /** Cohortes de l'incubateur dans lesquelles l'invitation est possible. */
  cohorts: Cohort[]
  /**
   * Affiche le choix du rôle (JURY | COACH) — réservé aux experts.
   */
  withExpertRole?: boolean
  submitLabel?: string
  onClose: () => void
  /** Exécute l'invitation ; une erreur est affichée dans la modale. */
  onConfirm: (cohortId: string, role: CohortExpertRole) => Promise<void>
}

/**
 * Modale partagée « inviter dans une cohorte » (experts et projets).
 */
export function InviteToCohortModal({
  title,
  subject,
  cohorts,
  withExpertRole = false,
  submitLabel = 'Inviter',
  onClose,
  onConfirm,
}: InviteToCohortModalProps) {
  const [cohortId, setCohortId] = useState(cohorts[0]?.id ?? '')
  const [role, setRole] = useState<CohortExpertRole>('COACH')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!cohortId) {
      setError('Sélectionnez une cohorte')
      return
    }
    setError(null)
    setLoading(true)
    try {
      await onConfirm(cohortId, role)
      onClose()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-6 z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <Card className="w-full max-w-[480px] p-0 overflow-hidden shadow-lg">
        <CardHeader icon={<Send size={15} />} title={title}>
          <Button size="sm" variant="ghost" onClick={onClose}>
            <X size={16} />
          </Button>
        </CardHeader>
        <div className="p-6">
          {error && (
            <div className="mb-5">
              <ErrorAlert message={error} />
            </div>
          )}

          <p className="text-[12px] text-ink-2 mb-4 leading-relaxed">
            <span className="font-semibold text-ink">{subject}</span> recevra une
            invitation à rejoindre la cohorte choisie. L’invitation devra être
            acceptée pour devenir effective.
          </p>

          {cohorts.length === 0 ? (
            <ErrorAlert message="Aucune cohorte disponible dans cet incubateur. Créez d’abord une cohorte." />
          ) : (
            <>
              <Field label="Cohorte" required>
                <Select
                  value={cohortId}
                  onChange={(e) => setCohortId(e.target.value)}
                >
                  {cohorts.map((cohort) => (
                    <option key={cohort.id} value={cohort.id}>
                      {cohort.name} — {COHORT_STATUS_LABELS[cohort.status]}
                    </option>
                  ))}
                </Select>
              </Field>

              {withExpertRole && (
                <Field label="Rôle">
                  <Select
                    value={role}
                    onChange={(e) =>
                      setRole(e.target.value as CohortExpertRole)
                    }
                  >
                    <option value="COACH">Coach</option>
                    <option value="JURY">Jury</option>
                  </Select>
                </Field>
              )}
            </>
          )}

          <div className="flex gap-3 mt-6">
            <Button className="flex-1" onClick={onClose}>
              Annuler
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              loading={loading}
              disabled={cohorts.length === 0}
              onClick={handleSubmit}
            >
              {submitLabel}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
