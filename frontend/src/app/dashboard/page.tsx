'use client'

import Link from 'next/link'
import { Card, Progress, StatBox, GlassCard } from '@/components/shared/ui'
import { User, Building2, FolderKanban, TrendingUp, Star, FileText } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useProjects } from '@/hooks/useProjects'
import { usePorteurKPIs } from '@/hooks/useProgress'

export default function DashboardPage() {
  const { user } = useAuth()
  const { projects, loading: projectsLoading } = useProjects()
  const { kpis, loading: kpisLoading } = usePorteurKPIs()

  const firstName = user?.profile?.first_name || 'Utilisateur'
  const roleLabels: Record<string, string> = {
    admin: 'Administrateur',
    expert: 'Expert',
    project_owner: 'Porteur de projet',
    incubator_membre: 'Membre incubateur',
  }
  const roleLabel = user?.role ? roleLabels[user.role] || 'Membre' : 'Membre'

  const totalSteps = projects.reduce((acc, p) => acc + (p.steps?.length || 0), 0)
  const approvedSteps = projects.reduce((acc, p) => acc + (p.steps?.filter(s => s.status === 'approved').length || 0), 0)
  const overallProgress = totalSteps > 0 ? Math.round((approvedSteps / totalSteps) * 100) : 0

  return (
    <div className="animate-fadeIn">
      <div className="mb-8">
        <h1 className="font-syne text-[24px] font-bold text-ink">Bonjour, {firstName} 👋</h1>
        <p className="text-[13px] text-ink2 mt-1">{roleLabel} — Voici un aperçu de votre activité</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <StatBox num={projects.length} label="Projets" icon={<FolderKanban size={16} />} />
        <StatBox num={`${overallProgress}%`} label="Progression globale" icon={<TrendingUp size={16} />} />
        <StatBox num={kpis?.total_reviews || 0} label="Évaluations reçues" icon={<Star size={16} />} />
        <StatBox num={kpis?.total_documents || 0} label="Documents uploadés" icon={<FileText size={16} />} />
      </div>

      {/* Projects summary */}
      {projects.length > 0 && (
        <Card className="p-5 mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[13px] font-semibold text-ink">Progression globale</h2>
            <span className="text-[12px] text-ink3 font-medium">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} />
          <div className="flex justify-between mt-2 text-[11px] text-ink3">
            <span>{approvedSteps}/{totalSteps} étapes approuvées</span>
            {kpis && <span>Score moyen: {Math.round(kpis.average_score)}/100</span>}
          </div>
        </Card>
      )}

      <div>
        <h2 className="text-[13px] font-semibold text-ink mb-4 flex items-center gap-2">
          <span className="w-1 h-4 rounded-full bg-moss" />
          Accès rapides
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/dashboard/project-owner" className="group">
            <Card className="p-5 hover:shadow-card-hover hover:border-moss/20 transition-all duration-200 cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-moss-light text-moss flex items-center justify-center">
                  <FolderKanban size={18} />
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-ink group-hover:text-moss transition-colors">Mes Projets</div>
                  <div className="text-[12px] text-ink3">{projects.length} projet(s) · {approvedSteps} étapes approuvées</div>
                </div>
              </div>
            </Card>
          </Link>
          <Link href="/dashboard/profile/edit" className="group">
            <Card className="p-5 hover:shadow-card-hover hover:border-moss/20 transition-all duration-200 cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-moss-light text-moss flex items-center justify-center">
                  <User size={18} />
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-ink group-hover:text-moss transition-colors">Mon profil</div>
                  <div className="text-[12px] text-ink3">Modifier mes informations personnelles</div>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>

      {/* Recent projects */}
      {projects.length > 0 && (
        <div className="mt-8">
          <h2 className="text-[13px] font-semibold text-ink mb-4 flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-moss" />
            Projets récents
          </h2>
          <div className="space-y-3">
            {projects.slice(0, 5).map((p) => {
              const pSteps = p.steps || []
              const pApproved = pSteps.filter(s => s.status === 'approved').length
              const pTotal = pSteps.length
              const pPct = pTotal > 0 ? Math.round((pApproved / pTotal) * 100) : 0
              return (
                <Link key={p.id} href={`/dashboard/project-owner/projects/${p.id}`}>
                  <Card className="p-[14px_18px] hover:shadow-card-hover hover:border-moss/20 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FolderKanban size={16} className="text-moss" />
                        <div>
                          <span className="text-[13px] font-semibold text-ink">{p.name}</span>
                          <span className="text-[11px] text-ink3 ml-2">{pPct}% · {pApproved}/{pTotal} étapes</span>
                        </div>
                      </div>
                      <div className="w-[80px]"><Progress value={pPct} /></div>
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
