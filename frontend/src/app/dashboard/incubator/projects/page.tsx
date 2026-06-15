'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Filter, Eye, FolderKanban, TrendingUp } from 'lucide-react';
import { Badge, Progress } from '@/components/shared/ui';
import { projectService } from '@/services/project.service';
import { useIncubateurKPIs } from '@/hooks/useProgress';
import { Project, PROJECT_STATUS_LABELS } from '@/types/project';

const STATUS_VARIANTS: Record<string, 'green' | 'amber' | 'blue' | 'gray' | 'red'> = {
  draft: 'gray',
  in_progress: 'blue',
  submitted: 'amber',
  under_review: 'amber',
  approved: 'green',
  rejected: 'red',
};

export default function IncubatorProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { kpis } = useIncubateurKPIs();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await projectService.getAll();
      setProjects(data);
    } catch {} finally {
      setLoading(false);
    }
  };

  const filtered = projects.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 md:p-8 max-w-[1000px] mx-auto space-y-6">
      <div>
        <h1 className="font-syne text-[22px] font-extrabold text-ink">Projets suivis</h1>
        <p className="text-[13px] text-ink3 mt-1">Consultez et évaluez les projets des porteurs</p>
      </div>

      {/* KPIs */}
      {kpis && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-moss/[.05] border border-border rounded-[10px] p-[14px]">
            <div className="font-syne text-[26px] font-extrabold text-ink leading-none">{kpis.total_projects}</div>
            <div className="text-[10px] text-ink3 uppercase tracking-[0.06em] font-semibold mt-[3px]">Projets</div>
          </div>
          <div className="bg-moss/[.05] border border-border rounded-[10px] p-[14px]">
            <div className="font-syne text-[26px] font-extrabold text-ink leading-none">{Math.round(kpis.average_progress)}%</div>
            <div className="text-[10px] text-ink3 uppercase tracking-[0.06em] font-semibold mt-[3px]">Progression moy.</div>
          </div>
          <div className="bg-moss/[.05] border border-border rounded-[10px] p-[14px]">
            <div className="font-syne text-[26px] font-extrabold text-ink leading-none">{kpis.blocked_steps}</div>
            <div className="text-[10px] text-ink3 uppercase tracking-[0.06em] font-semibold mt-[3px]">Étapes en attente</div>
          </div>
          <div className="bg-moss/[.05] border border-border rounded-[10px] p-[14px]">
            <div className="font-syne text-[26px] font-extrabold text-ink leading-none">{kpis.ready_for_review}</div>
            <div className="text-[10px] text-ink3 uppercase tracking-[0.06em] font-semibold mt-[3px]">Prêts pour éval.</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink3" />
          <input
            type="text"
            placeholder="Rechercher un projet..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-[32px] pr-3 py-2 font-dm text-[13px] border border-border rounded-lg bg-surface text-ink outline-none focus:border-moss"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 font-dm text-[13px] border border-border rounded-lg bg-surface text-ink outline-none focus:border-moss"
        >
          <option value="all">Tous les statuts</option>
          <option value="submitted">Soumis</option>
          <option value="under_review">En révision</option>
          <option value="approved">Approuvés</option>
          <option value="rejected">Refusés</option>
        </select>
      </div>

      {/* Projects list */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="bg-surface border border-border rounded-[14px] p-[16px_18px] animate-pulse">
              <div className="h-5 bg-ink/[.07] rounded w-1/3 mb-2" />
              <div className="h-4 bg-ink/[.05] rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <FolderKanban size={32} className="mx-auto text-ink3 mb-3" />
          <p className="text-ink3">Aucun projet trouvé</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(project => {
            const completed = project.steps?.filter(s => s.status === 'approved').length || 0;
            const total = project.steps?.length || 13;
            const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
            const userName = project.user?.profile?.first_name
              ? `${project.user.profile.first_name} ${project.user.profile.last_name || ''}`
              : project.user?.email || 'Utilisateur';

            return (
              <Link
                key={project.id}
                href={`/dashboard/incubator/projects/${project.id}`}
                className="block bg-surface border border-border rounded-[14px] p-[16px_18px] hover:shadow-sm hover:border-moss/25 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-[14px] font-semibold text-ink">{project.name}</h3>
                      <Badge variant={STATUS_VARIANTS[project.status]}>{PROJECT_STATUS_LABELS[project.status]}</Badge>
                    </div>
                    <div className="text-[11px] text-ink3">Porteur : {userName}</div>
                    {project.description && (
                      <p className="text-[12px] text-ink2 mt-1 line-clamp-1">{project.description}</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0 w-[120px]">
                    <div className="text-[11px] font-semibold text-moss">{percentage}%</div>
                    <Progress value={percentage} />
                    <div className="text-[10px] text-ink3 mt-0.5">{completed}/{total} étapes</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
