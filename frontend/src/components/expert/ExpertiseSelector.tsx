'use client';

import { ExpertiseArea } from '@/types/expert';
import { useMemo } from 'react';

interface Props {
  areas: ExpertiseArea[];
  selected: string[]; // ids
  onChange: (ids: string[]) => void;
  max?: number;
}

export function ExpertiseAreaSelector({ areas, selected, onChange, max = 8 }: Props) {
  // Grouper par catégorie
  const grouped = useMemo(() => {
    const map = new Map<string, ExpertiseArea[]>();
    for (const area of areas) {
      if (!map.has(area.category)) map.set(area.category, []);
      map.get(area.category)!.push(area);
    }
    return map;
  }, [areas]);

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      if (max && selected.length >= max) return;
      onChange([...selected, id]);
    }
  };

  return (
    <div>
      {Array.from(grouped.entries()).map(([category, items]) => (
        <div key={category} style={{ marginBottom: '20px' }}>
          <div style={{
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '.1em',
            textTransform: 'uppercase',
            color: '#999',
            marginBottom: '8px',
          }}>
            {category}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
            {items.map((area) => {
              const isSelected = selected.includes(area.id);
              const isDisabled = !isSelected && selected.length >= max;
              return (
                <button
                  key={area.id}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => toggle(area.id)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '100px',
                    fontSize: '12.5px',
                    fontWeight: isSelected ? 600 : 400,
                    border: `1.5px solid ${isSelected ? '#1a1a2e' : '#e8e5df'}`,
                    background: isSelected ? '#1a1a2e' : '#fff',
                    color: isSelected ? '#fff' : isDisabled ? '#ccc' : '#333',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    transition: 'all .15s',
                    opacity: isDisabled ? 0.5 : 1,
                  }}
                >
                  {isSelected && <span style={{ marginRight: '4px' }}>✓</span>}
                  {area.name}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
        {selected.length} / {max} domaines sélectionnés
      </div>
    </div>
  );
}
