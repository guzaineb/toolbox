<<<<<<< HEAD
// hooks/useAuth.ts
=======
>>>>>>> 38c6efc (Misa a jour les interfaces)
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '../services/api';

export type UserRole = 'admin' | 'expert' | 'project_owner' | 'incubator_membre';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole | null;
  is_verified: boolean;
  is_active: boolean;
<<<<<<< HEAD
  // ✅ FIX : propriétés manquantes qui causaient l'erreur TS2339
=======
>>>>>>> 38c6efc (Misa a jour les interfaces)
  profile?: {
    first_name: string;
    last_name: string;
    phone?: string;
    bio?: string;
    country?: string;
    city?: string;
    linkedin?: string;
    preferred_language?: string;
    birth_date?: string;
  };
  projectOwnerProfile?: {
    id: string;
    current_status?: string;
  } | null;
  expertProfile?: {
    id: string;
    headline?: string;
  } | null;
  incubatorMembers?: {
    id: string;
    role: string;
    incubator?: { id: string; name: string };
  }[];
}

export const ROLE_ROUTES: Record<string, string> = {
  admin:             '/dashboard',
  expert:            '/dashboard/expert',
  project_owner:     '/dashboard/project-owner',
  incubator_membre:  '/dashboard/incubator',
};

const DEFAULT_ROUTE = '/dashboard';

<<<<<<< HEAD
// ─── Storage helper — ✅ FIX : try/catch complet pour accès refusé (iframe, etc.) ──

=======
>>>>>>> 38c6efc (Misa a jour les interfaces)
const storage = {
  get: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return window.localStorage.getItem(key);
    } catch {
<<<<<<< HEAD
      // localStorage inaccessible (iframe cross-origin, mode privé, etc.)
=======
>>>>>>> 38c6efc (Misa a jour les interfaces)
      return null;
    }
  },
  set: (key: string, value: string): void => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // silently fail
    }
  },
  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      // silently fail
    }
  },
};

<<<<<<< HEAD
// ─── Hook ─────────────────────────────────────────────────────────────────────

=======
>>>>>>> 38c6efc (Misa a jour les interfaces)
export function useAuth() {
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router                = useRouter();

  useEffect(() => {
    const token = storage.get('access_token');
    if (!token) {
      setLoading(false);
      return;
    }

    api.get<AuthUser>('/users/me')
      .then(res  => setUser(res.data))
      .catch(()  => { storage.remove('access_token'); setUser(null); })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<AuthUser> => {
      try {
        const { data: authData } = await api.post<{
          access_token: string;
          id: string;
          email: string;
          role: UserRole;
        }>('/auth/login', { email, password });

        if (!authData.access_token) throw new Error('Token non reçu');

        storage.set('access_token', authData.access_token);

        const { data: userData } = await api.get<AuthUser>('/users/me');
        setUser(userData);
        return userData;
      } catch (error) {
        storage.remove('access_token');
        setUser(null);
        throw error;
      }
    },
    [],
  );

  const logout = useCallback(() => {
    storage.remove('access_token');
    setUser(null);
    router.push('/auth/login');
  }, [router]);

  const redirectToDashboard = useCallback(
    (role: string | null | undefined) => {
      const destination = role ? (ROLE_ROUTES[role] ?? DEFAULT_ROUTE) : DEFAULT_ROUTE;
      router.push(destination);
    },
    [router],
  );

  const isRole = useCallback(
    (role: UserRole) => user?.role === role,
    [user],
  );

  return { user, loading, login, logout, redirectToDashboard, isRole };
}