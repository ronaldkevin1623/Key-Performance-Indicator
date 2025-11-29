"use strict";
/**
 * Database Configuration
 * MongoDB Atlas connection setup with error handling
 *
 * Location: server/src/config/database.config.ts
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDatabaseConnected = exports.getDatabaseStatus = exports.setupDatabaseEventHandlers = exports.disconnectDatabase = exports.connectDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = __importDefault(require("../utils/logger"));
// MongoDB connection options
const options = {
// Automatically try to reconnect when connection is lost
// Modern mongoose versions handle these automatically
};
/**
 * Connect to MongoDB Atlas
 */
const connectDatabase = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }
        // Connect to MongoDB
        await mongoose_1.default.connect(mongoUri, options);
        logger_1.default.info('✅ MongoDB connected successfully');
        logger_1.default.info(`📊 Database: ${mongoose_1.default.connection.name}`);
        logger_1.default.info(`🌍 Host: ${mongoose_1.default.connection.host}`);
    }
    catch (error) {
        logger_1.default.error('❌ MongoDB connection error:', error.message);
        // Exit process with failure
        process.exit(1);
    }
};
exports.connectDatabase = connectDatabase;
/**
 * Disconnect from MongoDB
 */
const disconnectDatabase = async () => {
    try {
        await mongoose_1.default.disconnect();
        logger_1.default.info('MongoDB disconnected successfully');
    }
    catch (error) {
        logger_1.default.error('Error disconnecting from MongoDB:', error.message);
        throw error;
    }
};
exports.disconnectDatabase = disconnectDatabase;
/**
 * Handle MongoDB connection events
 */
const setupDatabaseEventHandlers = () => {
    // Connection successful
    mongoose_1.default.connection.on('connected', () => {
        logger_1.default.info('Mongoose connected to MongoDB');
    });
    // Connection error
    mongoose_1.default.connection.on('error', (err) => {
        logger_1.default.error('Mongoose connection error:', err);
    });
    // Connection disconnected
    mongoose_1.default.connection.on('disconnected', () => {
        logger_1.default.warn('Mongoose disconnected from MongoDB');
    });
    // If Node process ends, close mongoose connection
    process.on('SIGINT', async () => {
        await mongoose_1.default.connection.close();
        logger_1.default.info('Mongoose connection closed due to application termination');
        process.exit(0);
    });
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
        logger_1.default.error('Unhandled Rejection:', err.message);
        logger_1.default.error(err.stack);
    });
};
exports.setupDatabaseEventHandlers = setupDatabaseEventHandlers;
/**
 * Get database connection status
 */
const getDatabaseStatus = () => {
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    return states[mongoose_1.default.connection.readyState] || 'unknown';
};
exports.getDatabaseStatus = getDatabaseStatus;
/**
 * Check if database is connected
 */
const isDatabaseConnected = () => {
    return mongoose_1.default.connection.readyState === 1;
};
exports.isDatabaseConnected = isDatabaseConnected;
exports.default = {
    connectDatabase: exports.connectDatabase,
    disconnectDatabase: exports.disconnectDatabase,
    setupDatabaseEventHandlers: exports.setupDatabaseEventHandlers,
    getDatabaseStatus: exports.getDatabaseStatus,
    isDatabaseConnected: exports.isDatabaseConnected,
};
//# sourceMappingURL=database.config.js.map