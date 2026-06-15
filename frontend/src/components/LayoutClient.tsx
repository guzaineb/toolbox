'use client';

import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <>
    <div className="nav-links" id="desktop-nav-auth">
      <a href="#features" className="nav-link">Fonctionnalités</a>
      <a href="#roles" className="nav-link">Pour qui</a>
      <a href="#" className="nav-btn nav-btn-ghost" id="btn-demo-login">Connexion</a>
      <a href="#" className="nav-btn nav-btn-primary">Commencer →</a>
    </div>
      <nav className="bg-white shadow p-4 flex justify-between">
        <Link href="/" className="font-bold text-xl">ToolBox</Link>
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