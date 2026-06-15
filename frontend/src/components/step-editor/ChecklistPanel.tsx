'use client';

import { useState } from 'react';
import { CheckSquare, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ChecklistPanel({
  items,
}: {
  items: string[];
}) {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const toggle = (i: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const pct = items.length > 0 ? Math.round((checked.size / items.length) * 100) : 0;

  return (
    <div className="border border-border rounded-[10px] overflow-hidden">
      <div className="flex items-center justify-between p-[10px_14px] bg-moss/[.04] border-b border-border">
        <div className="flex items-center gap-2">
          <CheckSquare size={13} className="text-moss" />
          <span className="text-[11px] font-bold text-ink">Checklist</span>
        </div>
        <span className="text-[10px] text-ink3 font-medium">
          {checked.size}/{items.length} ({pct}%)
        </span>
      </div>

      {pct > 0 && (
        <div className="h-[2px] bg-moss/10">
          <div
            className="h-full bg-moss transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      <div className="p-[8px_6px] space-y-0.5">
        {items.map((item, i) => (
          <button
            key={i}
            type="button"
            onClick={() => toggle(i)}
            className="w-full flex items-start gap-2.5 p-[6px_8px] rounded-[6px] hover:bg-moss/[.04] transition-colors text-left"
          >
            {checked.has(i) ? (
              <CheckSquare size={14} className="text-moss mt-0.5 flex-shrink-0" />
            ) : (
              <Square size={14} className="text-ink3 mt-0.5 flex-shrink-0" />
            )}
            <span
              className={cn(
                'text-[12px] leading-relaxed',
                checked.has(i) ? 'text-ink3 line-through' : 'text-ink',
              )}
            >
              {item}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
