'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/services/api';

type State = 'idle' | 'loading' | 'accepted' | 'declined' | 'error';

export default function InvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [state, setState] = useState<State>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleAccept = async () => {
    if (!token) { setErrorMsg('Token manquant dans l\'URL.'); setState('error'); return; }
    setState('loading');
    try {
      // On cherche l'incubatorId dans l'URL aussi (?token=...&incubatorId=...)
      const incubatorId = searchParams.get('incubatorId') ?? '';
      await api.post(`/incubators/${incubatorId}/members/accept`, { token });
      setState('accepted');
      setTimeout(() => router.push('/dashboard'), 2000);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message ?? 'Une erreur est survenue.');
      setState('error');
    }
  };

  const handleDecline = () => {
    setState('declined');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--color-bg, #f7f6f3)' }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: '#fff',
        border: '1px solid #e8e5df',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 24px rgba(0,0,0,.07)',
      }}>

        {/* Header strip */}
        <div style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)',
          padding: '28px 32px 24px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decorative circles */}
          <div style={{
            position: 'absolute', top: '-30px', right: '-30px',
            width: '120px', height: '120px', borderRadius: '50%',
            background: 'rgba(255,255,255,.04)', pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: '-20px', left: '60px',
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'rgba(255,255,255,.03)', pointerEvents: 'none',
          }} />

          <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.45)', marginBottom: '16px' }}>
            ProjectStruct
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '10px',
              background: 'rgba(255,255,255,.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px', flexShrink: 0,
            }}>🏢</div>
            <div>
              <div style={{ color: '#fff', fontWeight: 600, fontSize: '16px', lineHeight: 1.2 }}>
                StartUp Tunisia Hub
              </div>
              <div style={{ color: 'rgba(255,255,255,.55)', fontSize: '12px', marginTop: '3px' }}>
                vous invite à rejoindre l'équipe
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '28px 32px' }}>

          {/* ── États finaux ── */}
          {state === 'accepted' && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎉</div>
              <div style={{ fontWeight: 700, fontSize: '17px', marginBottom: '6px', color: '#111' }}>
                Invitation acceptée !
              </div>
              <p style={{ fontSize: '13px', color: '#888' }}>
                Bienvenue dans l'équipe. Redirection vers le dashboard…
              </p>
            </div>
          )}

          {state === 'declined' && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>👋</div>
              <div style={{ fontWeight: 700, fontSize: '17px', marginBottom: '6px', color: '#111' }}>
                Invitation déclinée
              </div>
              <p style={{ fontSize: '13px', color: '#888', marginBottom: '20px' }}>
                Vous pouvez fermer cette page.
              </p>
              <Link href="/" style={{ fontSize: '13px', color: '#1a1a2e', textDecoration: 'underline' }}>
                Retour à l'accueil
              </Link>
            </div>
          )}

          {state === 'error' && (
            <div>
              <div style={{
                background: '#fff5f5', border: '1px solid #fecaca',
                borderRadius: '8px', padding: '12px 14px',
                fontSize: '13px', color: '#dc2626', marginBottom: '20px',
              }}>
                ⚠ {errorMsg}
              </div>
              <button onClick={() => setState('idle')} style={linkBtnStyle}>
                ← Réessayer
              </button>
            </div>
          )}

          {/* ── État principal ── */}
          {(state === 'idle' || state === 'loading') && (
            <>
              <h1 style={{ fontSize: '19px', fontWeight: 700, color: '#111', marginBottom: '6px' }}>
                Invitation reçue
              </h1>
              <p style={{ fontSize: '13px', color: '#666', marginBottom: '20px', lineHeight: 1.6 }}>
                <strong style={{ color: '#111' }}>Mehdi Trabelsi</strong> vous invite à rejoindre{' '}
                <strong style={{ color: '#111' }}>StartUp Tunisia Hub</strong> en tant que{' '}
                <strong style={{ color: '#1a1a2e' }}>Program Manager</strong>.
              </p>

              {/* Info card */}
              <div style={{
                background: '#f9f8f6', borderRadius: '10px',
                padding: '14px 16px', marginBottom: '24px',
                fontSize: '12.5px', color: '#555',
                display: 'flex', flexDirection: 'column', gap: '7px',
              }}>
                <Row label="Incubateur" value="StartUp Tunisia Hub" />
                <Row label="Rôle proposé" value="Program Manager" accent />
                <Row label="Invité par" value="Mehdi Trabelsi (Admin)" />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  onClick={handleAccept}
                  disabled={state === 'loading'}
                  style={{
                    width: '100%', padding: '13px',
                    background: state === 'loading' ? '#555' : '#1a1a2e',
                    color: '#fff', border: 'none', borderRadius: '9px',
                    fontSize: '14px', fontWeight: 600, cursor: state === 'loading' ? 'not-allowed' : 'pointer',
                    transition: 'background .2s, transform .1s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  }}
                  onMouseEnter={e => { if (state !== 'loading') (e.currentTarget as HTMLButtonElement).style.background = '#2d2d4e'; }}
                  onMouseLeave={e => { if (state !== 'loading') (e.currentTarget as HTMLButtonElement).style.background = '#1a1a2e'; }}
                >
                  {state === 'loading' ? (
                    <>
                      <Spinner /> Acceptation…
                    </>
                  ) : (
                    <>✓ Accepter l'invitation</>
                  )}
                </button>

                <button
                  onClick={handleDecline}
                  disabled={state === 'loading'}
                  style={{
                    width: '100%', padding: '13px',
                    background: 'transparent', color: '#dc2626',
                    border: '1.5px solid #fecaca', borderRadius: '9px',
                    fontSize: '14px', fontWeight: 500,
                    cursor: state === 'loading' ? 'not-allowed' : 'pointer',
                    transition: 'background .2s, border-color .2s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#fff5f5'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                >
                  Décliner l'invitation
                </button>
              </div>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '20px 0' }}>
                <div style={{ flex: 1, height: '1px', background: '#e8e5df' }} />
                <span style={{ fontSize: '11px', color: '#aaa' }}>Pas encore de compte ?</span>
                <div style={{ flex: 1, height: '1px', background: '#e8e5df' }} />
              </div>

    
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ color: '#999' }}>{label}</span>
      <span style={{
        fontWeight: 600,
        color: accent ? '#1a1a2e' : '#333',
        background: accent ? '#eeedf9' : 'transparent',
        padding: accent ? '2px 8px' : '0',
        borderRadius: accent ? '100px' : '0',
        fontSize: accent ? '11.5px' : 'inherit',
      }}>
        {value}
      </span>
    </div>
  );
}

function Spinner() {
  return (
    <span style={{
      display: 'inline-block',
      width: '14px', height: '14px',
      border: '2px solid rgba(255,255,255,.3)',
      borderTopColor: '#fff',
      borderRadius: '50%',
      animation: 'spin .7s linear infinite',
    }} />
  );
}

const linkBtnStyle: React.CSSProperties = {
  background: 'none', border: 'none', padding: 0,
  fontSize: '13px', color: '#1a1a2e', cursor: 'pointer',
  textDecoration: 'underline',
};