'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { projectService } from '@/services/project.service';
import { sectorService } from '@/services/sector.service';
import { developmentPhaseService } from '@/services/development-phase.service';
import { Button, Card, Field, Input, Textarea, Select, ErrorAlert } from '@/components/shared/ui';
import { ArrowLeft, Loader2 } from 'lucide-react';
import type { Sector, DevelopmentPhase } from '@/types/reference';

export default function CreateProjectPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sectorId, setSectorId] = useState('');
  const [developmentPhaseId, setDevelopmentPhaseId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sectors, setSectors] = useState<Sector[]>([]);
  const [phases, setPhases] = useState<DevelopmentPhase[]>([]);
  const [loadingRefs, setLoadingRefs] = useState(true);

  useEffect(() => {
    async function loadRefs() {
      try {
        const [sectorsData, phasesData] = await Promise.all([
          sectorService.getAll(),
          developmentPhaseService.getAll(),
        ]);
        setSectors(sectorsData);
        setPhases(phasesData);
      } catch {
        setError('Impossible de charger les listes de sélection');
      } finally {
        setLoadingRefs(false);
      }
    }
    loadRefs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setError(null);
    try {
      const project = await projectService.create({
        name: name.trim(),
        description: description.trim() || undefined,
        sector_id: sectorId || undefined,
        development_phase_id: developmentPhaseId || undefined,
      });
      router.push(`/dashboard/project-owner/projects/${project.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Erreur lors de la création');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-[900px] mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-[12px] text-ink3 hover:text-ink mb-6 transition-colors"
      >
        <ArrowLeft size={14} /> Retour
      </button>

      <Card className="p-[24px_28px]">
        <h1 className="font-syne text-[20px] font-extrabold text-ink mb-1">Créer un nouveau projet</h1>
        <p className="text-[13px] text-ink3 mb-6">
          Donnez un nom à votre projet pour commencer votre parcours entrepreneurial.
        </p>

        {error && <ErrorAlert message={error} className="mb-4" />}

        <form onSubmit={handleSubmit}>
          <Field label="Nom du projet" required>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Ma startup innovante"
              autoFocus
            />
          </Field>

          <Field label="Description (optionnelle)">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez brièvement votre projet..."
              rows={3}
            />
          </Field>

          <Field label="Secteur d'activité (optionnel)">
            <Select
              value={sectorId}
              onChange={(e) => setSectorId(e.target.value)}
              disabled={loadingRefs}
            >
              <option value="">Sélectionnez un secteur...</option>
              {sectors.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Select>
          </Field>

          <Field label="Phase de développement (optionnelle)">
            <Select
              value={developmentPhaseId}
              onChange={(e) => setDevelopmentPhaseId(e.target.value)}
              disabled={loadingRefs}
            >
              <option value="">Sélectionnez une phase...</option>
              {phases.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </Select>
          </Field>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="default" type="button" onClick={() => router.back()}>
              Annuler
            </Button>
            <Button variant="primary" type="submit" loading={saving} disabled={!name.trim()}>
              {saving ? 'Création...' : 'Créer le projet'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
