import { Request, Response } from "express";
/**
 * Create Project (Admin only)
 * POST /api/projects
 */
export declare const createProject: (req: Request, res: Response) => Promise<void>;
/**
 * Get All Projects (Admin only)
 * GET /api/projects
 */
export declare const getAllProjects: (req: Request, res: Response) => Promise<void>;
/**
 * Get Single Project (Admin only)
 * GET /api/projects/:id
 */
export declare const getProject: (req: Request, res: Response) => Promise<void>;
/**
 * Update Project (Admin only)
 * PATCH /api/projects/:id
 */
export declare const updateProject: (req: Request, res: Response) => Promise<void>;
/**
 * Delete Project (Admin only)
 * DELETE /api/projects/:id
 */
export declare const deleteProject: (req: Request, res: Response) => Promise<void>;
/**
 * Add Team Member to Project (Admin only)
 * POST /api/projects/:id/members
 */
export declare const addTeamMember: (req: Request, res: Response) => Promise<void>;
/**
 * Remove Team Member from Project (Admin only)
 * DELETE /api/projects/:id/members/:userId
 */
export declare const removeTeamMember: (req: Request, res: Response) => Promise<void>;
/**
 * Company-wide per-employee KPI progress
 * GET /api/projects/kpi-progress
 */
export declare const getCompanyKpiProgress: (req: Request, res: Response) => Promise<void>;
declare const _default: {
    createProject: (req: Request, res: Response) => Promise<void>;
    getAllProjects: (req: Request, res: Response) => Promise<void>;
    getProject: (req: Request, res: Response) => Promise<void>;
    updateProject: (req: Request, res: Response) => Promise<void>;
    deleteProject: (req: Request, res: Response) => Promise<void>;
    addTeamMember: (req: Request, res: Response) => Promise<void>;
    removeTeamMember: (req: Request, res: Response) => Promise<void>;
    getCompanyKpiProgress: (req: Request, res: Response) => Promise<void>;
};
export default _default;
//# sourceMappingURL=project.controller.d.ts.map