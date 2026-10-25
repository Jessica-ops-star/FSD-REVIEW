import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSocket, joinRoom } from '../services/socket';
import { useAuth } from './AuthContext';

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
}

interface SocketContextType {
  isConnected: boolean;
  toasts: ToastNotification[];
  dismissToast: (id: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const addToast = (title: string, message: string, type: 'info' | 'success' | 'warning' | 'alert' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);

    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      // Audio fallback
    }

    setTimeout(() => {
      dismissToast(id);
    }, 6000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    const socket = getSocket();

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    if (socket.connected) {
      setIsConnected(true);
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    joinRoom(`role:${user.role.toLowerCase()}`);
    joinRoom(`user:${user._id || user.id}`);

    const socket = getSocket();

    const handleOrderCreated = (order: any) => {
      if (user.role === 'ADMIN' || user.role === 'KITCHEN') {
        addToast(
          '🔔 New Order Received!',
          `Order #${order.orderNumber} for $${order.totalAmount} has been placed.`,
          'alert'
        );
      }
    };

    const handleStatusUpdate = (data: { order: any; previousStatus: string; status: string }) => {
      const order = data.order || data;
      addToast(
        `📦 Order #${order?.orderNumber || (data as any).orderNumber || ''} Updated`,
        `Current Status: ${order?.status ? order.status.replace(/_/g, ' ') : 'Updated'}`,
        order?.status === 'DELIVERED' ? 'success' : 'info'
      );
    };

    const handleDeliveryAssigned = (order: any) => {
      if (user.role === 'DELIVERY') {
        addToast(
          '🛵 New Delivery Assignment',
          `Order #${order.orderNumber} assigned to you! Target: ${order.deliveryAddress?.street || 'Delivery Address'}`,
          'warning'
        );
      }
    };

    socket.on('order:created', handleOrderCreated);
    socket.on('order:status_updated', handleStatusUpdate);
    socket.on('order:assigned', handleDeliveryAssigned);

    return () => {
      socket.off('order:created', handleOrderCreated);
      socket.off('order:status_updated', handleStatusUpdate);
      socket.off('order:assigned', handleDeliveryAssigned);
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ isConnected, toasts, dismissToast }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
};
