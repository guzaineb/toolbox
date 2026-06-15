'use client';

import Link from 'next/link';
import { Badge, Progress } from '@/components/shared/ui';
import { Project, PROJECT_STATUS_LABELS, STEP_STATUS_LABELS } from '@/types/project';
import { FolderKanban, ChevronRight } from 'lucide-react';

const STATUS_VARIANTS: Record<string, 'green' | 'amber' | 'blue' | 'gray' | 'red'> = {
  draft: 'gray',
  in_progress: 'blue',
  submitted: 'amber',
  under_review: 'amber',
  approved: 'green',
  rejected: 'red',
};

export function ProjectCard({ project }: { project: Project }) {
  const completed = project.steps?.filter(s => s.status === 'approved').length || 0;
  const total = project.steps?.length || 13;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <Link
      href={`/dashboard/project-owner/projects/${project.id}`}
      className="block bg-surface border border-border rounded-[14px] p-[16px_18px] hover:shadow-md hover:border-moss/25 transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-[38px] h-[38px] rounded-[10px] bg-moss-light text-moss flex items-center justify-center flex-shrink-0">
            <FolderKanban size={18} />
          </div>
          <div className="min-w-0">
            <h3 className="text-[14px] font-semibold text-ink truncate">{project.name}</h3>
            {project.description && (
              <p className="text-[12px] text-ink3 truncate mt-0.5">{project.description}</p>
            )}
          </div>
        </div>
        <ChevronRight size={16} className="text-ink3 flex-shrink-0 mt-1" />
      </div>

      <div className="flex items-center gap-2 mb-2.5">
        <Badge variant={STATUS_VARIANTS[project.status]}>{PROJECT_STATUS_LABELS[project.status]}</Badge>
        <span className="text-[11px] text-ink3">{completed}/{total} étapes</span>
      </div>

      <Progress value={percentage} />
      <div className="text-[11px] text-ink3 mt-1 text-right">{percentage}%</div>
    </Link>
  );
}
