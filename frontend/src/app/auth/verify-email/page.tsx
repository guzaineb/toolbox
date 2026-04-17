"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

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
    } catch (err: any) {
      setErrorMessage(err.message || 'Vérification échouée.');
    } finally {
      setLoading(false);
    }
  };

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