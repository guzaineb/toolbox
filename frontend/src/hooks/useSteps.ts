'use client';

import { useState, useEffect, useCallback } from 'react';
import { projectService } from '@/services/project.service';
import { ProjectStep, UpdateStepDto, StepStatus } from '@/types/project';

export function useSteps(projectId: string) {
  const [steps, setSteps] = useState<ProjectStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSteps = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const data = await projectService.getSteps(projectId);
      setSteps(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchSteps();
  }, [fetchSteps]);

  return { steps, loading, error, refetch: fetchSteps };
}

export function useStep(projectId: string, stepNumber: number) {
  const [step, setStep] = useState<ProjectStep | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStep = useCallback(async () => {
    if (!projectId || !stepNumber) return;
    setLoading(true);
    try {
      const data = await projectService.getStep(projectId, stepNumber);
      setStep(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [projectId, stepNumber]);

  useEffect(() => {
    fetchStep();
  }, [fetchStep]);

  const updateStep = useCallback(async (data: UpdateStepDto) => {
    setSaving(true);
    try {
      const updated = await projectService.updateStep(projectId, stepNumber, data);
      setStep(updated);
      return updated;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [projectId, stepNumber]);

  const submitStep = useCallback(async () => {
    setSaving(true);
    try {
      const updated = await projectService.submitStep(projectId, stepNumber);
      setStep(updated);
      return updated;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [projectId, stepNumber]);

  return { step, loading, saving, error, updateStep, submitStep, refetch: fetchStep };
}
