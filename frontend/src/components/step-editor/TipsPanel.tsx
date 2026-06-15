'use client';

import { useState } from 'react';
import { Lightbulb, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TipsPanel({
  tips = [], examples = [], defaultOpen = false,
}: {
  tips?: string[];
  examples?: string[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  if (!tips.length && !examples.length) return null;

  return (
    <div className="border border-moss/15 rounded-[10px] overflow-hidden mb-4">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-[10px_14px] bg-amber-light/20 hover:bg-amber-light/40 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Lightbulb size={13} className="text-amber-dark" />
          <span className="text-[11px] font-bold text-ink">Conseils & exemples</span>
        </div>
        {open ? <ChevronUp size={13} className="text-ink3" /> : <ChevronDown size={13} className="text-ink3" />}
      </button>

      {open && (
        <div className="p-[10px_14px] space-y-3">
          {tips.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-ink2 uppercase tracking-[0.06em] mb-2">Conseils</p>
              <ul className="space-y-1">
                {tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12px] text-ink2">
                    <span className="text-amber-dark mt-0.5 flex-shrink-0">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {examples.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-ink2 uppercase tracking-[0.06em] mb-2">Exemples</p>
              <ul className="space-y-1">
                {examples.map((ex, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12px] text-ink2">
                    <Star size={11} className="text-amber-dark mt-0.5 flex-shrink-0" />
                    <span className="italic">{ex}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
