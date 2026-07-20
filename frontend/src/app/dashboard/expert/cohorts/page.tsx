'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users, ChevronRight } from 'lucide-react'
import api from '@/services/api'
import { Badge, Button, Card } from '@/components/shared/ui'
import { CohortExpert, EXPERT_ROLE_LABELS, EXPERT_ROLE_COLORS } from '@/types/cohort'

export default function ExpertCohortsPage() {
  const [assignments, setAssignments] = useState<CohortExpert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/experts/me')
      .then(async (res) => {
        if (res.data?.id) {
          const response = await api.get(`/cohorts?expertUserId=${res.data.user?.id}`)
          setAssignments(response.data)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-7 w-64 bg-border rounded-lg" />
          {[1, 2].map((i) => <div key={i} className="h-20 bg-border rounded-[14px]" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <h1 className="font-syne text-[22px] font-extrabold text-ink mb-[2px]">Mes cohortes</h1>
      <p className="text-[12px] text-ink3 mb-6">Cohortes dans lesquelles vous êtes affecté</p>

      {assignments.length === 0 ? (
        <Card className="text-center py-14">
          <div className="w-14 h-14 rounded-full bg-moss-light text-moss flex items-center justify-center mx-auto mb-4">
            <Users size={24} />
          </div>
          <p className="text-[15px] font-semibold text-ink mb-1">Aucune cohorte</p>
          <p className="text-[12px] text-ink3">Vous n'avez pas encore été affecté à une cohorte.</p>
        </Card>
      ) : (
        <div className="space-y-[10px]">
          {assignments.map((a) => (
            <Card key={a.id} className="p-[16px_18px]">
              <div className="flex items-center gap-[14px]">
                <div className="w-[40px] h-[40px] rounded-[10px] bg-moss-light border border-border flex items-center justify-center flex-shrink-0">
                  <Users size={18} className="text-moss" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-ink truncate">
                    {a.cohort?.name || 'Cohorte inconnue'}
                  </div>
                  <div className="text-[11px] text-ink3">
                    Affecté le {new Date(a.assigned_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                <Badge variant={EXPERT_ROLE_COLORS[a.role]?.includes('purple') ? 'blue' : 'blue'}>
                  {EXPERT_ROLE_LABELS[a.role]}
                </Badge>
                <Badge variant={a.status === 'ACTIVE' ? 'green' : 'gray'}>
                  {a.status === 'ACTIVE' ? 'Actif' : 'Inactif'}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
