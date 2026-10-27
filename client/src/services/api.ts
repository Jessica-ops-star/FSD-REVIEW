import axios from 'axios';
import { User, MenuItem, Category, Cart, Order, Payment, Delivery } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'API Request Failed';
    console.error('API Error:', message);
    return Promise.reject(new Error(message));
  }
);

export const authAPI = {
  login: (data: { email: string; password: string; expectedRole?: string }) =>
    client.post<any, { message: string; token: string; user: User }>('/auth/login', data),
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone: string;
    role?: string;
    address?: any;
    setupKey?: string;
    invitationCode?: string;
  }) => client.post<any, { message: string; token: string; user: User }>('/auth/register', data),
  getMe: () => client.get<any, { user: User }>('/auth/me'),
};

export const menuAPI = {
  getCategories: () => client.get<any, Category[]>('/menu/categories'),
  createCategory: (data: { name: string; description?: string; displayOrder?: number }) =>
    client.post<any, Category>('/menu/categories', data),
  updateCategory: (id: string, data: { name?: string; description?: string; displayOrder?: number }) =>
    client.put<any, Category>(`/menu/categories/${id}`, data),
  deleteCategory: (id: string) =>
    client.delete<any, { message: string; id: string }>(`/menu/categories/${id}`),
  getMenuItems: (params?: { categoryId?: string; search?: string; availableOnly?: boolean; sortBy?: string; sortOrder?: string }) =>
    client.get<any, MenuItem[]>('/menu/items', { params }),
  getById: (id: string) => client.get<any, MenuItem>(`/menu/items/${id}`),
  create: (data: Partial<MenuItem>) => client.post<any, MenuItem>('/menu/items', data),
  update: (id: string, data: Partial<MenuItem>) => client.put<any, MenuItem>(`/menu/items/${id}`, data),
  toggleAvailability: (id: string, isAvailable?: boolean) =>
    client.patch<any, { message: string; id: string; isAvailable: boolean }>(`/menu/items/${id}/availability`, { isAvailable }),
  delete: (id: string) => client.delete<any, { message: string; id: string }>(`/menu/items/${id}`),
};

export const staffAPI = {
  getAll: () => client.get<any, User[]>('/staff'),
  getStaff: () => client.get<any, User[]>('/staff'),
  create: (data: { name: string; email: string; password: string; phone: string; role: string }) =>
    client.post<any, { message: string; staff: User }>('/staff', data),
  createStaff: (data: { name: string; email: string; password: string; phone: string; role: string }) =>
    client.post<any, { message: string; staff: User }>('/staff', data),
  toggleStatus: (id: string, isActive?: boolean) =>
    client.patch<any, { message: string; staff: User }>(`/staff/${id}/status`, { isActive }),
  resetPassword: (id: string, newPassword: string) =>
    client.post<any, { message: string }>(`/staff/${id}/reset-password`, { newPassword }),
  getInvitations: () =>
    client.get<any, { adminSetupKey: string; kitchenInviteCode: string; deliveryInviteCode: string }>('/staff/invitations'),
};

export const cartAPI = {
  getCart: () => client.get<any, Cart>('/cart'),
  addToCart: (menuItemId: string, quantity: number = 1) =>
    client.post<any, Cart>('/cart/items', { menuItemId, quantity }),
  updateQuantity: (itemId: string, quantity: number) =>
    client.put<any, Cart>(`/cart/items/${itemId}`, { quantity }),
  removeItem: (itemId: string) => client.delete<any, Cart>(`/cart/items/${itemId}`),
  clearCart: () => client.delete<any, { message: string }>('/cart'),
};

export const orderAPI = {
  createOrder: (data: {
    deliveryAddress: { street: string; city: string; zipCode: string; instructions?: string };
    paymentMethod: string;
    notes?: string;
  }) => client.post<any, { message: string; order: Order }>('/orders', data),
  getMyOrders: () => client.get<any, Order[]>('/orders/my-orders'),
  getAllOrders: (status?: string) =>
    client.get<any, Order[]>('/orders', { params: status ? { status } : {} }),
  getById: (id: string) => client.get<any, Order>(`/orders/${id}`),
  updateStatus: (id: string, status: string, note?: string) =>
    client.patch<any, { message: string; order: Order }>(`/orders/${id}/status`, { status, note }),
  cancelOrder: (id: string, reason?: string) =>
    client.post<any, { message: string; order: Order }>(`/orders/${id}/cancel`, { reason }),
};

export const deliveryAPI = {
  getAvailablePersonnel: () => client.get<any, User[]>('/deliveries/available-personnel'),
  assignDelivery: (orderId: string, deliveryPersonnelId: string) =>
    client.post<any, { message: string; order: Order; delivery: Delivery }>('/deliveries/assign', {
      orderId,
      deliveryPersonnelId,
    }),
  allocateDelivery: (orderId: string, deliveryPersonnelId: string) =>
    client.post<any, { message: string; order: Order; delivery: Delivery }>('/deliveries/assign', {
      orderId,
      deliveryPersonnelId,
    }),
  acceptDelivery: (orderId: string) =>
    client.post<any, { message: string; order: Order; delivery: Delivery }>(`/deliveries/${orderId}/accept`),
  getMyAssignments: () => client.get<any, Order[]>('/deliveries/my-assignments'),
  updateStatus: (orderId: string, status: string, notes?: string) =>
    client.patch<any, { message: string; order: Order; delivery: Delivery }>(`/deliveries/${orderId}/status`, {
      status,
      notes,
    }),
};

export const customerAPI = {
  getAll: () => client.get<any, User[]>('/customers'),
};

export default client;
