// hooks/useExpertiseAreas.ts
import { useState, useEffect, useCallback } from 'react';
import { expertService } from '@/services/expert.service';
import { ExpertiseArea } from '@/types/expert';

export function useExpertiseAreas() {
  const [allAreas, setAllAreas] = useState<ExpertiseArea[]>([]);
  const [groupedAreas, setGroupedAreas] = useState<Record<string, ExpertiseArea[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAreas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [areas, grouped] = await Promise.all([
        expertService.getAllExpertiseAreas(),
        expertService.getExpertiseAreasByCategory(),
      ]);
      setAllAreas(Array.isArray(areas) ? areas : []);
      setGroupedAreas(grouped || {});
    } catch (err: any) {
      console.error('Failed to load expertise areas:', err);
      setError(err.message);
      setAllAreas([]);
      setGroupedAreas({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAreas();
  }, [fetchAreas]);

  return {
    allAreas,
    groupedAreas,
    loading,
    error,
    refetch: fetchAreas,
  };
}