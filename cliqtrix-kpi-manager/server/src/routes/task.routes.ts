
import { Router } from 'express';
import {
  createTask,
  getAllTasks,
  getTask,
  updateTask,
  deleteTask,
  addComment,
  getEmployeeKPI,
} from '../controllers/task.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/tasks
 * @desc    Create new task
 * @access  Private (Admin only)
 */
router.post('/', requireAdmin, createTask);

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks (admin gets all, employee gets their tasks)
 * @access  Private (Admin & Employee)
 */
router.get('/', getAllTasks);

/**
 * @route   GET /api/tasks/kpi/:userId
 * @desc    Get employee KPI (total points)
 * @access  Private (Admin & Employee)
 */
router.get('/kpi/:userId', getEmployeeKPI);

/**
 * @route   GET /api/tasks/:id
 * @desc    Get single task
 * @access  Private (Admin & Employee - own tasks only)
 */
router.get('/:id', getTask);

/**
 * @route   PATCH /api/tasks/:id
 * @desc    Update task (admin all fields, employee status only)
 * @access  Private (Admin & Employee - own tasks only)
 */
router.patch('/:id', updateTask);

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete task (soft delete)
 * @access  Private (Admin only)
 */
router.delete('/:id', requireAdmin, deleteTask);

/**
 * @route   POST /api/tasks/:id/comments
 * @desc    Add comment to task
 * @access  Private (Admin & Employee)
 */
router.post('/:id/comments', addComment);

export default router;