import { useState, useEffect, useCallback } from 'react';
import { projectOwnerService } from '@/services/projectOwner.service';
import {ProjectOwnerProfile,UpdateProjectOwnerDto,CreateSkillDto,CreateExperienceDto,ProjectOwnerSkill,ProjectOwnerExperience,} from '@/types/projectOwner';

export function useProjectOwnerProfile() {
  const [profile, setProfile] = useState<ProjectOwnerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const data = await projectOwnerService.getMyProfile();
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

  const saveProfile = useCallback(async (data: UpdateProjectOwnerDto) => {
    setSaving(true);
    setError(null);
    try {
      const updated = profile
        ? await projectOwnerService.updateProfile(data)
        : await projectOwnerService.createProfile(data);
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

  // Compétences
  const addSkill = useCallback(async (skillData: CreateSkillDto) => {
    setSaving(true);
    try {
      const newSkill = await projectOwnerService.addSkill(skillData);
      setProfile(prev => prev ? {
        ...prev,
        skills: [...prev.skills, newSkill]
      } : null);
      return newSkill;
    } finally {
      setSaving(false);
    }
  }, []);

  const deleteSkill = useCallback(async (skillId: string) => {
    setSaving(true);
    try {
      await projectOwnerService.deleteSkill(skillId);
      setProfile(prev => prev ? {
        ...prev,
        skills: prev.skills.filter(s => s.id !== skillId)
      } : null);
    } finally {
      setSaving(false);
    }
  }, []);

  // Expériences
  const addExperience = useCallback(async (expData: CreateExperienceDto) => {
    setSaving(true);
    try {
      const newExp = await projectOwnerService.addExperience(expData);
      setProfile(prev => prev ? {
        ...prev,
        experiences: [...prev.experiences, newExp]
      } : null);
      return newExp;
    } finally {
      setSaving(false);
    }
  }, []);

  const deleteExperience = useCallback(async (expId: string) => {
    setSaving(true);
    try {
      await projectOwnerService.deleteExperience(expId);
      setProfile(prev => prev ? {
        ...prev,
        experiences: prev.experiences.filter(e => e.id !== expId)
      } : null);
    } finally {
      setSaving(false);
    }
  }, []);

  return {profile,loading,saving,error,saveProfile,addSkill,deleteSkill,addExperience,deleteExperience,refetch: fetchProfile,};
}