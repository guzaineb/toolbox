'use client';

import { FileText } from 'lucide-react';

export function StepRecapField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[10px] border border-moss/15 bg-moss/[.03] p-[12px_14px]">
      <div className="flex items-start gap-2.5">
        <FileText size={14} className="text-moss/50 flex-shrink-0 mt-0.5" />
        <div className="min-w-0">
          <span className="text-[11px] font-bold text-moss uppercase tracking-[0.05em] block mb-1.5">
            {label}
          </span>
          {value ? (
            <p className="text-[12px] text-ink2 leading-relaxed whitespace-pre-wrap">
              {value}
            </p>
          ) : (
            <p className="text-[12px] text-ink3 italic">
              Données de l&apos;étape précédente non disponibles
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
