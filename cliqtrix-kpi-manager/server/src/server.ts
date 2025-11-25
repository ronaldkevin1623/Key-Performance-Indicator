import express, { Application, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';

// Import configurations
import { connectDatabase, setupDatabaseEventHandlers, getDatabaseStatus } from './config/database.config';
import corsOptions from './config/cors.config'; // ✅ Use custom CORS config!
import logger from './utils/logger';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import projectRoutes from './routes/project.routes';
import taskRoutes from './routes/task.routes';
import dashboardRoutes from './routes/dashboard.routes';

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

// Use custom CORS configuration
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

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes); // REGISTER DASHBOARD ROUTE
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
      projects: {
        create: 'POST /api/projects',
        list: 'GET /api/projects',
        get: 'GET /api/projects/:id',
        update: 'PATCH /api/projects/:id',
        delete: 'DELETE /api/projects/:id',
        addMember: 'POST /api/projects/:id/members',
        removeMember: 'DELETE /api/projects/:id/members/:userId',
      },
      tasks: {
        create: 'POST /api/tasks',
        list: 'GET /api/tasks',
        get: 'GET /api/tasks/:id',
        update: 'PATCH /api/tasks/:id',
        delete: 'DELETE /api/tasks/:id',
        addComment: 'POST /api/tasks/:id/comments',
        getKPI: 'GET /api/tasks/kpi/:userId',
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
      projects: '/api/projects',
      tasks: '/api/tasks',
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
      logger.info('='.repeat(60));
      logger.info('🚀 Cliqtrix KPI Manager Server Started');
      logger.info('='.repeat(60));
      logger.info(`📍 Server: http://${HOST}:${PORT}`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV}`);
      logger.info(`📊 Database: ${getDatabaseStatus()}`);
      logger.info('='.repeat(60));
    });
  } catch (error: any) {
    logger.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

export default app;
