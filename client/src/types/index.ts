export type Role = 
  | 'CUSTOMER' 
  | 'ADMIN' 
  | 'RESTAURANT_ADMIN' 
  | 'KITCHEN' 
  | 'KITCHEN_STAFF' 
  | 'DELIVERY' 
  | 'DELIVERY_PERSONNEL';

export type OrderStatus =
  | 'PLACED'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'PICKED_UP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentMethod = 'CARD' | 'UPI' | 'CASH' | 'SIMULATED';

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'PAID' | 'FAILED';

export interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: Role;
  phone: string;
  address?: {
    street?: string;
    city?: string;
    zipCode?: string;
    formattedAddress?: string;
  };
  isActive?: boolean;
  createdAt?: string;
}

export interface Category {
  _id: string;
  id?: string;
  name: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface MenuItem {
  _id: string;
  id?: string;
  name: string;
  description: string;
  price: number;
  category: Category | string;
  imageUrl: string;
  isAvailable: boolean;
  isVeg?: boolean;
  preparationTimeMinutes?: number;
}

export interface CartItem {
  _id?: string;
  menuItem: MenuItem;
  quantity: number;
  priceAtAdd: number;
  itemTotal: number;
}

export interface Cart {
  _id?: string;
  customer: string;
  items: CartItem[];
  cartTotal: number;
}

export interface OrderItem {
  menuItem: string | MenuItem;
  name: string;
  price: number;
  quantity: number;
  itemTotal: number;
}

export interface Payment {
  _id?: string;
  order: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId: string;
  paidAt?: string;
}

export interface OrderStatusHistory {
  status: OrderStatus;
  updatedBy?: User | string;
  timestamp: string;
  note?: string;
}

export interface Order {
  _id: string;
  id?: string;
  orderNumber: string;
  customer: User | string;
  restaurant?: any;
  items: OrderItem[];
  subtotal: number;
  taxAmount: number;
  deliveryFee: number;
  totalAmount: number;
  deliveryAddress: {
    street: string;
    city: string;
    zipCode: string;
    instructions?: string;
  };
  payment?: Payment | string;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  status: OrderStatus;
  statusHistory?: OrderStatusHistory[];
  deliveryPersonnel?: User | string;
  delivery?: Delivery | string;
  deliveryStatus?: 'UNASSIGNED' | 'ALLOCATED' | 'ASSIGNED' | 'ACCEPTED' | 'PICKED_UP' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'FAILED';
  deliveryAcceptance?: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

export interface Delivery {
  _id: string;
  id?: string;
  order: Order | string;
  deliveryPersonnel: User | string;
  status: 'ALLOCATED' | 'ASSIGNED' | 'ACCEPTED' | 'PICKED_UP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'FAILED';
  isAccepted?: boolean;
  acceptedAt?: string;
  allocatedBy?: User | string;
  isApproved?: boolean;
  approvedBy?: User | string;
  deliveryAddress: {
    street: string;
    city: string;
    zipCode: string;
    instructions?: string;
  };
  assignedAt: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  notes?: string;
}

export interface ApiResponse<T = any> {
  message?: string;
  token?: string;
  user?: User;
  order?: Order;
  data?: T;
}
