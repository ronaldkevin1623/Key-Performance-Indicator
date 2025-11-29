"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.authenticate = void 0;
const jwt_config_1 = require("../config/jwt.config");
const models_1 = require("../models");
const logger_1 = __importDefault(require("../utils/logger"));
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ status: 'error', message: 'No token provided. Please login.' });
            return;
        }
        const token = authHeader.substring(7);
        const decoded = (0, jwt_config_1.verifyAccessToken)(token);
        const user = await models_1.User.findById(decoded.userId);
        if (!user || !user.isActive) {
            res.status(401).json({ status: 'error', message: 'User no longer exists or is inactive.' });
            return;
        }
        // Now companyId should always be a string!
        let companyId = "";
        if (typeof decoded.companyId === "string") {
            companyId = decoded.companyId;
        }
        else if (typeof decoded.companyId === "object" && decoded.companyId !== null) {
            // If old token; fallback
            const obj = decoded.companyId;
            if (obj._id && typeof obj._id === "string")
                companyId = obj._id;
            else if (obj.id && typeof obj.id === "string")
                companyId = obj.id;
        }
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
            companyId, // always plain string
        };
        next();
    }
    catch (error) {
        logger_1.default.error('Authentication error:', error.message);
        res.status(401).json({ status: 'error', message: 'Invalid or expired token. Please login again.' });
    }
};
exports.authenticate = authenticate;
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ status: 'error', message: 'Authentication required.' });
        return;
    }
    if (req.user.role !== 'admin') {
        res.status(403).json({ status: 'error', message: 'Access denied. Admin privileges required.' });
        return;
    }
    next();
};
exports.requireAdmin = requireAdmin;
// Other middleware (employee, company access...) same as before
exports.default = {
    authenticate: exports.authenticate,
    requireAdmin: exports.requireAdmin,
    // ...others...
};
//# sourceMappingURL=auth.middleware.js.map