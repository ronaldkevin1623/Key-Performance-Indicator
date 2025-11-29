"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
/**
 * @route   POST /api/auth/signup
 * @desc    Register new company with admin user
 * @access  Public
 */
router.post('/signup', auth_controller_1.signup);
/**
 * @route   POST /api/auth/login
 * @desc    Login user (admin or employee)
 * @access  Public
 */
router.post('/login', auth_controller_1.login);
/**
 * @route   GET /api/auth/me
 * @desc    Get current logged-in user
 * @access  Private
 */
router.get('/me', auth_middleware_1.authenticate, auth_controller_1.getCurrentUser);
/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', auth_middleware_1.authenticate, auth_controller_1.logout);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map