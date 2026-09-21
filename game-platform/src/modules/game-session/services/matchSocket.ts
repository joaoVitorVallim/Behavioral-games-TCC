import { io, Socket } from 'socket.io-client';

// VITE_SOCKET_URL já inclui o namespace do gateway (ex.: http://localhost:3000/prisoner).
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ?? `${import.meta.env.VITE_API_URL ?? 'http://localhost:3000'}/prisoner`;

let socket: Socket | null = null;

/** Socket único da partida, compartilhado pela sala de espera e pelas rodadas. */
export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: false,
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    if (socket.connected) socket.disconnect();
    socket = null;
  }
}
