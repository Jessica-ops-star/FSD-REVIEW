import http from 'http';
import dotenv from 'dotenv';
import app from './app';
import { connectDB } from './config/db';
import { initSocket } from './socket/socketManager';
import MenuItem from './models/MenuItem';
import { seedDatabase } from './utils/seed';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Connect to MongoDB Database
    await connectDB();

    // 2. Auto-seed and sync database with complete realistic seed dataset
    console.log('⚡ Syncing database with complete realistic seed dataset and dish images...');
    await seedDatabase(false);

    // 3. Create HTTP Server
    const server = http.createServer(app);

    // 4. Initialize Socket.IO Server Hub
    initSocket(server);

    // 4. Start listening
    server.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 MERN Restaurant Platform Backend Running!`);
      console.log(`📡 REST API Base URL: http://localhost:${PORT}/api`);
      console.log(`🔌 Socket.IO Server Ready on Port ${PORT}`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
