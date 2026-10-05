import { io, Socket } from 'socket.io-client';

// En production derrière Nginx, on laisse vide : le socket se connecte sur la
// même origine que la page (path /socket.io), Nginx le relaie vers l'API.
// En développement, on retombe sur l'origine de NEXT_PUBLIC_API_URL si elle
// est absolue (ex. http://localhost:3000), sinon sur l'origine courante.
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  (API_URL.startsWith('http') ? new URL(API_URL).origin : '');

// Namespace côté API : /notifications (ne pas préfixer par /api).
const SOCKET_NAMESPACE = '/notifications';
const SOCKET_PATH = '/socket.io';

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  if (typeof window === 'undefined') return null;

  if (!socket?.connected) {
    const token = localStorage.getItem('access_token');
    if (!token) return null;

    socket = io(`${SOCKET_URL}${SOCKET_NAMESPACE}`, {
      path: SOCKET_PATH,
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socket.on('connect_error', (err) => {
      console.warn('[NotificationSocket] connect_error:', err.message);
    });

    socket.on('disconnect', (reason) => {
      if (reason === 'io server disconnect') {
        socket = null;
      }
    });
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
