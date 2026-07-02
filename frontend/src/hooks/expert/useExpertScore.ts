import { useState, useEffect, useCallback } from 'react';
import { expertService } from '@/services/expert.service';
import { ExpertScore } from '@/types/expert';

export function useExpertScore() {
  const [score, setScore] = useState<ExpertScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchScore = useCallback(async () => {
    setLoading(true);
    try {
      const data = await expertService.getMyScore();
      setScore(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScore();
  }, [fetchScore]);

  return { score, loading, error, refetch: fetchScore };
}