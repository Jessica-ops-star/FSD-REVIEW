import { Server as SocketIOServer, Socket } from 'socket.io';

let ioInstance: SocketIOServer | null = null;

export const initSocket = (io: SocketIOServer) => {
  ioInstance = io;

  io.on('connection', (socket: Socket) => {
    console.log(`⚡ Client connected to Socket.IO: ${socket.id}`);

    // Join role-specific or order-specific rooms
    socket.on('join_room', (room: string) => {
      socket.join(room);
      console.log(`📌 Socket ${socket.id} joined room: ${room}`);
    });

    socket.on('leave_room', (room: string) => {
      socket.leave(room);
      console.log(`👋 Socket ${socket.id} left room: ${room}`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected from Socket.IO: ${socket.id}`);
    });
  });
};

export const getIO = (): SocketIOServer => {
  if (!ioInstance) {
    throw new Error('Socket.IO not initialized');
  }
  return ioInstance;
};

// Helper real-time event emitters
export const notifyNewOrder = (order: any) => {
  if (!ioInstance) return;
  console.log(`📢 Broadcasting NEW_ORDER: ${order.orderNumber}`);
  ioInstance.to('role:ADMIN').emit('new_order', order);
  ioInstance.to('role:KITCHEN').emit('new_order', order);
  ioInstance.to(`user:${order.userId}`).emit('order_updated', order);
};

export const notifyOrderStatusChange = (order: any, previousStatus: string) => {
  if (!ioInstance) return;
  console.log(`📢 Broadcasting ORDER_STATUS_CHANGE: ${order.orderNumber} -> ${order.status}`);
  
  // Broadcast to all relevant rooms
  ioInstance.to('role:ADMIN').emit('order_status_updated', { order, previousStatus });
  ioInstance.to('role:KITCHEN').emit('order_status_updated', { order, previousStatus });
  ioInstance.to('role:DELIVERY').emit('order_status_updated', { order, previousStatus });
  ioInstance.to(`order:${order.id}`).emit('order_status_updated', { order, previousStatus });
  ioInstance.to(`user:${order.userId}`).emit('order_status_updated', { order, previousStatus });
};

export const notifyDeliveryUpdate = (order: any) => {
  if (!ioInstance) return;
  console.log(`📢 Broadcasting DELIVERY_UPDATE: ${order.orderNumber}`);
  ioInstance.to('role:ADMIN').emit('delivery_updated', order);
  ioInstance.to('role:DELIVERY').emit('delivery_updated', order);
  ioInstance.to(`order:${order.id}`).emit('delivery_updated', order);
  ioInstance.to(`user:${order.userId}`).emit('delivery_updated', order);
};

export const notifyMenuUpdate = (menuItem: any, action: 'CREATE' | 'UPDATE' | 'DELETE') => {
  if (!ioInstance) return;
  console.log(`📢 Broadcasting MENU_UPDATE: ${menuItem.name} (${action})`);
  ioInstance.emit('menu_updated', { menuItem, action });
};
