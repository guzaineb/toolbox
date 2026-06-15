'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Textarea } from '@/components/shared/ui';
import { GuidedQuestion } from '@/data/pedagogical-content';

const BMC_BLOCKS = [
  { key: 'partenaires', label: 'Partenaires clés', color: 'bg-pink-50 border-pink-200', col: 1, row: 1 },
  { key: 'activites', label: 'Activités clés', color: 'bg-purple-50 border-purple-200', col: 2, row: 1 },
  { key: 'ressources', label: 'Ressources clés', color: 'bg-indigo-50 border-indigo-200', col: 3, row: 1 },
  { key: 'proposition', label: 'Proposition de valeur', color: 'bg-moss-light/40 border-moss/20', col: 2, row: 2, wide: true },
  { key: 'relation', label: 'Relation client', color: 'bg-orange-50 border-orange-200', col: 4, row: 1 },
  { key: 'canaux', label: 'Canaux', color: 'bg-amber-light/40 border-amber/20', col: 5, row: 1 },
  { key: 'segments', label: 'Segments clients', color: 'bg-red-light/40 border-red/20', col: 4, row: 2, wide: true ? false : undefined },
  { key: 'cout', label: 'Structure de coûts', color: 'bg-gray-50 border-gray-200 col-span-5', col: 1, row: 3, wide: true },
  { key: 'revenus', label: 'Flux de revenus', color: 'bg-blue-light/40 border-blue/20 col-span-5', col: 4, row: 3, wide: true },
];

export function BMCEditor({
  label, hint, value, onChange, subQuestions,
}: {
  label: string;
  hint?: string;
  value: any;
  onChange: (value: any) => void;
  subQuestions?: GuidedQuestion[];
}) {
  const [expanded, setExpanded] = useState(true);

  const blockValue = (blockKey: string) => {
    if (typeof value === 'object' && value !== null) return value[blockKey] || '';
    return '';
  };

  const updateBlock = (blockKey: string, val: string) => {
    onChange({ ...(typeof value === 'object' ? value || {} : {}), [blockKey]: val });
  };

  return (
    <div className="border border-border rounded-[12px] overflow-hidden mb-4">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-[12px_16px] bg-moss/[.04] hover:bg-moss/[.07] transition-colors"
      >
        <span className="text-[12px] font-bold text-ink uppercase tracking-[0.04em]">{label}</span>
        {expanded ? <ChevronUp size={14} className="text-ink3" /> : <ChevronDown size={14} className="text-ink3" />}
      </button>

      {expanded && (
        <div className="p-[12px]">
          {hint && <p className="text-[11px] text-ink3 mb-3 italic">{hint}</p>}

          <div className="grid grid-cols-5 gap-2">
            {BMC_BLOCKS.map((block) => (
              <div
                key={block.key}
                className={`rounded-[8px] border p-[8px] ${block.color} ${block.wide ? 'col-span-2' : ''}`}
                style={
                  block.key === 'proposition'
                    ? { gridRow: '1 / 3', gridColumn: '3 / 5' }
                    : block.key === 'segments'
                    ? {}
                    : block.key === 'cout'
                    ? { gridColumn: '1 / 4', gridRow: '3' }
                    : block.key === 'revenus'
                    ? { gridColumn: '4 / 6', gridRow: '3' }
                    : {}
                }
              >
                <span className="text-[9px] font-bold text-ink3 uppercase tracking-[0.06em] block mb-1">
                  {block.label}
                </span>
                <Textarea
                  value={blockValue(block.key)}
                  onChange={(e) => updateBlock(block.key, e.target.value)}
                  placeholder={`Décrivez ${block.label.toLowerCase()}...`}
                  rows={3}
                  className="text-[11px] px-[8px] py-[5px] min-h-[50px]"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
