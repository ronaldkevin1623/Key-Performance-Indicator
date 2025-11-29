import { Router } from "express";
import {
  createEmployee,
  getAllEmployees,
  getEmployeeDropdown,
  getEmployee,
  updateEmployee,
  deactivateEmployee,
  getMyProfile,
} from "../controllers/user.controller";
import { authenticate, requireAdmin } from "../middleware/auth.middleware";

const router = Router();

/**
 * Routes for logged-in user profile (admin or employee)
 * These need only authentication, not admin.
 */
router.get("/me/profile", authenticate, getMyProfile);

/**
 * Admin-only routes below
 */
router.use(authenticate, requireAdmin);

/**
 * @route   POST /api/users
 * @desc    Create new employee
 * @access  Private (Admin only)
 */
router.post("/", createEmployee);

/**
 * @route   GET /api/users/employee-dropdown
 * @desc    Get all employees in company (for assignment dropdown)
 * @access  Private (Admin only)
 */
router.get("/employee-dropdown", getEmployeeDropdown);

/**
 * @route   GET /api/users
 * @desc    Get all employees in company
 * @access  Private (Admin only)
 */
router.get("/", getAllEmployees);

/**
 * @route   GET /api/users/:id
 * @desc    Get single employee
 * @access  Private (Admin only)
 */
router.get("/:id", getEmployee);

/**
 * @route   PATCH /api/users/:id
 * @desc    Update employee details
 * @access  Private (Admin only)
 */
router.patch("/:id", updateEmployee);

/**
 * @route   DELETE /api/users/:id
 * @desc    Deactivate employee
 * @access  Private (Admin only)
 */
router.delete("/:id", deactivateEmployee);

export default router;
