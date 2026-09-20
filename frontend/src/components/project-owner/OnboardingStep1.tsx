// components/project-owner/OnboardingStep1.tsx
'use client';

interface OnboardingStep1Props {
  form: {
    current_status: string;
    education_level: string;
    field_of_study: string;
  };
  setForm: React.Dispatch<React.SetStateAction<any>>;
  onNext: () => void;
  isLoading?: boolean;
}

export function OnboardingStep1({ form, setForm, onNext, isLoading }: OnboardingStep1Props) {
  const isValid = form.current_status && form.education_level;

  return (
    <div className="space-y-4">
      {/* Champs existants (inchangés) */}
      <div>
        <label className="block text-sm font-medium text-ink mb-1">
          Statut actuel <span className="text-red">*</span>
        </label>
        <select
          value={form.current_status}
          onChange={(e) => setForm((f: any) => ({ ...f, current_status: e.target.value }))}
          className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-moss/50"
        >
          <option value="">— Sélectionner —</option>
          <option value="student">🎓 Étudiant</option>
          <option value="employee">💼 Salarié</option>
          <option value="entrepreneur">🚀 Entrepreneur</option>
          <option value="unemployed">🔍 Sans emploi</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1">
          Niveau d'études <span className="text-red">*</span>
        </label>
        <select
          value={form.education_level}
          onChange={(e) => setForm((f: any) => ({ ...f, education_level: e.target.value }))}
          className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-moss/50"
        >
          <option value="">— Sélectionner —</option>
          <option value="bac">Baccalauréat</option>
          <option value="bac+2">Bac+2 (BTS, DUT)</option>
          <option value="bac+3">Bac+3 (Licence)</option>
          <option value="bac+5">Bac+5 (Master)</option>
          <option value="doctorat">Doctorat</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1">Domaine d'études</label>
        <input
          type="text"
          value={form.field_of_study}
          onChange={(e) => setForm((f: any) => ({ ...f, field_of_study: e.target.value }))}
          placeholder="Ex: Informatique, Marketing..."
          className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-moss/50"
        />
      </div>

      {/* Boutons propres à l'étape 1 */}
      <div className="flex justify-end mt-6">
  <button
    onClick={onNext}
    disabled={!isValid || isLoading}
    className="bg-moss text-white px-6 py-2 rounded-lg font-medium hover:bg-moss-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {isLoading ? 'Enregistrement...' : 'Continuer'}
  </button>
</div>
    </div>
  );
}