import { cn } from "@/lib/utils";
import { AuthTranslation } from "@/i18n/auth";
import { useState } from "react";

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
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onConfirmPasswordChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  passwordStrength: number;
  serverError?: string | null;
  t: AuthTranslation;
}

// Fonction pour évaluer le score du mot de passe (comme dans PasswordField)
function scorePassword(pw: string) {
  const hasLen = pw.length >= 8;
  const hasUp = /[A-Z]/.test(pw);
  const hasLo = /[a-z]/.test(pw);
  const hasNum = /[0-9]/.test(pw);
  const hasSp = /[^A-Za-z0-9]/.test(pw);
  const isLong = pw.length >= 12;
  const score = [hasLen, hasUp, hasLo, hasNum, hasSp, isLong].filter(Boolean).length;
  return { score, hasLen, hasUp, hasLo, hasNum, hasSp, isLong };
}

function levelInfo(score: number, empty: boolean) {
  if (empty) return { label: 'Entrez un mot de passe', color: '#9ca3af', segs: 0 };
  if (score <= 1) return { label: 'Très faible', color: '#E24B4A', segs: 1 };
  if (score === 2) return { label: 'Faible', color: '#E24B4A', segs: 2 };
  if (score === 3) return { label: 'Moyen', color: '#EF9F27', segs: 3 };
  if (score === 4) return { label: 'Bon', color: '#1D9E75', segs: 4 };
  return { label: 'Excellent', color: '#085041', segs: 5 };
}

