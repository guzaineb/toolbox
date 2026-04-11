"use client";

import { useState } from "react";
import Link from "next/link";

import type { AuthTranslation } from "@/i18n/auth";
import { Input, Button, ErrorAlert, PasswordStrength } from "./ui";
import { Step1Data, Step1Errors } from "@/types/register";

interface Step1FormProps {
  data: Step1Data;
  errors: Step1Errors;
  serverError: string | null;
  loading: boolean;
  t: AuthTranslation;
  onFieldChange: <K extends keyof Step1Data>(k: K, v: Step1Data[K]) => void;
  onSubmit: () => void;
}

export function Step1Form({ data, errors, serverError, loading, t, onFieldChange, onSubmit }: Step1FormProps) {
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const EyeIcon = ({ visible }: { visible: boolean }) => (
    <svg className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer" viewBox="0 0 20 20" fill="currentColor">
      {visible ? (
        <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06L15.03 15.03A10.028 10.028 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41a1.651 1.651 0 010-1.186A10.004 10.004 0 014.97 4.97l-1.69-1.75zM7.75 6.69l1.09 1.09a2.5 2.5 0 003.38 3.38l1.09 1.09A4 4 0 017.75 6.69z" clipRule="evenodd" />
      ) : (
        <>
          <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
          <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41z" clipRule="evenodd" />
        </>
      )}
    </svg>
  );

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
      className="flex flex-col gap-3.5"
      noValidate
    >
      <div className="grid grid-cols-2 gap-3">
        <Input
          label={t.firstName} required
          placeholder="Jean"
          autoComplete="given-name"
          value={data.first_name}
          onChange={(e) => onFieldChange("first_name", e.target.value)}
          error={errors.first_name}
        />
        <Input
          label={t.lastName} required
          placeholder="Dupont"
          autoComplete="family-name"
          value={data.last_name}
          onChange={(e) => onFieldChange("last_name", e.target.value)}
          error={errors.last_name}
        />
      </div>

      <Input
        label={t.email} required
        type="email"
        placeholder="jean@example.com"
        autoComplete="email"
        value={data.email}
        onChange={(e) => onFieldChange("email", e.target.value)}
        error={errors.email}
        leftIcon={
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z"/>
            <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z"/>
          </svg>
        }
      />

      <div>
        <Input
          label={t.password} required
          type={showPw ? "text" : "password"}
          placeholder="••••••••"
          autoComplete="new-password"
          value={data.password}
          onChange={(e) => onFieldChange("password", e.target.value)}
          error={errors.password}
          leftIcon={
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
            </svg>
          }
          rightEl={<button type="button" onClick={() => setShowPw(v => !v)}><EyeIcon visible={showPw} /></button>}
        />
        <PasswordStrength password={data.password} labels={[t.pwChars, t.pwUpper, t.pwNumber, t.pwSpecial]} />
      </div>

      <Input
        label={t.confirmPassword} required
        type={showConfirm ? "text" : "password"}
        placeholder="••••••••"
        autoComplete="new-password"
        value={data.confirmPassword}
        onChange={(e) => onFieldChange("confirmPassword", e.target.value)}
        error={errors.confirmPassword}
        leftIcon={
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
          </svg>
        }
        rightEl={<button type="button" onClick={() => setShowConfirm(v => !v)}><EyeIcon visible={showConfirm} /></button>}
      />

      {/* Terms */}
      <div className="flex items-start gap-2">
        <input
          id="terms"
          type="checkbox"
          checked={data.acceptTerms}
          onChange={(e) => onFieldChange("acceptTerms", e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-violet-600 cursor-pointer flex-shrink-0"
        />
        <label htmlFor="terms" className="text-xs text-gray-500 leading-relaxed cursor-pointer">
          {t.terms1}{" "}
          <a href="#" className="text-violet-600 hover:underline">{t.termsLink}</a>{" "}
          {t.terms2}{" "}
          <a href="#" className="text-violet-600 hover:underline">{t.privacyLink}</a>
        </label>
      </div>
      {errors.acceptTerms && <p className="text-xs text-red-500 -mt-2">{errors.acceptTerms}</p>}

      {serverError && <ErrorAlert message={serverError} />}

      <Button type="submit" fullWidth loading={loading} className="mt-1">
        {t.continueBtn}
      </Button>

      <p className="text-center text-xs text-gray-400 mt-1">
        {t.alreadyAccount}{" "}
        <Link href="/login" className="text-violet-600 font-medium hover:underline">{t.loginLink}</Link>
      </p>
    </form>
  );
}
