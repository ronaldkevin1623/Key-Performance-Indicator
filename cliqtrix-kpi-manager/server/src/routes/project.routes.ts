
import { Router } from 'express';
import {
  createProject,
  getAllProjects,
  getProject,
  updateProject,
  deleteProject,
  addTeamMember,
  removeTeamMember,
} from '../controllers/project.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate, requireAdmin);

/**
 * @route   POST /api/projects
 * @desc    Create new project
 * @access  Private (Admin only)
 */
router.post('/', createProject);

/**
 * @route   GET /api/projects
 * @desc    Get all projects in company
 * @access  Private (Admin only)
 */
router.get('/', getAllProjects);

/**
 * @route   GET /api/projects/:id
 * @desc    Get single project
 * @access  Private (Admin only)
 */
router.get('/:id', getProject);

/**
 * @route   PATCH /api/projects/:id
 * @desc    Update project details
 * @access  Private (Admin only)
 */
router.patch('/:id', updateProject);

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete project (soft delete)
 * @access  Private (Admin only)
 */
router.delete('/:id', deleteProject);

/**
 * @route   POST /api/projects/:id/members
 * @desc    Add team member to project
 * @access  Private (Admin only)
 */
router.post('/:id/members', addTeamMember);

/**
 * @route   DELETE /api/projects/:id/members/:userId
 * @desc    Remove team member from project
 * @access  Private (Admin only)
 */
router.delete('/:id/members/:userId', removeTeamMember);

export default router;