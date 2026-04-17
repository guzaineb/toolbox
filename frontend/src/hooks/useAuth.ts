import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../services/api';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 🔥 Load user on app start
  useEffect(() => {
    const token = localStorage.getItem('access_token');

    if (!token) {
      setLoading(false);
      return;
    }

    api.get('/users/me')
      .then(res => setUser(res.data))
      .catch(() => {
        localStorage.removeItem('access_token');
        setUser(null);
      })
      .finally(() => setLoading(false));

  }, []);

  // 🔐 LOGIN
  const login = async (email: string, password: string) => {
    try {
      const res = await api.post('/auth/login', { email, password });

      localStorage.setItem('access_token', res.data.access_token);

      const userRes = await api.get('/users/me');
      setUser(userRes.data);

      return userRes.data;
    } catch (err) {
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