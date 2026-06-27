'use client';

import { useState, useRef } from 'react';
import { Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SubSectionContent } from '@/data/pedagogical-content';
import { Progress } from '@/components/shared/ui';
import { TipsPanel } from './TipsPanel';
import { GuidedField } from './GuidedField';

export function SubSectionCard({
  section, content, onChange, index,
}: {
  section: SubSectionContent;
  content: Record<string, any>;
  onChange: (key: string, value: any) => void;
  index: number;
}) {
  const [expanded, setExpanded] = useState(index === 0);
  const ref = useRef<HTMLDivElement>(null);

  const COMPLEX_TYPES = ['pestel_v2', 'stakeholder_matrix', 'customer_segment', 'value_proposition', 'discovery_card'];
  const RECAP_TYPES = ['step_recap'];

  const filledCount = section.guidedQuestions.filter((gq) => {
    if (RECAP_TYPES.includes(gq.type)) {
      return true;
    }
    if (COMPLEX_TYPES.includes(gq.type)) {
      const val = content[section.key];
      if (gq.type === 'pestel_v2') {
        return val && typeof val === 'object' && Object.values(val).some((d: any) => d?.quoi || d?.comment);
      }
      if (gq.type === 'stakeholder_matrix') {
        return Array.isArray(val) && val.length > 0;
      }
      if (gq.type === 'customer_segment') {
        return Array.isArray(val) && val.length > 0;
      }
      if (gq.type === 'value_proposition') {
        return val && typeof val === 'object' && (val.productsServices?.length > 0 || val.greenValue || val.socialValue);
      }
      if (gq.type === 'discovery_card') {
        return Array.isArray(val) && val.length > 0;
      }
      return false;
    }
    const val = content[section.key]?.[gq.question];
    return val !== undefined && val !== '' && !(Array.isArray(val) && val.length === 0);
  }).length;

  const totalQuestions = section.guidedQuestions.length;
  const progress = totalQuestions > 0 ? Math.round((filledCount / totalQuestions) * 100) : 0;

  const handleFieldChange = (questionText: string, value: any, gqType?: string) => {
    const sectionKey = section.key;
    if (gqType && RECAP_TYPES.includes(gqType)) {
      return;
    }
    if (gqType && COMPLEX_TYPES.includes(gqType)) {
      onChange(sectionKey, value);
      return;
    }
    const current = { ...(content[sectionKey] || {}) };
    current[questionText] = value;
    onChange(sectionKey, current);
  };

  const getFieldValue = (questionText: string, gqType?: string) => {
    if (gqType && COMPLEX_TYPES.includes(gqType)) {
      return content[section.key] ?? null;
    }
    return content[section.key]?.[questionText] ?? '';
  };

  return (
    <div ref={ref} className={cn('bg-surface border border-border rounded-[14px] shadow-sm overflow-hidden')}>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-[14px_18px] hover:bg-moss/[.03] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-[7px] h-[7px] rounded-full bg-moss/30 flex-shrink-0" />
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-ink3 uppercase tracking-[0.06em]">
                Section {index + 1}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-ink3">
                <Clock size={9} /> {section.estimatedMinutes} min
              </span>
            </div>
            <span className="text-[13px] font-bold text-ink">{section.label}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {progress > 0 && (
            <span className="text-[10px] text-moss font-medium">{progress}%</span>
          )}
          {expanded ? <ChevronUp size={15} className="text-ink3" /> : <ChevronDown size={15} className="text-ink3" />}
        </div>
      </button>

      {progress > 0 && (
        <div className="px-[18px] pb-[4px]">
          <Progress value={progress} />
        </div>
      )}

      {expanded && (
        <div className="p-[0_18px_18px] space-y-4">
          <div>
            <p className="text-[11px] font-bold text-moss mb-0.5">Objectif</p>
            <p className="text-[12px] text-ink2 leading-relaxed">{section.objective}</p>
          </div>

          <div>
            <p className="text-[11px] font-bold text-amber-dark mb-0.5">Pourquoi c&apos;est important</p>
            <p className="text-[12px] text-ink2 leading-relaxed">{section.whyImportant}</p>
          </div>

          <TipsPanel tips={section.tips} examples={section.examples} />

          <div className="space-y-4 pt-2">
            {section.guidedQuestions.map((gq, qi) => {
              const fieldValue = getFieldValue(gq.question, gq.type);

              if (COMPLEX_TYPES.includes(gq.type)) {
                return (
                  <GuidedField
                    key={qi}
                    question={gq}
                    value={fieldValue}
                    onChange={(val) => handleFieldChange(gq.question, val, gq.type)}
                    depth={0}
                  />
                );
              }

              return (
                <GuidedField
                  key={qi}
                  question={gq}
                  value={fieldValue}
                  onChange={(val) => handleFieldChange(gq.question, val)}
                  depth={0}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
