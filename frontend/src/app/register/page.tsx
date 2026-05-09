<<<<<<< HEAD
"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Card, Button } from "@/components/shared/ui";
import { AuthTranslation, authTranslations, Lang } from "@/i18n/auth";
=======
'use client';

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Onboard1SVG, RegisterSVG } from "@/components/auth/GeoSVGs";
import { Onboard2SVG } from "@/components/auth/GeoSVGs";
import AuthShell from "@/components/auth/AuthShell";
import LeftPanel from "@/components/auth/LeftPanel";
import RightPanel from "@/components/auth/RightPanel";
import { cn } from "@/lib/utils";
import { AuthTranslation, authTranslations, Lang } from "@/i18n/auth";
import { COUNTRIES, DEFAULT_COUNTRY, type Country } from "@/lib/countries ";
>>>>>>> 38c6efc (Misa a jour les interfaces)
import { StepIndicator } from "@/components/auth/StepIndicator";
import { StepAccount } from "@/components/auth/StepAccount";
import { StepProfile } from "@/components/auth/StepProfile";
import { StepRole } from "@/components/auth/StepRole";
<<<<<<< HEAD


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
=======
import { BtnMain, BtnSecondary, FormLink } from "@/components/auth/FormElements";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  birthDate?: string;
  selectedCountry: Country;
  city: string;
  address?: string;
  preferredLanguage?: string;
  bio: string;
  linkedin: string;
  role: string;
}

interface Errors {
  [key: string]: string;
}

