'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Rocket, ChevronRight } from 'lucide-react'
import api from '@/services/api'
import { Button, Card, CardHeader, Progress, Badge } from '@/components/shared/ui'

interface OnboardingStep {
  id: number
  title: string
  description: string
  href: string
  check: () => Promise<boolean>
}

export function IncubatorOnboarding({ incubatorId }: { incubatorId: string }) {
  const router = useRouter()
  const [steps, setSteps] = useState<OnboardingStep[]>([])
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const [incubator, documents, members] = await Promise.all([
          api.get(`/incubators/${incubatorId}`),
          api.get(`/incubators/${incubatorId}/documents`),
          api.get(`/incubators/${incubatorId}/members`),
        ])

        const hasInfo = incubator.data.name && incubator.data.slug
        const hasRequiredDocs = documents.data.some(
          (d: any) =>
            ['registre_commerce', 'document_legal'].includes(d.document_type) &&
            d.verification_status === 'APPROVED'
        )
        const hasTeam = members.data.length >= 2

        const newCompletedSteps: number[] = []
        if (hasInfo) newCompletedSteps.push(1)
        if (hasRequiredDocs) newCompletedSteps.push(2)
        if (hasTeam) newCompletedSteps.push(3)

        setCompletedSteps(newCompletedSteps)

        setSteps([
          {
            id: 1,
            title: 'Informations de base',
            description: 'Complétez les informations de votre incubateur',
            href: `/dashboard/incubator/${incubatorId}/edit`,
            check: async () => hasInfo,
          },
          {
            id: 2,
            title: 'Documents légaux',
            description: 'Uploadez les documents de vérification',
            href: `/dashboard/incubator/${incubatorId}/documents`,
            check: async () => hasRequiredDocs,
          },
          {
            id: 3,
            title: 'Inviter votre équipe',
            description: 'Ajoutez vos collaborateurs',
            href: `/dashboard/incubator/${incubatorId}/members`,
            check: async () => hasTeam,
          },
        ])
      } catch (error) {
        console.error('Error fetching onboarding status:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()
  }, [incubatorId])

  if (loading) return null
  if (completedSteps.length === steps.length) return null

  const progress = (completedSteps.length / steps.length) * 100
  const nextStep = steps.find((s) => !completedSteps.includes(s.id))

  return (
    <Card className="mb-6 border-moss/20 bg-moss/[.03]">
      <CardHeader
        icon={<Rocket size={13} />}
        title="Configuration de l'incubateur"
        className="border-moss/10 bg-moss/[.04]"
      >
        <Badge variant="green">{Math.round(progress)}%</Badge>
      </CardHeader>
      <div className="p-[16px_18px]">
        <Progress value={progress} />
        <p className="text-[12px] text-ink3 mt-3">
          Complétez les étapes ci-dessous pour activer pleinement votre incubateur.
        </p>

        <div className="mt-4 space-y-2">
          {steps.map((step) => {
            const isDone = completedSteps.includes(step.id)
            return (
              <div
                key={step.id}
                className={`flex items-center justify-between p-[10px_12px] rounded-lg border text-[12px] transition-all ${
                  isDone
                    ? 'bg-moss/[.06] border-moss/15 text-moss'
                    : 'bg-surface border-border text-ink2'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isDone ? 'bg-moss text-white' : 'bg-ink/10 text-ink3'
                    }`}
                  >
                    {isDone ? '✓' : step.id}
                  </div>
                  <span className={isDone ? 'line-through opacity-70' : ''}>
                    {step.title}
                  </span>
                </div>
                {!isDone && nextStep?.id === step.id && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => router.push(step.href)}
                  >
                    {step.title}
                    <ChevronRight size={12} />
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}