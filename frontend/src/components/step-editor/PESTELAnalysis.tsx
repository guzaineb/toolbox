'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/shared/ui';
import { GuidedQuestion } from '@/data/pedagogical-content';

const DIMENSIONS = ['Politique', 'Économique', 'Socioculturel', 'Technologique', 'Environnemental', 'Légal'] as const;

const DIMENSION_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  Politique: { bg: 'bg-blue-light/30', border: 'border-blue/15', text: 'text-blue' },
  Économique: { bg: 'bg-moss-light/30', border: 'border-moss/15', text: 'text-moss' },
  Socioculturel: { bg: 'bg-amber-light/30', border: 'border-amber/20', text: 'text-amber-dark' },
  Technologique: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-600' },
  Environnemental: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
  Légal: { bg: 'bg-red-light/30', border: 'border-red/15', text: 'text-red' },
};

export function PESTELAnalysis({
  label, hint, value, onChange, subQuestions,
}: {
  label: string;
  hint?: string;
  value: any;
  onChange: (value: any) => void;
  subQuestions?: GuidedQuestion[];
}) {
  const [expanded, setExpanded] = useState(true);

  const dimensionData = subQuestions && subQuestions.length === 6
    ? subQuestions
    : DIMENSIONS.map((name) => ({ question: name, type: 'pestel' as const, subQuestions: [] }));

  const getDimValue = (dimIndex: number) => {
    if (Array.isArray(value)) return value[dimIndex] || {};
    if (typeof value === 'object' && value !== null) return value[dimIndex] || {};
    return {};
  };

  const updateDim = (dimIndex: number, fieldIndex: number, fieldValue: string) => {
    const current = Array.isArray(value) ? [...value] : dimensionData.map(() => ({}));
    const d = { ...(current[dimIndex] || {}) };
    d[fieldIndex] = fieldValue;
    current[dimIndex] = d;
    onChange(current);
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
            {dimensionData.map((dim, di) => {
              const colors = DIMENSION_COLORS[dim.question] || DIMENSION_COLORS.Politique;
              const dValue = getDimValue(di);

              return (
                <div
                  key={di}
                  className={cn('rounded-[10px] border p-[12px]', colors.bg, colors.border)}
                >
                  <span className={cn('text-[11px] font-bold uppercase tracking-[0.05em] block mb-2', colors.text)}>
                    {dim.question}
                  </span>

                  <div className="space-y-2">
                    {(dim.subQuestions?.length
                      ? dim.subQuestions
                      : [{ question: `Facteur ${di + 1}`, type: 'text' as const }]
                    ).map((sq, fi) => (
                      <div key={fi}>
                        <label className="text-[10px] text-ink3 block mb-0.5">{sq.question}</label>
                        <Input
                          value={(dValue[fi] || dValue[sq.question] || '') as string}
                          onChange={(e) => updateDim(di, fi, e.target.value)}
                          placeholder={sq.placeholder || `Ex: ...`}
                          className="text-[12px] px-[10px] py-[6px]"
                        />
                      </div>
                    ))}
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
