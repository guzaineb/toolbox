'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { ChevronRight, Users, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { cohortService } from '@/services/cohort.service'
import { Badge, Button, Card, CardHeader, ErrorAlert, SuccessAlert, Field, Select } from '@/components/shared/ui'
import { Cohort, COHORT_STATUS_LABELS, COHORT_STATUS_COLORS } from '@/types/cohort'
import api from '@/services/api'

export default function PorteurCohortDetailPage() {
  const { cohortId } = useParams<{ cohortId: string }>()
  const router = useRouter()
  const [cohort, setCohort] = useState<Cohort | null>(null)
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([])
  const [selectedProject, setSelectedProject] = useState('')
  const [applying, setApplying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const fetchCohort = useCallback(() => {
    if (!cohortId) return
    setLoading(true)
    cohortService
      .getCohortById(cohortId)
      .then(setCohort)
      .finally(() => setLoading(false))
  }, [cohortId])

  useEffect(() => { fetchCohort() }, [fetchCohort])

  useEffect(() => {
    api.get('/projects').then((res) => setProjects(res.data))
  }, [])

  const handleApply = async () => {
    if (!selectedProject) { setError('Sélectionnez un projet'); return }
    setError(null)
    setApplying(true)
    try {
      await cohortService.applyToCohort(cohortId, selectedProject)
      setSuccess('Votre candidature a été soumise avec succès !')
      setSelectedProject('')
      fetchCohort()
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erreur lors de la candidature')
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 max-w-[700px] mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-7 w-72 bg-border rounded-lg" />
          <div className="h-48 bg-border rounded-[14px] mt-4" />
        </div>
      </div>
    )
  }

  if (!cohort) {
    return (
      <div className="p-8 max-w-[700px] mx-auto">
        <Card className="text-center py-16">
          <p className="text-ink font-medium">Cohorte introuvable.</p>
          <Link href="/dashboard/project-owner/cohorts">
            <Button className="mt-4" variant="outline">← Retour</Button>
          </Link>
        </Card>
      </div>
    )
  }

  const canApply = cohort.status === 'OPEN'

  return (
    <div className="p-6 md:p-8 max-w-[700px] mx-auto space-y-5">
      <div className="flex items-center gap-[5px] text-[11px] text-ink3 mb-2">
        <Link href="/dashboard/project-owner/cohorts" className="hover:text-moss transition-colors">Cohortes</Link>
        <ChevronRight size={11} />
        <span className="text-ink font-medium truncate">{cohort.name}</span>
      </div>

      <div>
        <h1 className="font-syne text-[22px] font-extrabold text-ink mb-1">{cohort.name}</h1>
        <div className="flex gap-[6px] flex-wrap mb-3">
          <Badge variant={COHORT_STATUS_COLORS[cohort.status]?.includes('green') ? 'green' : COHORT_STATUS_COLORS[cohort.status]?.includes('blue') ? 'blue' : COHORT_STATUS_COLORS[cohort.status]?.includes('red') ? 'red' : COHORT_STATUS_COLORS[cohort.status]?.includes('yellow') ? 'amber' : 'gray'}>
            {COHORT_STATUS_LABELS[cohort.status]}
          </Badge>
          {cohort.program && <Badge variant="gray">{cohort.program}</Badge>}
        </div>
        {cohort.description && (
          <p className="text-[13px] text-ink3 leading-relaxed">{cohort.description}</p>
        )}
      </div>

      <Card className="overflow-hidden">
        <CardHeader icon={<Users size={13} />} title="Détails" />
        <div className="divide-y divide-border">
          {[
            { label: 'Capacité', value: cohort.capacity ? `${cohort.current_participants}/${cohort.capacity}` : 'Illimité' },
            { label: 'Date limite', value: cohort.application_deadline ? new Date(cohort.application_deadline).toLocaleDateString('fr-FR') : '—' },
            { label: 'Début', value: cohort.start_date ? new Date(cohort.start_date).toLocaleDateString('fr-FR') : '—' },
            { label: 'Fin', value: cohort.end_date ? new Date(cohort.end_date).toLocaleDateString('fr-FR') : '—' },
          ].map((f) => (
            <div key={f.label} className="px-[18px] py-[9px] flex justify-between">
              <span className="text-[11px] font-bold text-ink3 uppercase tracking-[0.1em]">{f.label}</span>
              <span className="text-[12px] font-medium text-ink">{f.value}</span>
            </div>
          ))}
        </div>
      </Card>

      {canApply && (
        <Card className="p-0 overflow-hidden">
          <CardHeader icon={<CheckCircle size={13} />} title="Candidater" />
          <div className="p-6 space-y-4">
            {error && <ErrorAlert message={error} />}
            {success && <SuccessAlert message={success} />}
            <Field label="Sélectionnez un projet">
              <Select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}>
                <option value="">-- Choisir un projet --</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </Select>
            </Field>
            <Button variant="primary" loading={applying} onClick={handleApply} className="w-full">
              Soumettre ma candidature
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
