<<<<<<< HEAD
"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
=======
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthShell from '@/components/auth/AuthShell';
import LeftPanel from '@/components/auth/LeftPanel';
import RightPanel from '@/components/auth/RightPanel';
import { VerifySVG } from '@/components/auth/GeoSVGs';
import { cn } from '@/lib/utils';
>>>>>>> 38c6efc (Misa a jour les interfaces)

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tokenFromUrl = searchParams.get('token');
  const emailParam = searchParams.get('email');
  const codeFromUrl = searchParams.get('code');

  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'needCode'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');
  const [email, setEmail] = useState(emailParam || '');
  const [code, setCode] = useState(codeFromUrl || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tokenFromUrl) {
      verifyWithToken(tokenFromUrl);
    } else {
      setStatus('needCode');
    }
  }, [tokenFromUrl]);

  const verifyWithToken = async (token: string) => {
    try {
      const res = await fetch(
        `${API_URL}/auth/verify-email?token=${encodeURIComponent(token)}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Échec de la vérification');
      setStatus('success');
<<<<<<< HEAD
=======
      // Redirection automatique après 3 secondes
      setTimeout(() => {
        router.push('/login');
      }, 3000);
>>>>>>> 38c6efc (Misa a jour les interfaces)
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Lien invalide ou expiré.');
    }
  };

  const verifyWithCode = async () => {
    if (!email || !code) {
      setErrorMessage('Veuillez renseigner votre email et le code.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Code invalide');
      setStatus('success');
<<<<<<< HEAD
=======
      setTimeout(() => {
        router.push('/login');
      }, 3000);
>>>>>>> 38c6efc (Misa a jour les interfaces)
    } catch (err: any) {
      setErrorMessage(err.message || 'Vérification échouée.');
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  // LOADING
  if (status === 'verifying') return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>Project<span style={styles.accent}>Struct</span></div>
        <div style={styles.iconBox('#6366f1')}>⏳</div>
        <h1 style={styles.title}>Vérification en cours...</h1>
        <p style={styles.sub}>Veuillez patienter quelques instants.</p>
        <div style={styles.spinner} />
      </div>
    </div>
  );

  // SUCCESS
  if (status === 'success') return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>Project<span style={styles.accent}>Struct</span></div>
        <div style={styles.iconBox('#22c55e')}>✓</div>
        <h1 style={styles.title}>Email vérifié !</h1>
        <p style={styles.sub}>Votre compte est activé. Vous pouvez maintenant vous connecter.</p>
        <button style={styles.btn} onClick={() => router.push('/login')}>
          Se connecter →
        </button>
      </div>
    </div>
  );

  // ERROR
  if (status === 'error') return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>Project<span style={styles.accent}>Struct</span></div>
        <div style={styles.iconBox('#ef4444')}>✕</div>
        <h1 style={styles.title}>Vérification échouée</h1>
        <p style={{ ...styles.sub, color: '#ef4444' }}>{errorMessage}</p>
        <button style={styles.btn} onClick={() => { setStatus('needCode'); setErrorMessage(''); }}>
          Saisir le code manuellement
        </button>
        <button style={styles.btnGhost} onClick={() => router.push('/login')}>
          Retour à la connexion
        </button>
      </div>
    </div>
  );

  // FORM OTP
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>Project<span style={styles.accent}>Struct</span></div>
        <div style={styles.iconBox('#6366f1')}>✉</div>
        <h1 style={styles.title}>Vérification par code</h1>
        <p style={styles.sub}>Saisissez le code à 6 chiffres reçu par email.</p>

        {errorMessage && (
          <div style={styles.errorBox}>{errorMessage}</div>
        )}

        <input
          type="email"
          placeholder="votre@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />
        <input
          type="text"
          placeholder="_ _ _ _ _ _"
          value={code}
          maxLength={6}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          style={{ ...styles.input, textAlign: 'center', fontSize: '24px', letterSpacing: '10px', fontWeight: '700' }}
        />

        <button
          style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}
          onClick={verifyWithCode}
          disabled={loading}
        >
          {loading ? 'Vérification...' : 'Vérifier le code'}
        </button>
        <button style={styles.btnGhost} onClick={() => router.push('/login')}>
          Retour à la connexion
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, any> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f0f0f',
    padding: '24px',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    backgroundColor: '#1a1a1a',
    border: '1px solid #2a2a2a',
    borderRadius: '16px',
    padding: '40px 36px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  logo: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: '8px',
    letterSpacing: '-0.5px',
  },
  accent: { color: '#6366f1' },
  iconBox: (color: string) => ({
    width: '56px',
    height: '56px',
    borderRadius: '14px',
    background: `${color}20`,
    border: `1px solid ${color}40`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    color: color,
    fontWeight: '700',
    marginBottom: '4px',
  }),
  title: {
    margin: '0',
    fontSize: '20px',
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  sub: {
    margin: '0',
    fontSize: '13px',
    color: '#888',
    textAlign: 'center',
    lineHeight: '1.6',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    backgroundColor: '#111',
    border: '1px solid #2a2a2a',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box' as const,
  },
  btn: {
    width: '100%',
    padding: '13px',
    background: 'linear-gradient(135deg, #6366f1, #818cf8)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '4px',
  },
  btnGhost: {
    width: '100%',
    padding: '11px',
    background: 'transparent',
    color: '#666',
    border: '1px solid #2a2a2a',
    borderRadius: '10px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  errorBox: {
    width: '100%',
    padding: '10px 14px',
    backgroundColor: '#ef444415',
    border: '1px solid #ef444440',
    borderRadius: '8px',
    color: '#ef4444',
    fontSize: '13px',
    textAlign: 'center' as const,
    boxSizing: 'border-box' as const,
  },
  spinner: {
    width: '28px',
    height: '28px',
    border: '3px solid #2a2a2a',
    borderTop: '3px solid #6366f1',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
};
=======
  const handleResendCode = async () => {
    if (!email) {
      setErrorMessage('Veuillez renseigner votre email pour recevoir un nouveau code.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Impossible d\'envoyer le code');
      setErrorMessage('');
      alert('Un nouveau code vous a été envoyé par email.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Erreur lors de l\'envoi du code.');
    } finally {
      setLoading(false);
    }
  };

  const renderRightContent = () => {
    // État Vérification en cours
    if (status === 'verifying') {
      return (
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-5">
            <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
          <h1 className="text-[20px] font-semibold mb-2">Vérification en cours...</h1>
          <p className="text-[13px] text-text-2">
            Veuillez patienter quelques instants.
          </p>
        </div>
      );
    }

    // État Succès
    if (status === 'success') {
      return (
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-2xl mx-auto mb-5">
            ✓
          </div>
          <h1 className="text-[20px] font-semibold mb-2 text-green-600">Email vérifié !</h1>
          <p className="text-[13px] text-text-2 mb-6">
            Votre compte est activé. Vous pouvez maintenant vous connecter.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="w-full py-2.5 px-4 bg-accent text-white rounded-lg font-medium text-sm hover:bg-accent/90 transition-colors"
          >
            Se connecter →
          </button>
        </div>
      );
    }

    // État Erreur
    if (status === 'error') {
      return (
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center text-2xl mx-auto mb-5">
            ✕
          </div>
          <h1 className="text-[20px] font-semibold mb-2 text-red-600">Vérification échouée</h1>
          <p className="text-[13px] text-red-500 mb-6">{errorMessage}</p>
          <div className="space-y-3">
            <button
              onClick={() => { setStatus('needCode'); setErrorMessage(''); }}
              className="w-full py-2.5 px-4 bg-accent text-white rounded-lg font-medium text-sm hover:bg-accent/90 transition-colors"
            >
              Saisir le code manuellement
            </button>
            <button
              onClick={() => router.push('/login')}
              className="w-full py-2.5 px-4 bg-surface border border-border text-text-2 rounded-lg font-medium text-sm hover:bg-bg transition-colors"
            >
              Retour à la connexion
            </button>
          </div>
        </div>
      );
    }

    // État Formulaire Code
    return (
      <div>
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center text-2xl mx-auto mb-4">
            ✉️
          </div>
          <h1 className="text-[20px] font-semibold mb-2">Vérification par code</h1>
          <p className="text-[13px] text-text-2">
            Saisissez le code à 6 chiffres reçu par email.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center">
            {errorMessage}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold tracking-wide text-text-2 mb-1.5 uppercase">
              Email
            </label>
            <input
              type="email"
              placeholder="vous@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-cream border border-border rounded-lg text-sm text-ink outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20 placeholder:text-text-3"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold tracking-wide text-text-2 mb-1.5 uppercase">
              Code de vérification
            </label>
            <input
              type="text"
              placeholder="000000"
              value={code}
              maxLength={6}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className="w-full px-3.5 py-2.5 bg-cream border border-border rounded-lg text-center text-2xl tracking-[8px] font-semibold outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20 placeholder:text-text-3"
            />
          </div>

          <button
            onClick={verifyWithCode}
            disabled={loading}
            className={cn(
              "w-full py-2.5 px-4 bg-accent text-white rounded-lg font-medium text-sm transition-colors",
              loading ? "opacity-50 cursor-not-allowed" : "hover:bg-accent/90"
            )}
          >
            {loading ? "Vérification..." : "Vérifier le code"}
          </button>

          <button
            onClick={handleResendCode}
            disabled={loading}
            className="w-full py-2.5 px-4 bg-transparent border border-border text-text-2 rounded-lg font-medium text-sm hover:bg-bg transition-colors"
          >
            Renvoyer le code
          </button>

          <button
            onClick={() => router.push('/login')}
            className="w-full py-2.5 px-4 bg-transparent text-text-3 rounded-lg text-sm hover:text-accent transition-colors"
          >
            Retour à la connexion
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-border text-center">
          <p className="text-[11px] text-text-3">
            Vous n'avez pas reçu le code ? Vérifiez vos spams ou{' '}
            <button
              onClick={handleResendCode}
              disabled={loading}
              className="text-accent hover:underline disabled:opacity-50"
            >
              renvoyez-le
            </button>
          </p>
        </div>
      </div>
    );
  };

  return (
    <AuthShell
      left={
        <LeftPanel
          svgContent={<VerifySVG />}
          tag="Vérification"
          title="Confirmez votre adresse email"
          subtitle="Activez votre compte pour accéder à toutes les fonctionnalités de la plateforme."
        />
      }
      right={
        <RightPanel>
          <div className="max-w-md mx-auto w-full">
            {renderRightContent()}
          </div>
        </RightPanel>
      }
    />
  );
}
>>>>>>> 38c6efc (Misa a jour les interfaces)
