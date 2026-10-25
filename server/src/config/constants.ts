export const Role = {
  CUSTOMER: 'CUSTOMER',
  ADMIN: 'ADMIN',
  KITCHEN: 'KITCHEN',
  DELIVERY: 'DELIVERY',
} as const;

export type RoleType = typeof Role[keyof typeof Role];

export const OrderStatus = {
  PLACED: 'PLACED',
  CONFIRMED: 'CONFIRMED',
  PREPARING: 'PREPARING',
  READY: 'READY',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
} as const;

export type OrderStatusType = typeof OrderStatus[keyof typeof OrderStatus];

export const PaymentMethod = {
  UPI: 'UPI',
  CARD: 'CARD',
  COD: 'COD',
} as const;

export type PaymentMethodType = typeof PaymentMethod[keyof typeof PaymentMethod];

export const PaymentStatus = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
} as const;

export type PaymentStatusType = typeof PaymentStatus[keyof typeof PaymentStatus];

export const DeliveryStatus = {
  UNASSIGNED: 'UNASSIGNED',
  ALLOCATED: 'ALLOCATED',
  ASSIGNED: 'ASSIGNED',
  ACCEPTED: 'ACCEPTED',
  PICKED_UP: 'PICKED_UP',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
} as const;

export type DeliveryStatusType = typeof DeliveryStatus[keyof typeof DeliveryStatus];
