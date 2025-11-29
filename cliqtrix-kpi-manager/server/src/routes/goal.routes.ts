import { Router } from "express";
import {
  createGoal,
  getTodayGoals,
  getCompletedGoals,
  completeGoal,
} from "../controllers/goal.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// all goal routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/goals
 * @desc    Create new goal for current user
 * @access  Private (Employee/Admin)
 */
router.post("/", createGoal);

/**
 * @route   GET /api/goals/today
 * @desc    Get today's active goals for current user
 * @access  Private (Employee/Admin)
 */
router.get("/today", getTodayGoals);

/**
 * @route   GET /api/goals/completed
 * @desc    Get completed goals for current user
 * @access  Private (Employee/Admin)
 */
router.get("/completed", getCompletedGoals);

/**
 * @route   PATCH /api/goals/:id/complete
 * @desc    Mark a goal as completed
 * @access  Private (Owner/Admin)
 */
router.patch("/:id/complete", completeGoal);

export default router;
