"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
/**
 * Routes for logged-in user profile (admin or employee)
 * These need only authentication, not admin.
 */
router.get("/me/profile", auth_middleware_1.authenticate, user_controller_1.getMyProfile);
/**
 * Admin-only routes below
 */
router.use(auth_middleware_1.authenticate, auth_middleware_1.requireAdmin);
/**
 * @route   POST /api/users
 * @desc    Create new employee
 * @access  Private (Admin only)
 */
router.post("/", user_controller_1.createEmployee);
/**
 * @route   GET /api/users/employee-dropdown
 * @desc    Get all employees in company (for assignment dropdown)
 * @access  Private (Admin only)
 */
router.get("/employee-dropdown", user_controller_1.getEmployeeDropdown);
/**
 * @route   GET /api/users
 * @desc    Get all employees in company
 * @access  Private (Admin only)
 */
router.get("/", user_controller_1.getAllEmployees);
/**
 * @route   GET /api/users/:id
 * @desc    Get single employee
 * @access  Private (Admin only)
 */
router.get("/:id", user_controller_1.getEmployee);
/**
 * @route   PATCH /api/users/:id
 * @desc    Update employee details
 * @access  Private (Admin only)
 */
router.patch("/:id", user_controller_1.updateEmployee);
/**
 * @route   DELETE /api/users/:id
 * @desc    Deactivate employee
 * @access  Private (Admin only)
 */
router.delete("/:id", user_controller_1.deactivateEmployee);
exports.default = router;
//# sourceMappingURL=user.routes.js.map