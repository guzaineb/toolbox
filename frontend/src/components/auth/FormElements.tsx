'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

/* ── FormHead ── */
export function FormHead({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6 sm:mb-7 md:mb-8">
      <h1 className="font-syne text-xl sm:text-2xl font-bold text-ink mb-1">{title}</h1>
      <p className="text-xs sm:text-sm text-ink2">{subtitle}</p>
    </div>
  );
}

/* ── Field ── */
interface FieldProps {
  label: string;
  type?: string;
  value?: string;
  placeholder?: string;
  onChange?: (v: string) => void;
  rightSlot?: React.ReactNode;
  bottomSlot?: React.ReactNode;
  error?: string;
  register?: any;
  name?: string;
  required?: boolean;
}

export function Field({
  label,
  type = 'text',
  value,
  placeholder,
  onChange,
  rightSlot,
  bottomSlot,
  error,
  register,
  name,
  required,
}: FieldProps) {
  const inputProps = register && name ? register(name) : {};

  return (
    <div className="mb-3 sm:mb-3.5 md:mb-4 relative">
      <label className="block text-[10px] sm:text-[11px] font-semibold tracking-wide text-ink2 mb-1.5 uppercase">
        {label}
        {required && <span className="text-red ml-1">*</span>}
      </label>
      <div className="relative flex items-center">
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange?.(e.target.value)}
          className={`w-full px-3 sm:px-3.5 py-2 sm:py-2.5 border rounded-lg text-xs sm:text-sm text-ink bg-cream outline-none transition-all duration-200 focus:border-moss focus:bg-surface placeholder:text-ink3 ${
            error ? 'border-red focus:border-red' : 'border-border'
          } ${rightSlot ? 'pr-9 sm:pr-10' : ''}`}
          {...inputProps}
        />
        {rightSlot && (
          <span className="absolute right-3 text-ink3 text-sm pointer-events-none">
            {rightSlot}
          </span>
        )}
      </div>
      {error && (
        <p className="text-[10px] sm:text-[11px] text-red mt-1.5">{error}</p>
      )}
      {bottomSlot}
    </div>
  );
}

/* ── PasswordField ── */
interface PasswordFieldProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  confirmValue?: string;
  onConfirmChange?: (v: string) => void;
  showStrength?: boolean;
  showConfirm?: boolean;
  error?: string;
  register?: any;
  name?: string;
  required?: boolean;
}

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

