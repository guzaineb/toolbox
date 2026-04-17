import { Field, Input, Select, Textarea } from "@/components/shared/ui";
import { PhoneInput } from "@/components/auth/PhoneInput";
import { AuthTranslation, Lang } from "@/i18n/auth";

interface StepProfileProps {
  formData: {
    firstName: string;
    lastName: string;
    phone: string;
    country: string;
    city: string;
    bio: string;
    linkedin: string;
  };
  errors: {
    phone?: string;
  };
  onUpdate: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onPhoneChange: (fullPhone: string) => void;
  lang: Lang;
  t: AuthTranslation;
}

export function StepProfile({ formData, errors, onUpdate, onPhoneChange, lang, t }: StepProfileProps){
  return (
    <div className="step-animation">
      <h2 className="text-[18px] font-semibold mb-1">{t.completeProfile}</h2>
      <p className="text-[12px] text-text-2 mb-5">Ces informations sont visibles par les membres de la plateforme</p>
      <div className="grid grid-cols-2 gap-3">
        <Field label={t.firstName}>
          <Input name="firstName" value={formData.firstName} disabled className="bg-bg/50" />
        </Field>
        <Field label={t.lastName}>
          <Input name="lastName" value={formData.lastName} disabled className="bg-bg/50" />
        </Field>
      </div>
      <PhoneInput label={t.phone} value={formData.phone} onChange={onPhoneChange} error={errors.phone}
        lang={lang} searchPlaceholder={t.searchCountry} />
      <div className="grid grid-cols-2 gap-3">
        <Field label={t.country}>
          <Select name="country" value={formData.country} onChange={onUpdate}>
            <option>Tunisie</option><option>Maroc</option><option>France</option>
          </Select>
        </Field>
        <Field label={t.city}>
          <Input name="city" value={formData.city} onChange={onUpdate} placeholder="Tunis" />
        </Field>
      </div>
      <Field label="Bio">
        <Textarea name="bio" value={formData.bio} onChange={onUpdate} placeholder="Entrepreneur passionné..." />
      </Field>
      <Field label="LinkedIn">
        <Input name="linkedin" value={formData.linkedin} onChange={onUpdate} placeholder="https://linkedin.com/in/..." />
      </Field>
    </div>
  );
}