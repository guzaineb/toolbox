import { cn } from "@/lib/utils";

const ROLES = [
  { id: "owner", icon: "💡", label: "Porteur de projet", desc: "J'ai une idée à développer", bg: "bg-accent-light" },
  { id: "expert", icon: "🎓", label: "Expert", desc: "Je coache des startups", bg: "bg-amber-light" },
  { id: "incubator", icon: "🏢", label: "Membre incubateur", desc: "Je travaille en incubateur", bg: "bg-blue-light" },
];

interface StepRoleProps {
  formData: { role: string };
  errors: { role?: string };
  onRoleSelect: (role: string) => void;
  submitError: string | null;
  t: any;
}

export function StepRole({ formData, errors, onRoleSelect, submitError, t }: StepRoleProps) {
  return (
    <div className="step-animation">
      <h2 className="text-[18px] font-semibold mb-1">Quel est votre rôle ?</h2>
      <p className="text-[12px] text-text-2 mb-5">Vous pouvez avoir plusieurs rôles simultanément</p>
      {submitError && <div className="mb-4 text-sm text-red-500 bg-red-50 p-2 rounded">{submitError}</div>}
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        {ROLES.map(role => (
          <div key={role.id} onClick={() => onRoleSelect(role.id)}
            className={cn("border-[1.5px] rounded p-4 cursor-pointer transition-all",
              formData.role === role.id ? "border-accent bg-accent-light" : "border-border hover:border-border-strong"
            )}>
            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center text-[18px] mb-2.5", role.bg)}>
              {role.icon}
            </div>
            <div className="text-[13px] font-semibold mb-1">{role.label}</div>
            <div className="text-[11px] text-text-2">{role.desc}</div>
          </div>
        ))}
      </div>
      {errors.role && <span className="text-red-500 text-xs">{errors.role}</span>}
      <div className="bg-bg rounded-sm p-3 text-[12px] text-text-2 mb-4">
        Vous pourrez modifier vos rôles à tout moment dans les paramètres.
      </div>
    </div>
  );
}