'use client';

import { Check } from 'lucide-react';
import { getStadeFromProgress, STADE_LABELS, StadeKey } from '@/types/switchers';
import { cn } from '@/lib/utils';

const STAGES: StadeKey[] = ['ideation', 'creation', 'amorcage', 'scaling'];

interface StadeIndicatorProps {
  percentage: number;
}

export function StadeIndicator({ percentage }: StadeIndicatorProps) {
  const currentStade = getStadeFromProgress(percentage);
  const currentIndex = STAGES.indexOf(currentStade);

  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <div className="flex items-center justify-between">
        {STAGES.map((key, idx) => {
          const isCompleted = idx < currentIndex;
          const isActive = idx === currentIndex;
          const isFuture = idx > currentIndex;

          return (
            <div key={key} className="flex-1 flex items-center">
              <div className="flex flex-col items-center relative w-full">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all border-2',
                  isCompleted && 'bg-green-500 border-green-500 text-white',
                  isActive && 'bg-accent border-accent text-white shadow-md',
                  isFuture && 'bg-surface border-border text-text-3'
                )}>
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                <span className={cn(
                  'mt-2 text-xs font-medium whitespace-nowrap',
                  isActive && 'text-accent',
                  isCompleted && 'text-green-600',
                  isFuture && 'text-text-3'
                )}>
                  {STADE_LABELS[key]}
                </span>
              </div>
              {idx < STAGES.length - 1 && (
                <div className={cn(
                  'flex-1 h-1 mx-2 rounded-full -mt-6',
                  idx < currentIndex ? 'bg-green-400' : 'bg-border'
                )} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
