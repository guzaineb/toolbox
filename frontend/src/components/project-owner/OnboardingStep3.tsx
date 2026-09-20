'use client';

import { CreateSkillDto, CreateExperienceDto } from '@/types/projectOwner';

interface OnboardingStep3Props {
  profile: any;
  form: { linkedin_url: string };
  setForm: React.Dispatch<React.SetStateAction<any>>;
  setShowSkillModal: (value: boolean) => void;
  setShowExpModal: (value: boolean) => void;
  deleteSkill: (id: string) => Promise<void>;
  deleteExperience: (id: string) => Promise<void>;
  onPrevious: () => void;
  onFinish: () => void;
  isLoading?: boolean;
}

export function OnboardingStep3({
  profile,
  form,
  setForm,
  setShowSkillModal,
  setShowExpModal,
  deleteSkill,
  deleteExperience,
  onPrevious,
  onFinish,
  isLoading,
}: OnboardingStep3Props) {
  // Si profile n'est pas encore chargé, afficher un message
  if (!profile) {
    return <div className="text-center py-8">Chargement du profil...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Compétences */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-ink">Compétences</h3>
          <button
            onClick={() => setShowSkillModal(true)}
            className="bg-moss text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-moss-dark transition"
          >
            + Ajouter une compétence
          </button>
        </div>
        {profile.skills?.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill: any) => (
              <div key={skill.id} className="bg-moss-light/30 px-3 py-1 rounded-full flex items-center gap-1 text-sm">
                {skill.skill_name} ({skill.level})
                <button
                  onClick={() => deleteSkill(skill.id)}
                  className="ml-1 text-red-500 hover:text-red-700 font-bold"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-ink-2 text-sm">Aucune compétence pour l'instant.</p>
        )}
      </div>

      {/* Expériences */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-ink">Expériences</h3>
          <button
            onClick={() => setShowExpModal(true)}
            className="bg-moss text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-moss-dark transition"
          >
            + Ajouter une expérience
          </button>
        </div>
        {profile.experiences?.length > 0 ? (
          <div className="space-y-3">
            {profile.experiences.map((exp: any) => (
              <div key={exp.id} className="border border-border rounded-lg p-3 bg-surface">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-ink">{exp.title}</h4>
                    <p className="text-sm text-ink-2">{exp.organization}</p>
                    {exp.start_date && (
                      <p className="text-xs text-ink-3">
                        {exp.start_date} → {exp.end_date || 'Présent'}
                      </p>
                    )}
                    {exp.description && <p className="text-sm mt-2 text-ink-2">{exp.description}</p>}
                  </div>
                  <button
                    onClick={() => deleteExperience(exp.id)}
                    className="text-red text-sm hover:underline"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-ink-2 text-sm">Aucune expérience pour l'instant.</p>
        )}
      </div>

      {/* LinkedIn */}
      <div>
        <label className="block text-sm font-medium text-ink mb-1">LinkedIn (optionnel)</label>
        <input
          type="url"
          value={form.linkedin_url}
          onChange={(e) => setForm((f: any) => ({ ...f, linkedin_url: e.target.value }))}
          placeholder="https://linkedin.com/in/votre-profil"
          className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-moss/50"
        />
      </div>

      {/* Boutons de navigation */}
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={onPrevious}
          className="px-4 py-2 border border-border rounded-lg text-ink-2 hover:bg-cream transition"
        >
          Précédent
        </button>
        <button
          onClick={onFinish}
          disabled={isLoading}
          className="bg-moss text-white px-6 py-2 rounded-lg font-medium hover:bg-moss-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Finalisation...' : 'Terminer'}
        </button>
      </div>
    </div>
  );
}