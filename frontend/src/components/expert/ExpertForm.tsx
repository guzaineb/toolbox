'use client';

import { Button, Field, Input, Select, Textarea } from '@/components/shared/ui';
import { ExpertForm as ExpertFormData } from '@/hooks/useExpertProfile';

interface ExpertFormProps {
  form: ExpertFormData;
  onUpdateField: <K extends keyof ExpertFormData>(field: K, value: ExpertFormData[K]) => void;
  onSave: () => void;
  saving: boolean;
}

export function ExpertForm({ form, onUpdateField, onSave, saving }: ExpertFormProps) {
  return (
    <div className="space-y-3">
      <div className="text-[11px] font-semibold uppercase tracking-[.06em] text-text-2 mb-[14px]">
        Identité professionnelle
      </div>

      <Field label="Titre / headline">
        <Input
          value={form.headline}
          onChange={e => onUpdateField('headline', e.target.value)}
          placeholder="Expert en financement startups…"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Organisation">
          <Input
            value={form.organization}
            onChange={e => onUpdateField('organization', e.target.value)}
          />
        </Field>
        <Field label="Poste">
          <Input
            value={form.position}
            onChange={e => onUpdateField('position', e.target.value)}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Années d'expérience">
          <Input
            type="number"
            value={form.years_of_experience}
            onChange={e => onUpdateField('years_of_experience', Number(e.target.value))}
          />
        </Field>
        <Field label="Disponibilité">
          <Select
            value={form.availability_status}
            onChange={e => onUpdateField('availability_status', e.target.value)}
          >
            <option value="available">Disponible</option>
            <option value="partial">Partiellement dispo</option>
            <option value="unavailable">Non disponible</option>
          </Select>
        </Field>
      </div>

      <Field label="LinkedIn">
        <Input
          value={form.linkedin_url}
          onChange={e => onUpdateField('linkedin_url', e.target.value)}
        />
      </Field>

      <Field label="Bio expert">
        <Textarea
          value={form.bio}
          onChange={e => onUpdateField('bio', e.target.value)}
        />
      </Field>

      <Button variant="primary" className="text-[12px]" onClick={onSave} loading={saving}>
        Enregistrer
      </Button>
    </div>
  );
}