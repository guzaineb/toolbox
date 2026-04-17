"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Card, Button } from "@/components/shared/ui";
import { AuthTranslation, authTranslations, Lang } from "@/i18n/auth";
import { StepIndicator } from "@/components/auth/StepIndicator";
import { StepAccount } from "@/components/auth/StepAccount";
import { StepProfile } from "@/components/auth/StepProfile";
import { StepRole } from "@/components/auth/StepRole";


const API_URL = process.env.NEST_PUBLIC_API_URL || "http://localhost:3000";

export default function RegisterWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lang, setLang] = useState<Lang>("fr");
  const t = authTranslations[lang] as AuthTranslation;

  // Données du formulaire
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", password: "", confirmPassword: "",
    phone: "", country: "Tunisie", city: "", bio: "", linkedin: "", role: "owner",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  const evaluatePasswordStrength = useCallback((password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    setPasswordStrength(strength);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handlePhoneChange = (fullPhone: string) => {
    setFormData(prev => ({ ...prev, phone: fullPhone }));
    if (errors.phone) setErrors(prev => ({ ...prev, phone: "" }));
  };

  const validateStep0 = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.firstName.trim()) newErrors.firstName = t.required;
    if (!formData.lastName.trim()) newErrors.lastName = t.required;
    if (!formData.email.trim()) newErrors.email = t.required;
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = t.emailInvalid;
    if (!formData.password) newErrors.password = t.required;
    else if (formData.password.length < 6) newErrors.password = t.passwordMin;
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = t.passwordMatch;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep1 = () => {
    if (formData.phone && !/^\+\d{5,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      setErrors(prev => ({ ...prev, phone: t.phoneInvalid }));
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.role) {
      setErrors({ role: "Veuillez sélectionner un rôle" });
      return false;
    }
    return true;
  };

  const submitRegistration = async () => {
    setLoading(true);
    setSubmitError(null);
    const roleMapping: Record<string, string> = {
      owner: "project_owner", expert: "expert", incubator: "incubator_member",
    };
    const payload = {
      email: formData.email,
      password: formData.password,
      role: roleMapping[formData.role] || "project_owner",
      profile: {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone || undefined,
        country: formData.country || undefined,
        city: formData.city || undefined,
        bio: formData.bio || undefined,
        linkedin: formData.linkedin || undefined,
      },
    };
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur lors de l'inscription");
      router.push(`/check-email?email=${encodeURIComponent(formData.email)}`);
    } catch (err: any) {
      setSubmitError(err.message);
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (currentStep === 0 && validateStep0()) setCurrentStep(1);
    else if (currentStep === 1 && validateStep1()) setCurrentStep(2);
    else if (currentStep === 2 && validateStep2()) await submitRegistration();
  };

  const handleBack = () => currentStep > 0 && setCurrentStep(prev => prev - 1);

  const LanguageSwitcher = () => (
    <div className="absolute top-4 right-4 flex gap-2">
      {(["fr", "en", "ar"] as Lang[]).map(l => (
        <button key={l} onClick={() => setLang(l)}
          className={cn("text-xs px-2 py-1 rounded transition",
            lang === l ? "bg-accent text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}>
          {l === "fr" ? "FR" : l === "en" ? "EN" : "AR"}
        </button>
      ))}
    </div>
  );

  return (
    <div dir={t.dir} className="min-h-screen flex items-start justify-center bg-bg p-6 pt-10 relative">
      <LanguageSwitcher />
      <div className="w-full max-w-[520px]">
        <div className="font-display text-[20px] text-text mb-6 text-center">
          Project<span className="text-accent">Struct</span>
        </div>
        <StepIndicator currentStep={currentStep} t={t} />
        <Card>
          {currentStep === 0 && (
            <StepAccount formData={formData} errors={errors} onUpdate={handleChange}
              onPasswordChange={(e) => { handleChange(e); evaluatePasswordStrength(e.target.value); }}
              passwordStrength={passwordStrength} t={t} />
          )}
          {currentStep === 1 && (
            <StepProfile formData={formData} errors={errors} onUpdate={handleChange}
              onPhoneChange={handlePhoneChange} lang={lang} t={t} />
          )}
          {currentStep === 2 && (
            <StepRole formData={formData} errors={errors} onRoleSelect={(role) => {
              setFormData(prev => ({ ...prev, role }));
              if (errors.role) setErrors({});
            }} submitError={submitError} t={t} />
          )}
          <div className="flex gap-2 mt-6">
            {currentStep > 0 && <Button onClick={handleBack} variant="secondary">{t.backBtn || "← Retour"}</Button>}
            <Button variant="primary" fullWidth={currentStep === 0} className={currentStep > 0 ? "flex-1" : ""}
              onClick={handleNext} disabled={loading}>
              {loading ? "Chargement..." : currentStep === 0 ? t.continueBtn : currentStep === 2 ? "Terminer" : "Continuer →"}
            </Button>
          </div>
          {currentStep === 0 && (
            <p className="text-[12px] text-text-2 text-center mt-4">
              {t.alreadyAccount} <Link href="/login" className="text-accent font-medium">{t.loginLink}</Link>
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}