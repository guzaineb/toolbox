'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input, Textarea, Button } from '@/components/shared/ui';
import { StakeholderEntry } from '@/types/switchers';

interface StakeholderMatrixProps {
  label: string;
  hint?: string;
  value: StakeholderEntry[];
  onChange: (value: StakeholderEntry[]) => void;
}

const defaultEntry: StakeholderEntry = {
  name: '',
  influence: 1,
  impacted: 1,
  effects: '',
  actions: '',
};

export function StakeholderMatrix({ label, hint, value, onChange }: StakeholderMatrixProps) {
  const [expanded, setExpanded] = useState(true);

  const list = Array.isArray(value) ? value : [];

  const updateEntry = (index: number, field: keyof StakeholderEntry, fieldValue: string | number) => {
    const next = [...list];
    next[index] = { ...next[index], [field]: fieldValue };
    onChange(next);
  };

  const removeEntry = (index: number) => {
    const next = list.filter((_, i) => i !== index);
    onChange(next);
  };

  const addEntry = () => {
    onChange([...list, { ...defaultEntry }]);
  };

  return (
    <div className="border border-border rounded-[12px] overflow-hidden mb-4">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-[12px_16px] bg-moss/[.04] hover:bg-moss/[.07] transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-bold text-ink uppercase tracking-[0.04em]">{label}</span>
        </div>
        {expanded ? <ChevronUp size={14} className="text-ink3" /> : <ChevronDown size={14} className="text-ink3" />}
      </button>

      {hint && !expanded && (
        <p className="text-[11px] text-ink3 px-[16px] pb-[8px] italic">{hint}</p>
      )}

      {expanded && (
        <div className="p-[12px]">
          {hint && (
            <p className="text-[11px] text-ink3 mb-3 italic">{hint}</p>
          )}

          <div className="space-y-3">
            {list.map((entry, i) => (
              <div
                key={i}
                className="rounded-[10px] border border-moss/15 bg-moss-light/30 p-[12px]"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-ink3 font-semibold uppercase tracking-[0.05em]">
                    Partie prenante #{i + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeEntry(i)}
                    className="text-ink3 hover:text-red transition-colors cursor-pointer p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-[1fr_80px_80px] gap-2 mb-2">
                  <div>
                    <label className="text-[10px] text-ink3 block mb-0.5">Nom</label>
                    <Input
                      value={entry.name}
                      onChange={(e) => updateEntry(i, 'name', e.target.value)}
                      placeholder="Ex: Fournisseur"
                      className="text-[12px] px-[10px] py-[6px]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-ink3 block mb-0.5">Influence (1-5)</label>
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      value={entry.influence}
                      onChange={(e) => updateEntry(i, 'influence', Math.min(5, Math.max(1, Number(e.target.value) || 1)))}
                      className="text-[12px] px-[10px] py-[6px]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-ink3 block mb-0.5">Impacté (1-5)</label>
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      value={entry.impacted}
                      onChange={(e) => updateEntry(i, 'impacted', Math.min(5, Math.max(1, Number(e.target.value) || 1)))}
                      className="text-[12px] px-[10px] py-[6px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-ink3 block mb-0.5">Effets sur le projet</label>
                    <Textarea
                      value={entry.effects}
                      onChange={(e) => updateEntry(i, 'effects', e.target.value)}
                      placeholder="Décrivez les effets..."
                      className="text-[12px] px-[10px] py-[6px] min-h-[60px]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-ink3 block mb-0.5">Actions à entreprendre</label>
                    <Textarea
                      value={entry.actions}
                      onChange={(e) => updateEntry(i, 'actions', e.target.value)}
                      placeholder="Décrivez les actions..."
                      className="text-[12px] px-[10px] py-[6px] min-h-[60px]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addEntry}
            className="mt-3"
          >
            <Plus size={14} />
            Ajouter un partie prenante
          </Button>
        </div>
      )}
    </div>
  );
}
