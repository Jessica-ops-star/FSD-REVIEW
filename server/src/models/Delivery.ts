import mongoose, { Schema, Document } from 'mongoose';

export type DeliveryStatus =
  | 'ALLOCATED'
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'FAILED';

export interface IDelivery extends Document {
  _id: mongoose.Types.ObjectId;
  order: mongoose.Types.ObjectId;
  deliveryPersonnel: mongoose.Types.ObjectId;
  status: DeliveryStatus;
  isAccepted: boolean;
  acceptedAt?: Date;
  allocatedBy?: mongoose.Types.ObjectId;
  isApproved?: boolean;
  approvedBy?: mongoose.Types.ObjectId;
  deliveryAddress: {
    street: string;
    city: string;
    zipCode: string;
    instructions?: string;
  };
  assignedAt: Date;
  pickedUpAt?: Date;
  deliveredAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DeliverySchema: Schema<IDelivery> = new Schema(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
    deliveryPersonnel: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['ALLOCATED', 'ASSIGNED', 'ACCEPTED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED'],
      default: 'ASSIGNED',
      required: true,
    },
    isAccepted: { type: Boolean, default: false },
    acceptedAt: { type: Date },
    allocatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    isApproved: { type: Boolean, default: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    deliveryAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      zipCode: { type: String, required: true },
      instructions: { type: String, default: '' },
    },
    assignedAt: { type: Date, default: Date.now },
    pickedUpAt: { type: Date },
    deliveredAt: { type: Date },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model<IDelivery>('Delivery', DeliverySchema);
