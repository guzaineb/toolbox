'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, FolderKanban, TrendingUp, FileText, MessageSquare, Star } from 'lucide-react';
import { Button, Card, StatBox } from '@/components/shared/ui';
import { ProjectCard } from '@/components/project/ProjectCard';
import { useProjects } from '@/hooks/useProjects';
import { usePorteurKPIs } from '@/hooks/useProgress';

export default function ProjectOwnerDashboard() {
  const router = useRouter();
  const { projects, loading, error } = useProjects();
  const { kpis } = usePorteurKPIs();

  return (
    <div className="p-6 md:p-8 max-w-[1000px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-syne text-[22px] font-extrabold text-ink">Mes projets</h1>
          <p className="text-[13px] text-ink3 mt-1">Gérez vos projets entrepreneuriaux</p>
        </div>
        <Button variant="primary" onClick={() => router.push('/dashboard/project-owner/projects/create')}>
          <Plus size={14} /> Nouveau projet
        </Button>
      </div>

      {/* KPIs */}
      {kpis && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatBox num={kpis.total_projects} label="Projets" />
          <StatBox num={`${Math.round(kpis.average_progress)}%`} label="Progression moyenne" />
          <StatBox num={kpis.total_documents} label="Documents" />
          <StatBox num={kpis.average_score > 0 ? `${Math.round(kpis.average_score)}/100` : '-'} label="Score moyen" />
        </div>
      )}

      {/* Projects list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-surface border border-border rounded-[14px] p-[16px_18px] animate-pulse">
              <div className="h-5 bg-ink/[.07] rounded w-1/3 mb-2" />
              <div className="h-4 bg-ink/[.05] rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <Card className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-moss-light text-moss flex items-center justify-center mx-auto mb-4">
            <FolderKanban size={28} />
          </div>
          <h2 className="font-syne text-[18px] font-bold text-ink mb-2">Aucun projet pour le moment</h2>
          <p className="text-[13px] text-ink3 mb-6 max-w-sm mx-auto">
            Créez votre premier projet et commencez votre parcours entrepreneurial guidé en 13 étapes.
          </p>
          <Button variant="primary" onClick={() => router.push('/dashboard/project-owner/projects/create')}>
            <Plus size={14} /> Créer mon projet
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
