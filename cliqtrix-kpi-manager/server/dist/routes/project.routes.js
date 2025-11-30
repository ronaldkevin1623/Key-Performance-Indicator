"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const project_controller_1 = require("../controllers/project.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All routes require authentication and admin role
router.use(auth_middleware_1.authenticate, auth_middleware_1.requireAdmin);
/**
 * @route   POST /api/projects
 * @desc    Create new project
 * @access  Private (Admin only)
 */
router.post("/", project_controller_1.createProject);
/**
 * @route   GET /api/projects
 * @desc    Get all projects in company
 * @access  Private (Admin only)
 */
router.get("/", project_controller_1.getAllProjects);
/**
 * @route   GET /api/projects/kpi-progress
 * @desc    Get company-wide per-employee KPI progress
 * @access  Private (Admin only)
 */
router.get("/kpi-progress", project_controller_1.getCompanyKpiProgress);
/**
 * @route   GET /api/projects/:id
 * @desc    Get single project
 * @access  Private (Admin only)
 */
router.get("/:id", project_controller_1.getProject);
/**
 * @route   PATCH /api/projects/:id
 * @desc    Update project details
 * @access  Private (Admin only)
 */
router.patch("/:id", project_controller_1.updateProject);
/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete project (soft delete)
 * @access  Private (Admin only)
 */
router.delete("/:id", project_controller_1.deleteProject);
/**
 * @route   POST /api/projects/:id/members
 * @desc    Add team member to project
 * @access  Private (Admin only)
 */
router.post("/:id/members", project_controller_1.addTeamMember);
/**
 * @route   DELETE /api/projects/:id/members/:userId
 * @desc    Remove team member from project
 * @access  Private (Admin only)
 */
router.delete("/:id/members/:userId", project_controller_1.removeTeamMember);
exports.default = router;
//# sourceMappingURL=project.routes.js.map