import mongoose, { Schema, Document } from 'mongoose';

export interface IRestaurant extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  address: string;
  phone: string;
  isOpen: boolean;
  openingHours: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RestaurantSchema: Schema<IRestaurant> = new Schema(
  {
    name: { type: String, required: true, default: 'TasteHub Kitchen & Bistro' },
    description: { 
      type: String, 
      default: 'Premium artisanal dining experience offering fresh gourmet dishes crafted with local ingredients.' 
    },
    address: { type: String, required: true, default: '104 Culinary Avenue, Gourmet Plaza, Suite 400' },
    phone: { type: String, required: true, default: '+1 (555) 839-2041' },
    isOpen: { type: Boolean, default: true },
    openingHours: { type: String, default: '10:00 AM - 11:00 PM' },
    imageUrl: { 
      type: String, 
      default: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1200' 
    },
  },
  { timestamps: true }
);

export default mongoose.model<IRestaurant>('Restaurant', RestaurantSchema);
