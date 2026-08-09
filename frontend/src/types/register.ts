import type { Lang } from "../i18n/auth";

export interface Step1Data {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface Step2Data {
  phone?: string;
  birthDate?: string;
  country?: string;
  city?: string;
  address?: string;
  preferredLanguage: Lang;
}

export interface Step3Data {
 role: "PROJECT_OWNER" | "EXPERT" | "INCUBATOR_MEMBER" | null;
  expertHeadline?: string;
  expertBio?: string;
  expertExperienceYears?: number;
  projectOwnerStatus?: string;
  projectOwnerEducation?: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface ProfilePayload {
  first_name: string;
  last_name: string;
  phone?: string;
  birthDate?: string;
  country?: string;
  city?: string;
  address?: string;
  preferredLanguage: string;
}

export interface Step1Errors {
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  acceptTerms?: string;
}

export interface Step2Errors {
  phone?: string;
}

export interface Step3Errors {
  role?: string;
}
