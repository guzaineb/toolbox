// components/expert/ExpertiseSelector.tsx
'use client';

import { useState } from 'react';
import { Search, X, Plus } from 'lucide-react';
import { ExpertiseArea } from '@/types/expert';

interface ExpertiseSelectorProps {
  areas: ExpertiseArea[];
  groupedAreas: Record<string, ExpertiseArea[]>;
  selectedIds: string[];
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  loading?: boolean;
}

export function ExpertiseSelector({
  areas,
  groupedAreas,
  selectedIds,
  onSelect,
  onRemove,
  loading = false,
}: ExpertiseSelectorProps) {
  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(false);

  const filteredAreas = areas.filter(area =>
    area.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedAreas = areas.filter(area => selectedIds.includes(area.id));

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-200 rounded-lg" />
        <div className="h-20 bg-gray-200 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher un domaine d'expertise..."
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Domaines sélectionnés */}
      {selectedAreas.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm font-medium text-gray-700 mb-2">Sélectionnés ({selectedAreas.length})</p>
          <div className="flex flex-wrap gap-2">
            {selectedAreas.map(area => (
              <div key={area.id} className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 text-white rounded-full text-sm">
                {area.name}
                <button
                  type="button"
                  onClick={() => onRemove(area.id)}
                  className="hover:text-gray-300 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Liste des domaines disponibles */}
      <div className="max-h-80 overflow-y-auto space-y-4">
        {search ? (
          <div className="flex flex-wrap gap-2">
            {filteredAreas.map(area => (
              <button
                key={area.id}
                type="button"
                onClick={() => onSelect(area.id)}
                disabled={selectedIds.includes(area.id)}
                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                  selectedIds.includes(area.id)
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {area.name}
              </button>
            ))}
            {filteredAreas.length === 0 && (
              <p className="text-gray-500 text-sm">Aucun domaine trouvé</p>
            )}
          </div>
        ) : (
          Object.entries(groupedAreas).map(([category, categoryAreas]) => {
            const availableAreas = categoryAreas.filter(area => !selectedIds.includes(area.id));
            if (availableAreas.length === 0 && !showAll) return null;
            
            return (
              <div key={category}>
                <h4 className="text-sm font-medium text-gray-700 mb-2">{category}</h4>
                <div className="flex flex-wrap gap-2">
                  {availableAreas.slice(0, showAll ? undefined : 6).map(area => (
                    <button
                      key={area.id}
                      type="button"
                      onClick={() => onSelect(area.id)}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                    >
                      {area.name}
                    </button>
                  ))}
                </div>
              </div>
            );
          })
        )}
        
        {!search && (
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            {showAll ? 'Voir moins' : 'Voir plus de domaines'}
          </button>
        )}
      </div>
    </div>
  );
}