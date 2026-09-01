'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Building2, ChevronRight, Plus } from 'lucide-react'
import api from '@/services/api'
import { Badge, Button, Card } from '@/components/shared/ui'

interface Incubator {
  id: string
  name: string
  slug: string
  city?: string
  country?: string
  verification_status: 'PENDING' | 'APPROVED' | 'REJECTED'
  status: 'ACTIVE' | 'SUSPENDED'
  members?: { id: string }[]
  documents?: { id: string; verification_status: string }[]
}

const VERIFICATION_LABEL: Record<string, string> = {
  PENDING: 'En attente', APPROVED: 'Approuvé', REJECTED: 'Rejeté',
}
const VERIFICATION_VARIANT: Record<string, 'amber' | 'green' | 'red'> = {
  PENDING: 'amber', APPROVED: 'green', REJECTED: 'red',
}

export default function IncubatorListPage() {
  const [incubators, setIncubators] = useState<Incubator[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/incubators/my')
      .then((res) => setIncubators(res.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-8 max-w-[max-w-6xl] mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-7 w-64 bg-border rounded-lg" />
          <div className="h-4 w-48 bg-border rounded" />
          <div className="h-24 bg-border rounded-[14px] mt-4" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-[max-w-6xl] mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-syne text-[22px] font-extrabold text-ink mb-[2px] ">Incubateurs</h1>
          <p className="text-[12px] text-ink3">Gérez vos structures d'accompagnement</p>
        </div>
        <Link href="/dashboard/incubator/create">
          <Button variant="primary">
            <Plus size={12} />
            Créer un incubateur
          </Button>
        </Link>
      </div>

      {incubators.length === 0 ? (
        <Card className="text-center py-14">
          <div className="w-14 h-14 rounded-full bg-moss-light text-moss flex items-center justify-center mx-auto mb-4 text-[22px]">
            <Building2 size={24} />
          </div>
          <p className="text-[15px] font-semibold text-ink mb-1">Aucun incubateur</p>
          <p className="text-[12px] text-ink3 mb-6 max-w-[280px] mx-auto">
            Créez votre premier incubateur pour commencer à accompagner des projets.
          </p>
          <Link href="/dashboard/incubator/create">
            <Button variant="primary">
              <Plus size={12} />
              Créer un incubateur
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-[10px]">
          {incubators.map((inc) => {
            const approvedDocs = inc.documents?.filter((d) => d.verification_status === 'APPROVED').length ?? 0
            const totalDocs = inc.documents?.length ?? 0

            return (
              <Card key={inc.id} className="hover:shadow-[0_3px_16px_rgba(45,122,82,0.09)] hover:border-border-2 transition-all cursor-pointer">
                <div className="p-[16px_18px] flex items-center gap-[14px]">
                  <div className="w-[46px] h-[46px] rounded-[12px] bg-moss-light border border-border flex items-center justify-center text-[22px] flex-shrink-0">
                    <Building2 size={22} className="text-moss" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-syne text-[15px] font-bold text-ink mb-[2px] truncate">{inc.name}</h3>
                    <p className="text-[11px] text-ink3 mb-[6px]">
                      {inc.slug}
                      {inc.city ? ` · ${inc.city}` : ''}
                      {inc.country ? `, ${inc.country}` : ''}
                    </p>
                    <div className="flex gap-[5px] flex-wrap">
                      <Badge variant={VERIFICATION_VARIANT[inc.verification_status] ?? 'gray'}>
                        {VERIFICATION_LABEL[inc.verification_status] ?? inc.verification_status}
                      </Badge>
                      <Badge variant={inc.status === 'ACTIVE' ? 'blue' : 'gray'}>
                        {inc.status === 'ACTIVE' ? 'Actif' : 'Suspendu'}
                      </Badge>
                    </div>
                  </div>

                  <div className="hidden sm:flex gap-[18px] mr-3">
                    <div className="text-center">
                      <div className="font-syne text-[18px] font-extrabold text-ink leading-none">{inc.members?.length ?? 0}</div>
                      <div className="text-[9px] text-ink3 uppercase tracking-[0.06em] font-semibold mt-1">Membres</div>
                    </div>
                    <div className="text-center">
                      <div className="font-syne text-[18px] font-extrabold text-ink leading-none">
                        {approvedDocs}<span className="text-[11px] text-ink3 font-normal">/{totalDocs}</span>
                      </div>
                      <div className="text-[9px] text-ink3 uppercase tracking-[0.06em] font-semibold mt-1">Docs</div>
                    </div>
                  </div>

                  <Link href={`/dashboard/incubator/${inc.id}`} onClick={(e) => e.stopPropagation()}>
                    <Button variant="outline" size="sm">
                      Gérer
                      <ChevronRight size={11} />
                    </Button>
                  </Link>
                </div>
              </Card>
            )
          })}

          {/* Create new placeholder */}
          <Link href="/dashboard/incubator/create">
            <div className="border-[1.5px] border-dashed border-moss/20 bg-moss/[.02] rounded-[14px] p-6 flex items-center justify-center cursor-pointer hover:border-moss/40 hover:bg-moss/[.04] transition-all">
              <div className="text-center">
                <div className="w-10 h-10 rounded-[12px] bg-moss-light border border-border flex items-center justify-center mx-auto mb-[10px] text-[20px]">
                  <Building2 size={20} className="text-moss" />
                </div>
                <div className="text-[13px] font-semibold text-ink mb-1">Créer un nouvel incubateur</div>
                <div className="text-[12px] text-ink3 mb-3">Ajoutez une nouvelle structure d'accompagnement</div>
                <Button variant="primary" size="sm"><Plus size={11} /> Créer</Button>
              </div>
            </div>
          </Link>
        </div>
      )}
    </div>
  )
}