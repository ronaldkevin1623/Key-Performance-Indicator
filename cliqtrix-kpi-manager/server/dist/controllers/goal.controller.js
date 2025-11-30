"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeGoal = exports.getCompletedGoals = exports.getTodayGoals = exports.createGoal = void 0;
const Goal_model_1 = __importDefault(require("../models/Goal.model"));
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Create a new goal for the logged-in employee
 * POST /api/goals
 */
const createGoal = async (req, res) => {
    try {
        const userId = req.user.userId;
        const companyId = req.user.companyId;
        const { title, description, startDate, endDate, targetPoints, priority, } = req.body;
        if (!title || !startDate || !endDate) {
            res.status(400).json({
                status: "error",
                message: "Title, start date and end date are required.",
            });
            return;
        }
        const goal = await Goal_model_1.default.create({
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
        logger_1.default.info(`Goal created for user ${userId}: ${title}`);
        res.status(201).json({
            status: "success",
            message: "Goal created successfully.",
            data: { goal },
        });
    }
    catch (error) {
        logger_1.default.error("Create goal error:", error);
        res.status(500).json({
            status: "error",
            message: "Error creating goal.",
        });
    }
};
exports.createGoal = createGoal;
/**
 * Get today's/open goals for the logged-in employee
 * GET /api/goals/today
 */
const getTodayGoals = async (req, res) => {
    try {
        const userId = req.user.userId;
        const companyId = req.user.companyId;
        const now = new Date();
        const goals = await Goal_model_1.default.find({
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
    }
    catch (error) {
        logger_1.default.error("Get today goals error:", error);
        res.status(500).json({
            status: "error",
            message: "Error fetching goals.",
        });
    }
};
exports.getTodayGoals = getTodayGoals;
/**
 * Get completed goals for the logged-in employee
 * GET /api/goals/completed
 */
const getCompletedGoals = async (req, res) => {
    try {
        const userId = req.user.userId;
        const companyId = req.user.companyId;
        const goals = await Goal_model_1.default.find({
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
    }
    catch (error) {
        logger_1.default.error("Get completed goals error:", error);
        res.status(500).json({
            status: "error",
            message: "Error fetching completed goals.",
        });
    }
};
exports.getCompletedGoals = getCompletedGoals;
/**
 * Mark a goal as completed (done)
 * PATCH /api/goals/:id/complete
 */
const completeGoal = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const companyId = req.user.companyId;
        const goal = await Goal_model_1.default.findOne({
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
        logger_1.default.info(`Goal completed: ${goal.title} by user ${userId}`);
        res.status(200).json({
            status: "success",
            message: "Goal marked as completed.",
            data: { goal },
        });
    }
    catch (error) {
        logger_1.default.error("Complete goal error:", error);
        res.status(500).json({
            status: "error",
            message: "Error completing goal.",
        });
    }
};
exports.completeGoal = completeGoal;
exports.default = {
    createGoal: exports.createGoal,
    getTodayGoals: exports.getTodayGoals,
    getCompletedGoals: exports.getCompletedGoals,
    completeGoal: exports.completeGoal,
};
//# sourceMappingURL=goal.controller.js.map