import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../services/api';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
// Récupération du profil à partir du token stocké
  const fetchUserProfile = async (token: string) => {
    try {
      const res = await fetch('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        // Token invalide
        localStorage.removeItem('access_token');
      }
    } catch (error) {
      console.error('Erreur chargement profil', error);
      localStorage.removeItem('access_token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      api.get('/users/me')
        .then(res => setUser(res.data))
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('access_token', res.data.access_token);
      const userRes = await api.get('/users/me');
      setUser(userRes.data);
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      throw new Error('Identifiants incorrects');
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    router.push('/login');
  };

  return { user, loading, login, logout };
}