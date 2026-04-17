'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { Button, Card, ErrorAlert, Field, Input, Select, Textarea } from '@/components/shared/ui';

interface CreateIncubatorForm {
  name: string;
  legal_name?: string;
  slug: string;
  description?: string;
  organization_type?: string;
  email?: string;
  phone?: string;
  website_url?: string;
  address?: string;
  country?: string;
  city?: string;
}

export default function CreateIncubatorPage() {
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<CreateIncubatorForm>();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Auto-génère le slug depuis le nom
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const slug = e.target.value
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    setValue('slug', slug);
  };

  const onSubmit = async (data: CreateIncubatorForm) => {
    setServerError(null);
    setLoading(true);
    try {
      const res = await api.post('/incubators', data);
      router.push(`/dashboard/incubator/${res.data.id}`);
    } catch (err: any) {
      setServerError(err?.response?.data?.message ?? 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-[680px]">
      <h1 className="font-display text-[26px] mb-1">Créer un incubateur</h1>
      <p className="text-[13px] text-text-2 mb-7">
        Vous deviendrez automatiquement administrateur de cet incubateur.
      </p>

      {serverError && (
        <div className="mb-5">
          <ErrorAlert message={serverError} />
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Identité */}
        <Card>
          <div className="text-[11px] font-semibold uppercase tracking-[.06em] text-text-2 mb-[14px]">
            Identité
          </div>
          <Field label="Nom de l'incubateur *">
            <Input
              placeholder="ex: StartUp Tunisia Hub"
              {...register('name', { required: 'Le nom est requis' })}
              onChange={(e) => { register('name').onChange(e); handleNameChange(e); }}
            />
            {errors.name && <span className="text-[11px] text-red mt-1 block">{errors.name.message}</span>}
          </Field>
          <Field label="Slug (URL unique) *">
            <Input
              placeholder="startup-tunisia-hub"
              {...register('slug', { required: 'Le slug est requis' })}
            />
            {errors.slug && <span className="text-[11px] text-red mt-1 block">{errors.slug.message}</span>}
          </Field>
          <Field label="Raison sociale">
            <Input placeholder="Nom légal de l'organisation" {...register('legal_name')} />
          </Field>
          <Field label="Type d'organisation">
            <Select {...register('organization_type')}>
              <option value="">— Sélectionner —</option>
              <option value="public">Public</option>
              <option value="private">Privé</option>
              <option value="university">Université</option>
              <option value="ngo">ONG</option>
            </Select>
          </Field>
          <Field label="Description">
            <Textarea
              placeholder="Décrivez la mission et les activités de votre incubateur…"
              {...register('description')}
            />
          </Field>
        </Card>

        {/* Contact */}
        <Card>
          <div className="text-[11px] font-semibold uppercase tracking-[.06em] text-text-2 mb-[14px]">
            Contact
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email">
              <Input type="email" placeholder="contact@incubateur.tn" {...register('email')} />
            </Field>
            <Field label="Téléphone">
              <Input placeholder="+216 XX XXX XXX" {...register('phone')} />
            </Field>
          </div>
          <Field label="Site web">
            <Input placeholder="https://…" {...register('website_url')} />
          </Field>
        </Card>

        {/* Localisation */}
        <Card>
          <div className="text-[11px] font-semibold uppercase tracking-[.06em] text-text-2 mb-[14px]">
            Localisation
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Pays">
              <Select {...register('country')}>
                <option value="">— Pays —</option>
                <option value="TN">Tunisie</option>
                <option value="MA">Maroc</option>
                <option value="DZ">Algérie</option>
                <option value="FR">France</option>
              </Select>
            </Field>
            <Field label="Ville">
              <Input placeholder="Tunis" {...register('city')} />
            </Field>
          </div>
          <Field label="Adresse">
            <Input placeholder="Rue, Quartier" {...register('address')} />
          </Field>
        </Card>

        <div className="flex gap-3">
          <Button type="button" onClick={() => router.back()}>Annuler</Button>
          <Button type="submit" variant="primary" loading={loading} className="flex-1 justify-center">
            Créer l'incubateur
          </Button>
        </div>
      </form>
    </div>
  );
}
