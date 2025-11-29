import { Request, Response } from "express";
import Goal from "../models/Goal.model";
import logger from "../utils/logger";

/**
 * Create a new goal for the logged-in employee
 * POST /api/goals
 */
export const createGoal = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const companyId = req.user!.companyId;

    const {
      title,
      description,
      startDate,
      endDate,
      targetPoints,
      priority,
    } = req.body;

    if (!title || !startDate || !endDate) {
      res.status(400).json({
        status: "error",
        message: "Title, start date and end date are required.",
      });
      return;
    }

    const goal = await Goal.create({
      user: userId,
      company: companyId,
      title,
      description,
      startDate,
      endDate,
      targetPoints,
      priority: priority ?? 3,
      status: "open",
    });

    logger.info(`Goal created for user ${userId}: ${title}`);

    res.status(201).json({
      status: "success",
      message: "Goal created successfully.",
      data: { goal },
    });
  } catch (error: any) {
    logger.error("Create goal error:", error);
    res.status(500).json({
      status: "error",
      message: "Error creating goal.",
    });
  }
};

/**
 * Get today's/open goals for the logged-in employee
 * GET /api/goals/today
 */
export const getTodayGoals = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const companyId = req.user!.companyId;

    const now = new Date();

    const goals = await Goal.find({
      user: userId,
      company: companyId,
      status: "open",
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .sort({ priority: 1, endDate: 1, createdAt: 1 })
      .lean();

    res.status(200).json({
      status: "success",
      data: { goals },
    });
  } catch (error: any) {
    logger.error("Get today goals error:", error);
    res.status(500).json({
      status: "error",
      message: "Error fetching goals.",
    });
  }
};

/**
 * Get completed goals for the logged-in employee
 * GET /api/goals/completed
 */
export const getCompletedGoals = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const companyId = req.user!.companyId;

    const goals = await Goal.find({
      user: userId,
      company: companyId,
      status: "done",
    })
      .sort({ updatedAt: -1, endDate: -1, createdAt: -1 })
      .lean();

    res.status(200).json({
      status: "success",
      data: { goals },
    });
  } catch (error: any) {
    logger.error("Get completed goals error:", error);
    res.status(500).json({
      status: "error",
      message: "Error fetching completed goals.",
    });
  }
};

/**
 * Mark a goal as completed (done)
 * PATCH /api/goals/:id/complete
 */
export const completeGoal = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const companyId = req.user!.companyId;

    const goal = await Goal.findOne({
      _id: id,
      user: userId,
      company: companyId,
    });

    if (!goal) {
      res.status(404).json({
        status: "error",
        message: "Goal not found.",
      });
      return;
    }

    goal.status = "done";
    await goal.save();

    logger.info(`Goal completed: ${goal.title} by user ${userId}`);

    res.status(200).json({
      status: "success",
      message: "Goal marked as completed.",
      data: { goal },
    });
  } catch (error: any) {
    logger.error("Complete goal error:", error);
    res.status(500).json({
      status: "error",
      message: "Error completing goal.",
    });
  }
};

export default {
  createGoal,
  getTodayGoals,
  getCompletedGoals,
  completeGoal,
};
