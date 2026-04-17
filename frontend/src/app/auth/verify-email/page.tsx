"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/shared/ui';

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tokenFromUrl = searchParams.get('token');
  const codeFromUrl = searchParams.get('code');
  const emailParam = searchParams.get('email'); // optionnel

  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'needCode'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');
  const [email, setEmail] = useState(emailParam || '');
  const [code, setCode] = useState(codeFromUrl || '');

  // Si on a un token dans l'URL, on tente la vérification automatique
  useEffect(() => {
    if (tokenFromUrl) {
      verifyWithToken(tokenFromUrl);
    } else if (!codeFromUrl) {
      // Ni token ni code pré-rempli → afficher le formulaire de saisie
      setStatus('needCode');
    } else {
      // Code pré-rempli dans l'URL, on peut l'utiliser mais on laisse l'utilisateur valider
      setStatus('needCode');
    }
  }, [tokenFromUrl, codeFromUrl]);

  const verifyWithToken = async (token: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Échec de la vérification');
      }
      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Lien invalide ou expiré. Utilisez le code reçu par email.');
    }
  };

  const verifyWithCode = async () => {
    if (!email || !code) {
      setErrorMessage('Veuillez renseigner votre email et le code de vérification.');
      setStatus('error');
      return;
    }
    setStatus('verifying');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Code invalide');
      }
      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Vérification échouée.');
    }
  };

  const handleGoToLogin = () => router.push('/login');

  if (status === 'verifying') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg p-6">
        <div className="text-center">Vérification en cours...</div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg p-6">
        <div className="w-full max-w-[420px] bg-surface border border-border rounded-[14px] p-9 shadow-md text-center">
          <div className="font-display text-[22px] text-text mb-7">Project<span className="text-accent">Struct</span></div>
          <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center text-2xl mx-auto mb-5">✅</div>
          <h1 className="text-[20px] font-semibold mb-2">Email vérifié !</h1>
          <p className="text-[13px] text-text-2 mb-5">Vous pouvez maintenant vous connecter.</p>
          <Button variant="primary" fullWidth onClick={handleGoToLogin}>
            Se connecter →
          </Button>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg p-6">
        <div className="w-full max-w-[420px] bg-surface border border-border rounded-[14px] p-9 shadow-md text-center">
          <div className="font-display text-[22px] text-text mb-7">Project<span className="text-accent">Struct</span></div>
          <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center text-2xl mx-auto mb-5">❌</div>
          <h1 className="text-[20px] font-semibold mb-2">Vérification échouée</h1>
          <p className="text-[13px] text-text-2 mb-5">{errorMessage}</p>
          <Button variant="primary" fullWidth onClick={() => setStatus('needCode')}>
            Saisir un code manuellement
          </Button>
        </div>
      </div>
    );
  }

  // Formulaire de saisie du code OTP
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-6">
      <div className="w-full max-w-[420px] bg-surface border border-border rounded-[14px] p-9 shadow-md">
        <div className="font-display text-[22px] text-text mb-7 text-center">Project<span className="text-accent">Struct</span></div>
        <h1 className="text-[20px] font-semibold mb-2 text-center">Vérification par code</h1>
        <p className="text-[13px] text-text-2 mb-5 text-center">
          Saisissez le code à 6 chiffres reçu par email.
        </p>
        <input
          type="email"
          placeholder="Votre email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 p-2 border border-border rounded bg-bg text-text"
        />
        <input
          type="text"
          placeholder="Code à 6 chiffres"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full mb-5 p-2 border border-border rounded bg-bg text-text"
        />
        <Button variant="primary" fullWidth onClick={verifyWithCode}>
          Vérifier
        </Button>
        <div className="text-center mt-4">
          <button
            onClick={() => router.push('/login')}
            className="text-sm text-accent underline"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    </div>
  );
}