export function StepAccount({ 
  formData, 
  errors, 
  onUpdate, 
  onPasswordChange, 
  onConfirmPasswordChange,
  passwordStrength,
  serverError,
  t 
}: StepAccountProps) {
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { score, hasLen, hasUp, hasLo, hasNum, hasSp, isLong } = scorePassword(formData.password);
  const { label: strengthLabel, color, segs } = levelInfo(score, formData.password.length === 0);

  const rules = [
    { id: 'len', text: '8 caractères min.', ok: hasLen },
    { id: 'up', text: 'Majuscule', ok: hasUp },
    { id: 'lo', text: 'Minuscule', ok: hasLo },
    { id: 'nu', text: 'Chiffre', ok: hasNum },
    { id: 'sp', text: 'Caractère spécial', ok: hasSp },
    { id: 'long', text: '12+ caractères', ok: isLong },
  ];

  const getSegColor = (index: number) => {
    if (formData.password.length === 0) return 'bg-border';
    if (index <= segs) {
      if (segs <= 2) return 'bg-[#E24B4A]';
      if (segs === 3) return 'bg-[#EF9F27]';
      if (segs === 4) return 'bg-[#1D9E75]';
      return 'bg-[#085041]';
    }
    return 'bg-border';
  };

  const hasConfirmValue = formData.confirmPassword.length > 0;
  const matches = hasConfirmValue && formData.password === formData.confirmPassword;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-[18px] sm:text-[20px] font-semibold text-ink mb-1">
          Créer un compte
        </h2>
        <p className="text-[12px] sm:text-[13px] text-ink2">
          Rejoignez l'écosystème d'innovation
        </p>
      </div>

      {serverError && (
        <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          {serverError}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Prénom */}
        <div>
          <label className="block text-[10px] sm:text-[11px] font-semibold tracking-wide text-ink2 mb-1.5 uppercase">
            Prénom <span className="text-red">*</span>
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={onUpdate}
            placeholder="Mehdi"
            className={cn(
              "w-full px-3 sm:px-3.5 py-2 sm:py-2.5 border rounded-lg text-xs sm:text-sm text-ink bg-cream outline-none transition-all duration-200 focus:border-moss focus:bg-surface placeholder:text-ink3",
              errors.firstName ? "border-red focus:border-red" : "border-border"
            )}
          />
          {errors.firstName && (
            <p className="text-[10px] sm:text-[11px] text-red mt-1.5">{errors.firstName}</p>
          )}
        </div>

        {/* Nom */}
        <div>
          <label className="block text-[10px] sm:text-[11px] font-semibold tracking-wide text-ink2 mb-1.5 uppercase">
            Nom <span className="text-red">*</span>
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={onUpdate}
            placeholder="Trabelsi"
            className={cn(
              "w-full px-3 sm:px-3.5 py-2 sm:py-2.5 border rounded-lg text-xs sm:text-sm text-ink bg-cream outline-none transition-all duration-200 focus:border-moss focus:bg-surface placeholder:text-ink3",
              errors.lastName ? "border-red focus:border-red" : "border-border"
            )}
          />
          {errors.lastName && (
            <p className="text-[10px] sm:text-[11px] text-red mt-1.5">{errors.lastName}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div className="mb-3">
        <label className="block text-[10px] sm:text-[11px] font-semibold tracking-wide text-ink2 mb-1.5 uppercase">
          Email <span className="text-red">*</span>
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={onUpdate}
          placeholder="vous@example.com"
          className={cn(
            "w-full px-3 sm:px-3.5 py-2 sm:py-2.5 border rounded-lg text-xs sm:text-sm text-ink bg-cream outline-none transition-all duration-200 focus:border-moss focus:bg-surface placeholder:text-ink3",
            errors.email ? "border-red focus:border-red" : "border-border"
          )}
        />
        {errors.email && (
          <p className="text-[10px] sm:text-[11px] text-red mt-1.5">{errors.email}</p>
        )}
      </div>

      {/* Mot de passe avec icône 👁/🙈 */}
      <div className="mb-3">
        <label className="block text-[10px] sm:text-[11px] font-semibold tracking-wide text-ink2 mb-1.5 uppercase">
          Mot de passe <span className="text-red">*</span>
        </label>
        <div className="relative flex items-center">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={onPasswordChange}
            placeholder="Créez un mot de passe sécurisé"
            className={cn(
              "w-full px-3 sm:px-3.5 py-2 sm:py-2.5 border rounded-lg text-xs sm:text-sm text-ink bg-cream outline-none transition-all duration-200 focus:border-moss focus:bg-surface placeholder:text-ink3 pr-9 sm:pr-10",
              errors.password ? "border-red focus:border-red" : "border-border"
            )}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 sm:right-3 text-ink3 hover:text-ink2 transition-colors text-sm sm:text-base"
            aria-label="Afficher/masquer le mot de passe"
          >
            {showPassword ? '🙈' : '👁'}
          </button>
        </div>
        
        {errors.password && (
          <p className="text-[10px] sm:text-[11px] text-red mt-1.5">{errors.password}</p>
        )}

        {/* Barre de force du mot de passe - style PasswordField */}
        {formData.password.length > 0 && (
          <>
            <div className="flex gap-1 mt-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${getSegColor(i)}`}
                />
              ))}
            </div>
            <div className="flex justify-between items-center mt-1.5">
              <span className="text-[10px] sm:text-[11px] font-medium" style={{ color }}>
                {strengthLabel}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Liste des critères de sécurité */}
      {formData.password.length > 0 && (
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 mb-3">
          {rules.map((r) => (
            <div key={r.id} className={`flex items-center gap-1.5 text-[10px] sm:text-[11px] ${r.ok ? 'text-green-600' : 'text-ink3'}`}>
              <div className={`w-3 h-3 rounded-full border flex items-center justify-center text-[7px] sm:text-[8px] ${
                r.ok ? 'bg-moss-light border-moss text-moss' : 'border-border'
              }`}>
                {r.ok && '✓'}
              </div>
              {r.text}
            </div>
          ))}
        </div>
      )}

      {/* Confirmation mot de passe avec icône */}
      <div className="mb-6">
        <label className="block text-[10px] sm:text-[11px] font-semibold tracking-wide text-ink2 mb-1.5 uppercase">
          Confirmer le mot de passe <span className="text-red">*</span>
        </label>
        <div className="relative flex items-center">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={onConfirmPasswordChange || onUpdate}
            placeholder="Répétez le mot de passe"
            className={cn(
              "w-full px-3 sm:px-3.5 py-2 sm:py-2.5 border rounded-lg text-xs sm:text-sm text-ink bg-cream outline-none transition-all duration-200 focus:border-moss focus:bg-surface",
              matches && hasConfirmValue
                ? "border-green-500 pr-9"
                : hasConfirmValue && !matches
                ? "border-red"
                : "border-border",
              "pr-9 sm:pr-10"
            )}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-2 sm:right-3 text-ink3 hover:text-ink2 transition-colors text-sm sm:text-base"
            aria-label="Afficher/masquer la confirmation"
          >
            {showConfirmPassword ? '🙈' : '👁'}
          </button>
          {matches && hasConfirmValue && (
            <span className="absolute right-8 sm:right-9 text-green-500 text-sm pointer-events-none">✓</span>
          )}
        </div>
        {hasConfirmValue && (
          <p className={`text-[10px] sm:text-[11px] mt-1.5 ${matches ? 'text-green-600' : 'text-red'}`}>
            {matches ? 'Les mots de passe correspondent' : 'Les mots de passe ne correspondent pas'}
          </p>
        )}
        {errors.confirmPassword && !hasConfirmValue && (
          <p className="text-[10px] sm:text-[11px] text-red mt-1.5">{errors.confirmPassword}</p>
        )}
      </div>
    </div>
  );
}