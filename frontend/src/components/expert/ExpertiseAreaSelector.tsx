// src/components/expert/ExpertiseAreaSelector.tsx
'use client';

import { ExpertiseArea } from '@/types/expert';

interface ExpertiseAreaSelectorProps {
  areas: ExpertiseArea[];
  selected: string[];
  onChange: (ids: string[]) => void;
  groupedAreas?: Record<string, ExpertiseArea[]>;
  max?: number;
}

export function ExpertiseAreaSelector({ 
  areas, 
  selected, 
  onChange, 
  groupedAreas: groupedAreasProp,
  max = 8 
}: ExpertiseAreaSelectorProps) {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((i) => i !== id));
    } else {
      if (selected.length < max) {
        onChange([...selected, id]);
      }
    }
  };

  // Si groupedAreas est fourni, l'utiliser, sinon grouper dynamiquement
  const grouped = groupedAreasProp || areas.reduce<Record<string, ExpertiseArea[]>>((acc, area) => {
    const cat = area.category || 'Autres';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(area);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Sélectionnez jusqu'à {max} domaines
        </div>
        <div className="text-sm font-medium text-gray-900">
          {selected.length}/{max}
        </div>
      </div>

      {Object.entries(grouped).map(([category, categoryAreas]) => (
        <div key={category}>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">{category}</h3>
          <div className="flex flex-wrap gap-2">
            {categoryAreas.map((area) => {
              const isSelected = selected.includes(area.id);
              return (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => toggle(area.id)}
                  disabled={!isSelected && selected.length >= max}
                  className={`
                    px-3 py-1.5 rounded-full text-sm font-medium transition-all
                    ${isSelected 
                      ? 'bg-gray-900 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                    ${(!isSelected && selected.length >= max) 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'cursor-pointer'
                    }
                  `}
                >
                  {area.name}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}