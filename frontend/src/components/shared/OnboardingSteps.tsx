'use client'
import { cn } from '@/lib/utils'

const STEPS = ['Profil', 'Rôle', 'Confirmation']

export function OnboardingSteps({ active }: { active: number }) {
  return (
    <div className="flex items-center mb-8">
      {STEPS.map((s, i) => {
        const stepNum = i + 1
        const isDone = stepNum < active
        const isActive = stepNum === active
        return (
          <div key={s} className="flex items-center flex-1">
            {i > 0 && <div className="flex-1 h-px bg-border mx-1.5" />}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className={cn(
                'w-[26px] h-[26px] rounded-full flex items-center justify-center text-[11px] font-semibold border-[1.5px] flex-shrink-0',
                isDone && 'bg-accent border-accent text-white',
                isActive && 'bg-text border-text text-white',
                !isDone && !isActive && 'border-border text-text-3'
              )}>
                {isDone ? '✓' : stepNum}
              </div>
              <span className={cn(
                'text-[12px] whitespace-nowrap',
                isActive ? 'text-text font-medium' : 'text-text-3'
              )}>
                {s}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
