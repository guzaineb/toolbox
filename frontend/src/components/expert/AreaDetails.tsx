'use client';

import { Button, Select } from '@/components/shared/ui';
import { AreaLevel, ExpertiseArea } from '@/hooks/useExpertiseAreas';

interface AreaDetailsProps {
  selectedAreaIds: string[];
  allAreas: ExpertiseArea[];
  areaLevels: Record<string, AreaLevel>;
  onUpdateLevel: (id: string, level: string) => void;
  onUpdateYears: (id: string, years: number) => void;
  onSave: () => void;
  saving: boolean;
}

export function AreaDetails({
  selectedAreaIds,
  allAreas,
  areaLevels,
  onUpdateLevel,
  onUpdateYears,
  onSave,
  saving,
}: AreaDetailsProps) {
  if (selectedAreaIds.length === 0) return null;

  return (
    <>
      <div className="h-px bg-border my-4" />
      <div className="text-[11px] font-semibold uppercase tracking-[.06em] text-text-2 mb-2.5">
        Détail des expertises actives
      </div>

      {selectedAreaIds.map(id => {
        const area = allAreas.find(a => a.id === id);
        if (!area) return null;
        const lvl = areaLevels[id] ?? { level: 'Expert', years: 1 };

        return (
          <div key={id} className="flex items-center gap-3 py-3 border-b border-border last:border-none">
            <span className="text-[13px] font-medium flex-1">{area.name}</span>
            <Select
              className="!w-auto !text-[12px] !py-1 !px-2"
              value={lvl.level}
              onChange={e => onUpdateLevel(id, e.target.value)}
            >
              <option>Expert</option>
              <option>Intermédiaire</option>
              <option>Débutant</option>
            </Select>
            <input
              type="number"
              value={lvl.years}
              onChange={e => onUpdateYears(id, Number(e.target.value))}
              className="w-14 text-[12px] py-1 px-2 text-center border border-border rounded-sm ml-2 focus:border-accent outline-none"
            />
            <span className="text-[11px] text-text-2">ans</span>
          </div>
        );
      })}

      <Button variant="primary" className="text-[12px] mt-3" onClick={onSave} loading={saving}>
        Enregistrer les expertises
      </Button>
    </>
  );
}