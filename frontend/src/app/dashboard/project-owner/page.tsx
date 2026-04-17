'use client';

import { useEffect, useState } from 'react';
import api from '@/services/api';
import { Button, Card, ErrorAlert, Field, Input, Select, Toggle } from '@/components/shared/ui';

interface ProjectOwnerForm {
  current_status: string;
  education_level: string;
  field_of_study: string;
  occupation: string;
  entrepreneurial_experience_level: number;
  has_previous_startup: boolean;
  linkedin_url: string;
}

export default function ProjectOwnerPage() {
  const [form, setForm] = useState<ProjectOwnerForm>({
    current_status: '',
    education_level: '',
    field_of_study: '',
    occupation: '',
    entrepreneurial_experience_level: 0,
    has_previous_startup: false,
    linkedin_url: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.get('/project-owner/me')
      .then(res => {
        if (res.data) {
          setForm({
            current_status: res.data.current_status ?? '',
            education_level: res.data.education_level ?? '',
            field_of_study: res.data.field_of_study ?? '',
            occupation: res.data.occupation ?? '',
            entrepreneurial_experience_level: res.data.entrepreneurial_experience_level ?? 0,
            has_previous_startup: res.data.has_previous_startup ?? false,
            linkedin_url: res.data.linkedin_url ?? '',
          });
        }
      })
      .catch(() => {}) // profil inexistant = formulaire vide
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true); setError(null); setSuccess(false);
    try {
      await api.patch('/project-owner/me', form);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-3">
          <div className="h-7 w-48 bg-border rounded" />
          <div className="h-4 w-64 bg-border rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[800px]">
      <h1 className="font-display text-[26px] mb-1">Porteur de projet</h1>
      <p className="text-[13px] text-text-2 mb-7">Votre profil entrepreneurial</p>

      {error && <div className="mb-5"><ErrorAlert message={error} /></div>}
      {success && (
        <div className="mb-5 p-3 rounded bg-accent-light text-accent text-[13px] border border-accent/20">
          ✓ Profil enregistré avec succès.
        </div>
      )}

      <Card className="mb-3.5">
        <div className="text-[11px] font-semibold uppercase tracking-[.06em] text-text-2 mb-[14px]">
          Informations générales
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Statut actuel">
            <Select value={form.current_status} onChange={e => setForm(f => ({ ...f, current_status: e.target.value }))}>
              <option value="">— Sélectionner —</option>
              <option value="student">Étudiant</option>
              <option value="employee">Salarié</option>
              <option value="entrepreneur">Entrepreneur</option>
              <option value="unemployed">Sans emploi</option>
            </Select>
          </Field>
          <Field label="Niveau d'études">
            <Select value={form.education_level} onChange={e => setForm(f => ({ ...f, education_level: e.target.value }))}>
              <option value="">— Sélectionner —</option>
              <option value="bac">Bac</option>
              <option value="bac+2">Bac+2</option>
              <option value="bac+3">Bac+3 (Licence)</option>
              <option value="bac+5">Bac+5 (Master)</option>
              <option value="doctorat">Doctorat</option>
            </Select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Domaine d'études">
            <Input
              value={form.field_of_study}
              onChange={e => setForm(f => ({ ...f, field_of_study: e.target.value }))}
              placeholder="Informatique, Finance…"
            />
          </Field>
          <Field label="Occupation">
            <Input
              value={form.occupation}
              onChange={e => setForm(f => ({ ...f, occupation: e.target.value }))}
              placeholder="Product Manager…"
            />
          </Field>
        </div>
        <Field label="Expérience entrepreneuriale">
          <Select
            value={form.entrepreneurial_experience_level}
            onChange={e => setForm(f => ({ ...f, entrepreneurial_experience_level: Number(e.target.value) }))}
          >
            <option value={0}>Aucune expérience</option>
            <option value={1}>Débutant (idée)</option>
            <option value={2}>Intermédiaire (1–3 startups)</option>
            <option value={3}>Avancé (3+ startups)</option>
          </Select>
        </Field>
        <div className="flex items-center gap-2.5 py-2.5">
          <span className="text-[13px]">Expérience startup précédente</span>
          <div className="ml-auto">
            <Toggle
              on={form.has_previous_startup}
              onToggle={() => setForm(f => ({ ...f, has_previous_startup: !f.has_previous_startup }))}
            />
          </div>
        </div>
        <Field label="LinkedIn">
          <Input
            value={form.linkedin_url}
            onChange={e => setForm(f => ({ ...f, linkedin_url: e.target.value }))}
            placeholder="https://linkedin.com/in/…"
          />
        </Field>
        <Button variant="primary" className="text-[12px]" onClick={handleSave} loading={saving}>
          Enregistrer
        </Button>
      </Card>
    </div>
  );
}
