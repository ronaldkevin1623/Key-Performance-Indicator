# Backend Integration Guide

## Quick Start

### 1. Configure Backend CORS

Add this to your Express server (`server/index.js` or `server/app.js`):

```javascript
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:5173', // Vite dev server
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 2. Setup Environment Variables

Create `client/.env` file:
```
VITE_API_URL=http://localhost:5000
```

### 3. Start Both Servers

**Terminal 1 - Backend:**
```bash
cd server
npm install
npm start  # Should run on port 5000
```

**Terminal 2 - Frontend:**
```bash
cd client
npm install
npm run dev  # Runs on port 5173
```

## Backend API Requirements

Your backend must implement these endpoints:

### Authentication
- `POST /auth/signup` - Register new user
  - Body: `{ name, email, password, company, role }`
  - Returns: `{ token, user: { id, name, email, role, company } }`

- `POST /auth/login` - User login
  - Body: `{ email, password }`
  - Returns: `{ token, user: { id, name, email, role, company } }`

- `GET /auth/me` - Get current user
  - Headers: `Authorization: Bearer <token>`
  - Returns: `{ id, name, email, role, company }`

- `POST /auth/logout` - Logout user
  - Headers: `Authorization: Bearer <token>`

### Dashboard
- `GET /dashboard/admin` - Admin dashboard stats
  - Headers: `Authorization: Bearer <token>`
  - Returns: `{ totalProjects, totalUsers, totalTasks, completionRate }`

- `GET /dashboard/employee` - Employee dashboard stats
  - Headers: `Authorization: Bearer <token>`
  - Returns: `{ totalTasks, completedTasks, totalPoints, completionRate }`

### Projects
- `GET /projects` - Get all projects
- `POST /projects` - Create project
- `GET /projects/:id` - Get project by ID
- `PUT /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project
- `GET /projects/:id/kpi` - Get project KPIs

### Tasks
- `GET /tasks?userId=&projectId=` - Get all tasks (with optional filters)
- `POST /tasks` - Create task
- `GET /tasks/:id` - Get task by ID
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task

### Users (Admin only)
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

## JWT Token Format

Your backend should return JWT tokens with this payload:
```javascript
{
  id: user.id,
  email: user.email,
  role: user.role,
  company: user.company
}
```

## Testing the Integration

1. **Start both servers**
2. **Open browser**: `http://localhost:5173`
3. **Sign up** as admin or employee
4. **Login** with credentials
5. **Check browser console** for any CORS or API errors
6. **Test features**: Create projects, add tasks, view dashboards

## Common Issues

### CORS Errors
- Make sure backend CORS is configured correctly
- Check if backend is running on port 5000
- Verify frontend is making requests to correct URL

### 401 Unauthorized
- Token not being sent correctly
- Token expired
- Check Authorization header format: `Bearer <token>`

### 404 Not Found
- Backend routes don't match frontend API calls
- Check endpoint URLs match exactly

### Network Errors
- Backend not running
- Wrong API_URL in .env file
- Firewall blocking connections

## Production Deployment

### Backend
Deploy to Heroku, Railway, Render, or AWS

### Frontend
1. Update `.env.production`:
```
VITE_API_URL=https://your-backend-url.com
```

2. Build and deploy:
```bash
npm run build
# Deploy 'dist' folder to Vercel, Netlify, etc.
```

3. Update backend CORS to allow production URL

## Security Checklist

✅ JWT tokens stored in localStorage (or use httpOnly cookies)
✅ All inputs validated on both frontend and backend
✅ CORS restricted to your frontend domain in production
✅ Rate limiting implemented on backend
✅ SQL injection protection (use parameterized queries)
✅ XSS protection (React handles this by default)
✅ HTTPS in production
