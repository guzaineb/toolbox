'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/shared/ui';
import { PESTELData, PESTELDimension } from '@/types/switchers';

const DIMENSIONS = [
  { key: 'politique', label: 'Politique' },
  { key: 'economique', label: 'Économique' },
  { key: 'socioculturel', label: 'Socioculturel' },
  { key: 'technologique', label: 'Technologique' },
  { key: 'environnemental', label: 'Environnemental' },
  { key: 'legal', label: 'Légal' },
] as const;

const DIMENSION_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  politique: { bg: 'bg-blue-light/30', border: 'border-blue/15', text: 'text-blue' },
  economique: { bg: 'bg-moss-light/30', border: 'border-moss/15', text: 'text-moss' },
  socioculturel: { bg: 'bg-amber-light/30', border: 'border-amber/20', text: 'text-amber-dark' },
  technologique: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-600' },
  environnemental: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
  legal: { bg: 'bg-red-light/30', border: 'border-red/15', text: 'text-red' },
};

const QUESTION_QUOI = (label: string) =>
  `Quels sont les aspects ${label.toLowerCase()} qui peuvent influer sur votre entreprise ?`;

const QUESTION_COMMENT = `Comment cela va-t-il influer sur votre projet ?`;

interface PESTELAnalysisV2Props {
  label: string;
  hint?: string;
  value: PESTELData;
  onChange: (value: PESTELData) => void;
}

export function PESTELAnalysisV2({
  label,
  hint,
  value,
  onChange,
}: PESTELAnalysisV2Props) {
  const [expanded, setExpanded] = useState(true);

  const updateDimension = (key: string, field: 'quoi' | 'comment', val: string) => {
    const current: PESTELDimension = value[key as keyof PESTELData] || { quoi: '', comment: '' };
    onChange({
      ...value,
      [key]: { ...current, [field]: val },
    });
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
            {DIMENSIONS.map((dim) => {
              const colors = DIMENSION_COLORS[dim.key] || DIMENSION_COLORS.politique;
              const dimValue: PESTELDimension = value[dim.key as keyof PESTELData] || { quoi: '', comment: '' };

              return (
                <div
                  key={dim.key}
                  className={cn('rounded-[10px] border p-[12px]', colors.bg, colors.border)}
                >
                  <span className={cn('text-[11px] font-bold uppercase tracking-[0.05em] block mb-2', colors.text)}>
                    {dim.label}
                  </span>

                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] text-ink3 block mb-0.5">
                        {QUESTION_QUOI(dim.label)}
                      </label>
                      <Textarea
                        value={dimValue.quoi}
                        onChange={(e) => updateDimension(dim.key, 'quoi', e.target.value)}
                        placeholder="Ex: ..."
                        className="text-[12px] px-[10px] py-[6px] min-h-[52px]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-ink3 block mb-0.5">
                        {QUESTION_COMMENT}
                      </label>
                      <Textarea
                        value={dimValue.comment}
                        onChange={(e) => updateDimension(dim.key, 'comment', e.target.value)}
                        placeholder="Ex: ..."
                        className="text-[12px] px-[10px] py-[6px] min-h-[52px]"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
