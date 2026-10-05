import axios from 'axios';

// En production derrière Nginx : "/api" (même origine, pas de CORS, build
// réutilisable quelle que soit l'IP/domaine). En développement : URL absolue
// de l'API Nest (NEXT_PUBLIC_API_URL=http://localhost:3000 dans frontend/.env).
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

const isBrowser = () => typeof window !== 'undefined';

api.interceptors.request.use((config) => {
  if (isBrowser()) {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch { }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url ?? '';
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register');

    if (
      error.response?.status === 401 &&
      isBrowser() &&
      !isAuthEndpoint
    ) {
      try { localStorage.removeItem('access_token'); } catch { }
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;