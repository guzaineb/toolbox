
'use client';
import { useEffect, useMemo, useState } from 'react';
import { PhoneInput } from '@/components/auth/PhoneInput';
import { Field, Input, Select, Textarea } from '@/components/shared/ui';
import { AuthTranslation, Lang } from '@/i18n/auth';
import { COUNTRIES } from '@/lib/countries';
import { cn } from '@/lib/utils';

interface StepProfileProps {
  formData: {
    firstName: string;
    lastName: string;
    email?: string;
    phone: string;
    birthDate?: string;
    country: string;
    city: string;
    address?: string;
    preferredLanguage?: string;
    bio: string;
    linkedin: string;
  };

  errors: {
    phone?: string;
    birthDate?: string;
    preferredLanguage?: string;
  };

  onUpdate: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;

  onCountryChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;

  onPhoneChange: (fullPhone: string) => void;

  onBirthDateChange: (date: string) => void;

  lang: Lang;
  t: AuthTranslation;
}

function parseDateParts(dateStr?: string): {
  day: string;
  month: string;
  year: string;
} {
  if (!dateStr) {
    return {
      day: '',
      month: '',
      year: '',
    };
  }

  const parts = dateStr.split('-');

  if (parts.length !== 3) {
    return {
      day: '',
      month: '',
      year: '',
    };
  }

  const [year, month, day] = parts;

  return {
    day,
    month,
    year,
  };
}

