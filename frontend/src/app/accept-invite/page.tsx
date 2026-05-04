'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/services/api';
import { Button, Card } from '@/components/shared/ui';

export default function AcceptInvitePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token d\'invitation manquant');
      return;
    }

    api.post('incubators/:incubatorId/members/accept', { token })
      .then(() => {
        setStatus('success');
        setMessage('Invitation acceptée avec succès !');
        setTimeout(() => {
          router.push('/dashboard/incubator');
        }, 2000);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err?.response?.data?.message || 'Erreur lors de l\'acceptation');
      });
  }, [token, router]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="text-4xl mb-4">⏳</div>
            <h2 className="text-xl font-semibold mb-2">Acceptation en cours...</h2>
            <p className="text-text-2">Veuillez patienter</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="text-4xl mb-4">✅</div>
            <h2 className="text-xl font-semibold mb-2">Invitation acceptée !</h2>
            <p className="text-text-2 mb-4">{message}</p>
            <p className="text-sm text-text-2">Redirection en cours...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="text-4xl mb-4">❌</div>
            <h2 className="text-xl font-semibold mb-2">Erreur</h2>
            <p className="text-text-2 mb-4">{message}</p>
            <Button onClick={() => router.push('/dashboard')}>
              Retour à l'accueil
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}