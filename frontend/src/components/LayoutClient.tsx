'use client';

import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <>
      <nav className="bg-white shadow p-4 flex justify-between">
        <Link href="/" className="font-bold text-xl">ProjectStruct</Link>
        <div>
          {user ? (
            <>
            
              <button onClick={logout} className="text-red-500">Déconnexion</button>
            </>
          ) : (
            <>
              <Link href="/login" className="mr-2">Connexion</Link>
              <Link href="/register">Inscription</Link>
            </>
          )}
        </div>
      </nav>
      <main className="p-6">{children}</main>
    </>
  );
}