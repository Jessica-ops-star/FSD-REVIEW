import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const token = localStorage.getItem('token');

    socket = io(window.location.origin, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      auth: { token },
    });

    socket.on('connect', () => {
      console.log('⚡ Socket.IO Connected successfully:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Socket.IO Disconnected:', reason);
    });
  }

  return socket;
};

export const reconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  return getSocket();
};

export const joinRoom = (room: string) => {
  const s = getSocket();
  if (s.connected) {
    s.emit('join:room', room);
  } else {
    s.once('connect', () => {
      s.emit('join:room', room);
    });
  }
};

export const joinOrderRoom = (orderId: string) => {
  const s = getSocket();
  if (s.connected) {
    s.emit('join:order', orderId);
  } else {
    s.once('connect', () => {
      s.emit('join:order', orderId);
    });
  }
};

export const leaveRoom = (room: string) => {
  const s = getSocket();
  if (s.connected) {
    s.emit('leave:room', room);
  }
};
