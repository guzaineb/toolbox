'use client';

import { useState } from 'react';
import { CreateExperienceDto } from '@/types/projectOwner';

interface ExperienceModalProps {
  onAdd: (exp: CreateExperienceDto) => Promise<void>;
  onClose: () => void;
  saving: boolean;
}

export function ExperienceModal({ onAdd, onClose, saving }: ExperienceModalProps) {
  const [form, setForm] = useState<CreateExperienceDto>({
    title: '',
    organization: '',
    description: '',
    start_date: '',
    end_date: '',
  });
  const [localSaving, setLocalSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.organization.trim()) return;
    setLocalSaving(true);
    try {
      await onAdd(form);
      // Réinitialiser
      setForm({ title: '', organization: '', description: '', start_date: '', end_date: '' });
      onClose();
    } catch (err) {
      console.error("Erreur lors de l'ajout de l'expérience", err);
    } finally {
      setLocalSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-xl p-6 max-w-md w-full shadow-xl animate-slideIn">
        <h3 className="text-lg font-semibold text-ink mb-4">Ajouter une expérience</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Titre <span className="text-red">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Chef de produit, Développeur, Fondateur..."
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-moss/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Organisation <span className="text-red">*</span>
            </label>
            <input
              type="text"
              value={form.organization}
              onChange={(e) => setForm((f) => ({ ...f, organization: e.target.value }))}
              placeholder="Startup XYZ, Entreprise ABC..."
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-moss/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Décrivez vos responsabilités et réalisations..."
              rows={3}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-moss/50"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                Date de début
              </label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-moss/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                Date de fin
              </label>
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-moss/50"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 border border-border rounded-lg text-ink-2 hover:bg-cream">
            Annuler
          </button>
          <button onClick={handleSubmit} disabled={saving || localSaving}   className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50">
            {saving || localSaving ? 'Ajout...' : 'Ajouter'}
          </button>
        </div>
      </div>
    </div>
  );
}