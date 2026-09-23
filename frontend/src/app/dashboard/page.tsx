'use client'

import Link from 'next/link'
import { Card, Progress, StatBox, Badge } from '@/components/shared/ui'
import { FolderKanban, TrendingUp, Star, FileText, ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useProjects } from '@/hooks/useProjects'
import { usePorteurKPIs, useProjectProgress } from '@/hooks/useProgress'
import { StadeIndicator } from '@/components/dashboard/StadeIndicator'
import { ToolProgressCard } from '@/components/dashboard/ToolProgressCard'
import { NextActions } from '@/components/dashboard/NextActions'

export default function DashboardPage() {
  const { user } = useAuth()
  const { projects, loading: projectsLoading } = useProjects()
  const { kpis, loading: kpisLoading } = usePorteurKPIs()
  const latestProjectId = projects.length > 0 ? projects[0].id : null
  const { progress } = useProjectProgress(latestProjectId || '')

  const firstName = user?.profile?.first_name || 'Utilisateur'
  const roleLabels: Record<string, string> = {
    admin: 'Administrateur',
    expert: 'Expert',
    project_owner: 'Porteur de projet',
    incubator_membre: 'Membre incubateur',
  }
  const roleLabel = user?.role ? roleLabels[user.role] || 'Membre' : 'Membre'

  const totalSteps = projects.reduce((acc, p) => acc + (p.steps?.length || 0), 0)
  const approvedSteps = projects.reduce((acc, p) => acc + (p.steps?.filter(s => s.status === 'approved' || s.status === 'submitted').length || 0), 0)
  const overallProgress = totalSteps > 0 ? Math.round((approvedSteps / totalSteps) * 100) : 0

  const latestProject = projects.length > 0 ? projects[0] : null
  const latestSteps = latestProject?.steps || []

  return (
    <div className="animate-fadeIn space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-syne text-[24px] font-bold text-ink">Bonjour, {firstName} !</h1>
        <p className="text-[13px] text-ink2 mt-1">{roleLabel} — Voici un aperçu de votre activité</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatBox num={projects.length} label="Projets" icon={<FolderKanban size={16} />} />
        <StatBox num={`${overallProgress}%`} label="Progression globale" icon={<TrendingUp size={16} />} />
        <StatBox num={kpis?.total_reviews || 0} label="Évaluations reçues" icon={<Star size={16} />} />
        <StatBox num={kpis?.total_documents || 0} label="Documents" icon={<FileText size={16} />} />
      </div>

      {/* Two-column layout: Stade + Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stade indicator */}
        <Card className="p-5">
          <h2 className="text-[13px] font-semibold text-ink mb-4 flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-moss" />
            Stade de mon entreprise
          </h2>
          <StadeIndicator percentage={overallProgress} />
        </Card>

        {/* Tool progress */}
        {progress?.toolProgress && (
          <Card className="p-5">
            <h2 className="text-[13px] font-semibold text-ink mb-3 flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-moss" />
              Mes outils
            </h2>
            <ToolProgressCard toolProgress={progress.toolProgress} />
          </Card>
        )}
      </div>

      {/* Global progress bar */}
      {projects.length > 0 && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[13px] font-semibold text-ink">Progression globale</h2>
            <span className="text-[12px] text-ink3 font-medium">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} />
          <div className="flex justify-between mt-2 text-[11px] text-ink3">
            <span>{approvedSteps}/{totalSteps} étapes complétées</span>
            {kpis && <span>Score moyen: {Math.round(kpis.average_score)}/100</span>}
          </div>
        </Card>
      )}

      {/* Next action */}
      {latestProjectId && latestSteps.length > 0 && (
        <NextActions steps={latestSteps} projectId={latestProjectId} />
      )}

      {/* Quick access */}
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
                  <div className="text-[13px] font-semibold text-ink group-hover:text-moss transition-colors">
                    Mes Projets
                    <ArrowRight size={14} className="inline ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-[12px] text-ink3">{projects.length} projet(s)</div>
                </div>
              </div>
            </Card>
          </Link>
          <Link href="/dashboard/profile/edit" className="group">
            <Card className="p-5 hover:shadow-card-hover hover:border-moss/20 transition-all duration-200 cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-moss-light text-moss flex items-center justify-center">
                  <Star size={18} />
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-ink group-hover:text-moss transition-colors">
                    Mon profil
                    <ArrowRight size={14} className="inline ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-[12px] text-ink3">Modifier mes informations</div>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>

      {/* Recent projects */}
      {projects.length > 0 && (
        <div>
          <h2 className="text-[13px] font-semibold text-ink mb-4 flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-moss" />
            Projets récents
          </h2>
          <div className="space-y-3">
            {projects.slice(0, 5).map((p) => {
              const pSteps = p.steps || []
              const pApproved = pSteps.filter(s => s.status === 'approved' || s.status === 'submitted').length
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
