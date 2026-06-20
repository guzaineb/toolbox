'use client';

import { TOOL_STEP_MAPPING, ToolKey } from '@/types/switchers';
import { Progress } from '@/components/shared/ui';
import { cn } from '@/lib/utils';

const toolKeys = Object.keys(TOOL_STEP_MAPPING) as ToolKey[];

function pctColor(pct: number) {
  if (pct > 75) return 'text-moss';
  if (pct > 25) return 'text-amber-dark';
  return 'text-ink3';
}

export function ToolProgressCard({ toolProgress }: { toolProgress: Record<string, number> }) {
  return (
    <div className="glass rounded-[14px] p-5">
      <h3 className="text-[13px] font-bold text-ink mb-4 uppercase tracking-[0.04em]">
        Progression des outils
      </h3>
      <div className="space-y-4">
        {toolKeys.map((key) => {
          const pct = toolProgress[key] ?? 0;
          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[13px] text-ink">
                  {TOOL_STEP_MAPPING[key].label}
                </span>
                <span className={cn('text-[12px] font-semibold tabular-nums', pctColor(pct))}>
                  {pct}%
                </span>
              </div>
              <Progress value={pct} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
