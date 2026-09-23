"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import api from "../services/api";
import { authTranslations, Lang } from "../i18n/auth";
import { Step1Data, Step2Data, Step3Data, Step1Errors, Step2Errors, Step3Errors } from "../types/register";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function useRegisterStepper() {
  const router = useRouter();
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [lang, setLangState] = useState<Lang>("fr");
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Form States
  const [step1, setStep1] = useState<Step1Data>({
    first_name: "", last_name: "", email: "", password: "", confirmPassword: "", acceptTerms: false,
  });
  const [step2, setStep2] = useState<Step2Data>({
    phone: "", birthDate: "", country: "TN", city: "", address: "", preferredLanguage: "fr",
  });
  const [step3, setStep3] = useState<Step3Data>({
    role: null , expertHeadline: "", expertBio: "", expertExperienceYears: 0,
    projectOwnerStatus: "", projectOwnerEducation: ""
  });

  // Errors States
  const [errors1, setErrors1] = useState<Step1Errors>({});
  const [errors2, setErrors2] = useState<Step2Errors>({});
  const [errors3, setErrors3] = useState<Step3Errors>({});

  const t = useMemo(() => authTranslations[lang], [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    setStep2((prev) => ({ ...prev, preferredLanguage: l }));
  }, []);

  const validateStep1 = () => {
    const errs: Step1Errors = {};
    if (!step1.first_name.trim()) errs.first_name = "Requis";
    if (!step1.last_name.trim()) errs.last_name = "Requis";
    if (!EMAIL_RE.test(step1.email)) errs.email = "Email invalide";
    if (step1.password.length < 8) errs.password = "8 caractères min.";
    if (step1.password !== step1.confirmPassword) errs.confirmPassword = "Mots de passe différents";
    if (!step1.acceptTerms) errs.acceptTerms = "Veuillez accepter les conditions";
    setErrors1(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: Step2Errors = {};
    if (!step2.phone || step2.phone.length < 8) errs.phone = "Numéro invalide";
    setErrors2(errs);
    return Object.keys(errs).length === 0;
  };

  const submitStep1 = () => validateStep1() && setStep(2);
  const submitStep2 = () => validateStep2() && setStep(3);

  const submitStep3 = async () => {
    if (!step3.role) {
        setErrors3({ role: "Veuillez choisir un rôle" });
        return;
    }
    
    setLoading(true);
    setServerError(null);
    try {
      const fullPayload = {
        ...step1,
        profile: { ...step2, preferred_language: lang },
        role_data: step3
      };

      await api.post("/auth/register", fullPayload);
      const loginRes = await api.post("/auth/login", { email: step1.email, password: step1.password });

      if (loginRes.data?.access_token) {
        localStorage.setItem("ps_access_token", loginRes.data.access_token);
        router.push("/dashboard");
      }
    } catch (e: any) {
      const msg = e.response?.data?.message;
      setServerError(Array.isArray(msg) ? msg[0] : msg || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return {
    step, lang, t, step1, step2, step3, errors1, errors2, errors3, loading, serverError,
    setLang,
    setStep1Field: (k: any, v: any) => setStep1(p => ({ ...p, [k]: v })),
    setStep2Field: (k: any, v: any) => setStep2(p => ({ ...p, [k]: v })),
    setStep3Field: (k: any, v: any) => setStep3(p => ({ ...p, [k]: v })),
    submitStep1, submitStep2, submitStep3,
    goBack: () => setStep(prev => (prev > 1 ? (prev - 1) as any : 1)),
    clearServerError: () => setServerError(null)
  };
}