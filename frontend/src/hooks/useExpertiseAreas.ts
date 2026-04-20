import { useState, useCallback } from 'react';
import api from '@/services/api';

export interface ExpertiseArea {
  id: string;
  name: string;
  category?: string;
}

export interface AreaLevel {
  id: string;
  level: string;
  years: number;
}

export function useExpertiseAreas() {
  const [allAreas, setAllAreas] = useState<ExpertiseArea[]>([]);
  const [loadingAreas, setLoadingAreas] = useState(true);
  const [selectedAreaIds, setSelectedAreaIds] = useState<string[]>([]);
  const [areaLevels, setAreaLevels] = useState<Record<string, AreaLevel>>({});

  const fetchAreas = useCallback(async () => {
    setLoadingAreas(true);
    try {
      const res = await api.get('/expert/expertise-areas');
      setAllAreas(res.data);
      return res.data;
    } catch (err) {
      console.error('Failed to load expertise areas', err);
      throw err;
    } finally {
      setLoadingAreas(false);
    }
  }, []);

  const toggleArea = useCallback((id: string) => {
    setSelectedAreaIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
    if (!areaLevels[id]) {
      setAreaLevels(prev => ({
        ...prev,
        [id]: { id, level: 'Expert', years: 1 }
      }));
    }
  }, [areaLevels]);

  const updateAreaLevel = useCallback((id: string, level: string) => {
    setAreaLevels(prev => ({
      ...prev,
      [id]: { ...prev[id], level }
    }));
  }, []);

  const updateAreaYears = useCallback((id: string, years: number) => {
    setAreaLevels(prev => ({
      ...prev,
      [id]: { ...prev[id], years }
    }));
  }, []);

  const groupedAreas = allAreas.reduce<Record<string, ExpertiseArea[]>>((acc, area) => {
    const cat = area.category ?? 'Général';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(area);
    return acc;
  }, {});

  return {
    allAreas,
    loadingAreas,
    selectedAreaIds,
    areaLevels,
    setSelectedAreaIds,
    setAreaLevels,
    toggleArea,
    updateAreaLevel,
    updateAreaYears,
    groupedAreas,
    fetchAreas
  };
}