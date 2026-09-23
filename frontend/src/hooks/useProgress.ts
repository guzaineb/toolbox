'use client';

import { useState, useEffect, useCallback } from 'react';
import { projectService } from '@/services/project.service';
import { PorteurKPIs, IncubateurKPIs, ProgressInfo } from '@/types/project';

export function usePorteurKPIs() {
  const [kpis, setKpis] = useState<PorteurKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await projectService.getPorteurKPIs();
      setKpis(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { kpis, loading, refetch: fetch };
}

export function useIncubateurKPIs() {
  const [kpis, setKpis] = useState<IncubateurKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await projectService.getIncubateurKPIs();
      setKpis(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { kpis, loading, refetch: fetch };
}

export function useProjectProgress(projectId: string) {
  const [progress, setProgress] = useState<ProgressInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const data = await projectService.getProgress(projectId);
      setProgress(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { progress, loading, refetch: fetch };
}
