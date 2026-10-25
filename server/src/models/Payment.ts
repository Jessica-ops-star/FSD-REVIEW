import mongoose, { Schema, Document } from 'mongoose';

export type PaymentMethod = 'CARD' | 'UPI' | 'CASH' | 'SIMULATED';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface IPayment extends Document {
  _id: mongoose.Types.ObjectId;
  order: mongoose.Types.ObjectId;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId: string;
  paidAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema<IPayment> = new Schema(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    amount: { type: Number, required: true, min: 0 },
    method: {
      type: String,
      enum: ['CARD', 'UPI', 'CASH', 'SIMULATED'],
      default: 'SIMULATED',
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED'],
      default: 'COMPLETED',
      required: true,
    },
    transactionId: { type: String, required: true },
    paidAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<IPayment>('Payment', PaymentSchema);
