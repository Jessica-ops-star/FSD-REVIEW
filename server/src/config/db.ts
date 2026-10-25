import mongoose from 'mongoose';

let mongoMemoryServer: any = null;

export const connectDB = async (): Promise<typeof mongoose> => {
  try {
    const connStr = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/restaurant_platform';
    console.log(`Attempting MongoDB connection at ${connStr}...`);
    
    // Set 3 second timeout for initial connection attempt to local MongoDB
    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 3000,
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error: any) {
    console.warn(`⚠️ Local MongoDB connection failed (${error.message}). Falling back to MongoMemoryServer for standalone execution...`);
    
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServer.getUri();
      console.log(`🚀 In-Memory MongoDB Server Started at ${memoryUri}`);
      
      const conn = await mongoose.connect(memoryUri);
      console.log(`✅ In-Memory MongoDB Connected!`);
      return conn;
    } catch (memErr: any) {
      console.error(`❌ Failed to start In-Memory MongoDB fallback:`, memErr);
      process.exit(1);
    }
  }
};
