import dotenv from 'dotenv';
import { connectDB } from '../config/db';
import MenuItem from '../models/MenuItem';

dotenv.config();

const correctedImages: Record<string, string> = {
  'Gobi Manchurian': 'https://images.unsplash.com/photo-1577186912275-4f74c57458ef?auto=format&fit=crop&q=80&w=800',
  'Idli': 'https://images.unsplash.com/photo-1741376509047-66dae5df90f9?auto=format&fit=crop&q=80&w=800',
  'Poori': 'https://images.unsplash.com/photo-1643892467625-65df6a500524?auto=format&fit=crop&q=80&w=800',
  'Parotta': 'https://images.unsplash.com/photo-1694951675394-1fd90089d4fa?auto=format&fit=crop&q=80&w=800',
  'Gulab Jamun': 'https://images.unsplash.com/photo-1666190092159-3171cf0fbb12?auto=format&fit=crop&q=80&w=800',
  'Veg Burger': 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=800',
  'Paneer Tikka': 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&q=80&w=800',
  'Samosa': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=800',
  'French Fries': 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&q=80&w=800',
  'Chicken Biryani': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=800',
  'Brownie': 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=800',
  'Ice Cream': 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&q=80&w=800',
  'Mango Lassi': 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&q=80&w=800',
  'Cold Coffee': 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=800',
  'Fresh Lime Soda': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=800',
};

async function updateImages() {
  await connectDB();
  for (const [name, imageUrl] of Object.entries(correctedImages)) {
    const res = await MenuItem.updateMany({ name }, { $set: { imageUrl } });
    console.log(`Updated ${name}: matched ${res.matchedCount}, modified ${res.modifiedCount}`);
  }
  console.log('✅ Menu images updated in MongoDB!');
  process.exit(0);
}

updateImages().catch((e) => {
  console.error(e);
  process.exit(1);
});
