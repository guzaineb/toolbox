'use client';

import { ExpertiseArea } from '@/hooks/useExpertiseAreas';
import { cn } from '@/lib/utils';

interface ExpertiseSelectorProps {
  groupedAreas: Record<string, ExpertiseArea[]>;
  selectedAreaIds: string[];
  onToggleArea: (id: string) => void;
}

export function ExpertiseSelector({ groupedAreas, selectedAreaIds, onToggleArea }: ExpertiseSelectorProps) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-[.06em] text-text-2 mb-3">
        Domaines d'expertise
      </div>
      <div className="text-[12px] text-text-2 mb-3">
        Sélectionnez vos domaines (cliquez pour activer)
      </div>

      {Object.entries(groupedAreas).map(([cat, areas]) => (
        <div key={cat} className="mb-3">
          <div className="text-[11px] text-text-2 mb-1.5">{cat}</div>
          <div className="flex flex-wrap">
            {areas.map(area => (
              <button
                key={area.id}
                onClick={() => onToggleArea(area.id)}
                className={cn(
                  'inline-flex items-center gap-1 text-[12px] px-2.5 py-1 rounded-full border m-[3px] cursor-pointer transition-all',
                  selectedAreaIds.includes(area.id)
                    ? 'bg-accent-light text-accent border-accent'
                    : 'bg-bg text-text-2 border-border hover:border-accent'
                )}
              >
                {area.name}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}