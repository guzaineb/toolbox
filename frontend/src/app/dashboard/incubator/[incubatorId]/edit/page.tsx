// app/dashboard/incubator/[incubatorId]/edit/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '@/services/api';
import { Button, Card, ErrorAlert, Field, Input, Select, Textarea } from '@/components/shared/ui';

interface EditIncubatorForm {
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
  logo_url?: string;
  tax_id?: string;
  registration_number?: string;
  foundation_date?: string;
}

export default function EditIncubatorPage() {
  const { incubatorId } = useParams<{ incubatorId: string }>();
  const router = useRouter();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<EditIncubatorForm>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (incubatorId) {
      api.get(`/incubators/${incubatorId}`)
        .then(res => {
          const data = res.data;
          Object.keys(data).forEach(key => {
            if (data[key] !== undefined && data[key] !== null) {
              setValue(key as keyof EditIncubatorForm, data[key]);
            }
          });
        })
        .catch(err => setError(err?.response?.data?.message))
        .finally(() => setLoading(false));
    }
  }, [incubatorId, setValue]);

  const onSubmit = async (data: EditIncubatorForm) => {
    setSubmitting(true);
    setError(null);
    try {
      await api.patch(`/incubators/${incubatorId}`, data);
      router.push(`/dashboard/incubator/${incubatorId}`);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erreur lors de la modification');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-3">
          <div className="h-7 w-48 bg-border rounded" />
          <div className="h-24 bg-border rounded mt-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[600px]">
      <h1 className="font-display text-[26px] mb-1">Modifier l'incubateur</h1>
      <p className="text-[13px] text-text-2 mb-7">Modifiez les informations de votre structure</p>

      {error && <div className="mb-5"><ErrorAlert message={error} /></div>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="space-y-4">
          <Field label="Nom de l'incubateur *" required>
            <Input {...register('name', { required: 'Le nom est requis' })} />
            {errors.name && <span className="text-red-500 text-[11px]">{errors.name.message}</span>}
          </Field>

          <Field label="Slug *" required>
            <Input {...register('slug', { required: 'Le slug est requis' })} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Raison sociale">
              <Input {...register('legal_name')} />
            </Field>
            <Field label="N° d'enregistrement">
              <Input {...register('registration_number')} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="NIF (Tax ID)">
              <Input {...register('tax_id')} />
            </Field>
            <Field label="Date de fondation">
              <Input type="date" {...register('foundation_date')} />
            </Field>
          </div>

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
            <Textarea rows={4} {...register('description')} />
          </Field>

          <div className="border-t border-border pt-4">
            <h3 className="text-[13px] font-semibold mb-3">Contact</h3>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Email">
                <Input type="email" {...register('email')} />
              </Field>
              <Field label="Téléphone">
                <Input {...register('phone')} />
              </Field>
            </div>
            <Field label="Site web">
              <Input {...register('website_url')} placeholder="https://..." />
            </Field>
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="text-[13px] font-semibold mb-3">Localisation</h3>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Pays">
                <Select {...register('country')}>
                  <option value="">— Pays —</option>
                  <option value="TN">Tunisie</option>
                  <option value="FR">France</option>
                  <option value="MA">Maroc</option>
                  <option value="DZ">Algérie</option>
                  <option value="SN">Sénégal</option>
                  <option value="CI">Côte d'Ivoire</option>
                </Select>
              </Field>
              <Field label="Ville">
                <Input {...register('city')} />
              </Field>
            </div>
            <Field label="Adresse">
              <Input {...register('address')} />
            </Field>
            <Field label="Logo URL">
              <Input {...register('logo_url')} placeholder="https://..." />
            </Field>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" onClick={() => router.back()}>Annuler</Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Enregistrer les modifications
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}