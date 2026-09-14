'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { projectService } from '@/services/project.service';
import type { Project } from '@/services/project.service';

const PROJECT_ROUTE_PREFIX = '/dashboard/project-owner/projects/';

export function extractProjectIdFromPathname(pathname: string): string | null {
  if (!pathname?.startsWith(PROJECT_ROUTE_PREFIX)) return null;
  const rest = pathname.slice(PROJECT_ROUTE_PREFIX.length);
  const [projectId] = rest.split('/');
  return projectId || null;
}

export function useActiveProject(enabled = false) {
  const pathname = usePathname();

  const projectId = useMemo(
    () => extractProjectIdFromPathname(pathname ?? ''),
    [pathname]
  );

  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['my-projects'],
    queryFn: () => projectService.list(),
    enabled,
  });

  const activeProject = useMemo<Project | undefined>(() => {
    if (!projectId || !projects) return undefined;
    return projects.find((p) => p.id === projectId);
  }, [projectId, projects]);

  return {
    projects,
    activeProject,
    projectId,
    isInProjectRoute: !!projectId,
    loading: isLoading,
    error,
  };
}