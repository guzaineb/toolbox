'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/services/api';
import { ExpertiseArea, ExpertProfile, AVAILABILITY_LABELS } from '@/types/expert';
import { ExpertiseAreaSelector } from '@/components/expert/ExpertiseSelector';

type Step = 'identity' | 'expertise' | 'availability';

const STEPS: { id: Step; label: string; icon: string }[] = [
  { id: 'identity', label: 'Identité professionnelle', icon: '👤' },
  { id: 'expertise', label: 'Domaines d\'expertise', icon: '🧠' },
  { id: 'availability', label: 'Disponibilité', icon: '📅' },
];

export default function ExpertFormPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>('identity');
  const [saving, setSaving] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(true);
  const [areas, setAreas] = useState<ExpertiseArea[]>([]);
  const [existing, setExisting] = useState<ExpertProfile | null>(null);
  const [error, setError] = useState('');

  // Formulaire
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [organization, setOrganization] = useState('');
  const [position, setPosition] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState<string>('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [selectedAreaIds, setSelectedAreaIds] = useState<string[]>([]);
  const [availabilityStatus, setAvailabilityStatus] = useState<'available' | 'busy' | 'unavailable'>('available');

  useEffect(() => {
    // Charger les areas + profil existant en parallèle
    Promise.all([
      api.get('/experts/expertise-areas').then((r) => setAreas(r.data)),
      api.get('/experts/me').then((r) => {
        if (r.data) {
          const p: ExpertProfile = r.data;
          setExisting(p);
          setHeadline(p.headline ?? '');
          setBio(p.bio ?? '');
          setOrganization(p.organization ?? '');
          setPosition(p.position ?? '');
          setYearsOfExperience(p.years_of_experience?.toString() ?? '');
          setLinkedinUrl(p.linkedin_url ?? '');
          setSelectedAreaIds(p.expertiseAreas?.map((a) => a.id) ?? []);
          setAvailabilityStatus((p.availability_status as any) ?? 'available');
        }
      }).catch(() => {}),
    ]).finally(() => setLoadingAreas(false));
  }, []);

  const currentStepIndex = STEPS.findIndex((s) => s.id === step);

  const validateStep = (): string => {
    if (step === 'identity' && !headline.trim()) return 'Le titre professionnel est requis.';
    if (step === 'expertise' && selectedAreaIds.length === 0) return 'Sélectionnez au moins un domaine.';
    return '';
  };

  const goNext = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError('');
    const next = STEPS[currentStepIndex + 1];
    if (next) setStep(next.id);
  };

  const goPrev = () => {
    setError('');
    const prev = STEPS[currentStepIndex - 1];
    if (prev) setStep(prev.id);
  };

  const handleSubmit = async () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError('');
    setSaving(true);

    const payload = {
      headline: headline.trim(),
      bio: bio.trim() || undefined,
      organization: organization.trim() || undefined,
      position: position.trim() || undefined,
      years_of_experience: yearsOfExperience ? parseInt(yearsOfExperience) : undefined,
      linkedin_url: linkedinUrl.trim() || undefined,
      expertiseAreaIds: selectedAreaIds,
      availability_status: availabilityStatus,
    };

    try {
      if (existing) {
        await api.patch('/experts/me', payload);
      } else {
        await api.post('/experts', payload);
      }
      router.push('/dashboard/expert');
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Une erreur est survenue.');
    } finally {
      setSaving(false);
    }
  };

  if (loadingAreas) {
    return (
      <div style={{ padding: '32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ height: '20px', background: '#f0ede8', borderRadius: '6px', width: `${60 + i * 10}%` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px', maxWidth: '640px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <Link href="/dashboard/expert" style={{ fontSize: '13px', color: '#888', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
          ← Retour
        </Link>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111', margin: 0 }}>
          {existing ? 'Modifier mon profil expert' : 'Créer mon profil expert'}
        </h1>
        <p style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>
          Renseignez vos informations pour être matchés avec des projets
        </p>
      </div>

      {/* Stepper */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '32px' }}>
        {STEPS.map((s, i) => {
          const isDone = i < currentStepIndex;
          const isActive = s.id === step;
          return (
            <div key={s.id} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: isDone ? '#16a34a' : isActive ? '#1a1a2e' : '#f0ede8',
                  color: isDone || isActive ? '#fff' : '#aaa',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: isDone ? '14px' : '13px', fontWeight: 600,
                  transition: 'all .2s',
                }}>
                  {isDone ? '✓' : i + 1}
                </div>
                <div style={{ fontSize: '11px', fontWeight: isActive ? 600 : 400, color: isActive ? '#111' : '#999', textAlign: 'center' }}>
                  {s.label}
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: '1px', background: i < currentStepIndex ? '#16a34a' : '#e8e5df', marginBottom: '20px' }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Card */}
      <div style={{
        background: '#fff', border: '1px solid #e8e5df',
        borderRadius: '16px', padding: '28px 32px',
        boxShadow: '0 2px 12px rgba(0,0,0,.05)',
      }}>
        {/* Erreur */}
        {error && (
          <div style={{
            background: '#fff5f5', border: '1px solid #fecaca',
            borderRadius: '8px', padding: '10px 14px',
            fontSize: '13px', color: '#dc2626', marginBottom: '20px',
          }}>
            ⚠ {error}
          </div>
        )}

        {/* ── STEP 1 : Identité ── */}
        {step === 'identity' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <Field label="Titre professionnel *" hint="Ex: Expert en Product Management & Lean Startup">
              <input
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Ex: Consultant en stratégie digitale"
                style={inputStyle}
              />
            </Field>
            <Field label="Biographie">
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Décrivez votre parcours et votre valeur ajoutée..."
                rows={4}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <Field label="Organisation">
                <input value={organization} onChange={(e) => setOrganization(e.target.value)} placeholder="Ex: Startup Academy" style={inputStyle} />
              </Field>
              <Field label="Poste actuel">
                <input value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Ex: Directeur Associé" style={inputStyle} />
              </Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <Field label="Années d'expérience">
                <input
                  type="number" min={0} max={50}
                  value={yearsOfExperience}
                  onChange={(e) => setYearsOfExperience(e.target.value)}
                  placeholder="Ex: 8"
                  style={inputStyle}
                />
              </Field>
              <Field label="LinkedIn">
                <input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/..." style={inputStyle} />
              </Field>
            </div>
          </div>
        )}

        {/* ── STEP 2 : Expertise ── */}
        {step === 'expertise' && (
          <ExpertiseAreaSelector
            areas={areas}
            selected={selectedAreaIds}
            onChange={setSelectedAreaIds}
            max={8}
          />
        )}

        {/* ── STEP 3 : Disponibilité ── */}
        {step === 'availability' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '13px', color: '#555', marginBottom: '4px' }}>
              Indiquez votre disponibilité actuelle pour les cohortes et missions
            </div>
            {(['available', 'busy', 'unavailable'] as const).map((status) => {
              const isSelected = availabilityStatus === status;
              const colors = { available: '#16a34a', busy: '#d97706', unavailable: '#dc2626' };
              const icons = { available: '🟢', busy: '🟡', unavailable: '🔴' };
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setAvailabilityStatus(status)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '14px 16px',
                    border: `1.5px solid ${isSelected ? colors[status] : '#e8e5df'}`,
                    borderRadius: '10px',
                    background: isSelected ? `${colors[status]}10` : '#fff',
                    cursor: 'pointer', textAlign: 'left', transition: 'all .15s',
                  }}
                >
                  <span style={{ fontSize: '20px' }}>{icons[status]}</span>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: isSelected ? colors[status] : '#333' }}>
                      {AVAILABILITY_LABELS[status]}
                    </div>
                    <div style={{ fontSize: '12px', color: '#888' }}>
                      {status === 'available' && 'Prêt à recevoir des missions et rejoindre des cohortes'}
                      {status === 'busy' && 'Disponible mais avec une capacité limitée'}
                      {status === 'unavailable' && 'Non disponible pour le moment'}
                    </div>
                  </div>
                  {isSelected && (
                    <span style={{ marginLeft: 'auto', color: colors[status], fontWeight: 700, fontSize: '16px' }}>✓</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #f0ede8' }}>
          <button
            type="button"
            onClick={goPrev}
            disabled={currentStepIndex === 0}
            style={{
              padding: '10px 20px', background: 'transparent',
              border: '1.5px solid #e8e5df', borderRadius: '8px',
              fontSize: '13px', cursor: currentStepIndex === 0 ? 'not-allowed' : 'pointer',
              color: currentStepIndex === 0 ? '#ccc' : '#555',
            }}
          >
            ← Précédent
          </button>

          {currentStepIndex < STEPS.length - 1 ? (
            <button type="button" onClick={goNext} style={primaryBtnStyle}>
              Suivant →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              style={{ ...primaryBtnStyle, opacity: saving ? 0.6 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}
            >
              {saving ? 'Enregistrement...' : existing ? '✓ Mettre à jour' : '✓ Créer mon profil'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Helpers UI ────────────────────────────────────────────────────────────────

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '13px', fontWeight: 600, color: '#333' }}>{label}</label>
      {hint && <span style={{ fontSize: '11.5px', color: '#aaa', marginTop: '-3px' }}>{hint}</span>}
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '10px 12px',
  border: '1.5px solid #e8e5df',
  borderRadius: '8px',
  fontSize: '13.5px',
  color: '#111',
  outline: 'none',
  background: '#fafaf8',
  width: '100%',
  boxSizing: 'border-box',
};

const primaryBtnStyle: React.CSSProperties = {
  padding: '10px 24px',
  background: '#1a1a2e',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontSize: '13.5px',
  fontWeight: 600,
  cursor: 'pointer',
};
