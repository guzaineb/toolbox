import { Field, Input, Progress } from "@/components/shared/ui";
import { AuthTranslation } from "@/i18n/auth";


interface StepAccountProps {
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
  };
  errors: {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  };
  onUpdate: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;  // ← typé
  passwordStrength: number;
  t: AuthTranslation;
}

export function StepAccount({ formData, errors, onUpdate, onPasswordChange, passwordStrength, t }: StepAccountProps) {
  const getStrengthLabel = () => {
    if (passwordStrength === 100) return "Mot de passe très fort";
    if (passwordStrength >= 75) return "Mot de passe fort";
    if (passwordStrength >= 50) return "Mot de passe moyen";
    if (passwordStrength > 0) return "Mot de passe faible";
    return "";
  };
  return (
    <div className="step-animation">
      <h1 className="text-[20px] font-semibold mb-1">{t.createAccount}</h1>
      <p className="text-[13px] text-text-2 mb-6">Rejoignez l'écosystème d'innovation</p>
      <div className="grid grid-cols-2 gap-3">
        <Field label={t.firstName}>
          <Input name="firstName" value={formData.firstName} onChange={onUpdate} placeholder="Mehdi" />
          {errors.firstName && <span className="text-red-500 text-xs">{errors.firstName}</span>}
        </Field>
        <Field label={t.lastName}>
          <Input name="lastName" value={formData.lastName} onChange={onUpdate} placeholder="Trabelsi" />
          {errors.lastName && <span className="text-red-500 text-xs">{errors.lastName}</span>}
        </Field>
      </div>
      <Field label={t.email}>
        <Input type="email" name="email" value={formData.email} onChange={onUpdate} placeholder="vous@example.com" />
        {errors.email && <span className="text-red-500 text-xs">{errors.email}</span>}
      </Field>
      <Field label={t.password}>
        <Input type="password" name="password" value={formData.password} onChange={onPasswordChange} />
        {errors.password && <span className="text-red-500 text-xs">{errors.password}</span>}
      </Field>
      <Field label={t.confirmPassword}>
        <Input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={onUpdate} />
        {errors.confirmPassword && <span className="text-red-500 text-xs">{errors.confirmPassword}</span>}
      </Field>
      {formData.password && (
        <div className="mb-[14px]">
          <Progress value={passwordStrength} />
          <span className="text-[11px] text-accent mt-1 block">{getStrengthLabel()}</span>
        </div>
      )}
    </div>
  );
}