'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ExpertiseLevel, LEVEL_LABELS, LEVEL_COLORS } from '@/types/expert';

interface ExpertiseWithLevel {
  id: string;
  areaId: string;
  areaName: string;
  level: ExpertiseLevel;
  yearsOfExperience: number;
}

export function ExpertiseLevelEditor({ expertise, onUpdate, onRemove, saving }: {
  expertise: ExpertiseWithLevel;
  onUpdate: (level: ExpertiseLevel, years: number) => void;
  onRemove: () => void;
  saving?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [level, setLevel] = useState<ExpertiseLevel>(expertise.level);
  const [years, setYears] = useState(expertise.yearsOfExperience);

  const handleSave = () => {
    onUpdate(level, years);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setLevel(expertise.level);
    setYears(expertise.yearsOfExperience);
    setIsOpen(false);
  };

  const toggleOpen = () => setIsOpen(!isOpen);

  // Gestion du clavier pour l'accessibilité
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleOpen();
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* ✅ Remplacer <button> par <div role="button"> */}
      <div
        role="button"
        tabIndex={0}
        onClick={toggleOpen}
        onKeyDown={handleKeyDown}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-medium text-gray-900">{expertise.areaName}</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${LEVEL_COLORS[expertise.level]}`}>
            {LEVEL_LABELS[expertise.level]}
          </span>
          <span className="text-sm text-gray-500">{expertise.yearsOfExperience} ans</span>
        </div>

        <div className="flex items-center gap-2">
          {/* ✅ Bouton enfant valide (aucun bouton parent) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            disabled={saving}
            className="text-red-500 hover:text-red-700 text-sm disabled:opacity-50"
          >
            Retirer
          </button>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {isOpen && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Niveau d'expertise
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as ExpertiseLevel)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
              >
                <option value="junior">Junior - Connaissances de base</option>
                <option value="intermediate">Intermédiaire - Pratique régulière</option>
                <option value="senior">Senior - Maîtrise avancée</option>
                <option value="expert">Expert - Référence dans le domaine</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Années d'expérience
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={years}
                onChange={(e) => setYears(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-3 py-1 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              Enregistrer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}