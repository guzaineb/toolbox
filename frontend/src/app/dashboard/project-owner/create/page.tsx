'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProjectOwnerProfile } from '@/hooks/useProjectOwnerProfile';
import { OnboardingSteps } from '@/components/project-owner/OnboardingSteps';
import { OnboardingStep1 } from '@/components/project-owner/OnboardingStep1';
import { OnboardingStep2 } from '@/components/project-owner/OnboardingStep2';
import { SkillModal } from '@/components/project-owner/SkillModal';
import { ExperienceModal } from '@/components/project-owner/ExperienceModal';
import { CreateSkillDto, CreateExperienceDto } from '@/types/projectOwner';
import { OnboardingStep3 } from '@/components/project-owner/OnboardingStep3';

type OnboardingStep = 1 | 2 | 3;

type FormData = {
  current_status: string;
  education_level: string;
  field_of_study: string;
  occupation: string;
  entrepreneurial_experience_level: number;
  has_previous_startup: boolean;
  linkedin_url: string;
};

export default function CreateProjectOwnerProfile() {
  const router = useRouter();
  const { profile, loading, saving, error, saveProfile, addSkill, deleteSkill, addExperience, deleteExperience, refetch } = useProjectOwnerProfile();

  const [step, setStep] = useState<OnboardingStep>(1);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [showExpModal, setShowExpModal] = useState(false);
  const [form, setForm] = useState<FormData>({
    current_status: '', education_level: '', field_of_study: '',
    occupation: '', entrepreneurial_experience_level: 0,
    has_previous_startup: false, linkedin_url: '',
  });

  useEffect(() => {
    if (profile && !loading) {
      setForm({
        current_status: profile.current_status || '',
        education_level: profile.education_level || '',
        field_of_study: profile.field_of_study || '',
        occupation: profile.occupation || '',
        entrepreneurial_experience_level: profile.entrepreneurial_experience_level || 0,
        has_previous_startup: profile.has_previous_startup || false,
        linkedin_url: profile.linkedin_url || '',
      });
    }
  }, [profile, loading]);

  const handleNextStep1 = async () => {
    if (!form.current_status || !form.education_level) return;
    await saveProfile(form);
    setStep(2);
  };

  const handleNextStep2 = async () => {
    await saveProfile(form);
    setStep(3);
  };

  const handleFinish = async () => {
    await saveProfile(form);
    await refetch();
    router.push('/dashboard/project-owner');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-moss mx-auto" />
          <p className="mt-4 text-ink3">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream to-moss-light/30 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-ink mb-2 font-syne">Créez votre profil</h1>
          <p className="text-ink3">Remplissez les étapes ci-dessous</p>
        </div>
        <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
          <OnboardingSteps currentStep={step} />
          {error && (
            <div className="mb-4 p-3 bg-red-light border border-red rounded-lg text-red text-sm">{error}</div>
          )}

          {step === 1 && (
            <OnboardingStep1 form={form} setForm={setForm} onNext={handleNextStep1} isLoading={saving} />
          )}
          {step === 2 && (
            <OnboardingStep2 form={form} setForm={setForm} onPrevious={() => setStep(1)} onNext={handleNextStep2} isLoading={saving} />
          )}
          {step === 3 && (
            <OnboardingStep3
              profile={profile} form={form} setForm={setForm}
              setShowSkillModal={setShowSkillModal} setShowExpModal={setShowExpModal}
              deleteSkill={deleteSkill} deleteExperience={deleteExperience}
              onPrevious={() => setStep(2)} onFinish={handleFinish} isLoading={saving}
            />
          )}
        </div>
      </div>

      {showSkillModal && (
        <SkillModal onAdd={async (skill) => { await addSkill(skill); }} onClose={() => setShowSkillModal(false)} saving={saving} />
      )}
      {showExpModal && (
        <ExperienceModal onAdd={async (exp) => { await addExperience(exp); }} onClose={() => setShowExpModal(false)} saving={saving} />
      )}
    </div>
  );
}
