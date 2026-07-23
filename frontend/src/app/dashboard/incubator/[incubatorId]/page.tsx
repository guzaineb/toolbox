'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Building2, Users, FileCheck, ChevronRight, Settings, Info,
} from 'lucide-react'
import api from '@/services/api'
import { Badge, Button, Card, CardHeader, ProgressBar } from '@/components/shared/ui'

interface Member {
  id: string
  role: string
  job_title?: string
  status: string
  is_primary_contact: boolean
  user?: { profile?: { first_name: string; last_name: string } }
}

interface Incubator {
  id: string
  name: string
  slug: string
  description?: string
  email?: string
  phone?: string
  website_url?: string
  city?: string
  country?: string
  organization_type?: string
  registration_number?: string
  tax_id?: string
  foundation_date?: string
  verification_status: 'pending' | 'approved' | 'rejected'
  status: 'active' | 'suspended'
  members?: Member[]
  documents?: { id: string; verification_status: string }[]
}

const ROLE_LABEL: Record<string, string> = {
  admin: 'Admin', program_manager: 'Program Mgr', cohort_manager: 'Cohort Mgr',
  review_manager: 'Review Mgr', member: 'Membre', viewer: 'Viewer',
}

const ROLE_BADGE: Record<string, 'green' | 'blue' | 'amber' | 'gray'> = {
  admin: 'green', program_manager: 'blue', cohort_manager: 'amber',
  review_manager: 'blue', member: 'gray', viewer: 'gray',
}

const AVATAR_COLORS = [
  'bg-[rgba(127,119,221,0.12)] text-[#6b63d0]',
  'bg-[rgba(45,138,221,0.12)] text-[#2572b8]',
  'bg-[rgba(212,83,126,0.12)] text-[#b84070]',
  'bg-[rgba(201,168,76,0.12)] text-[#8a6a10]',
  'bg-[rgba(29,158,117,0.12)] text-[#1a8060]',
  'bg-[rgba(99,102,241,0.12)] text-[#4f46e5]',
]

