// components/project-owner/OnboardingStep2.tsx
'use client';

interface OnboardingStep2Props {
  form: {
    occupation: string;
    entrepreneurial_experience_level: number;
    has_previous_startup: boolean;
  };
  setForm: React.Dispatch<React.SetStateAction<any>>;
  onPrevious: () => void;
  onNext: () => void;
  isLoading?: boolean;
}

export function OnboardingStep2({ form, setForm, onPrevious, onNext, isLoading }: OnboardingStep2Props) {
  return (
    <div className="space-y-4">
      {/* Champs existants */}
      <div>
        <label className="block text-sm font-medium text-ink mb-1">Occupation actuelle</label>
        <input
          type="text"
          value={form.occupation}
          onChange={(e) => setForm((f: any) => ({ ...f, occupation: e.target.value }))}
          placeholder="Ex: Développeur full-stack..."
          className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-moss/50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1">Niveau d'expérience entrepreneuriale</label>
        <select
          value={form.entrepreneurial_experience_level}
          onChange={(e) => setForm((f: any) => ({ ...f, entrepreneurial_experience_level: Number(e.target.value) }))}
          className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-moss/50"
        >
          <option value={0}>🌟 Aucune expérience - Je débute</option>
          <option value={1}>💡 Débutant - J'ai une idée</option>
          <option value={2}>📈 Intermédiaire - 1 à 3 startups</option>
          <option value={3}>🏆 Avancé - 3+ startups ou expérience significative</option>
        </select>
      </div>

      <div className="flex items-center justify-between p-4 bg-cream rounded-lg border border-border">
        <div>
          <span className="font-medium text-ink">Expérience en startup</span>
          <p className="text-sm text-ink-2">Avez-vous déjà créé ou participé à une startup ?</p>
        </div>
        <button
          onClick={() => setForm((f: any) => ({ ...f, has_previous_startup: !f.has_previous_startup }))}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            form.has_previous_startup ? 'bg-moss' : 'bg-border'
          }`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            form.has_previous_startup ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </button>
      </div>

      {/* Boutons */}
      <div className="flex justify-end gap-3 mt-6">
  <button
    onClick={onPrevious}
    className="px-4 py-2 border border-border rounded-lg text-ink-2 hover:bg-cream transition"
  >
    Précédent
  </button>
  <button
    onClick={onNext}
    disabled={isLoading}
    className="bg-moss text-white px-6 py-2 rounded-lg font-medium hover:bg-moss-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {isLoading ? 'Enregistrement...' : 'Continuer'}
  </button>
</div>
  
    </div>
  );
}