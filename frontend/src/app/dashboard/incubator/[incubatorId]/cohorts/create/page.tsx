'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Users } from 'lucide-react'
import { cohortService } from '@/services/cohort.service'
import { Badge, Button, Card, CardHeader, ErrorAlert, Field, Input, Textarea } from '@/components/shared/ui'

export default function CreateCohortPage() {
  const { incubatorId } = useParams<{ incubatorId: string }>()
  const router = useRouter()

  const [name, setName] = useState('')
  const [program, setProgram] = useState('')
  const [description, setDescription] = useState('')
  const [capacity, setCapacity] = useState('')
  const [applicationDeadline, setApplicationDeadline] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Le nom est requis')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const cohort = await cohortService.createCohort(incubatorId, {
        name: name.trim(),
        program: program.trim() || undefined,
        description: description.trim() || undefined,
        capacity: capacity ? parseInt(capacity) : undefined,
        application_deadline: applicationDeadline || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      })
      router.push(`/dashboard/incubator/${incubatorId}/cohorts/${cohort.id}`)
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-[700px] mx-auto">
      <div className="flex items-center gap-[5px] text-[11px] text-ink3 mb-2">
        <Link href="/dashboard/incubator" className="hover:text-moss transition-colors">Incubateurs</Link>
        <ChevronRight size={11} />
        <Link href={`/dashboard/incubator/${incubatorId}`} className="hover:text-moss transition-colors">Détail</Link>
        <ChevronRight size={11} />
        <Link href={`/dashboard/incubator/${incubatorId}/cohorts`} className="hover:text-moss transition-colors">Cohortes</Link>
        <ChevronRight size={11} />
        <span className="text-ink font-medium">Créer</span>
      </div>

      <h1 className="font-syne text-[22px] font-extrabold text-ink mb-1">Créer une cohorte</h1>
      <p className="text-[12px] text-ink3 mb-6">Définissez les paramètres de votre nouvelle cohorte</p>

      {error && <div className="mb-5"><ErrorAlert message={error} /></div>}

      <Card className="p-0 overflow-hidden">
        <CardHeader icon={<Users size={15} />} title="Informations de la cohorte" />
        <div className="p-6 space-y-5">
          <Field label="Nom *">
            <Input
              placeholder="ex: Cohorte Printemps 2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <Field label="Programme">
            <Input
              placeholder="ex: Accélération Green Tech"
              value={program}
              onChange={(e) => setProgram(e.target.value)}
            />
          </Field>
          <Field label="Description">
            <Textarea
              placeholder="Description de la cohorte..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </Field>
          <Field label="Capacité maximale">
            <Input
              type="number"
              min={1}
              placeholder="ex: 20"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Date limite candidature">
              <Input
                type="date"
                value={applicationDeadline}
                onChange={(e) => setApplicationDeadline(e.target.value)}
              />
            </Field>
            <Field label="Date de début">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Field>
            <Field label="Date de fin">
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Field>
          </div>
        </div>
      </Card>

      <div className="flex gap-3 mt-6">
        <Link href={`/dashboard/incubator/${incubatorId}/cohorts`} className="flex-1">
          <Button className="w-full">Annuler</Button>
        </Link>
        <Button variant="primary" className="flex-1" loading={loading} onClick={handleSubmit}>
          Créer la cohorte
        </Button>
      </div>
    </div>
  )
}
