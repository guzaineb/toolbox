'use client';

import { useEffect, useState } from 'react';
import api from '@/services/api';
import { Button, Card, ErrorAlert, Field, Input, Select, Textarea } from '@/components/shared/ui';
import { cn } from '@/lib/utils';

interface ExpertiseArea {
  id: string;
  name: string;
  category?: string;
}

interface ExpertForm {
  headline: string;
  organization: string;
  position: string;
  years_of_experience: number;
  availability_status: string;
  linkedin_url: string;
  bio: string;
}

interface AreaLevel {
  id: string;
  level: string;
  years: number;
}

export default function ExpertPage() {
  const [allAreas, setAllAreas] = useState<ExpertiseArea[]>([]);
  const [selectedAreaIds, setSelectedAreaIds] = useState<string[]>([]);
  const [areaLevels, setAreaLevels] = useState<Record<string, AreaLevel>>({});
  const [form, setForm] = useState<ExpertForm>({
    headline: '',
    organization: '',
    position: '',
    years_of_experience: 0,
    availability_status: 'available',
    linkedin_url: '',
    bio: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Charge les areas disponibles ET le profil existant en parallèle
    Promise.all([
      api.get('/expert/expertise-areas'),
      api.get('/expert/me').catch(() => null),
    ]).then(([areasRes, meRes]) => {
      setAllAreas(areasRes.data);
      if (meRes?.data) {
        const p = meRes.data;
        setForm({
          headline: p.headline ?? '',
          organization: p.organization ?? '',
          position: p.position ?? '',
          years_of_experience: p.years_of_experience ?? 0,
          availability_status: p.availability_status ?? 'available',
          linkedin_url: p.linkedin_url ?? '',
          bio: p.bio ?? '',
        });
        if (p.expertiseAreas?.length) {
          setSelectedAreaIds(p.expertiseAreas.map((a: ExpertiseArea) => a.id));
          const levels: Record<string, AreaLevel> = {};
          p.expertiseAreas.forEach((a: ExpertiseArea) => {
            levels[a.id] = { id: a.id, level: 'Expert', years: 1 };
          });
          setAreaLevels(levels);
        }
      }
    }).finally(() => setLoading(false));
  }, []);

  const toggleArea = (id: string) => {
    setSelectedAreaIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
    if (!areaLevels[id]) {
      setAreaLevels(prev => ({ ...prev, [id]: { id, level: 'Expert', years: 1 } }));
    }
  };

  const handleSaveIdentity = async () => {
    setSaving(true); setError(null); setSuccess(false);
    try {
      await api.patch('/expert/me', {
        ...form,
        expertiseAreaIds: selectedAreaIds,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  // Groupe les areas par catégorie
  const grouped = allAreas.reduce<Record<string, ExpertiseArea[]>>((acc, a) => {
    const cat = a.category ?? 'Général';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(a);
    return acc;
  }, {});

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
      <h1 className="font-display text-[26px] mb-1">Profil expert</h1>
      <p className="text-[13px] text-text-2 mb-7">Définissez vos domaines d'expertise et votre disponibilité</p>

      {error && <div className="mb-5"><ErrorAlert message={error} /></div>}
      {success && (
        <div className="mb-5 p-3 rounded bg-accent-light text-accent text-[13px] border border-accent/20">
          ✓ Profil enregistré avec succès.
        </div>
      )}

      {/* Identité */}
      <Card className="mb-3.5">
        <div className="text-[11px] font-semibold uppercase tracking-[.06em] text-text-2 mb-[14px]">
          Identité professionnelle
        </div>
        <Field label="Titre / headline">
          <Input
            value={form.headline}
            onChange={e => setForm(f => ({ ...f, headline: e.target.value }))}
            placeholder="Expert en financement startups…"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Organisation">
            <Input value={form.organization} onChange={e => setForm(f => ({ ...f, organization: e.target.value }))} />
          </Field>
          <Field label="Poste">
            <Input value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Années d'expérience">
            <Input
              type="number"
              value={form.years_of_experience}
              onChange={e => setForm(f => ({ ...f, years_of_experience: Number(e.target.value) }))}
            />
          </Field>
          <Field label="Disponibilité">
            <Select
              value={form.availability_status}
              onChange={e => setForm(f => ({ ...f, availability_status: e.target.value }))}
            >
              <option value="available">Disponible</option>
              <option value="partial">Partiellement dispo</option>
              <option value="unavailable">Non disponible</option>
            </Select>
          </Field>
        </div>
        <Field label="LinkedIn">
          <Input value={form.linkedin_url} onChange={e => setForm(f => ({ ...f, linkedin_url: e.target.value }))} />
        </Field>
        <Field label="Bio expert">
          <Textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
        </Field>
        <Button variant="primary" className="text-[12px]" onClick={handleSaveIdentity} loading={saving}>
          Enregistrer
        </Button>
      </Card>

      {/* Expertise areas */}
      <Card>
        <div className="text-[11px] font-semibold uppercase tracking-[.06em] text-text-2 mb-3">
          Domaines d'expertise
        </div>
        <div className="text-[12px] text-text-2 mb-3">Sélectionnez vos domaines (cliquez pour activer)</div>

        {/* Grouped tags */}
        {Object.entries(grouped).map(([cat, areas]) => (
          <div key={cat} className="mb-3">
            <div className="text-[11px] text-text-2 mb-1.5">{cat}</div>
            <div className="flex flex-wrap">
              {areas.map(area => (
                <button
                  key={area.id}
                  onClick={() => toggleArea(area.id)}
                  className={cn(
                    'inline-flex items-center gap-1 text-[12px] px-2.5 py-1 rounded-full border m-[3px] cursor-pointer transition-all',
                    selectedAreaIds.includes(area.id)
                      ? 'bg-accent-light text-accent border-accent'
                      : 'bg-bg text-text-2 border-border hover:border-accent'
                  )}
                >
                  {area.name}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Detail des areas sélectionnées */}
        {selectedAreaIds.length > 0 && (
          <>
            <div className="h-px bg-border my-4" />
            <div className="text-[11px] font-semibold uppercase tracking-[.06em] text-text-2 mb-2.5">
              Détail des expertises actives
            </div>
            {selectedAreaIds.map(id => {
              const area = allAreas.find(a => a.id === id);
              if (!area) return null;
              const lvl = areaLevels[id] ?? { level: 'Expert', years: 1 };
              return (
                <div key={id} className="flex items-center gap-3 py-3 border-b border-border last:border-none">
                  <span className="text-[13px] font-medium flex-1">{area.name}</span>
                  <Select
                    className="!w-auto !text-[12px] !py-1 !px-2"
                    value={lvl.level}
                    onChange={e => setAreaLevels(prev => ({
                      ...prev,
                      [id]: { ...prev[id], level: e.target.value },
                    }))}
                  >
                    <option>Expert</option>
                    <option>Intermédiaire</option>
                    <option>Débutant</option>
                  </Select>
                  <input
                    type="number"
                    value={lvl.years}
                    onChange={e => setAreaLevels(prev => ({
                      ...prev,
                      [id]: { ...prev[id], years: Number(e.target.value) },
                    }))}
                    className="w-14 text-[12px] py-1 px-2 text-center border border-border rounded-sm ml-2 focus:border-accent outline-none"
                  />
                  <span className="text-[11px] text-text-2">ans</span>
                </div>
              );
            })}
            <Button variant="primary" className="text-[12px] mt-3" onClick={handleSaveIdentity} loading={saving}>
              Enregistrer les expertises
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}
