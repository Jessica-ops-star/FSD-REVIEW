import mongoose, { Schema, Document } from 'mongoose';

export interface IMenuItem extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  price: number;
  category: mongoose.Types.ObjectId;
  restaurant?: mongoose.Types.ObjectId;
  imageUrl: string;
  isAvailable: boolean;
  isVeg: boolean;
  preparationTimeMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}

const MenuItemSchema: Schema<IMenuItem> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant' },
    imageUrl: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
    isVeg: { type: Boolean, default: true },
    preparationTimeMinutes: { type: Number, default: 15 },
  },
  { timestamps: true }
);

export default mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);
