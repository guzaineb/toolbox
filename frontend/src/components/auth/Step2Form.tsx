"use client";


import { Input, Select, Button, ErrorAlert, AvatarInitials, SectionLabel } from "./ui";
import { PhoneInput } from "./PhoneInput";
import { Step2Data, Step2Errors } from "@/types/register";
import { AuthTranslation, Lang } from "@/i18n/auth";
import { COUNTRIES } from "@/lib/countries ";

interface Step2FormProps {
  data: Step2Data;
  errors: Step2Errors;
  serverError: string | null;
  loading: boolean;
  t: AuthTranslation;
  lang: Lang;
  firstName: string;
  lastName: string;
  onFieldChange: <K extends keyof Step2Data>(k: K, v: Step2Data[K]) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export function Step2Form({
  data, errors, serverError, loading, t, lang,
  firstName, lastName, onFieldChange, onSubmit, onBack,
}: Step2FormProps) {
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
      className="flex flex-col gap-3.5"
      noValidate
    >
      <AvatarInitials firstName={firstName} lastName={lastName} />

      {/* Contact */}
      <SectionLabel>{t.sectionContact}</SectionLabel>

      <PhoneInput
        label={t.phone}
        value={data.phone ?? ""}
        onChange={(v) => onFieldChange("phone", v)}
        error={errors.phone}
        lang={lang}
        searchPlaceholder={t.searchCountry}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label={t.birthDate}
          type="date"
          value={data.birthDate ?? ""}
          onChange={(e) => onFieldChange("birthDate", e.target.value)}
        />
        <Select
          label={t.preferredLanguage}
          value={data.preferredLanguage}
          onChange={(e) => onFieldChange("preferredLanguage", e.target.value as Lang)}
        >
          <option value="fr">{t.langFr}</option>
          <option value="en">{t.langEn}</option>
          <option value="ar">{t.langAr}</option>
        </Select>
      </div>

      {/* Divider */}
      <hr className="border-gray-100" />

      {/* Location */}
      <SectionLabel>{t.sectionLocation}</SectionLabel>

      <div className="grid grid-cols-2 gap-3">
        <Select
          label={t.country}
          value={data.country ?? ""}
          onChange={(e) => onFieldChange("country", e.target.value)}
        >
          <option value="">--</option>
          {COUNTRIES.map((c) => (
            <option key={c.iso} value={c.iso}>
              {c.flag} {c.name[lang] ?? c.name.fr}
            </option>
          ))}
        </Select>
        <Input
          label={t.city}
          placeholder="Tunis"
          value={data.city ?? ""}
          onChange={(e) => onFieldChange("city", e.target.value)}
        />
      </div>

      <Input
        label={t.address}
        placeholder="Rue, quartier..."
        value={data.address ?? ""}
        onChange={(e) => onFieldChange("address", e.target.value)}
      />

      {serverError && <ErrorAlert message={serverError} />}

      <div className="flex flex-col gap-2 mt-1">
        <Button type="submit" fullWidth loading={loading}>
          {t.finishBtn}
        </Button>
        <Button type="button" variant="outline" fullWidth onClick={onBack} disabled={loading}>
          {t.backBtn}
        </Button>
        <button
          type="button"
          onClick={onSubmit}
          className="text-xs text-gray-400 hover:text-gray-500 text-center mt-1 underline"
        >
          {t.skipBtn}
        </button>
      </div>
    </form>
  );
}
