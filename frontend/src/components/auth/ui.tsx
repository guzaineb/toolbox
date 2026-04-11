"use client";

import { Lang } from "@/i18n/auth"; 
import { cn } from "@/lib/utils";
import React, { forwardRef } from "react";

// ─── LangBar ─────────────────────────────────────────────────────────────────
export const LangBar: React.FC<{ lang: Lang; onChange: (l: Lang) => void }> = ({ lang, onChange }) => (
  <div className="flex gap-1.5 justify-end mb-5">
    {(["fr", "en", "ar"] as Lang[]).map((l) => (
      <button
        key={l}
        type="button"
        onClick={() => onChange(l)}
        className={`px-3 py-1 rounded-full text-xs border transition-all ${
          lang === l
            ? "bg-violet-50 border-violet-300 text-violet-700 font-medium"
            : "bg-white border-gray-200 text-gray-400 hover:border-gray-300"
        }`}
      >
        {l === "ar" ? "ع" : l.toUpperCase()}
      </button>
    ))}
  </div>
);

// ─── Stepper ──────────────────────────────────────────────────────────────────
interface StepperProps {
  step: 1 | 2;
  label1: string;
  label2: string;
}
export const Stepper: React.FC<StepperProps> = ({ step, label1, label2 }) => (
  <div className="flex items-center justify-center mb-6">
    <div className="flex flex-col items-center">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
        step === 1 ? "bg-violet-600 text-white" : "bg-violet-100 text-violet-700 border-2 border-violet-600"
      }`}>
        {step > 1 ? (
          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
          </svg>
        ) : "1"}
      </div>
      <span className={`text-[10px] mt-1 font-medium ${step === 1 ? "text-violet-600" : "text-violet-500"}`}>{label1}</span>
    </div>
    <div className={`w-12 h-0.5 mb-3.5 mx-1 transition-colors ${step === 2 ? "bg-violet-600" : "bg-gray-200"}`} />
    <div className="flex flex-col items-center">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
        step === 2 ? "bg-violet-600 text-white" : "bg-gray-100 text-gray-400 border border-gray-200"
      }`}>2</div>
      <span className={`text-[10px] mt-1 font-medium ${step === 2 ? "text-violet-600" : "text-gray-400"}`}>{label2}</span>
    </div>
  </div>
);

// ─── Input ───────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
  leftIcon?: React.ReactNode;
  rightEl?: React.ReactNode;
}
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, required, leftIcon, rightEl, className = "", ...props }, ref) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-600">
        {label}{required && <span className="text-violet-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          className={`
            w-full bg-gray-50 border rounded-xl px-3.5 py-2.5 text-sm text-gray-800
            placeholder:text-gray-300 outline-none transition-all duration-150
            ${leftIcon ? "pl-9" : ""}
            ${rightEl ? "pr-10" : ""}
            ${error
              ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
              : "border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 hover:border-gray-300"
            }
            ${className}
          `}
          {...props}
        />
        {rightEl && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">{rightEl}</span>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
);
Input.displayName = "Input";

// ─── Select ───────────────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
}
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, children, className = "", ...props }, ref) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      <select
        ref={ref}
        className={`
          w-full bg-gray-50 border rounded-xl px-3.5 py-2.5 text-sm text-gray-800
          outline-none transition-all cursor-pointer appearance-none
          ${error ? "border-red-400" : "border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 hover:border-gray-300"}
          ${className}
        `}
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%239ca3af' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
);
Select.displayName = "Select";

// ─── Button ───────────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost";
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode
}
export const Button: React.FC<ButtonProps> = ({
  variant = "primary", loading, fullWidth, children, className = "", disabled, ...props
}) => {
  const base = "inline-flex items-center justify-center gap-2 rounded-xl font-medium text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white focus:ring-violet-400 px-5 py-2.5",
    outline: "bg-white border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-800 focus:ring-gray-300 px-5 py-2.5",
    ghost: "bg-transparent text-gray-400 hover:text-gray-600 focus:ring-gray-300 px-3 py-2",
  };
  return (
    <button className={`${base} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`} disabled={disabled || loading} {...props}>
      {loading ? (
        <>
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Chargement...
        </>
      ) : children}
    </button>
  );
};

// ─── ErrorAlert ───────────────────────────────────────────────────────────────
export const ErrorAlert: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
    <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-4.75a.75.75 0 001.5 0v-4.5a.75.75 0 00-1.5 0v4.5zm.75-7a.75.75 0 110 1.5.75.75 0 010-1.5z" clipRule="evenodd" />
    </svg>
    <p className="text-sm text-red-700">{message}</p>
  </div>
);

// ─── PasswordStrength ────────────────────────────────────────────────────────
export const PasswordStrength: React.FC<{ password: string; labels: [string,string,string,string] }> = ({ password, labels }) => {
  const checks = [
    password.length >= 6,
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const barColors = ["bg-gray-200", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-emerald-500"];
  if (!password) return null;
  return (
    <div className="mt-1.5">
      <div className="flex gap-1 mb-1.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < score ? barColors[score] : "bg-gray-100"}`} />
        ))}
      </div>
      <div className="flex gap-3 flex-wrap">
        {checks.map((ok, i) => (
          <span key={i} className={`text-[10px] font-medium ${ok ? "text-emerald-600" : "text-gray-300"}`}>
            {ok ? "✓" : "○"} {labels[i]}
          </span>
        ))}
      </div>
    </div>
  );
};

// ─── Avatar Initials ─────────────────────────────────────────────────────────
export const AvatarInitials: React.FC<{ firstName: string; lastName: string; size?: number }> = ({ firstName, lastName, size = 48 }) => {
  const initials = `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
  return (
    <div style={{ width: size, height: size }} className="rounded-full bg-violet-100 border-2 border-dashed border-violet-300 flex items-center justify-center mx-auto mb-4">
      <span className="text-violet-600 font-semibold text-sm">{initials || "?"}</span>
    </div>
  );
};

// ─── SectionLabel ────────────────────────────────────────────────────────────
export const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-[10px] font-semibold tracking-widest text-violet-400 mb-3">{children}</p>
);
// ---- FIELD (label + input wrapper) ----
export function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('mb-[14px]', className)}>
      <label className="block text-[12px] font-medium text-text-2 mb-[5px]">{label}</label>
      {children}
    </div>
  )
}
export function Progress({ value }: { value: number }) {
  return (
    <div className="h-1 bg-border rounded-sm overflow-hidden">
      <div
        className="h-full bg-accent rounded-sm transition-all duration-400"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}