export function PasswordField({
  label = 'Mot de passe',
  placeholder = 'Créez un mot de passe',
  value,
  onChange,
  confirmValue = '',
  onConfirmChange,
  showStrength = true,
  showConfirm = false,
  error,
  register,
  name,
  required,
}: PasswordFieldProps) {
  const [showPw, setShowPw] = useState(false);
  const { score, hasLen, hasUp, hasLo, hasNum, hasSp, isLong } = scorePassword(value);
  const { label: strengthLabel, color, segs } = levelInfo(score, value.length === 0);

  const rules = [
    { id: 'len', text: '8 caractères min.', ok: hasLen },
    { id: 'up', text: 'Majuscule', ok: hasUp },
    { id: 'lo', text: 'Minuscule', ok: hasLo },
    { id: 'nu', text: 'Chiffre', ok: hasNum },
    { id: 'sp', text: 'Caractère spécial', ok: hasSp },
    { id: 'long', text: '12+ caractères', ok: isLong },
  ];

  // Correction ici : utilisation de confirmValue avec valeur par défaut
  const hasConfirmValue = confirmValue && confirmValue.length > 0;
  const matches = hasConfirmValue && value === confirmValue;
  const inputProps = register && name ? register(name) : {};

  const getSegColor = (index: number) => {
    if (value.length === 0) return 'bg-border';
    if (index <= segs) {
      if (segs <= 2) return 'bg-[#E24B4A]';
      if (segs === 3) return 'bg-[#EF9F27]';
      if (segs === 4) return 'bg-[#1D9E75]';
      return 'bg-[#085041]';
    }
    return 'bg-border';
  };

  return (
    <div>
      <div className="mb-3 sm:mb-3.5 md:mb-4 relative">
        <label className="block text-[10px] sm:text-[11px] font-semibold tracking-wide text-ink2 mb-1.5 uppercase">
          {label}
          {required && <span className="text-red ml-1">*</span>}
        </label>
        <div className="relative flex items-center">
          <input
            type={showPw ? 'text' : 'password'}
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full px-3 sm:px-3.5 py-2 sm:py-2.5 border rounded-lg text-xs sm:text-sm text-ink bg-cream outline-none transition-all duration-200 focus:border-moss focus:bg-surface placeholder:text-ink3 pr-9 sm:pr-10 ${
              error ? 'border-red focus:border-red' : 'border-border'
            }`}
            autoComplete="new-password"
            {...inputProps}
          />
          <button
            type="button"
            onClick={() => setShowPw((p) => !p)}
            className="absolute right-2 sm:right-3 text-ink3 hover:text-ink2 transition-colors text-sm sm:text-base"
            aria-label="Afficher/masquer le mot de passe"
          >
            {showPw ? '🙈' : '👁'}
          </button>
        </div>
        {error && <p className="text-[10px] sm:text-[11px] text-red mt-1.5">{error}</p>}

        {showStrength && value.length > 0 && (
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

      {showStrength && value.length > 0 && (
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 mb-3 sm:mb-4">
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

      {showConfirm && onConfirmChange !== undefined && (
        <div className="mb-3 sm:mb-3.5 md:mb-4">
          <label className="block text-[10px] sm:text-[11px] font-semibold tracking-wide text-ink2 mb-1.5 uppercase">
            Confirmer
          </label>
          <div className="relative flex items-center">
            <input
              type={showPw ? 'text' : 'password'}
              value={confirmValue}
              placeholder="Répétez le mot de passe"
              onChange={(e) => onConfirmChange(e.target.value)}
              className={`w-full px-3 sm:px-3.5 py-2 sm:py-2.5 border rounded-lg text-xs sm:text-sm text-ink bg-cream outline-none transition-all duration-200 focus:border-moss focus:bg-surface ${
                matches && hasConfirmValue
                  ? 'border-green-500 pr-9'
                  : hasConfirmValue
                  ? 'border-red'
                  : 'border-border'
              }`}
              autoComplete="new-password"
            />
            {matches && hasConfirmValue && (
              <span className="absolute right-3 text-green-500 text-sm">✓</span>
            )}
          </div>
          {hasConfirmValue && (
            <p className={`text-[10px] sm:text-[11px] mt-1.5 ${matches ? 'text-green-600' : 'text-red'}`}>
              {matches ? 'Les mots de passe correspondent' : 'Les mots de passe ne correspondent pas'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Button ── */
export function BtnMain({children,onClick,type = 'button',disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="w-full py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-semibold font-syne tracking-wide bg-ink text-white cursor-pointer transition-all duration-200 hover:bg-[#2a2a24] hover:-translate-y-px active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-1"
    >
      {children}
    </button>
  );
}

export function BtnSecondary({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium border border-border bg-transparent text-ink cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 hover:border-border2 hover:bg-cream disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}

/* ── Divider ── */
export function Divider({ label = 'ou' }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 my-4 sm:my-5">
      <div className="flex-1 h-px bg-border" />
      <span className="text-[10px] sm:text-[11px] text-ink3">{label}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

/* ── FormLink ── */
export function FormLink({
  text,
  linkText,
  onClick,
}: {
  text: string;
  linkText: string;
  onClick: () => void;
}) {
  return (
    <p className="text-[11px] sm:text-xs text-ink2 text-center mt-3 sm:mt-4">
      {text}{' '}
      <button onClick={onClick} className="text-moss font-medium hover:underline cursor-pointer">
        {linkText}
      </button>
    </p>
  );
}





/* ── Grid2 ── */
export function Grid2({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
      {children}
    </div>
  );
}

/* ── ProgressBar ── */
export function ProgressBar({ steps, current }: { steps: number; current: number }) {
  return (
    <div className="flex items-center gap-2 mb-6 sm:mb-8">
      {Array.from({ length: steps }).map((_, i) => {
        const done = i < current - 1;
        const active = i === current - 1;
        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div
              className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-bold flex-shrink-0 ${
                done ? 'bg-moss text-white' : active ? 'bg-ink text-white' : 'bg-border text-ink3'
              }`}
            >
              {done ? '✓' : i + 1}
            </div>
            {i < steps - 1 && (
              <div className="flex-1 h-0.5 bg-border ml-2 first:ml-0 overflow-hidden rounded-full">
                <div
                  className={`h-full bg-moss rounded-full transition-all duration-300 ${
                    done ? 'w-full' : 'w-0'
                  }`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}