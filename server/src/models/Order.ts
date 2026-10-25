import mongoose, { Schema, Document } from 'mongoose';

export type OrderStatus = 
  | 'PLACED' 
  | 'CONFIRMED' 
  | 'PREPARING' 
  | 'READY' 
  | 'PICKED_UP'
  | 'OUT_FOR_DELIVERY' 
  | 'DELIVERED' 
  | 'CANCELLED';

export interface IOrderItem {
  menuItem: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  itemTotal: number;
}

export interface IOrderStatusHistory {
  status: OrderStatus;
  updatedBy?: mongoose.Types.ObjectId;
  timestamp: Date;
  note?: string;
}

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  orderNumber: string;
  customer: mongoose.Types.ObjectId;
  restaurant?: mongoose.Types.ObjectId;
  items: IOrderItem[];
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
  payment?: mongoose.Types.ObjectId;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  status: OrderStatus;
  statusHistory: IOrderStatusHistory[];
  deliveryPersonnel?: mongoose.Types.ObjectId;
  delivery?: mongoose.Types.ObjectId;
  deliveryStatus?: 'UNASSIGNED' | 'ALLOCATED' | 'ASSIGNED' | 'ACCEPTED' | 'PICKED_UP' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'FAILED';
  deliveryAcceptance?: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  menuItem: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  itemTotal: { type: Number, required: true },
});

const OrderStatusHistorySchema = new Schema<IOrderStatusHistory>({
  status: { 
    type: String, 
    enum: ['PLACED', 'CONFIRMED', 'PREPARING', 'READY', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'], 
    required: true 
  },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now },
  note: { type: String, default: '' },
});

const OrderSchema: Schema<IOrder> = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant' },
    items: [OrderItemSchema],
    subtotal: { type: Number, required: true, min: 0 },
    taxAmount: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    deliveryAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      zipCode: { type: String, required: true },
      instructions: { type: String, default: '' },
    },
    payment: { type: Schema.Types.ObjectId, ref: 'Payment' },
    paymentStatus: { 
      type: String, 
      enum: ['PENDING', 'PAID', 'FAILED'], 
      default: 'PAID' 
    },
    status: {
      type: String,
      enum: ['PLACED', 'CONFIRMED', 'PREPARING', 'READY', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
      default: 'PLACED',
      required: true,
    },
    statusHistory: [OrderStatusHistorySchema],
    deliveryPersonnel: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    delivery: { type: Schema.Types.ObjectId, ref: 'Delivery', default: null },
    deliveryStatus: {
      type: String,
      enum: ['UNASSIGNED', 'ALLOCATED', 'ASSIGNED', 'ACCEPTED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED'],
      default: 'UNASSIGNED',
    },
    deliveryAcceptance: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
      default: 'PENDING',
    },
  },
  { timestamps: true }
);

export default mongoose.model<IOrder>('Order', OrderSchema);
