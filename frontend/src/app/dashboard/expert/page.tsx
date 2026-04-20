'use client';

import { useEffect } from 'react';
import { Card, ErrorAlert } from '@/components/shared/ui';
import { useExpertiseAreas } from '@/hooks/useExpertiseAreas';
import { useExpertProfile } from '@/hooks/useExpertProfile';
import { ExpertForm } from '@/components/expert/ExpertForm';
import { ExpertiseSelector } from '@/components/expert/ExpertiseSelector';
import { AreaDetails } from '@/components/expert/AreaDetails';

export default function ExpertPage() {
  const {
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
    fetchAreas,
  } = useExpertiseAreas();

  const {
    form,
    loadingProfile,
    saving,
    error,
    success,
    updateFormField,
    saveProfile,
    fetchProfile,
  } = useExpertProfile();

  // Chargement parallèle et initialisation des expertises depuis le profil
  useEffect(() => {
    const loadData = async () => {
      const [areas, profile] = await Promise.all([fetchAreas(), fetchProfile()]);
      if (profile?.expertiseAreas?.length) {
        setSelectedAreaIds(profile.expertiseAreas.map((a: any) => a.id));
        const levels: Record<string, any> = {};
        profile.expertiseAreas.forEach((a: any) => {
          levels[a.id] = {
            id: a.id,
            level: a.level || 'Expert',
            years: a.years || 1,
          };
        });
        setAreaLevels(levels);
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Les fetch sont stables (useCallback)

  const handleSave = () => saveProfile(selectedAreaIds);

  const isLoading = loadingAreas || loadingProfile;

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-3">
          <div className="h-7 w-48 bg-border rounded" />
          <div className="h-4 w-64 bg-border rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[800px]">
      <h1 className="font-display text-[26px] mb-1">Profil expert</h1>
      <p className="text-[13px] text-text-2 mb-7">
        Définissez vos domaines d'expertise et votre disponibilité
      </p>

      {error && (
        <div className="mb-5">
          <ErrorAlert message={error} />
        </div>
      )}
      {success && (
        <div className="mb-5 p-3 rounded bg-accent-light text-accent text-[13px] border border-accent/20">
          ✓ Profil enregistré avec succès.
        </div>
      )}

      <Card className="mb-3.5">
        <ExpertForm
          form={form}
          onUpdateField={updateFormField}
          onSave={handleSave}
          saving={saving}
        />
      </Card>

      <Card>
        <ExpertiseSelector
          groupedAreas={groupedAreas}
          selectedAreaIds={selectedAreaIds}
          onToggleArea={toggleArea}
        />
        <AreaDetails
          selectedAreaIds={selectedAreaIds}
          allAreas={allAreas}
          areaLevels={areaLevels}
          onUpdateLevel={updateAreaLevel}
          onUpdateYears={updateAreaYears}
          onSave={handleSave}
          saving={saving}
        />
      </Card>
    </div>
  );
}