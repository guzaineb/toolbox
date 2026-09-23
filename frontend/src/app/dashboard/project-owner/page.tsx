'use client'

import { useRouter } from 'next/navigation'
import { Plus, FolderKanban } from 'lucide-react'
import { Button, Card, StatBox, EmptyState, CardSkeleton } from '@/components/shared/ui'
import { ProjectCard } from '@/components/project/ProjectCard'
import { useProjects } from '@/hooks/useProjects'
import { usePorteurKPIs } from '@/hooks/useProgress'

export default function ProjectOwnerDashboard() {
  const router = useRouter()
  const { projects, loading, error } = useProjects()
  const { kpis } = usePorteurKPIs()

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-syne text-[22px] font-bold text-ink">Mes projets</h1>
          <p className="text-[13px] text-ink3 mt-1">Gérez vos projets entrepreneuriaux</p>
        </div>
        <Button variant="primary" onClick={() => router.push('/dashboard/project-owner/projects/create')}>
          <Plus size={14} /> Nouveau projet
        </Button>
      </div>

      {kpis && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatBox num={kpis.total_projects} label="Projets" icon={<FolderKanban size={16} />} />
          <StatBox num={`${Math.round(kpis.average_progress)}%`} label="Progression moyenne" icon={<FolderKanban size={16} />} />
          <StatBox num={kpis.total_documents} label="Documents" icon={<FolderKanban size={16} />} />
          <StatBox num={kpis.average_score > 0 ? `${Math.round(kpis.average_score)}/100` : '-'} label="Score moyen" icon={<FolderKanban size={16} />} />
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map(i => <CardSkeleton key={i} lines={3} />)}
        </div>
      ) : projects.length === 0 ? (
        <Card>
          <EmptyState
            icon={<FolderKanban size={28} />}
            title="Aucun projet pour le moment"
            description="Créez votre premier projet et commencez votre parcours entrepreneurial guidé en 21 étapes."
            action={
              <Button variant="primary" onClick={() => router.push('/dashboard/project-owner/projects/create')}>
                <Plus size={14} /> Créer mon projet
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}
