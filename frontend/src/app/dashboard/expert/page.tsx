'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/services/api';
import {
  ExpertProfile,
  ExpertiseArea,
  AVAILABILITY_LABELS,
  AVAILABILITY_COLORS,
} from '@/types/expert';

export default function ExpertDashboardPage() {
  const [profile, setProfile] = useState<ExpertProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/experts/me')
      .then((r) => setProfile(r.data))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  const handleRemoveArea = async (areaId: string) => {
    if (!confirm('Retirer ce domaine d\'expertise ?')) return;
    try {
      await api.delete(`/experts/expertise/${areaId}`);
      setProfile((prev) =>
        prev
          ? { ...prev, expertiseAreas: prev.expertiseAreas.filter((a) => a.id !== areaId) }
          : prev,
      );
    } catch {
      alert('Erreur lors de la suppression.');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ height: '24px', background: '#f0ede8', borderRadius: '6px', width: `${50 + i * 15}%` }} />
          ))}
        </div>
      </div>
    );
  }

  // Pas encore de profil
  if (!profile) {
    return (
      <div style={{ padding: '32px', maxWidth: '600px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 6px' }}>Mon profil expert</h1>
        <p style={{ fontSize: '13px', color: '#888', marginBottom: '24px' }}>
          Vous n'avez pas encore de profil expert.
        </p>
        <div style={{
          border: '2px dashed #e8e5df', borderRadius: '16px',
          padding: '40px', textAlign: 'center',
        }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🧠</div>
          <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '6px' }}>
            Créez votre profil expert
          </div>
          <p style={{ fontSize: '13px', color: '#888', marginBottom: '20px' }}>
            Renseignez vos domaines d'expertise pour être sollicité dans les cohortes.
          </p>
          <Link href="/dashboard/expert/create">
            <button style={primaryBtn}>+ Créer mon profil expert</button>
          </Link>
        </div>
      </div>
    );
  }

  // Grouper les domaines par catégorie
  const grouped = profile.expertiseAreas.reduce((acc, area) => {
    if (!acc[area.category]) acc[area.category] = [];
    acc[area.category].push(area);
    return acc;
  }, {} as Record<string, ExpertiseArea[]>);

  const availColor = AVAILABILITY_COLORS[profile.availability_status] ?? '#888';
  const availLabel = AVAILABILITY_LABELS[profile.availability_status] ?? profile.availability_status;

  return (
    <div style={{ padding: '32px', maxWidth: '720px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 4px' }}>Mon profil expert</h1>
          <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>
            Gérez vos informations et domaines d'expertise
          </p>
        </div>
        <Link href="/dashboard/expert/create">
          <button style={secondaryBtn}>✏ Modifier</button>
        </Link>
      </div>

      {/* Identity Card */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '12px',
            background: '#f0ede8', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '24px', flexShrink: 0,
          }}>
            🧠
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '17px', fontWeight: 700, color: '#111', marginBottom: '2px' }}>
              {profile.headline}
            </div>
            {(profile.position || profile.organization) && (
              <div style={{ fontSize: '13px', color: '#666' }}>
                {[profile.position, profile.organization].filter(Boolean).join(' · ')}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '3px 10px', borderRadius: '100px',
                background: `${availColor}15`,
                border: `1px solid ${availColor}40`,
                fontSize: '12px', fontWeight: 600, color: availColor,
              }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: availColor, display: 'inline-block' }} />
                {availLabel}
              </span>
              {profile.years_of_experience && (
                <span style={{ fontSize: '12px', color: '#888' }}>
                  · {profile.years_of_experience} ans d'expérience
                </span>
              )}
            </div>
          </div>
        </div>

        {profile.bio && (
          <p style={{ fontSize: '13.5px', color: '#444', lineHeight: 1.7, margin: '0 0 16px' }}>
            {profile.bio}
          </p>
        )}

        {profile.linkedin_url && (
          <a
            href={profile.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: '12.5px', color: '#0077b5', textDecoration: 'none' }}
          >
            🔗 Voir sur LinkedIn
          </a>
        )}
      </div>

      {/* Domaines d'expertise */}
      <div style={{ ...card, marginTop: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 600 }}>Domaines d'expertise</div>
            <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
              {profile.expertiseAreas.length} domaine{profile.expertiseAreas.length !== 1 ? 's' : ''} associé{profile.expertiseAreas.length !== 1 ? 's' : ''}
            </div>
          </div>
          <Link href="/dashboard/expert/create">
            <button style={{ ...secondaryBtn, fontSize: '12px', padding: '6px 12px' }}>+ Modifier</button>
          </Link>
        </div>

        {profile.expertiseAreas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#aaa', fontSize: '13px' }}>
            Aucun domaine sélectionné
          </div>
        ) : (
          Object.entries(grouped).map(([category, items]) => (
            <div key={category} style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: '#bbb', marginBottom: '8px' }}>
                {category}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                {items.map((area) => (
                  <span
                    key={area.id}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '5px 12px', borderRadius: '100px',
                      background: '#f0ede8', fontSize: '12.5px', fontWeight: 500, color: '#333',
                    }}
                  >
                    {area.name}
                    <button
                      onClick={() => handleRemoveArea(area.id)}
                      title="Retirer"
                      style={{
                        background: 'none', border: 'none', padding: '0',
                        cursor: 'pointer', color: '#aaa', lineHeight: 1,
                        fontSize: '13px', display: 'flex', alignItems: 'center',
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats légères */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '16px' }}>
        <StatCard icon="🎯" value={profile.expertiseAreas.length} label="Domaines" />
        <StatCard icon="📅" value={profile.years_of_experience ?? '—'} label="Années exp." />
        <StatCard icon="📡" value={availLabel} label="Statut" small />
      </div>
    </div>
  );
}

// ── Helpers UI ────────────────────────────────────────────────────────────────

function StatCard({ icon, value, label, small }: { icon: string; value: string | number; label: string; small?: boolean }) {
  return (
    <div style={{ ...card, textAlign: 'center', padding: '16px' }}>
      <div style={{ fontSize: '24px', marginBottom: '6px' }}>{icon}</div>
      <div style={{ fontSize: small ? '13px' : '20px', fontWeight: 700, color: '#111' }}>{value}</div>
      <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>{label}</div>
    </div>
  );
}

const card: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #e8e5df',
  borderRadius: '14px',
  padding: '20px 24px',
  boxShadow: '0 1px 6px rgba(0,0,0,.04)',
};

const primaryBtn: React.CSSProperties = {
  padding: '10px 20px',
  background: '#1a1a2e',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontSize: '13.5px',
  fontWeight: 600,
  cursor: 'pointer',
};

const secondaryBtn: React.CSSProperties = {
  padding: '8px 16px',
  background: '#fff',
  color: '#1a1a2e',
  border: '1.5px solid #e8e5df',
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: 500,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};
