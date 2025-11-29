"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const goal_controller_1 = require("../controllers/goal.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// all goal routes require authentication
router.use(auth_middleware_1.authenticate);
/**
 * @route   POST /api/goals
 * @desc    Create new goal for current user
 * @access  Private (Employee/Admin)
 */
router.post("/", goal_controller_1.createGoal);
/**
 * @route   GET /api/goals/today
 * @desc    Get today's active goals for current user
 * @access  Private (Employee/Admin)
 */
router.get("/today", goal_controller_1.getTodayGoals);
/**
 * @route   GET /api/goals/completed
 * @desc    Get completed goals for current user
 * @access  Private (Employee/Admin)
 */
router.get("/completed", goal_controller_1.getCompletedGoals);
/**
 * @route   PATCH /api/goals/:id/complete
 * @desc    Mark a goal as completed
 * @access  Private (Owner/Admin)
 */
router.patch("/:id/complete", goal_controller_1.completeGoal);
exports.default = router;
//# sourceMappingURL=goal.routes.js.map