export default function RegisterPage(): React.ReactElement {
  const router = useRouter();
  const [step, setStep] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [lang, setLang] = useState<Lang>("fr");
  const t = authTranslations[lang] as AuthTranslation;
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    birthDate: "",
    selectedCountry: DEFAULT_COUNTRY,
    city: "",
    address: "",
    preferredLanguage: "",
    bio: "",
    linkedin: "",
    role: "",
  });

  const [errors, setErrors] = useState<Errors>({});

  const calculatePasswordStrength = useCallback((password: string): number => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^A-Za-z0-9]/.test(password)) strength += 10;
    return Math.min(strength, 100);
  }, []);

  const [passwordStrength, setPasswordStrength] = useState<number>(0);

  const isPasswordValid = useCallback((password: string): boolean => {
    const hasLen = password.length >= 8;
    const hasUp = /[A-Z]/.test(password);
    const hasLo = /[a-z]/.test(password);
    const hasNum = /[0-9]/.test(password);
    const hasSp = /[^A-Za-z0-9]/.test(password);
    return hasLen && hasUp && hasLo && hasNum && hasSp;
  }, []);

  const handleChange = (field: keyof FormData, value: string | Country): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as string]) setErrors(prev => ({ ...prev, [field as string]: "" }));
  };

  const handlePhoneChange = useCallback((fullPhone: string): void => {
    setFormData(prev => {
      if (prev.phone === fullPhone) return prev;
      return { ...prev, phone: fullPhone };
    });
    if (errors.phone) setErrors(prev => ({ ...prev, phone: "" }));
  }, [errors.phone]);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, password: value }));
    setPasswordStrength(calculatePasswordStrength(value));
    
    if (errors.password) setErrors(prev => ({ ...prev, password: "" }));
    
    if (value && !isPasswordValid(value)) {
      setErrors(prev => ({ ...prev, password: "Le mot de passe ne respecte pas tous les critères" }));
    } else {
      setErrors(prev => ({ ...prev, password: "" }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
>>>>>>> 38c6efc (Misa a jour les interfaces)
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

<<<<<<< HEAD
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
=======
  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const country = COUNTRIES.find(c => c.iso === e.target.value);
    if (country) {
      setFormData(prev => ({ ...prev, selectedCountry: country }));
    }
  };

  const validateStep0 = (): boolean => {
    const newErrors: Errors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = "Prénom requis";
    if (!formData.lastName.trim()) newErrors.lastName = "Nom requis";
    
    if (!formData.email.trim()) newErrors.email = "Email requis";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email invalide";
    
    if (!formData.password) {
      newErrors.password = "Mot de passe requis";
    } else if (!isPasswordValid(formData.password)) {
      newErrors.password = "Le mot de passe doit contenir 8 caractères minimum, une majuscule, une minuscule, un chiffre et un caractère spécial";
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }
    
>>>>>>> 38c6efc (Misa a jour les interfaces)
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

<<<<<<< HEAD
  const validateStep1 = () => {
    if (formData.phone && !/^\+\d{5,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      setErrors(prev => ({ ...prev, phone: t.phoneInvalid }));
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
=======
  const validateStep1 = (): boolean => {
    const newErrors: Errors = {};
    
    // Validation du téléphone
    if (formData.phone) {
      const dialCode = formData.selectedCountry.dialCode;
      const phoneWithoutDial = formData.phone.replace(dialCode, '');
      const phoneRegex = /^\d{8,15}$/;
      
      if (!phoneWithoutDial || !phoneRegex.test(phoneWithoutDial.replace(/\s/g, ''))) {
        newErrors.phone = `Numéro invalide. Format: ${dialCode}XXXXXXXX`;
      }
    }
    
    // Validation de la date de naissance (optionnelle)
    if (formData.birthDate) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(formData.birthDate)) {
        newErrors.birthDate = "Format de date invalide. Utilisez AAAA-MM-JJ";
      } else {
        const birthDate = new Date(formData.birthDate);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 16) {
          newErrors.birthDate = "Vous devez avoir au moins 16 ans";
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
>>>>>>> 38c6efc (Misa a jour les interfaces)
    if (!formData.role) {
      setErrors({ role: "Veuillez sélectionner un rôle" });
      return false;
    }
    return true;
  };

<<<<<<< HEAD
  const submitRegistration = async () => {
    setLoading(true);
    setSubmitError(null);
    const roleMapping: Record<string, string> = {
      owner: "project_owner", expert: "expert", incubator: "incubator_membre",
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
=======
  const submitRegistration = async (): Promise<void> => {
    setLoading(true);
    setServerError(null);

    const payload = {
      email: formData.email,
      password: formData.password,
      role: formData.role,
      profile: {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone ,
        birthDate: formData.birthDate ,
        country: formData.selectedCountry.name.fr,
        country_code: formData.selectedCountry.iso,
        dial_code: formData.selectedCountry.dialCode,
        city: formData.city ,
        address: formData.address,
        preferredLanguage: formData.preferredLanguage ,
        bio: formData.bio ,
        linkedin: formData.linkedin ,
      },
    };

>>>>>>> 38c6efc (Misa a jour les interfaces)
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
<<<<<<< HEAD
      setSubmitError(err.message);
=======
      setServerError(err.message);
>>>>>>> 38c6efc (Misa a jour les interfaces)
      setLoading(false);
    }
  };

<<<<<<< HEAD
  const handleNext = async () => {
    if (currentStep === 0 && validateStep0()) setCurrentStep(1);
    else if (currentStep === 1 && validateStep1()) setCurrentStep(2);
    else if (currentStep === 2 && validateStep2()) await submitRegistration();
  };

  const handleBack = () => currentStep > 0 && setCurrentStep(prev => prev - 1);

  const LanguageSwitcher = () => (
    <div className="absolute top-4 right-4 flex gap-2">
      {(["fr", "en", "ar"] as Lang[]).map(l => (
=======
  const handleNext = async (): Promise<void> => {
    if (step === 0 && validateStep0()) setStep(1);
    else if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) await submitRegistration();
  };

  const handleBack = (): void => {
    if (step > 0) setStep(prev => prev - 1);
  };
const handleBirthDateChange = (date: string) => {
  setFormData(prev => ({ ...prev, birthDate: date }));
  if (errors.birthDate) setErrors(prev => ({ ...prev, birthDate: "" }));
}; 
  const handleRoleSelect = (role: string): void => {
    setFormData(prev => ({ ...prev, role }));
    if (errors.role) setErrors(prev => ({ ...prev, role: "" }));
  };

  // Changer le SVG selon l'étape
  const getLeftPanelContent = () => {
    if (step === 1) return <Onboard1SVG />;
    if (step === 2) return <Onboard2SVG />;
    return <RegisterSVG />;
  };

  const getLeftPanelTitle = () => {
    if (step === 1) return "Complétez votre profil";
    if (step === 2) return "Choisissez votre rôle";
    return "Construisez, connectez, développez";
  };

  const getLeftPanelSubtitle = () => {
    if (step === 1) {
      return "Ces informations permettront aux autres membres de mieux vous connaître.";
    }
    if (step === 2) {
      return "Sélectionnez le rôle qui vous correspond le mieux pour commencer votre aventure.";
    }
    return "Créez votre compte en 2 minutes. Accédez à tout l'écosystème d'innovation de la région MENA.";
  };

  const LanguageSwitcher = (): React.ReactElement => (
    <div className="absolute top-4 right-4 z-20 flex gap-2">
      {(["fr", "en", "ar"] as Lang[]).map((l: Lang) => (
>>>>>>> 38c6efc (Misa a jour les interfaces)
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
<<<<<<< HEAD
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
=======
    <>
      <LanguageSwitcher />
      <AuthShell
        left={
          <LeftPanel
            svgContent={getLeftPanelContent()}
            tag=""
            title={getLeftPanelTitle()}
            subtitle={getLeftPanelSubtitle()}
          />
        }
        right={
          <RightPanel>
            <StepIndicator currentStep={step} t={t} />

            {step === 0 && (
              <StepAccount
                formData={formData}
                errors={errors}
                onUpdate={handleInputChange}
                onPasswordChange={handlePasswordChange}
                passwordStrength={passwordStrength}
                t={t}
              />
            )}

            {step === 1 && (
              <StepProfile
                formData={{
                  firstName: formData.firstName,
                  lastName: formData.lastName,
                  phone: formData.phone,
                  birthDate: formData.birthDate,
                  country: formData.selectedCountry.iso,
                  city: formData.city,
                  address: formData.address,
                  preferredLanguage: formData.preferredLanguage,
                  bio: formData.bio,
                  linkedin: formData.linkedin,
                }}
                errors={{ 
                  phone: errors.phone,
                  birthDate: errors.birthDate,
                  preferredLanguage: errors.preferredLanguage
                }}
                onUpdate={handleInputChange}
                onCountryChange={handleCountryChange}
                onPhoneChange={handlePhoneChange}
                onBirthDateChange={handleBirthDateChange}
                lang={lang}
                t={t}
              />
            )}

            {step === 2 && (
              <StepRole
                formData={{ role: formData.role }}
                errors={{ role: errors.role }}
                onRoleSelect={handleRoleSelect}
                submitError={serverError}
                t={t}
              />
            )}

            <div className="flex gap-3 mt-8">
              {step > 0 && (
                <BtnSecondary onClick={handleBack}>
                  ← Retour
                </BtnSecondary>
              )}
              <BtnMain onClick={handleNext} disabled={loading}>
                {loading ? "Chargement..." : step === 2 ? "Finaliser l'inscription →" : "Continuer →"}
              </BtnMain>
            </div>

            {step === 0 && (
              <FormLink
                text="Vous avez déjà un compte ?"
                linkText="Se connecter"
                onClick={() => router.push('/login')}
              />
            )}
          </RightPanel>
        }
      />
    </>
>>>>>>> 38c6efc (Misa a jour les interfaces)
  );
}