export default function IncubatorDetailPage() {
  const { incubatorId } = useParams<{ incubatorId: string }>()
  const [incubator, setIncubator] = useState<Incubator | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (incubatorId) {
      api.get(`/incubators/${incubatorId}`)
        .then(res => setIncubator(res.data))
        .finally(() => setLoading(false))
    }
  }, [incubatorId])

  if (loading) {
    return (
      <div className="p-8 max-w-[900px] mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-72 bg-border rounded-lg" />
          <div className="h-4 w-48 bg-border rounded" />
          <div className="grid grid-cols-3 gap-3 mt-6">
            {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-border rounded-[14px]" />)}
          </div>
        </div>
      </div>
    )
  }

  if (!incubator) {
    return (
      <div className="p-8 max-w-[max-w-6xl] mx-auto">
        <Card className="text-center py-16">
          <div className="w-12 h-12 rounded-full bg-red-light text-red flex items-center justify-center mx-auto mb-3">
            <Info size={20} />
          </div>
          <p className="text-ink font-medium">Incubateur introuvable.</p>
          <Link href="/dashboard/incubator">
            <Button className="mt-4" variant="outline">← Retour</Button>
          </Link>
        </Card>
      </div>
    )
  }

  const activeMembers = incubator.members?.filter(m => m.status === 'active') ?? []
  const approvedDocs = incubator.documents?.filter(d => d.verification_status === 'approved').length ?? 0
  const totalDocs = incubator.documents?.length ?? 0
  const docsProgress = totalDocs > 0 ? Math.round((approvedDocs / totalDocs) * 100) : 0

  const infoFields = [
    incubator.slug && { label: 'Slug', value: incubator.slug },
    incubator.organization_type && { label: 'Type', value: incubator.organization_type },
    incubator.email && { label: 'Email', value: incubator.email, href: `mailto:${incubator.email}` },
    incubator.phone && { label: 'Téléphone', value: incubator.phone, href: `tel:${incubator.phone}` },
    incubator.website_url && { label: 'Site web', value: incubator.website_url, href: incubator.website_url },
    (incubator.city || incubator.country) && { label: 'Localisation', value: [incubator.city, incubator.country].filter(Boolean).join(', ') },
    incubator.registration_number && { label: "N° d'enregistrement", value: incubator.registration_number },
    incubator.tax_id && { label: 'NIF', value: incubator.tax_id },
    incubator.foundation_date && { label: 'Fondation', value: String(new Date(incubator.foundation_date).getFullYear()) },
  ].filter(Boolean) as { label: string; value: string; href?: string }[]

  return (
    <div className="p-6 md:p-8 max-w-[max-w-6xl] mx-auto space-y-5">

      {/* Breadcrumb */}
      <div className="flex items-center gap-[5px] text-[11px] text-ink3 mb-2">
        <Link href="/dashboard/incubator" className="hover:text-moss transition-colors">Incubateurs</Link>
        <ChevronRight size={11} />
        <span className="text-ink font-medium truncate">{incubator.name}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="font-syne text-[22px] font-extrabold text-ink mb-1">{incubator.name}</h1>
          <div className="flex gap-[6px] mb-1.5 flex-wrap">
            <Badge variant={incubator.verification_status === 'approved' ? 'green' : incubator.verification_status === 'rejected' ? 'red' : 'amber'}>
              {incubator.verification_status === 'approved' ? 'Approuvé' : incubator.verification_status === 'rejected' ? 'Rejeté' : 'En attente'}
            </Badge>
            <Badge variant={incubator.status === 'active' ? 'blue' : 'gray'}>
              {incubator.status === 'active' ? 'Actif' : 'Suspendu'}
            </Badge>
          </div>
          {incubator.description && (
            <p className="text-[12px] text-ink3 leading-relaxed max-w-[400px]">{incubator.description}</p>
          )}
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Link href={`/dashboard/incubator/${incubatorId}/members`}>
            <Button variant="ghost" size="sm"><Users size={13} /> Équipe</Button>
          </Link>
          <Link href={`/dashboard/incubator/${incubatorId}/documents`}>
            <Button variant="ghost" size="sm"><FileCheck size={13} /> Documents</Button>
          </Link>
            <Link href={`/dashboard/incubator/${incubatorId}/cohorts`}>
            <Button variant="ghost" size="sm"><FileCheck size={13} />Cohorts </Button>
          </Link>
          <Link href={`/dashboard/incubator/${incubatorId}/edit`}>
            <Button variant="primary" size="sm"><Settings size={13} /> Paramètres</Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-surface border border-border rounded-[12px] p-[16px_18px] shadow-[0_1px_5px_rgba(15,31,22,0.04)]">
          <div className="font-syne text-[28px] font-extrabold text-ink leading-none mb-[3px]">{incubator.members?.length ?? 0}</div>
          <div className="text-[10px] text-ink3 uppercase tracking-[0.07em] font-semibold">Membres</div>
        </div>
        <div className="bg-surface border border-border rounded-[12px] p-[16px_18px] shadow-[0_1px_5px_rgba(15,31,22,0.04)]">
          <div className="flex items-end justify-between mb-2">
            <div className="font-syne text-[28px] font-extrabold text-ink leading-none">
              {approvedDocs}<span className="text-[16px] text-ink3 font-normal">/{totalDocs}</span>
            </div>
            <span className="text-[11px] text-moss font-bold">{docsProgress}%</span>
          </div>
          <ProgressBar value={docsProgress} className="mb-1" />
          <div className="text-[10px] text-ink3 uppercase tracking-[0.07em] font-semibold">Docs validés</div>
        </div>
        <div className="bg-surface border border-border rounded-[12px] p-[16px_18px] shadow-[0_1px_5px_rgba(15,31,22,0.04)]">
          <div className="font-syne text-[28px] font-extrabold text-ink leading-none mb-[3px]">{activeMembers.length}</div>
          <div className="text-[10px] text-ink3 uppercase tracking-[0.07em] font-semibold">Membres actifs</div>
        </div>
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-[14px] items-start">

        {/* Informations */}
        {infoFields.length > 0 && (
          <Card className="overflow-hidden">
            <CardHeader icon={<Info size={13} />} title="Informations" />
            <div>
              {infoFields.map((f) => (
                <div key={f.label} className="px-[18px] py-[9px] border-b border-border last:border-none">
                  <div className="text-[9px] font-bold text-ink3 uppercase tracking-[0.1em] mb-[2px]">{f.label}</div>
                  {f.href ? (
                    <a href={f.href} target="_blank" rel="noreferrer" className="text-[12px] font-medium text-moss hover:underline truncate block">
                      {f.value}
                    </a>
                  ) : (
                    <div className="text-[12px] font-medium text-ink truncate">{f.value}</div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Team preview */}
        {incubator.members && incubator.members.length > 0 && (
          <Card className="overflow-hidden">
            <CardHeader icon={<Users size={13} />} title={`Équipe (${incubator.members.length})`}>
              <Link href={`/dashboard/incubator/${incubatorId}/members`} className="text-[11px] text-moss font-semibold hover:underline flex items-center gap-[3px]">
                Gérer <ChevronRight size={11} />
              </Link>
            </CardHeader>
            <div className="divide-y divide-border">
              {incubator.members.slice(0, 5).map((m, idx) => {
                const fn = m.user?.profile?.first_name ?? '?'
                const ln = m.user?.profile?.last_name ?? ''
                const initials = `${fn.charAt(0)}${ln.charAt(0)}`.toUpperCase()
                const colorClass = AVATAR_COLORS[idx % AVATAR_COLORS.length]
                return (
                  <div key={m.id} className="flex items-center gap-[10px] px-[18px] py-[10px] hover:bg-moss-light transition-colors cursor-pointer">
                    <div className={`w-[30px] h-[30px] rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${colorClass}`}>
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-medium text-ink truncate">
                        {fn} {ln}
                        {m.is_primary_contact && (
                          <span className="text-[9px] ml-1 px-[6px] py-[1px] rounded-[5px] bg-moss-light text-moss font-bold">Contact</span>
                        )}
                      </div>
                      {m.job_title && <div className="text-[11px] text-ink3 truncate">{m.job_title}</div>}
                    </div>
                    <Badge variant={ROLE_BADGE[m.role] ?? 'gray'} className="text-[9px] px-[8px] py-[3px] rounded-[10px]">
                      {ROLE_LABEL[m.role] ?? m.role}
                    </Badge>
                  </div>
                )
              })}
            </div>
            {incubator.members.length > 5 && (
              <div className="px-[18px] py-[9px] border-t border-border text-center">
                <Link href={`/dashboard/incubator/${incubatorId}/members`}>
                  <span className="text-[11px] text-ink3 hover:text-moss transition-colors cursor-pointer">
                    +{incubator.members.length - 5} autres membres →
                  </span>
                </Link>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}