function getInitials(first: string, last: string) {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

export function StepProfile({
  formData,
  errors,
  onUpdate,
  onCountryChange,
  onPhoneChange,
  onBirthDateChange,
  lang,
  t,
}: StepProfileProps) {
  const LANGUAGES = [
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'ar', label: 'العربية', flag: '🇹🇳' },
  ];

  const MONTHS = [
    { value: '01', label: 'Janvier' },
    { value: '02', label: 'Février' },
    { value: '03', label: 'Mars' },
    { value: '04', label: 'Avril' },
    { value: '05', label: 'Mai' },
    { value: '06', label: 'Juin' },
    { value: '07', label: 'Juillet' },
    { value: '08', label: 'Août' },
    { value: '09', label: 'Septembre' },
    { value: '10', label: 'Octobre' },
    { value: '11', label: 'Novembre' },
    { value: '12', label: 'Décembre' },
  ];

  const parsed = parseDateParts(formData.birthDate);

  const [day, setDay] = useState(parsed.day);
  const [month, setMonth] = useState(parsed.month);
  const [year, setYear] = useState(parsed.year);

  useEffect(() => {
    setDay(parsed.day);
    setMonth(parsed.month);
    setYear(parsed.year);
  }, [formData.birthDate]);

  // Nombre de jours dynamique selon mois/année
  const maxDays = useMemo(() => {
    if (!month || !year) return 31;

    return new Date(Number(year), Number(month), 0).getDate();
  }, [month, year]);

  const days = Array.from({ length: maxDays }, (_, i) =>
    String(i + 1).padStart(2, '0')
  );

  const currentYear = new Date().getFullYear();

  const years = Array.from(
    { length: currentYear - 16 - 1900 + 1 },
    (_, i) => currentYear - 16 - i
  );

  const handleDatePartChange = (
    part: 'day' | 'month' | 'year',
    value: string
  ) => {
    let newDay = day;
    let newMonth = month;
    let newYear = year;

    if (part === 'day') {
      newDay = value;
      setDay(value);
    }

    if (part === 'month') {
      newMonth = value;
      setMonth(value);
    }

    if (part === 'year') {
      newYear = value;
      setYear(value);
    }

    // Vérifie si le jour existe réellement
    if (newDay && newMonth && newYear) {
      const maxValidDays = new Date(
        Number(newYear),
        Number(newMonth),
        0
      ).getDate();

      if (Number(newDay) > maxValidDays) {
        newDay = '';
        setDay('');
      }

      if (newDay) {
        onBirthDateChange(`${newYear}-${newMonth}-${newDay}`);
      } else {
        onBirthDateChange('');
      }
    } else {
      onBirthDateChange('');
    }
  };

  return (
    <div className="step-animation">
      <h2 className="text-[18px] font-semibold mb-1 text-ink">
        {t.completeProfile || 'Complétez votre profil'}
      </h2>

      {/* ───────────────── Identité ───────────────── */}
      <div className="mb-5 bg-bg/60 border border-border rounded-lg p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-accent-light flex items-center justify-center text-accent font-semibold text-[14px] flex-shrink-0">
            {getInitials(formData.firstName, formData.lastName)}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-medium text-ink truncate">
              {formData.firstName} {formData.lastName}
            </p>

            {formData.email && (
              <p className="text-[12px] text-ink2 truncate">
                {formData.email}
              </p>
            )}
          </div>

          <span className="flex-shrink-0 inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full border border-border text-ink3 bg-surface">
            🔒 Non modifiable
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label={t.firstName || 'Prénom'} required>
            <Input
              name="firstName"
              value={formData.firstName}
              disabled
              className="bg-bg/50 cursor-not-allowed text-ink/50"
            />
          </Field>

          <Field label={t.lastName || 'Nom'} required>
            <Input
              name="lastName"
              value={formData.lastName}
              disabled
              className="bg-bg/50 cursor-not-allowed text-ink/50"
            />
          </Field>
        </div>

        <p className="text-[10px] text-ink3 mt-1 flex items-center gap-1">
          <span>ℹ️</span>
          Ces champs sont définis à la création du compte et ne peuvent pas
          être modifiés ici.
        </p>
      </div>

      {/* ───────────────── Téléphone ───────────────── */}
      <div className="mb-4">
        <PhoneInput
          label={t.phone || 'Téléphone'}
          value={formData.phone}
          onChange={onPhoneChange}
          error={errors.phone}
          lang={lang}
          searchPlaceholder={
            t.searchCountry || 'Rechercher un pays'
          }
        />
      </div>

      {/* ───────────────── Date naissance ───────────────── */}
      <div className="mb-4">
        <label className="block text-[12px] font-medium text-text2 mb-[5px]">
          Date de naissance
        </label>

        <div className="grid grid-cols-[1fr_1.7fr_1fr] gap-2 mb-1">
          <span className="text-[10px] text-ink3 text-center">
            Jour
          </span>

          <span className="text-[10px] text-ink3 text-center">
            Mois
          </span>

          <span className="text-[10px] text-ink3 text-center">
            Année
          </span>
        </div>

        <div
          className={cn(
            'grid grid-cols-[1fr_1.7fr_1fr] gap-2'
          )}
        >
          {/* Jour */}
          <select
            value={day}
            onChange={(e) =>
              handleDatePartChange('day', e.target.value)
            }
            className={cn(
              'w-full px-2 py-[9px] border rounded-sm bg-surface text-text text-[13px] outline-none transition-colors focus:border-accent',
              errors.birthDate
                ? 'border-red'
                : 'border-border'
            )}
          >
            <option value="">--</option>

            {days.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Mois */}
          <select
            value={month}
            onChange={(e) =>
              handleDatePartChange('month', e.target.value)
            }
            className={cn(
              'w-full px-2 py-[9px] border rounded-sm bg-surface text-text text-[13px] outline-none transition-colors focus:border-accent',
              errors.birthDate
                ? 'border-red'
                : 'border-border'
            )}
          >
            <option value="">--------</option>

            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.value} – {m.label}
              </option>
            ))}
          </select>

          {/* Année */}
          <select
            value={year}
            onChange={(e) =>
              handleDatePartChange('year', e.target.value)
            }
            className={cn(
              'w-full px-2 py-[9px] border rounded-sm bg-surface text-text text-[13px] outline-none transition-colors focus:border-accent',
              errors.birthDate
                ? 'border-red'
                : 'border-border'
            )}
          >
            <option value="">----</option>

            {years.map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {errors.birthDate && (
          <p className="text-red text-xs mt-1">
            {errors.birthDate}
          </p>
        )}

        <p className="text-[10px] text-ink3 mt-1">
          📅 Optionnel · Âge minimum 16 ans
        </p>
      </div>

      {/* ───────────────── Pays & Ville ───────────────── */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Field label={t.country || 'Pays'}>
          <Select
            name="country"
            value={formData.country}
            onChange={onCountryChange || onUpdate}
          >
            <option value="">Sélectionnez un pays</option>

            {COUNTRIES.map((country) => (
              <option
                key={country.iso}
                value={country.iso}
              >
                {country.flag}{' '}
                {country.name[lang] || country.name.fr}
              </option>
            ))}
          </Select>
        </Field>

        <Field label={t.city || 'Ville'}>
          <Input
            name="city"
            value={formData.city}
            onChange={onUpdate}
            placeholder="Tunis"
          />
        </Field>
      </div>

      {/* ───────────────── Adresse ───────────────── */}
      <div className="mb-4">
        <Field label="Adresse">
          <Input
            name="address"
            value={formData.address || ''}
            onChange={onUpdate}
            placeholder="123 Rue Example, Appartement 4"
          />
        </Field>
      </div>

      {/* ───────────────── Langue ───────────────── */}
      <div className="mb-4">
        <Field label="Langue préférée">
          <Select
            name="preferredLanguage"
            value={formData.preferredLanguage || ''}
            onChange={onUpdate}
          >
            <option value="">
              Sélectionnez votre langue
            </option>

            {LANGUAGES.map((langOption) => (
              <option
                key={langOption.code}
                value={langOption.code}
              >
                {langOption.flag} {langOption.label}
              </option>
            ))}
          </Select>

          {errors.preferredLanguage && (
            <p className="text-red text-xs mt-1">
              {errors.preferredLanguage}
            </p>
          )}
        </Field>
      </div>

      {/* ───────────────── Bio ───────────────── */}
      <div className="mb-4">
        <Field label="Bio">
          <Textarea
            name="bio"
            value={formData.bio}
            onChange={onUpdate}
            placeholder="Entrepreneur passionné par les technologies innovantes..."
            rows={4}
          />

          <div className="flex justify-between text-[10px] text-ink3 mt-1">
            <span>
              Décrivez-vous et vos expertises
            </span>

            <span className="font-mono">
              {formData.bio.length}/500
            </span>
          </div>
        </Field>
      </div>

      {/* ───────────────── LinkedIn ───────────────── */}
      <div className="mb-4">
        <Field label="LinkedIn">
          <Input
            name="linkedin"
            value={formData.linkedin}
            onChange={onUpdate}
            placeholder="https://linkedin.com/in/votre-profil"
          />
        </Field>
      </div>
    </div>
  );
}