"use client";

import { useRegisterStepper } from "@/hooks/useRegisterStepper";
import { LangBar, Stepper } from "./ui";
import { Step1Form } from "./Step1Form";
import { Step2Form } from "./Step2Form";
import { Step3Form } from "./Step3Form";


export function RegisterStepper() {
  const {
    step, lang, t,

    step1, step2, step3,
    errors1, errors2,errors3,
    loading, serverError,
    setLang, setStep1Field, setStep2Field, setStep3Field,
    submitStep1, submitStep2, submitStep3,
    goBack, clearServerError,
  } = useRegisterStepper();

  return (
    <div
      dir={t.dir}
      className="min-h-screen bg-violet-50/40 flex items-center justify-center px-4 py-10"
    >
      {/* Subtle bg dot pattern */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "radial-gradient(circle, #7c3aed 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-7">
          <div className="w-11 h-11 rounded-2xl bg-violet-100 border border-violet-200 flex items-center justify-center mb-3">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-violet-600">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Syne', sans-serif" }}>
            ProjectStruct
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Plateforme de gestion d'incubateurs</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-100 rounded-2xl p-7 shadow-sm shadow-violet-100">
          <LangBar lang={lang} onChange={setLang} />

          <Stepper step={step} label1={t.stepAccount} label2={t.stepProfile} label3={t.stepRole || 'Rôle'} />

          {/* Step title */}
          <div className="mb-5">
            <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Syne', sans-serif" }}>
              {step === 1 ? t.createAccount : step === 2 ? t.completeProfile : t.chooseRole || 'Choisir rôle'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
      {step === 1 ? t.step1of3 : step === 2 ? t.step2of3 : t.step3of3}      </p>
          </div>
cc
          {step === 1 ? (
            <Step1Form
              data={step1}
              errors={errors1}
              serverError={serverError}
              loading={loading}
              t={t}
              onFieldChange={setStep1Field}
              onSubmit={submitStep1}
            />
          ) : step === 2 ? (
            <Step2Form
              data={step2}
              errors={errors2}
              serverError={serverError}
              loading={loading}
              t={t}
              lang={lang}
              firstName={step1.first_name}
              lastName={step1.last_name}
              onFieldChange={setStep2Field}
              onSubmit={submitStep2}
              onBack={goBack}
            />
          ) : (
            <Step3Form
              t={t}
              loading={loading}
              onSubmit={submitStep3}
              onSkip={goBack}
            />
          )}
        </div>
      </div>
    </div>
  );
}
