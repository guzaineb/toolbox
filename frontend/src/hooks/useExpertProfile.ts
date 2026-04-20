import { useState, useCallback } from 'react';
import api from '@/services/api';

export interface ExpertForm {
  headline: string;
  organization: string;
  position: string;
  years_of_experience: number;
  availability_status: string;
  linkedin_url: string;
  bio: string;
}

const defaultForm: ExpertForm = {
  headline: '',
  organization: '',
  position: '',
  years_of_experience: 0,
  availability_status: 'available',
  linkedin_url: '',
  bio: '',
};

export function useExpertProfile() {
  const [form, setForm] = useState<ExpertForm>(defaultForm);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoadingProfile(true);
    try {
      const res = await api.get('/expert/me').catch(() => null);
      if (res?.data) {
        const p = res.data;
        setForm({
          headline: p.headline ?? '',
          organization: p.organization ?? '',
          position: p.position ?? '',
          years_of_experience: p.years_of_experience ?? 0,
          availability_status: p.availability_status ?? 'available',
          linkedin_url: p.linkedin_url ?? '',
          bio: p.bio ?? '',
        });
        return res.data;
      }
      return null;
    } catch (err) {
      console.error('Failed to load profile', err);
      return null;
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  const updateFormField = useCallback(<K extends keyof ExpertForm>(field: K, value: ExpertForm[K]) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const saveProfile = useCallback(async (expertiseAreaIds: string[]) => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await api.patch('/expert/me', {
        ...form,
        expertiseAreaIds,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  }, [form]);

  return {
    form,
    loadingProfile,
    saving,
    error,
    success,
    updateFormField,
    saveProfile,
    fetchProfile,
    setError,  
    setSuccess,
  };
}