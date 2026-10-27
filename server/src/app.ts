import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import menuRoutes from './routes/menuRoutes';
import cartRoutes from './routes/cartRoutes';
import orderRoutes from './routes/orderRoutes';
import deliveryRoutes from './routes/deliveryRoutes';
import customerRoutes from './routes/customerRoutes';
import paymentRoutes from './routes/paymentRoutes';
import staffRoutes from './routes/staffRoutes';
import categoryRoutes from './routes/categoryRoutes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app: Application = express();

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
  })
);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route welcoming users and directing to frontend
app.get('/', (req, res) => {
  res.json({
    status: 'ONLINE',
    message: 'Spice Garden Restaurant Platform API is running smoothly 🚀',
    frontend: 'https://fsd-review-v1aa.vercel.app',
    healthCheck: '/api/health',
    endpoints: {
      menu: '/api/menu/items',
      categories: '/api/menu/categories',
      auth: '/api/auth/login'
    }
  });
});

// API Base Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date(),
    service: 'Integrated Restaurant Management API (MERN)',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/staff', staffRoutes);

// Error Handling Middleware
app.use(errorHandler);

export default app;
