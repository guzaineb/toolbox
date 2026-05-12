import { cn } from "@/lib/utils";
import { AuthTranslation } from "@/i18n/auth";

export function StepIndicator({ currentStep, t }: { currentStep: number; t: AuthTranslation }) {
  const steps = [
    { number: 0, label: t.stepAccount },
    { number: 1, label: t.stepProfile },
    { number: 2, label: "Rôle" },
  ];
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, idx) => (
          <div key={step.number} className="flex-1 flex items-center">
            <div className="flex flex-col items-center relative">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                currentStep === step.number ? "bg-accent text-white" :
                currentStep > step.number ? "bg-accent/30 text-accent" : "bg-border text-text-2"
              )}>
                {currentStep > step.number ? "✓" : step.number + 1}
              </div>
              <span className={cn("absolute top-10 text-xs whitespace-nowrap",
                currentStep === step.number ? "text-accent font-medium" : "text-text-2"
              )}>{step.label}</span>
            </div>
            {idx < steps.length - 1 && (
              <div className={cn("flex-1 h-[2px] mx-2 transition-colors",
                currentStep > step.number ? "bg-accent" : "bg-border"
              )} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}