'use client';

import { useState, useEffect, useCallback } from 'react';
import { projectService } from '@/services/project.service';
import { Project, CreateProjectDto, UpdateProjectDto } from '@/types/project';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const data = await projectService.getAll();
      setProjects(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return { projects, loading, error, refetch: fetchProjects };
}

export function useProject(projectId: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const data = await projectService.getOne(projectId);
      setProject(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const updateProject = useCallback(async (data: UpdateProjectDto) => {
    try {
      const updated = await projectService.update(projectId, data);
      setProject(updated);
      return updated;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [projectId]);

  const deleteProject = useCallback(async () => {
    await projectService.delete(projectId);
    setProject(null);
  }, [projectId]);

  return { project, loading, error, updateProject, deleteProject, refetch: fetchProject };
}
