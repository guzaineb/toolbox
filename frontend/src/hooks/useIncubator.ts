import { useEffect, useState, useCallback } from 'react';
import { incubatorService } from '@/services/incubator.service';
import { Incubator, CreateIncubatorDto, UpdateIncubatorDto } from '@/types/incubator';

export function useIncubator(incubatorId?: string) {
  const [incubator, setIncubator] = useState<Incubator | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIncubator = useCallback(async () => {
    if (!incubatorId) return;
    setLoading(true);
    try {
      const data = await incubatorService.getOne(incubatorId);
      setIncubator(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [incubatorId]);

  useEffect(() => {
    fetchIncubator();
  }, [fetchIncubator]);

  const updateIncubator = useCallback(async (data: UpdateIncubatorDto) => {
    if (!incubatorId) throw new Error('No incubator ID');
    setLoading(true);
    try {
      const updated = await incubatorService.update(incubatorId, data);
      setIncubator(updated);
      return updated;
    } finally {
      setLoading(false);
    }
  }, [incubatorId]);

  const deleteIncubator = useCallback(async () => {
    if (!incubatorId) throw new Error('No incubator ID');
    setLoading(true);
    try {
      await incubatorService.delete(incubatorId);
      setIncubator(null);
    } finally {
      setLoading(false);
    }
  }, [incubatorId]);

  const updateStatus = useCallback(async (status: 'ACTIVE' | 'SUSPENDED') => {
    if (!incubatorId) throw new Error('No incubator ID');
    setLoading(true);
    try {
      const updated = await incubatorService.updateStatus(incubatorId, { status });
      setIncubator(updated);
      return updated;
    } finally {
      setLoading(false);
    }
  }, [incubatorId]);

  const updateVerification = useCallback(async (verification_status: 'APPROVED' | 'REJECTED') => {
    if (!incubatorId) throw new Error('No incubator ID');
    setLoading(true);
    try {
      const updated = await incubatorService.updateVerification(incubatorId, { verification_status });
      setIncubator(updated);
      return updated;
    } finally {
      setLoading(false);
    }
  }, [incubatorId]);

  return {
    incubator,
    loading,
    error,
    refetch: fetchIncubator,
    updateIncubator,
    deleteIncubator,
    updateStatus,
    updateVerification,
  };
}