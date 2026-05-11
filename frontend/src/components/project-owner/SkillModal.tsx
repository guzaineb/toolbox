'use client';

import { useState } from 'react';
import { CreateSkillDto } from '@/types/projectOwner';

interface SkillModalProps {
  onAdd: (skill: CreateSkillDto) => Promise<void>;
  onClose: () => void;
  saving: boolean;
}

export function SkillModal({ onAdd, onClose, saving }: SkillModalProps) {
  const [skillName, setSkillName] = useState('');
  const [level, setLevel] = useState<CreateSkillDto['level']>('beginner');
  const [localSaving, setLocalSaving] = useState(false);

  const handleSubmit = async () => {
    if (!skillName.trim()) return;
    setLocalSaving(true);
    try {
      await onAdd({ skill_name: skillName, level });
      // Réinitialiser le formulaire
      setSkillName('');
      setLevel('beginner');
      onClose(); // Fermer la modale après succès
    } catch (err) {
      console.error("Erreur lors de l'ajout de la compétence", err);
    } finally {
      setLocalSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-xl p-6 max-w-md w-full shadow-xl animate-slideIn">
        <h3 className="text-lg font-semibold text-ink mb-4">Ajouter une compétence</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Nom de la compétence
            </label>
            <input
              type="text"
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              placeholder="React, Python, Marketing..."
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-moss/50"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Niveau
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as any)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-moss/50 bg-surface"
            >
              <option value="beginner">🌱 Débutant</option>
              <option value="intermediate">📚 Intermédiaire</option>
              <option value="advanced">🚀 Avancé</option>
              <option value="expert">🏆 Expert</option>
            </select>
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