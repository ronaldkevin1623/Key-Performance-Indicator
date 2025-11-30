import { Request, Response } from "express";
/**
 * Create a new goal for the logged-in employee
 * POST /api/goals
 */
export declare const createGoal: (req: Request, res: Response) => Promise<void>;
/**
 * Get today's/open goals for the logged-in employee
 * GET /api/goals/today
 */
export declare const getTodayGoals: (req: Request, res: Response) => Promise<void>;
/**
 * Get completed goals for the logged-in employee
 * GET /api/goals/completed
 */
export declare const getCompletedGoals: (req: Request, res: Response) => Promise<void>;
/**
 * Mark a goal as completed (done)
 * PATCH /api/goals/:id/complete
 */
export declare const completeGoal: (req: Request, res: Response) => Promise<void>;
declare const _default: {
    createGoal: (req: Request, res: Response) => Promise<void>;
    getTodayGoals: (req: Request, res: Response) => Promise<void>;
    getCompletedGoals: (req: Request, res: Response) => Promise<void>;
    completeGoal: (req: Request, res: Response) => Promise<void>;
};
export default _default;
//# sourceMappingURL=goal.controller.d.ts.map