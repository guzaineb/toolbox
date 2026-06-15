'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/shared/ui';
import { GuidedQuestion } from '@/data/pedagogical-content';

const QUADRANTS = ['Forces', 'Faiblesses', 'Opportunités', 'Menaces'] as const;

const QUADRANT_COLORS: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  Forces: { bg: 'bg-blue-light/40', border: 'border-blue/20', text: 'text-blue', icon: '💪' },
  Faiblesses: { bg: 'bg-red-light/40', border: 'border-red/20', text: 'text-red', icon: '⚠️' },
  Opportunités: { bg: 'bg-moss-light/40', border: 'border-moss/20', text: 'text-moss', icon: '🌟' },
  Menaces: { bg: 'bg-amber-light/40', border: 'border-amber/30', text: 'text-amber-dark', icon: '⚡' },
};

export function SWOTAnalysis({
  label, hint, value, onChange, subQuestions,
}: {
  label: string;
  hint?: string;
  value: any;
  onChange: (value: any) => void;
  subQuestions?: GuidedQuestion[];
}) {
  const [expanded, setExpanded] = useState(true);

  const quadrantData = subQuestions && subQuestions.length === 4
    ? subQuestions
    : QUADRANTS.map((name) => ({ question: name, type: 'text' as const, subQuestions: [] }));

  const getQuadrantValue = (quadrantIndex: number) => {
    if (Array.isArray(value)) return value[quadrantIndex] || {};
    if (typeof value === 'object' && value !== null) return value[quadrantIndex] || {};
    return {};
  };

  const updateQuadrant = (quadrantIndex: number, fieldIndex: number, fieldValue: string) => {
    const current = Array.isArray(value) ? [...value] : quadrantData.map(() => ({}));
    const q = { ...(current[quadrantIndex] || {}) };
    q[fieldIndex] = fieldValue;
    current[quadrantIndex] = q;
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
            {quadrantData.map((quadrant, qi) => {
              const colors = QUADRANT_COLORS[quadrant.question] || QUADRANT_COLORS.Forces;
              const qValue = getQuadrantValue(qi);

              return (
                <div
                  key={qi}
                  className={cn('rounded-[10px] border p-[12px]', colors.bg, colors.border)}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-[14px]">{colors.icon}</span>
                    <span className={cn('text-[11px] font-bold uppercase tracking-[0.05em]', colors.text)}>
                      {quadrant.question}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {(quadrant.subQuestions?.length
                      ? quadrant.subQuestions
                      : [{ question: `Point clé pour "${quadrant.question}"`, type: 'text' as const }]
                    ).map((sq, fi) => (
                      <div key={fi}>
                        <label className="text-[10px] text-ink3 block mb-0.5">{sq.question}</label>
                        <Input
                          value={(qValue[fi] || qValue[sq.question] || '') as string}
                          onChange={(e) => updateQuadrant(qi, fi, e.target.value)}
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
