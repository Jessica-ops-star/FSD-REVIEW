import mongoose, { Schema, Document } from 'mongoose';

export interface ICartItem {
  _id?: mongoose.Types.ObjectId;
  menuItem: mongoose.Types.ObjectId;
  quantity: number;
  priceAtAdd: number;
  itemTotal: number;
}

export interface ICart extends Document {
  _id: mongoose.Types.ObjectId;
  customer: mongoose.Types.ObjectId;
  items: ICartItem[];
  cartTotal: number;
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>({
  menuItem: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  priceAtAdd: { type: Number, required: true },
  itemTotal: { type: Number, required: true },
});

const CartSchema: Schema<ICart> = new Schema(
  {
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [CartItemSchema],
    cartTotal: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<ICart>('Cart', CartSchema);
