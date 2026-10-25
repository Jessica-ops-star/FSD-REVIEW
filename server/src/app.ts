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
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
