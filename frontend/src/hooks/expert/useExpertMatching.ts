import { useState, useCallback } from 'react';
import { expertService } from '@/services/expert.service';
import { ProjectMatch } from '@/types/expert';

export function useExpertMatching() {
  const [matching, setMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<ProjectMatch | null>(null);
  const [error, setError] = useState<string | null>(null);

  const matchProject = useCallback(async (requiredAreas: string[], minYearsExperience: number) => {
    setMatching(true);
    setError(null);
    try {
      const result = await expertService.matchWithProject(requiredAreas, minYearsExperience);
      setMatchResult(result);
      return result;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      throw err;
    } finally {
      setMatching(false);
    }
  }, []);

  const clearMatch = useCallback(() => {
    setMatchResult(null);
    setError(null);
  }, []);

  return {matchProject,matchResult,matching,error,clearMatch,
  };
}