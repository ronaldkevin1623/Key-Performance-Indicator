/**
 * Database Configuration
 * MongoDB Atlas connection setup with error handling
 *
 * Location: server/src/config/database.config.ts
 */
/**
 * Connect to MongoDB Atlas
 */
export declare const connectDatabase: () => Promise<void>;
/**
 * Disconnect from MongoDB
 */
export declare const disconnectDatabase: () => Promise<void>;
/**
 * Handle MongoDB connection events
 */
export declare const setupDatabaseEventHandlers: () => void;
/**
 * Get database connection status
 */
export declare const getDatabaseStatus: () => string;
/**
 * Check if database is connected
 */
export declare const isDatabaseConnected: () => boolean;
declare const _default: {
    connectDatabase: () => Promise<void>;
    disconnectDatabase: () => Promise<void>;
    setupDatabaseEventHandlers: () => void;
    getDatabaseStatus: () => string;
    isDatabaseConnected: () => boolean;
};
export default _default;
//# sourceMappingURL=database.config.d.ts.map