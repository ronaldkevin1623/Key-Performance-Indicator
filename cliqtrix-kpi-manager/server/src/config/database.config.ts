/**
 * Database Configuration
 * MongoDB Atlas connection setup with error handling
 * 
 * Location: server/src/config/database.config.ts
 */

import mongoose from 'mongoose';
import logger from '../utils/logger';

// MongoDB connection options
const options: mongoose.ConnectOptions = {
  // Automatically try to reconnect when connection is lost
  // Modern mongoose versions handle these automatically
};

/**
 * Connect to MongoDB Atlas
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    // Connect to MongoDB
    await mongoose.connect(mongoUri, options);

    logger.info('✅ MongoDB connected successfully');
    logger.info(`📊 Database: ${mongoose.connection.name}`);
    logger.info(`🌍 Host: ${mongoose.connection.host}`);

  } catch (error: any) {
    logger.error('❌ MongoDB connection error:', error.message);
    
    // Exit process with failure
    process.exit(1);
  }
};

/**
 * Disconnect from MongoDB
 */
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected successfully');
  } catch (error: any) {
    logger.error('Error disconnecting from MongoDB:', error.message);
    throw error;
  }
};

/**
 * Handle MongoDB connection events
 */
export const setupDatabaseEventHandlers = (): void => {
  // Connection successful
  mongoose.connection.on('connected', () => {
    logger.info('Mongoose connected to MongoDB');
  });

  // Connection error
  mongoose.connection.on('error', (err) => {
    logger.error('Mongoose connection error:', err);
  });

  // Connection disconnected
  mongoose.connection.on('disconnected', () => {
    logger.warn('Mongoose disconnected from MongoDB');
  });

  // If Node process ends, close mongoose connection
  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    logger.info('Mongoose connection closed due to application termination');
    process.exit(0);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err: any) => {
    logger.error('Unhandled Rejection:', err.message);
    logger.error(err.stack);
  });
};

/**
 * Get database connection status
 */
export const getDatabaseStatus = (): string => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return states[mongoose.connection.readyState] || 'unknown';
};

/**
 * Check if database is connected
 */
export const isDatabaseConnected = (): boolean => {
  return mongoose.connection.readyState === 1;
};

export default {
  connectDatabase,
  disconnectDatabase,
  setupDatabaseEventHandlers,
  getDatabaseStatus,
  isDatabaseConnected,
};