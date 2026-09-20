import { Suspense } from 'react';
import CheckEmailClient from './CheckEmailClient';

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
      <CheckEmailClient />
    </Suspense>
  );
}