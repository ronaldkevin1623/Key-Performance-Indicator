
import express, { Application, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';

// Import configurations
import { connectDatabase, setupDatabaseEventHandlers, getDatabaseStatus } from './config/database.config';
import logger from './utils/logger';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';

// Load environment variables
const result = dotenv.config({ path: '.env.development' });

// Debug logging
console.log('=== ENV FILE DEBUG ===');
console.log('Dotenv loaded:', result.error ? 'FAILED' : 'SUCCESS');
if (result.error) {
  console.log('Error:', result.error.message);
}
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
console.log('MONGODB_URI value:', process.env.MONGODB_URI ? 'SET (hidden for security)' : 'NOT SET');
console.log('======================');

// Create Express app
const app: Application = express();

// Get port from environment or use default
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';

// ============================================
// MIDDLEWARE SETUP
// ============================================

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// HTTP request logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ============================================
// API ROUTES
// ============================================

// Mount authentication routes
app.use('/api/auth', authRoutes);

// Mount user management routes
app.use('/api/users', userRoutes);

// ============================================
// TEST ROUTES
// ============================================

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: getDatabaseStatus(),
  });
});

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    message: '🎯 Cliqtrix KPI Manager API',
    version: '1.0.0',
    status: 'active',
    database: getDatabaseStatus(),
    endpoints: {
      health: '/health',
      auth: {
        signup: 'POST /api/auth/signup',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
        logout: 'POST /api/auth/logout',
      },
      users: {
        create: 'POST /api/users',
        list: 'GET /api/users',
        get: 'GET /api/users/:id',
        update: 'PATCH /api/users/:id',
        deactivate: 'DELETE /api/users/:id',
      },
    },
  });
});

// API info endpoint
app.get('/api', (_req: Request, res: Response) => {
  res.status(200).json({
    message: 'Cliqtrix KPI Manager API v1.0.0',
    database: getDatabaseStatus(),
    availableRoutes: {
      authentication: '/api/auth',
      users: '/api/users',
    },
  });
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(`Error: ${err.message}`);
  logger.error(err.stack);

  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ============================================
// START SERVER
// ============================================

const startServer = async () => {
  try {
    // Setup database event handlers
    setupDatabaseEventHandlers();

    // Connect to database
    await connectDatabase();

    // Start server
    app.listen(PORT, () => {
      logger.info('='.repeat(50));
      logger.info('🚀 Cliqtrix KPI Manager Server Started');
      logger.info('='.repeat(50));
      logger.info(`📍 Server: http://${HOST}:${PORT}`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV}`);
      logger.info(`📊 Database: ${getDatabaseStatus()}`);
      logger.info('='.repeat(50));
      logger.info('📌 Available Routes:');
      logger.info('   AUTH:');
      logger.info('     POST   /api/auth/signup   - Company registration');
      logger.info('     POST   /api/auth/login    - User login');
      logger.info('     GET    /api/auth/me       - Get current user');
      logger.info('     POST   /api/auth/logout   - User logout');
      logger.info('   USERS (Admin only):');
      logger.info('     POST   /api/users         - Create employee');
      logger.info('     GET    /api/users         - List employees');
      logger.info('     GET    /api/users/:id     - Get employee');
      logger.info('     PATCH  /api/users/:id     - Update employee');
      logger.info('     DELETE /api/users/:id     - Deactivate employee');
      logger.info('='.repeat(50));
    });

  } catch (error: any) {
    logger.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

// Start the server
startServer();

// Export app for testing
export default app;