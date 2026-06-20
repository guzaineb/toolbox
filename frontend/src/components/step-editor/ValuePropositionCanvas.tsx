'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input, Textarea, Button } from '@/components/shared/ui';
import type { ValuePropositionCanvas as VPCanvas } from '@/types/switchers';

const SECTION_LABELS: Record<string, string> = {
  productsServices: 'Produits et services',
  painRelievers: 'Soulagement des douleurs',
  gainCreators: 'Créateurs de gains',
  greenValue: 'Valeur ajoutée environnementale',
  socialValue: 'Valeur ajoutée sociale',
  customerSegment: 'Segment client ciblé',
};

const SECTION_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  productsServices: { bg: 'bg-blue-light/30', border: 'border-blue/15', text: 'text-blue' },
  painRelievers: { bg: 'bg-moss-light/30', border: 'border-moss/15', text: 'text-moss' },
  gainCreators: { bg: 'bg-amber-light/30', border: 'border-amber/20', text: 'text-amber-dark' },
  greenValue: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
  socialValue: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-600' },
  customerSegment: { bg: 'bg-purple-light/30', border: 'border-purple/20', text: 'text-purple' },
};

interface ValuePropositionCanvasProps {
  label: string;
  hint?: string;
  value: VPCanvas;
  onChange: (value: VPCanvas) => void;
}

export function ValuePropositionCanvas({
  label, hint, value, onChange,
}: ValuePropositionCanvasProps) {
  const [expanded, setExpanded] = useState(true);
  const [newItems, setNewItems] = useState<Record<string, string>>({});

  const safeArr = (key: 'productsServices' | 'painRelievers' | 'gainCreators'): string[] =>
    value[key] || [];

  const addItem = (key: 'productsServices' | 'painRelievers' | 'gainCreators') => {
    const input = newItems[key]?.trim();
    if (!input) return;
    onChange({ ...value, [key]: [...safeArr(key), input] });
    setNewItems((prev) => ({ ...prev, [key]: '' }));
  };

  const removeItem = (key: 'productsServices' | 'painRelievers' | 'gainCreators', index: number) => {
    const arr = safeArr(key).filter((_, i) => i !== index);
    onChange({ ...value, [key]: arr });
  };

  const updateItem = (key: 'productsServices' | 'painRelievers' | 'gainCreators', index: number, val: string) => {
    const arr = [...safeArr(key)];
    arr[index] = val;
    onChange({ ...value, [key]: arr });
  };

  const renderStringList = (key: 'productsServices' | 'painRelievers' | 'gainCreators') => {
    const colors = SECTION_COLORS[key];
    const items = safeArr(key);
    return (
      <div className={cn('rounded-[10px] border p-[12px]', colors.bg, colors.border)}>
        <span className={cn('text-[11px] font-bold uppercase tracking-[0.05em] block mb-2', colors.text)}>
          {SECTION_LABELS[key]}
        </span>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-1">
              <Input
                value={item}
                onChange={(e) => updateItem(key, i, e.target.value)}
                placeholder={`${SECTION_LABELS[key]}...`}
                className="text-[12px] px-[10px] py-[6px] flex-1"
              />
              <button
                type="button"
                onClick={() => removeItem(key, i)}
                className="text-ink3 hover:text-red transition-colors p-1 flex-shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <div className="flex items-center gap-1">
            <Input
              value={newItems[key] || ''}
              onChange={(e) => setNewItems((prev) => ({ ...prev, [key]: e.target.value }))}
              placeholder="Ajouter un élément..."
              className="text-[12px] px-[10px] py-[6px] flex-1"
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addItem(key); } }}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => addItem(key)}
              disabled={!newItems[key]?.trim()}
            >
              <Plus size={12} />
              Ajouter
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderTextField = (key: 'greenValue' | 'socialValue' | 'customerSegment') => {
    const colors = SECTION_COLORS[key];
    const isMultiline = key !== 'customerSegment';
    return (
      <div className={cn('rounded-[10px] border p-[12px]', colors.bg, colors.border)}>
        <span className={cn('text-[11px] font-bold uppercase tracking-[0.05em] block mb-2', colors.text)}>
          {SECTION_LABELS[key]}
        </span>
        {isMultiline ? (
          <Textarea
            value={value[key]}
            onChange={(e) => onChange({ ...value, [key]: e.target.value })}
            placeholder={`Décrivez ${SECTION_LABELS[key].toLowerCase()}...`}
            className="text-[12px] px-[10px] py-[6px] min-h-[72px]"
          />
        ) : (
          <Input
            value={value[key]}
            onChange={(e) => onChange({ ...value, [key]: e.target.value })}
            placeholder="Ex: ..."
            className="text-[12px] px-[10px] py-[6px]"
          />
        )}
      </div>
    );
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-3">
              {renderStringList('productsServices')}
              {renderStringList('painRelievers')}
              {renderStringList('gainCreators')}
            </div>
            <div className="space-y-3">
              {renderTextField('greenValue')}
              {renderTextField('socialValue')}
              {renderTextField('customerSegment')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
