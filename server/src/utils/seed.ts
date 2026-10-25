import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import User from '../models/User';
import Restaurant from '../models/Restaurant';
import Category from '../models/Category';
import MenuItem from '../models/MenuItem';

dotenv.config();

export const seedDatabase = async (exitOnComplete = true): Promise<void> => {
  try {
    console.log('🌱 Starting MongoDB Database Seeder...');
    await connectDB();

    // 1. Seed or Upsert Default Restaurant
    let restaurant = await Restaurant.findOne({ name: 'Spice Garden Central' });
    if (!restaurant) {
      restaurant = await Restaurant.create({
        name: 'Spice Garden Central',
        description: 'Authentic multi-cuisine dining experience with real-time order tracking and kitchen operations.',
        address: '742 Evergreen Terrace, Culinary District, Metropolis, 560001',
        phone: '+91 98765 43210',
        isOpen: true,
        openingHours: '10:00 AM - 11:00 PM',
        imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1200',
      });
      console.log('✅ Restaurant created: Spice Garden Central');
    } else {
      console.log('ℹ️ Restaurant already exists: Spice Garden Central');
    }

    // 2. Seed or Upsert Demo Users (All 4 Distinct Roles)
    const demoUsers = [
      {
        email: 'customer@restaurant.com',
        name: 'Alex Johnson (Customer)',
        password: 'Customer@123',
        role: 'CUSTOMER',
        phone: '+91 98765 11111',
        address: {
          street: '456 Oak Street, Apt 3B',
          city: 'Metropolis',
          zipCode: '560001',
          formattedAddress: '456 Oak Street, Apt 3B, Metropolis, 560001',
        },
      },
      {
        email: 'admin@restaurant.com',
        name: 'Sarah Connor (Restaurant Admin)',
        password: 'Admin@123',
        role: 'ADMIN',
        phone: '+91 98765 22222',
      },
      {
        email: 'kitchen@restaurant.com',
        name: 'Chef Gordon (Kitchen Staff)',
        password: 'Kitchen@123',
        role: 'KITCHEN',
        phone: '+91 98765 33333',
      },
      {
        email: 'delivery@restaurant.com',
        name: 'David Express (Delivery Rider)',
        password: 'Delivery@123',
        role: 'DELIVERY',
        phone: '+91 98765 44444',
      },
    ];

    for (const u of demoUsers) {
      let existingUser = await User.findOne({ email: u.email });
      if (!existingUser) {
        await User.create(u);
        console.log(`✅ Demo User created: ${u.role} (${u.email})`);
      } else {
        existingUser.name = u.name;
        existingUser.role = u.role as any;
        existingUser.phone = u.phone;
        existingUser.isActive = true;
        if (u.address) existingUser.address = u.address;
        await existingUser.save();
        console.log(`ℹ️ Demo User verified: ${u.role} (${u.email})`);
      }
    }

    // 3. Seed or Upsert 7 Standard Categories (as mandated in Section 5)
    const categoryDefs = [
      { name: 'Starters', displayOrder: 1, description: 'Crispy appetizers, kebabs, and sizzlers' },
      { name: 'South Indian', displayOrder: 2, description: 'Crispy dosas, idlis, and traditional coastal specialties' },
      { name: 'Main Course', displayOrder: 3, description: 'Rich gravies, paneer, and savory chef specials' },
      { name: 'Rice and Biryani', displayOrder: 4, description: 'Dum biryanis and wok-fried basmati rice' },
      { name: 'Chinese', displayOrder: 5, description: 'Hakka noodles, manchurian, and wok specials' },
      { name: 'Desserts', displayOrder: 6, description: 'Warm sweets, pastries, and ice creams' },
      { name: 'Beverages', displayOrder: 7, description: 'Refreshing coolers, shakes, and hot beverages' },
    ];

    const categoryMap: Record<string, any> = {};
    for (const catDef of categoryDefs) {
      let cat = await Category.findOne({ name: catDef.name });
      if (!cat) {
        cat = await Category.create(catDef);
        console.log(`✅ Category created: ${cat.name}`);
      } else {
        cat.displayOrder = catDef.displayOrder;
        cat.description = catDef.description;
        await cat.save();
      }
      categoryMap[catDef.name] = cat._id;
    }

    // 4. Seed or Upsert 32 Realistic Food Items (All 30 items required by prompt)
    const menuItemsData = [
      // --- 1. Starters ---
      {
        name: 'Paneer Tikka',
        description: 'Cottage cheese cubes marinated in spiced hung yogurt, chargrilled in a clay tandoor with bell peppers.',
        price: 260,
        categoryName: 'Starters',
        imageUrl: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&q=80&w=800',
        isAvailable: true,
        isVeg: true,
        preparationTimeMinutes: 15,
      },
      {
        name: 'Chicken 65',
        description: 'Spicy, deep-fried boneless chicken bites marinated with curry leaves, ginger, red chilies, and South Indian spices.',
        price: 280,
        categoryName: 'Starters',
        imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=800',
        isAvailable: true,
        isVeg: false,
        preparationTimeMinutes: 15,
      },
      {
        name: 'Samosa',
        description: 'Crispy pastry cones packed with seasoned potato mash, green peas, cumin, and served with tangy tamarind chutney.',
        price: 80,
        categoryName: 'Starters',
        imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=800',
        isAvailable: true,
        isVeg: true,
        preparationTimeMinutes: 8,
      },
      {
        name: 'French Fries',
        description: 'Golden crispy potato sticks seasoned with peri peri spice rub and served with creamy herb dip.',
        price: 120,
        categoryName: 'Starters',
        imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&q=80&w=800',
        isAvailable: true,
        isVeg: true,
        preparationTimeMinutes: 10,
      },
      {
        name: 'Gobi Manchurian',
        description: 'Crisp fried cauliflower florets tossed in a spicy, sweet, and tangy Indo-Chinese Manchurian sauce with scallions.',
        price: 190,
        categoryName: 'Starters',
        imageUrl: 'https://images.unsplash.com/photo-1577186912275-4f74c57458ef?auto=format&fit=crop&q=80&w=800',
        isAvailable: true,
        isVeg: true,
        preparationTimeMinutes: 12,
      },

      // --- 2. South Indian ---
      {
        name: 'Masala Dosa',
        description: 'Crisp fermented rice and lentil crepe stuffed with tempered spiced potato bhaji, served with coconut chutney & piping hot sambar.',
        price: 140,
        categoryName: 'South Indian',
        imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&q=80&w=800',
        isAvailable: true,
        isVeg: true,
        preparationTimeMinutes: 10,
      },
      {
        name: 'Plain Dosa',
        description: 'Golden, paper-thin crispy fermented rice crepe roasted with pure desi ghee, served with assorted chutneys and sambar.',
        price: 110,
        categoryName: 'South Indian',
        imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=800',
        isAvailable: true,
        isVeg: true,
        preparationTimeMinutes: 8,
      },
      {
        name: 'Idli',
        description: 'Steamed fluffy rice and urad dal cakes, soft as clouds, served with fresh coconut chutney, tomato dip, and drumstick sambar.',
        price: 90,
        categoryName: 'South Indian',
        imageUrl: 'https://images.unsplash.com/photo-1741376509047-66dae5df90f9?auto=format&fit=crop&q=80&w=800',
        isAvailable: true,
        isVeg: true,
        preparationTimeMinutes: 6,
      },
      {
        name: 'Poori',
        description: 'Puffy deep-fried golden whole wheat bread served with mild spiced South Indian potato masala gravy.',
        price: 120,
        categoryName: 'South Indian',
        imageUrl: 'https://images.unsplash.com/photo-1643892467625-65df6a500524?auto=format&fit=crop&q=80&w=800',
        isAvailable: true,
        isVeg: true,
        preparationTimeMinutes: 10,
      },
      {
        name: 'Parotta',
        description: 'Flaky, layered Malabar flatbread shallow-fried on tawa, served with rich aromatic vegetable kurma.',
        price: 130,
        categoryName: 'South Indian',
        imageUrl: 'https://images.unsplash.com/photo-1694951675394-1fd90089d4fa?auto=format&fit=crop&q=80&w=800',
        isAvailable: true,
        isVeg: true,
        preparationTimeMinutes: 10,
      },

      // --- 3. Main Course ---
      {
        name: 'Paneer Butter Masala',
        description: 'Succulent cubes of Indian cottage cheese simmered in a velvety, rich tomato, cashew nut, and butter gravy garnished with kasuri methi.',
        price: 290,
        categoryName: 'Main Course',
        imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=800',
        isAvailable: true,
        isVeg: true,
        preparationTimeMinutes: 18,
      },
      {
        name: 'Butter Chicken',
        description: 'Tender tandoor-smoked chicken pieces bathed in a smooth, sweet and mildly spiced aromatic tomato-cream gravy with fragrant spices.',
        price: 340,
        categoryName: 'Main Course',
        imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&q=80&w=800',
        isAvailable: true,
        isVeg: false,
        preparationTimeMinutes: 20,
      },
      {
        name: 'Veg Burger',
        description: 'Crispy seasoned vegetable patty layered with melted cheddar cheese slice, fresh lettuce, tomato, and house burger sauce.',
        price: 150,
        categoryName: 'Main Course',
        imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800',
        isAvailable: true,
        isVeg: true,
        preparationTimeMinutes: 12,
      },
      {
        name: 'Chicken Burger',
        description: 'Juicy crumb-fried chicken breast fillet topped with spicy slaw, cheddar cheese, and pickles in a toasted brioche bun.',
        price: 190,
        categoryName: 'Main Course',
        imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&q=80&w=800',
        isAvailable: true,
        isVeg: false,
        preparationTimeMinutes: 14,
      },
      {
        name: 'Margherita Pizza',
        description: 'Artisan hand-tossed pizza crust topped with rich San Marzano tomato puree, fresh mozzarella cheese, and fragrant sweet basil leaves.',
        price: 280,
        categoryName: 'Main Course',
        imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&q=80&w=800',
        isAvailable: true,
        isVeg: true,
        preparationTimeMinutes: 18,
      },
      {
        name: 'Pasta',
        description: 'Penne rigate cooked al dente in a velvety garlic-parmesan cream sauce with sautéed mushrooms, bell peppers, and fresh herbs.',
        price: 260,
        categoryName: 'Main Course',
        imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281898?auto=format&fit=crop&q=80&w=800',
        isAvailable: true,
        isVeg: true,
        preparationTimeMinutes: 16,
      },

      // --- 4. Rice and Biryani ---
      {
        name: 'Chicken Biryani',
        description: 'Royal Hyderabadi dum biryani cooked with marinated spring chicken, aged long-grain basmati rice, saffron, mint, and fried onions.',
        price: 320,
        categoryName: 'Rice and Biryani',
        imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=800',
        isAvailable: true,
        isVeg: false,
        preparationTimeMinutes: 25,
      },
      {
        name: 'Veg Biryani',
        description: 'Fragrant basmati rice layered with garden vegetables, aromatic whole spices, fried cashews, and kewra essence in slow dum style.',
        price: 240,
        categoryName: 'Rice and Biryani',
        imageUrl: 'https://images.unsplash.com/photo-1642821373181-696a54913e9a?auto=format&fit=crop&q=80&w=800',
        isAvailable: true,
        isVeg: true,
        preparationTimeMinutes: 20,
      },
      {
        name: 'Paneer Biryani',
        description: 'Aromatic basmati rice cooked with chargrilled spiced cottage cheese cubes, caramelized shallots, saffron, and mint gravy.',
        price: 270,
        categoryName: 'Rice and Biryani',
        imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&q=80&w=800',
        isAvailable: true,
        isVeg: true,
        preparationTimeMinutes: 20,
      },
      {
        name: 'Chicken Fried Rice',
        description: 'Wok-tossed long grain rice with fluffy scrambled egg, shredded chicken breast, scallions, and a dash of light soy and white pepper.',
        price: 220,
        categoryName: 'Rice and Biryani',
        imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=800',
        isAvailable: true,
        isVeg: false,
        preparationTimeMinutes: 12,
      },
      {
        name: 'Veg Fried Rice',
        description: 'Classic Indo-Chinese fried rice stir-fried over high flame with diced carrots, french beans, spring onion greens, and garlic.',
        price: 190,
        categoryName: 'Rice and Biryani',
        imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&q=80&w=800',
        isAvailable: true,
        isVeg: true,
        preparationTimeMinutes: 12,
      },

      // --- 5. Chinese ---
      {
        name: 'Chicken Noodles',
        description: 'Wok-tossed Hakka noodles with tender chicken strips, julienned bell peppers, crunchy cabbage, and garlic chili oil.',
        price: 210,
        categoryName: 'Chinese',
        imageUrl: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&q=80&w=800',
        isAvailable: true,
        isVeg: false,
        preparationTimeMinutes: 14,
      },
      {
        name: 'Veg Noodles',
        description: 'Long wheat noodles stir-fried with farm fresh vegetables, soy sauce, white pepper, and toasted sesame oil in a smoking wok.',
        price: 180,
        categoryName: 'Chinese',
        imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=800',
        isAvailable: true,
        isVeg: true,
        preparationTimeMinutes: 12,
      },
      {
        name: 'Chili Chicken',
        description: 'Batter-fried succulent chicken chunks tossed with diced bell peppers, red onions, garlic, and fiery dark chili soya sauce.',
        price: 270,
        categoryName: 'Chinese',
        imageUrl: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&q=80&w=800',
        isAvailable: true,
        isVeg: false,
        preparationTimeMinutes: 15,
      },

      // --- 6. Desserts ---
      {
        name: 'Gulab Jamun',
        description: 'Classic Indian delicacy: warm, golden milk solid spheres soaked in cardamom, saffron, and rose water syrup. (2 pieces)',
        price: 110,
        categoryName: 'Desserts',
        imageUrl: 'https://images.unsplash.com/photo-1666190092159-3171cf0fbb12?auto=format&fit=crop&q=80&w=800',
        isAvailable: true,
        isVeg: true,
        preparationTimeMinutes: 5,
      },
      {
        name: 'Brownie',
        description: 'Dense, fudgy dark chocolate walnut brownie served warm with a drizzle of Belgian chocolate ganache.',
        price: 150,
        categoryName: 'Desserts',
        imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=800',
        isAvailable: true,
        isVeg: true,
        preparationTimeMinutes: 5,
      },
      {
        name: 'Ice Cream',
        description: 'Triple scoop artisan ice cream pairing premium Belgian dark chocolate, Alphonso mango, and Madagascar vanilla bean.',
        price: 130,
        categoryName: 'Desserts',
        imageUrl: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&q=80&w=800',
        isAvailable: true,
        isVeg: true,
        preparationTimeMinutes: 4,
      },

      // --- 7. Beverages ---
      {
        name: 'Mango Lassi',
        description: 'Thick, creamy traditional yogurt beverage blended with sweet Alphonso mango pulp, topped with saffron strands and crushed pistachios.',
        price: 110,
        categoryName: 'Beverages',
        imageUrl: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&q=80&w=800',
        isAvailable: true,
        isVeg: true,
        preparationTimeMinutes: 5,
      },
      {
        name: 'Fresh Lime Soda',
        description: 'Chilled sparkling carbonated cooler prepared with freshly pressed lime juice, mint sprigs, and choice of sweet or salt.',
        price: 80,
        categoryName: 'Beverages',
        imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=800',
        isAvailable: true,
        isVeg: true,
        preparationTimeMinutes: 4,
      },
      {
        name: 'Cold Coffee',
        description: 'Rich espresso shot blended with chilled whole milk, chocolate fudge drizzle, and a scoop of vanilla ice cream.',
        price: 140,
        categoryName: 'Beverages',
        imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=800',
        isAvailable: true,
        isVeg: true,
        preparationTimeMinutes: 5,
      },
      {
        name: 'Masala Tea',
        description: 'Authentic Indian kadak chai brewed with fresh cow milk, crushed ginger, green cardamom, cloves, and premium Assam tea leaves.',
        price: 60,
        categoryName: 'Beverages',
        imageUrl: 'https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?auto=format&fit=crop&q=80&w=800',
        isAvailable: true,
        isVeg: true,
        preparationTimeMinutes: 6,
      },
      // 32nd Item: Special Unavailable item to test currently unavailable display & order prevention
      {
        name: 'Chef Special Tandoori Platter',
        description: 'Grand royal assortment of tandoori paneer, kebabs, and stuffed mushrooms. (Special Weekend Exclusive)',
        price: 499,
        categoryName: 'Starters',
        imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800',
        isAvailable: false, // Explicitly false to test unavailability display!
        isVeg: true,
        preparationTimeMinutes: 30,
      },
    ];

    console.log(`Seeding / Upserting ${menuItemsData.length} Realistic Food Items...`);

    for (const item of menuItemsData) {
      const catId = categoryMap[item.categoryName];
      if (!catId) continue;

      let menuItem = await MenuItem.findOne({ name: item.name });
      if (!menuItem) {
        await MenuItem.create({
          name: item.name,
          description: item.description,
          price: item.price,
          category: catId,
          restaurant: restaurant._id,
          imageUrl: item.imageUrl,
          isAvailable: item.isAvailable,
          isVeg: item.isVeg,
          preparationTimeMinutes: item.preparationTimeMinutes,
        });
      } else {
        menuItem.description = item.description;
        menuItem.price = item.price;
        menuItem.category = catId;
        menuItem.restaurant = restaurant._id;
        menuItem.imageUrl = item.imageUrl;
        menuItem.isAvailable = item.isAvailable;
        menuItem.isVeg = item.isVeg;
        menuItem.preparationTimeMinutes = item.preparationTimeMinutes;
        await menuItem.save();
      }
    }

    console.log('✅ Database Seeding Completed Successfully!');
    console.log('----------------------------------------------------');
    console.log('Total Categories Seeded:', Object.keys(categoryMap).length);
    console.log('Total Menu Items Seeded:', menuItemsData.length);
    console.log('Demo Accounts Credentials:');
    console.log('CUSTOMER : customer@restaurant.com (Password: Customer@123)');
    console.log('ADMIN    : admin@restaurant.com    (Password: Admin@123)');
    console.log('KITCHEN  : kitchen@restaurant.com  (Password: Kitchen@123)');
    console.log('DELIVERY : delivery@restaurant.com (Password: Delivery@123)');
    console.log('----------------------------------------------------');

    if (exitOnComplete) {
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Error Seeding Database:', error);
    if (exitOnComplete) {
      process.exit(1);
    }
  }
};

// If run directly from CLI (e.g. `npm run seed`)
if (require.main === module) {
  seedDatabase(true);
}
