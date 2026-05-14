'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthShell from '@/components/auth/AuthShell';
import LeftPanel from '@/components/auth/LeftPanel';
import RightPanel from '@/components/auth/RightPanel';
import { ForgotSVG } from '@/components/auth/GeoSVGs';
import {
  FormHead, Field, PasswordField, BtnMain, FormLink,
} from '@/components/auth/FormElements';
import styles from './page.module.css';

export default function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur');
      setMessage(data.message || 'Un email vous a été envoyé si le compte existe.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Le mot de passe doit faire au moins 6 caractères.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur');
      setMessage('Mot de passe mis à jour ! Redirection vers la connexion...');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Mode : formulaire de demande d'email
  if (!token) {
    return (
      <AuthShell
        left={
          <LeftPanel
            svgContent={<ForgotSVG />}
            tag="Récupération de compte"
            title="Retrouvez l'accès à votre espace"
            subtitle="Nous vous enverrons un lien sécurisé pour réinitialiser votre mot de passe en toute sécurité."
          />
        }
        right={
          <RightPanel>
            <FormHead
              title="Mot de passe oublié"
              subtitle="Entrez votre email pour recevoir un lien de réinitialisation"
            />
            <form onSubmit={handleForgotPassword}>
              <Field
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                required
              />
              {error && <div className={styles.error}>{error}</div>}
              {message && <div className={styles.success}>{message}</div>}
              <BtnMain type="submit" disabled={loading}>
                {loading ? 'Envoi...' : 'Envoyer le lien de réinitialisation →'}
              </BtnMain>
            </form>
            <div className={styles.infoBox}>
              Si un compte existe avec cet email, vous recevrez un lien dans les 5 prochaines minutes.
            </div>
            <FormLink
              text=""
              linkText="← Retour à la connexion"
              onClick={() => router.push('/login')}
            />
          </RightPanel>
        }
      />
    );
  }

  // Mode : réinitialisation avec token
  return (
    <AuthShell
      left={
        <LeftPanel
          svgContent={<ForgotSVG />}
          tag="Nouveau mot de passe"
          title="Créez un mot de passe sécurisé"
          subtitle="Choisissez un mot de passe robuste que vous n'utilisez pas ailleurs."
        />
      }
      right={
        <RightPanel>
          <FormHead
            title="Nouveau mot de passe"
            subtitle="Entrez votre nouveau mot de passe ci-dessous"
          />
          <form onSubmit={handleResetPassword}>
            <PasswordField
              label="Nouveau mot de passe"
              value={newPassword}
              onChange={setNewPassword}
              showStrength={true}
            />
            <PasswordField
              label="Confirmer le mot de passe"
              value={confirmPassword}
              onChange={setConfirmPassword}
              showStrength={false}
            />
            {error && <div className={styles.error}>{error}</div>}
            {message && <div className={styles.success}>{message}</div>}
            <BtnMain type="submit" disabled={loading}>
              {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe →'}
            </BtnMain>
          </form>
          <FormLink
            text=""
            linkText="← Retour à la connexion"
            onClick={() => router.push('/login')}
          />
        </RightPanel>
      }
    />
  );
}