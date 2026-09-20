// components/project-owner/OnboardingSteps.tsx
'use client';

interface OnboardingStepsProps {
  currentStep: 1 | 2 | 3;
}

const steps = [
  { number: 1, label: 'Informations de base' },
  { number: 2, label: 'Expérience entrepreneuriale' },
  { number: 3, label: 'Compétences & expériences' },
];

export function OnboardingSteps({ currentStep }: OnboardingStepsProps) {
  const progress = ((currentStep - 1) / 2) * 100;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step) => (
          <div key={step.number} className="flex flex-col items-center flex-1">
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                ${step.number === currentStep
                  ? 'bg-moss text-white'
                  : step.number < currentStep
                  ? 'bg-moss-light text-moss'
                  : 'bg-cream text-ink-2 border border-border'
                }
              `}
            >
              {step.number < currentStep ? '✓' : step.number}
            </div>
            <span className="text-xs mt-2 text-ink-2 text-center hidden sm:block">
              {step.label}
            </span>
          </div>
        ))}
      </div>
      <div className="completion-bar mt-4">
        <div className="completion-fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}