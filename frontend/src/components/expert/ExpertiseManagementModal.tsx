import { ExpertiseLevel } from "@/types/expert";
import { ExpertiseSelector } from "./ExpertiseSelector";
import { useState } from "react";
import { X } from 'lucide-react';

export function ExpertiseManagementModal({
  allAreas,
  groupedAreas,
  currentExpertises,
  editingExpertise,
  onAdd,
  onUpdate,
  onClose,
  saving,
}: {
  allAreas: any[];
  groupedAreas: Record<string, any[]>;
  currentExpertises: any[];
  editingExpertise: any | null;
  onAdd: (areaId: string, level: ExpertiseLevel, years: number) => Promise<void>;
  onUpdate: (areaId: string, level: ExpertiseLevel, years: number) => Promise<void>;
  onClose: () => void;
  saving: boolean;
}) {
  const [step, setStep] = useState<'select' | 'configure'>('select');
  const [selectedAreaId, setSelectedAreaId] = useState<string>(editingExpertise?.areaId || '');
  const [level, setLevel] = useState<ExpertiseLevel>(editingExpertise?.level || 'intermediate');
  const [years, setYears] = useState<number>(editingExpertise?.years || 0);
  const [loading, setLoading] = useState(false);

  const selectedArea = allAreas.find(a => a.id === selectedAreaId);
  const isEdit = !!editingExpertise;
  const usedAreaIds = currentExpertises.map(c => c.expertiseArea.id);
  const availableAreas = allAreas.filter(area => !usedAreaIds.includes(area.id));

  const handleSelectArea = (areaId: string) => {
    setSelectedAreaId(areaId);
    setStep('configure');
  };

  const handleSave = async () => {
    if (!selectedAreaId) return;
    setLoading(true);
    try {
      if (isEdit) {
        await onUpdate(selectedAreaId, level, years);
      } else {
        await onAdd(selectedAreaId, level, years);
      }
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full mx-4 shadow-lg overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-ink">
              {isEdit ? 'Modifier l’expertise' : (step === 'select' ? 'Ajouter un domaine' : 'Configurer l’expertise')}
            </h3>
            <button onClick={onClose} className="text-ink3 hover:text-ink">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {step === 'select' && !isEdit && (
            <ExpertiseSelector
              areas={availableAreas}
              groupedAreas={groupedAreas}
              selectedIds={[]}
              onSelect={handleSelectArea}
              onRemove={() => {}}
              loading={false}
            />
          )}
          {(step === 'configure' || isEdit) && selectedArea && (
            <div className="space-y-4">
              <div className="p-4 bg-moss/[.03] rounded-lg border border-moss/10">
                <p className="text-sm text-ink3">Domaine sélectionné</p>
                <p className="font-medium text-ink">{selectedArea.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink2 mb-1">Niveau d’expertise</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as ExpertiseLevel)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-moss/30 focus:border-moss bg-white"
                >
                  <option value="junior">Junior</option>
                  <option value="intermediate">Intermédiaire</option>
                  <option value="senior">Senior</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink2 mb-1">Années d’expérience</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={years}
                  onChange={(e) => setYears(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-moss/30 focus:border-moss bg-white"
                />
              </div>
              {!isEdit && (
                <button type="button" onClick={() => setStep('select')} className="text-sm text-moss hover:text-moss/80">
                  ← Changer de domaine
                </button>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-border flex justify-end gap-3 bg-moss/[.02]">
          <button onClick={onClose} className="px-4 py-2 border border-border rounded-lg hover:bg-moss/5">
            Annuler
          </button>
          {(step === 'configure' || isEdit) && (
            <button
              onClick={handleSave}
              disabled={loading || saving}
              className="px-4 py-2 bg-moss text-white rounded-lg hover:bg-moss-dark disabled:opacity-50"
            >
              {loading || saving ? 'Enregistrement...' : (isEdit ? 'Mettre à jour' : 'Ajouter')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}