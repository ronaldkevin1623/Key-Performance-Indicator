"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
// Import configurations
const database_config_1 = require("./config/database.config");
const cors_config_1 = __importDefault(require("./config/cors.config"));
const logger_1 = __importDefault(require("./utils/logger"));
// Import routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const project_routes_1 = __importDefault(require("./routes/project.routes"));
const projectStats_routes_1 = __importDefault(require("./routes/projectStats.routes"));
const task_routes_1 = __importDefault(require("./routes/task.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const team_routes_1 = __importDefault(require("./routes/team.routes"));
const goal_routes_1 = __importDefault(require("./routes/goal.routes"));
const chatbot_routes_1 = __importDefault(require("./routes/chatbot.routes"));
// Load environment variables (switch file by NODE_ENV)
const envFile = process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";
const result = dotenv_1.default.config({ path: envFile });
// Debug logging
console.log("=== ENV FILE DEBUG ===");
console.log("Using env file:", envFile);
console.log("Dotenv loaded:", result.error ? "FAILED" : "SUCCESS");
if (result.error) {
    console.log("Error:", result.error.message);
}
console.log("MONGODB_URI exists:", !!process.env.MONGODB_URI);
console.log("MONGODB_URI value:", process.env.MONGODB_URI ? "SET (hidden for security)" : "NOT SET");
console.log("======================");
// Create Express app
const app = (0, express_1.default)();
// Get port from environment or use default
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "localhost";
// ============================================
// MIDDLEWARE SETUP
// ============================================
// Security middleware
app.use((0, helmet_1.default)());
// Use custom CORS configuration
app.use((0, cors_1.default)(cors_config_1.default));
// Body parsing middleware
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
// Compression middleware
app.use((0, compression_1.default)());
// HTTP request logger
if (process.env.NODE_ENV === "development") {
    app.use((0, morgan_1.default)("dev"));
}
// ============================================
// API ROUTES
// ============================================
app.use("/api/auth", auth_routes_1.default);
app.use("/api/users", user_routes_1.default);
app.use("/api/projects", project_routes_1.default);
app.use("/api/projects", projectStats_routes_1.default);
app.use("/api/tasks", task_routes_1.default);
app.use("/api/dashboard", dashboard_routes_1.default);
app.use("/api/teams", team_routes_1.default);
app.use("/api/goals", goal_routes_1.default);
app.use("/api/chatbot", chatbot_routes_1.default);
// ============================================
// TEST ROUTES
// ============================================
app.get("/health", (_req, res) => {
    res.status(200).json({
        status: "success",
        message: "Server is running",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        database: (0, database_config_1.getDatabaseStatus)(),
    });
});
app.get("/", (_req, res) => {
    res.status(200).json({
        message: "🎯 Cliqtrix KPI Manager API",
        version: "1.0.0",
        status: "active",
        database: (0, database_config_1.getDatabaseStatus)(),
        endpoints: {
            health: "/health",
            auth: {
                signup: "POST /api/auth/signup",
                login: "POST /api/auth/login",
                me: "GET /api/auth/me",
                logout: "POST /api/auth/logout",
            },
            users: {
                create: "POST /api/users",
                list: "GET /api/users",
                get: "GET /api/users/:id",
                update: "PATCH /api/users/:id",
                deactivate: "DELETE /api/users/:id",
            },
            projects: {
                create: "POST /api/projects",
                list: "GET /api/projects",
                get: "GET /api/projects/:id",
                update: "PATCH /api/projects/:id",
                delete: "DELETE /api/projects/:id",
                addMember: "POST /api/projects/:id/members",
                removeMember: "DELETE /api/projects/:id/members/:userId",
                overview: "GET /api/projects/:id/overview",
            },
            tasks: {
                create: "POST /api/tasks",
                list: "GET /api/tasks",
                get: "GET /api/tasks/:id",
                update: "PATCH /api/tasks/:id",
                delete: "DELETE /api/tasks/:id",
                addComment: "POST /api/tasks/:id/comments",
                getKPI: "GET /api/tasks/kpi/:userId",
            },
            teams: {
                upsertForProject: "PUT /api/teams/:projectId",
            },
            goals: {
                create: "POST /api/goals",
                today: "GET /api/goals/today",
                complete: "PATCH /api/goals/:id/complete",
            },
            chatbot: {
                chat: "POST /api/chatbot",
            },
        },
    });
});
app.get("/api", (_req, res) => {
    res.status(200).json({
        message: "Cliqtrix KPI Manager API v1.0.0",
        database: (0, database_config_1.getDatabaseStatus)(),
        availableRoutes: {
            authentication: "/api/auth",
            users: "/api/users",
            projects: "/api/projects",
            tasks: "/api/tasks",
            dashboard: "/api/dashboard",
            teams: "/api/teams",
            goals: "/api/goals",
            chatbot: "/api/chatbot",
        },
    });
});
// ============================================
// ERROR HANDLING
// ============================================
app.use((req, res) => {
    res.status(404).json({
        status: "error",
        message: "Route not found",
        path: req.originalUrl,
    });
});
app.use((err, _req, res, _next) => {
    logger_1.default.error(`Error: ${err.message}`);
    logger_1.default.error(err.stack);
    res.status(err.status || 500).json({
        status: "error",
        message: err.message || "Internal server error",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
});
// ============================================
// START SERVER
// ============================================
const startServer = async () => {
    try {
        (0, database_config_1.setupDatabaseEventHandlers)();
        await (0, database_config_1.connectDatabase)();
        app.listen(PORT, () => {
            logger_1.default.info("=".repeat(60));
            logger_1.default.info("🚀 Cliqtrix KPI Manager Server Started");
            logger_1.default.info("=".repeat(60));
            logger_1.default.info(`📍 Server: http://${HOST}:${PORT}`);
            logger_1.default.info(`🌍 Environment: ${process.env.NODE_ENV}`);
            logger_1.default.info(`📊 Database: ${(0, database_config_1.getDatabaseStatus)()}`);
            logger_1.default.info("=".repeat(60));
        });
    }
    catch (error) {
        logger_1.default.error("Failed to start server:", error.message);
        process.exit(1);
    }
};
startServer();
exports.default = app;
//# sourceMappingURL=server.js.map