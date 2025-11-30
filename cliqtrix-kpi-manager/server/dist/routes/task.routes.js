"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const task_controller_1 = require("../controllers/task.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.authenticate);
/**
 * @route   POST /api/tasks
 * @desc    Create new task
 * @access  Private (Admin only)
 */
router.post('/', auth_middleware_1.requireAdmin, task_controller_1.createTask);
/**
 * @route   GET /api/tasks
 * @desc    Get all tasks (admin gets all, employee gets their tasks)
 * @access  Private (Admin & Employee)
 */
router.get('/', task_controller_1.getAllTasks);
/**
 * @route   GET /api/tasks/kpi/:userId
 * @desc    Get employee KPI (total points)
 * @access  Private (Admin & Employee)
 */
router.get('/kpi/:userId', task_controller_1.getEmployeeKPI);
/**
 * @route   GET /api/tasks/:id
 * @desc    Get single task
 * @access  Private (Admin & Employee - own tasks only)
 */
router.get('/:id', task_controller_1.getTask);
/**
 * @route   PATCH /api/tasks/:id
 * @desc    Update task (admin all fields, employee status only)
 * @access  Private (Admin & Employee - own tasks only)
 */
router.patch('/:id', task_controller_1.updateTask);
/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete task (soft delete)
 * @access  Private (Admin only)
 */
router.delete('/:id', auth_middleware_1.requireAdmin, task_controller_1.deleteTask);
/**
 * @route   POST /api/tasks/:id/comments
 * @desc    Add comment to task
 * @access  Private (Admin & Employee)
 */
router.post('/:id/comments', task_controller_1.addComment);
exports.default = router;
//# sourceMappingURL=task.routes.js.map