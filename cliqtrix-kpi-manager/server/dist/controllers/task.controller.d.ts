import { Request, Response } from 'express';
/**
 * Create Task (Admin only)
 * POST /api/tasks
 */
export declare const createTask: (req: Request, res: Response) => Promise<void>;
/**
 * Get All Tasks (Admin gets all, Employee gets their tasks)
 * GET /api/tasks
 */
export declare const getAllTasks: (req: Request, res: Response) => Promise<void>;
/**
 * Get Single Task
 * GET /api/tasks/:id
 */
export declare const getTask: (req: Request, res: Response) => Promise<void>;
/**
 * Update Task (Admin or assigned employee)
 * PATCH /api/tasks/:id
 */
export declare const updateTask: (req: Request, res: Response) => Promise<void>;
/**
 * Delete Task (Admin only)
 * DELETE /api/tasks/:id
 */
export declare const deleteTask: (req: Request, res: Response) => Promise<void>;
/**
 * Add Comment to Task
 * POST /api/tasks/:id/comments
 */
export declare const addComment: (req: Request, res: Response) => Promise<void>;
/**
 * Get Employee KPI (Total points for date range)
 * GET /api/tasks/kpi/:userId
 */
export declare const getEmployeeKPI: (req: Request, res: Response) => Promise<void>;
declare const _default: {
    createTask: (req: Request, res: Response) => Promise<void>;
    getAllTasks: (req: Request, res: Response) => Promise<void>;
    getTask: (req: Request, res: Response) => Promise<void>;
    updateTask: (req: Request, res: Response) => Promise<void>;
    deleteTask: (req: Request, res: Response) => Promise<void>;
    addComment: (req: Request, res: Response) => Promise<void>;
    getEmployeeKPI: (req: Request, res: Response) => Promise<void>;
};
export default _default;
//# sourceMappingURL=task.controller.d.ts.map