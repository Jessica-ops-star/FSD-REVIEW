export const mockCategories = [
  { _id: "cat-1", name: "Starters", displayOrder: 1, isActive: true },
  { _id: "cat-2", name: "South Indian", displayOrder: 2, isActive: true },
  { _id: "cat-3", name: "Main Course", displayOrder: 3, isActive: true },
  { _id: "cat-4", name: "Rice and Biryani", displayOrder: 4, isActive: true },
  { _id: "cat-5", name: "Chinese", displayOrder: 5, isActive: true },
  { _id: "cat-6", name: "Desserts", displayOrder: 6, isActive: true },
  { _id: "cat-7", name: "Beverages", displayOrder: 7, isActive: true }
];

export const mockMenuItems = [
  {
    _id: "dish-1",
    name: "Paneer Tikka",
    description: "Grilled paneer with aromatic Indian spices",
    price: 220,
    category: { _id: "cat-1", name: "Starters" },
    imageUrl: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8",
    isAvailable: true,
    isVeg: true,
    preparationTimeMinutes: 20
  },
  {
    _id: "dish-2",
    name: "Masala Dosa",
    description: "Crispy dosa served with potato masala",
    price: 150,
    category: { _id: "cat-2", name: "South Indian" },
    imageUrl: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976",
    isAvailable: true,
    isVeg: true,
    preparationTimeMinutes: 15
  },
  {
    _id: "dish-3",
    name: "Veg Biryani",
    description: "Fragrant basmati rice with vegetables and spices",
    price: 240,
    category: { _id: "cat-4", name: "Rice and Biryani" },
    imageUrl: "https://images.unsplash.com/photo-1589302168068-964664d93dc0",
    isAvailable: true,
    isVeg: true,
    preparationTimeMinutes: 25
  },
  {
    _id: "dish-4",
    name: "Chocolate Brownie",
    description: "Rich chocolate brownie dessert",
    price: 120,
    category: { _id: "cat-6", name: "Desserts" },
    imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c",
    isAvailable: true,
    isVeg: true,
    preparationTimeMinutes: 10
  },
  {
    _id: "dish-5",
    name: "Fresh Lime Soda",
    description: "Refreshing lime soda",
    price: 80,
    category: { _id: "cat-7", name: "Beverages" },
    imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765edfd7",
    isAvailable: true,
    isVeg: true,
    preparationTimeMinutes: 5
  }
];