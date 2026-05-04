import { useState, useEffect, useCallback } from 'react';
import { expertService } from '@/services/expert.service';
import { ExpertProfile, UpdateExpertDto, CreateExpertDto, AddExpertiseDto } from '@/types/expert';

export function useExpertProfile() {
  const [profile, setProfile] = useState<ExpertProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const data = await expertService.getMyProfile();
      setProfile(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const saveProfile = useCallback(async (data: UpdateExpertDto) => {
    setSaving(true);
    setError(null);
    try {
      const updated = profile
        ? await expertService.updateProfile(data)
        : await expertService.createProfile(data as CreateExpertDto);
      setProfile(updated);
      return updated;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [profile]);


const updateAvailability = useCallback(async (status: ExpertProfile['availability_status']): Promise<void> => {
  setSaving(true);
  setError(null);
  try {
    const updated = await expertService.updateProfile({ availability_status: status });
    setProfile(updated);
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message;
    setError(msg);
    throw err; // Propager l'erreur pour gestion dans le modal
  } finally {
    setSaving(false);
  }
}, []);

  const addExpertise = useCallback(async (dto: AddExpertiseDto) => {
    setSaving(true);
    try {
      const updated = await expertService.addExpertise(dto);
      setProfile(updated);
      return updated;
    } finally {
      setSaving(false);
    }
  }, []);

  const addMultipleExpertises = useCallback(async (expertises: AddExpertiseDto[]) => {
    setSaving(true);
    try {
      const updated = await expertService.addMultipleExpertises(expertises);
      setProfile(updated);
      return updated;
    } finally {
      setSaving(false);
    }
  }, []);

  const updateExpertiseLevel = useCallback(async (expertiseAreaId: string, level: string, years?: number) => {
    setSaving(true);
    try {
      const updated = await expertService.updateExpertiseLevel(expertiseAreaId, level, years);
      setProfile(updated);
      return updated;
    } finally {
      setSaving(false);
    }
  }, []);

  const removeExpertise = useCallback(async (expertiseAreaId: string) => {
    setSaving(true);
    try {
      await expertService.removeExpertise(expertiseAreaId);
      setProfile(prev => prev ? {
        ...prev,
        expertiseConnections: prev.expertiseConnections.filter(c => c.expertiseArea.id !== expertiseAreaId)
      } : null);
    } finally {
      setSaving(false);
    }
  }, []);

  const deleteProfile = useCallback(async () => {
    setSaving(true);
    try {
      await expertService.deleteProfile();
      setProfile(null);
    } finally {
      setSaving(false);
    }
  }, []);

  return {profile,loading,saving,error,saveProfile,updateAvailability,addExpertise,addMultipleExpertises,updateExpertiseLevel,removeExpertise,deleteProfile,refetch: fetchProfile,};
}