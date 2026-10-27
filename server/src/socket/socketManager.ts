import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { UserRole } from '../models/User';

let io: Server | null = null;

export const initSocket = (server: HttpServer): Server => {
  io = new Server(server, {
    cors: {
      origin: (origin, callback) => callback(null, true),
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
      credentials: true,
    },
  });

  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    if (!token) {
      // Allow guest/anonymous room joins for tracking demo if token missing
      return next();
    }

    try {
      const secret = process.env.JWT_SECRET || 'restaurant_platform_super_secret_jwt_key_2026_academic_project';
      const decoded = jwt.verify(token, secret) as { userId: string; role: UserRole };
      (socket as any).userId = decoded.userId;
      (socket as any).role = decoded.role;
      next();
    } catch (err) {
      next();
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId;
    const role = (socket as any).role;
    
    console.log(`🔌 Socket Connected: ${socket.id} (User: ${userId || 'Guest'}, Role: ${role || 'None'})`);

    // Auto-join user room and role room if authenticated
    if (userId) {
      socket.join(`user:${userId}`);
    }
    if (role) {
      const lowerRole = role.toLowerCase();
      socket.join(`role:${lowerRole}`);
      if (lowerRole === 'restaurant_admin' || lowerRole === 'admin') {
        socket.join('role:admin');
        socket.join('role:restaurant_admin');
      } else if (lowerRole === 'kitchen_staff' || lowerRole === 'kitchen') {
        socket.join('role:kitchen');
        socket.join('role:kitchen_staff');
      } else if (lowerRole === 'delivery_personnel' || lowerRole === 'delivery') {
        socket.join('role:delivery');
        socket.join('role:delivery_personnel');
      }
      console.log(`  -> Joined Rooms for role: ${lowerRole}`);
    }

    // Explicit room joins
    socket.on('join:room', (room: string) => {
      socket.join(room);
      console.log(`  -> Socket ${socket.id} joined room: ${room}`);
    });

    socket.on('leave:room', (room: string) => {
      socket.leave(room);
      console.log(`  -> Socket ${socket.id} left room: ${room}`);
    });

    socket.on('join:order', (orderId: string) => {
      socket.join(`order:${orderId}`);
      console.log(`  -> Socket ${socket.id} tracking order:${orderId}`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Socket Disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.io has not been initialized!');
  }
  return io;
};

// Helper emitters to be invoked from Express Controllers
export const notifyOrderCreated = (order: any) => {
  if (!io) return;
  console.log(`📡 Socket Broadcast: order:created for ${order.orderNumber}`);
  // Notify kitchen & admin dashboards
  io.to('role:kitchen').to('role:kitchen_staff').to('role:admin').to('role:restaurant_admin').emit('order:created', order);
  const custId = order.customer?._id || order.customer;
  if (custId) {
    io.to(`user:${custId.toString()}`).emit('order:created', order);
  }
};

export const notifyOrderStatusUpdated = (order: any, previousStatus: string) => {
  if (!io) return;
  console.log(`📡 Socket Broadcast: order:status_updated (${previousStatus} -> ${order.status}) for ${order.orderNumber}`);
  
  const payload = {
    orderId: order._id,
    orderNumber: order.orderNumber,
    status: order.status,
    previousStatus,
    updatedAt: order.updatedAt,
    order,
  };

  const custId = order.customer?._id || order.customer;

  // Broadcast universal status update
  io.to(`order:${order._id}`).emit('order:status_updated', payload);
  if (custId) {
    io.to(`user:${custId.toString()}`).emit('order:status_updated', payload);
  }
  io.to('role:admin').to('role:restaurant_admin').emit('order:status_updated', payload);
  io.to('role:kitchen').to('role:kitchen_staff').emit('order:status_updated', payload);
  io.to('role:delivery').to('role:delivery_personnel').emit('order:status_updated', payload);

  // Also emit specific lifecycle events as mandated by Section 14
  const eventMap: Record<string, string> = {
    CONFIRMED: 'order:confirmed',
    PREPARING: 'order:preparing',
    READY: 'order:ready',
    PICKED_UP: 'delivery:picked_up',
    OUT_FOR_DELIVERY: 'delivery:out_for_delivery',
    DELIVERED: 'order:delivered',
  };

  const specificEvent = eventMap[order.status];
  if (specificEvent) {
    io.to(`order:${order._id}`).emit(specificEvent, payload);
    if (custId) io.to(`user:${custId.toString()}`).emit(specificEvent, payload);
    io.to('role:admin').to('role:restaurant_admin').emit(specificEvent, payload);
    io.to('role:kitchen').to('role:kitchen_staff').emit(specificEvent, payload);
    io.to('role:delivery').to('role:delivery_personnel').emit(specificEvent, payload);
  }
};

export const notifyDeliveryAssigned = (deliveryPersonnelId: string, order: any) => {
  if (!io) return;
  console.log(`📡 Socket Direct: delivery:assigned / order:assigned to delivery user ${deliveryPersonnelId}`);
  io.to(`user:${deliveryPersonnelId}`).emit('delivery:assigned', order);
  io.to(`user:${deliveryPersonnelId}`).emit('order:assigned', order);
  io.to('role:delivery').to('role:delivery_personnel').emit('delivery:assigned', order);
  io.to('role:delivery').to('role:delivery_personnel').emit('order:assigned', order);
  io.to('role:admin').to('role:restaurant_admin').emit('delivery:assigned', order);
  io.to(`order:${order._id}`).emit('delivery:assigned', order);
};

export const notifyMenuUpdated = (itemOrCategory?: any) => {
  if (!io) return;
  console.log(`📡 Socket Broadcast: menu:updated`);
  io.emit('menu:updated', itemOrCategory || { timestamp: new Date() });
  io.emit('menu_updated', itemOrCategory || { timestamp: new Date() });
};
