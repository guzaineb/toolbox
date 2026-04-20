"use client"

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { Button, Card, ErrorAlert, Field, Input, Select, Textarea } from '@/components/shared/ui';
import { ProfileForm } from '@/types/profil';

export default function ProfileEditPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  // Initialisation du formulaire
  const [form, setForm] = useState<ProfileForm>({
    first_name: '',
    last_name: '',
    phone: '',
    birth_date: '',
    country: '',
    city: '',
    address: '',
    bio: '',
    linkedin: '',
    preferred_language: 'fr',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Pré-remplissage du formulaire avec les données existantes
  useEffect(() => {
    if (user?.profile) {
      const p = user.profile as any;
      setForm({
        first_name: p.first_name ?? '',
        last_name: p.last_name ?? '',
        phone: p.phone ?? '',
        // Transformation de la date ISO (ex: 1990-05-20T00:00:00Z) en format YYYY-MM-DD pour l'input date
        birth_date: p.birth_date ? new Date(p.birth_date).toISOString().split('T')[0] : '',
        country: p.country ?? '',
        city: p.city ?? '',
        address: p.address ?? '',
        bio: p.bio ?? '',
        linkedin: p.linkedin ?? '',
        preferred_language: p.preferred_language ?? 'fr',
      });
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      /**
       * NETTOYAGE DU PAYLOAD
       * On transforme les chaînes vides en 'undefined' ou on les supprime.
       * Cela permet au validateur @IsOptional() du backend de ne pas rejeter la requête.
       */
      const payload: any = {};
      Object.keys(form).forEach((key) => {
        const value = (form as any)[key];
        if (value !== '' && value !== null) {
          payload[key] = value;
        }
      });

      // Envoi de la requête au backend
      await api.patch('/users/profile', payload);
      
      setSuccess(true);

      // Redirection après succès
      setTimeout(() => {
        setSuccess(false);
        router.push('/dashboard/profile');
        // Optionnel : Forcer le rafraîchissement des données utilisateur
        // window.location.reload(); 
      }, 1500);

    } catch (err: any) {
      console.error("Erreur mise à jour profil:", err);
      // Gestion propre du message d'erreur (NestJS renvoie souvent un tableau dans err.response.data.message)
      const backendMessage = err?.response?.data?.message;
      setError(Array.isArray(backendMessage) ? backendMessage[0] : (backendMessage ?? 'Erreur lors de la sauvegarde'));
    } finally {
      setSaving(false);
    }
  };

  // Calcul des initiales pour l'avatar
  const initials = `${form.first_name?.charAt(0) || ''}${form.last_name?.charAt(0) || ''}`.toUpperCase() || '??';

  return (
    <div className="p-8 max-w-[800px]">
      {/* Tab nav */}
      <div className="flex gap-0.5 bg-bg p-[3px] rounded-sm mb-[22px] border border-border w-fit">
        <Link href="/dashboard/profile">
          <span className="px-3.5 py-1.5 rounded-[5px] text-[12px] font-medium bg-transparent text-text-2 hover:text-text cursor-pointer">
            Vue publique
          </span>
        </Link>
        <span className="px-3.5 py-1.5 rounded-[5px] text-[12px] font-medium bg-surface text-text shadow-sm">
          Modifier
        </span>
      </div>

      <h1 className="font-display text-[26px] mb-1">Modifier le profil</h1>
      <p className="text-[13px] text-text-2 mb-7">Ces informations sont visibles par les autres membres</p>

      {error && <div className="mb-5"><ErrorAlert message={error} /></div>}
      
      {success && (
        <div className="mb-5 p-3 rounded bg-green-50 text-green-600 text-[13px] border border-green-200">
          ✓ Profil mis à jour avec succès. Redirection…
        </div>
      )}

      <Card>
        {/* Row d'en-tête (Avatar & Email) */}
        <div className="flex items-center gap-[14px] mb-5 pb-5 border-b border-border">
          <div className="w-14 h-14 rounded-full bg-accent-light text-accent flex items-center justify-center text-[18px] font-semibold">
            {initials}
          </div>
          <div>
            <div className="text-[13px] font-medium">{form.first_name} {form.last_name}</div>
            <div className="text-[12px] text-text-2">{user?.email}</div>
          </div>
        </div>

        {/* Formulaire en deux colonnes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Prénom">
            <Input 
              value={form.first_name} 
              onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} 
            />
          </Field>
          <Field label="Nom">
            <Input 
              value={form.last_name} 
              onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} 
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Téléphone">
            <Input 
              value={form.phone} 
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} 
              placeholder="+216 -- --- ---" 
            />
          </Field>
          <Field label="Date de naissance">
            <Input 
              type="date" 
              value={form.birth_date} 
              onChange={e => setForm(f => ({ ...f, birth_date: e.target.value }))} 
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Pays">
            <Select 
              value={form.country} 
              onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
            >
              <option value="">— Sélectionner —</option>
              <option value="TN">Tunisie</option>
              <option value="MA">Maroc</option>
              <option value="DZ">Algérie</option>
              <option value="FR">France</option>
            </Select>
          </Field>
          <Field label="Ville">
            <Input 
              value={form.city} 
              onChange={e => setForm(f => ({ ...f, city: e.target.value }))} 
            />
          </Field>
        </div>

        <Field label="Adresse">
          <Input 
            value={form.address} 
            onChange={e => setForm(f => ({ ...f, address: e.target.value }))} 
          />
        </Field>

        <Field label="Bio (Présentation)">
          <Textarea 
            value={form.bio} 
            onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} 
            rows={4}
          />
        </Field>

        <Field label="Profil LinkedIn">
          <Input 
            value={form.linkedin} 
            onChange={e => setForm(f => ({ ...f, linkedin: e.target.value }))} 
            placeholder="https://linkedin.com/in/votre-profil" 
          />
        </Field>

        <Field label="Langue préférée">
          <Select 
            value={form.preferred_language} 
            onChange={e => setForm(f => ({ ...f, preferred_language: e.target.value }))}
          >
            <option value="fr">Français</option>
            <option value="ar">Arabe</option>
            <option value="en">Anglais</option>
          </Select>
        </Field>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <Link href="/dashboard/profile">
            <Button type="button" variant="outline">Annuler</Button>
          </Link>
          <Button 
            variant="primary" 
            className="flex-1 justify-center" 
            onClick={handleSave} 
            loading={saving}
            disabled={saving}
          >
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </Button>
        </div>
      </Card>
    </div>
  );
}