import cors from 'cors';

const corsOptions: cors.CorsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    
    // Allowed origins
    const allowedOrigins = [
      'http://localhost:5173',      // Vite dev server
      'http://localhost:8080',      // Your current frontend port ✅
      'http://localhost:3000',      // Alternative React dev server
      'http://localhost:4200',      // Angular dev server
      process.env.FRONTEND_URL,     // Production frontend URL from env
    ].filter(Boolean);  // Remove undefined values

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,  // Allow cookies and auth headers
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
  ],
};

export default corsOptions;
