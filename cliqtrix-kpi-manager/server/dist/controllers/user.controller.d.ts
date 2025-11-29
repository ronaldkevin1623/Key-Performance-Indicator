import { Request, Response } from "express";
/**
 * Create Employee (Admin only)
 * POST /api/users
 */
export declare const createEmployee: (req: Request, res: Response) => Promise<void>;
/**
 * Get All Employees (Admin only)
 * GET /api/users
 */
export declare const getAllEmployees: (req: Request, res: Response) => Promise<void>;
/**
 * Get Employee Dropdown (Employee selector for assignment)
 * GET /api/users/employee-dropdown
 */
export declare const getEmployeeDropdown: (req: Request, res: Response) => Promise<void>;
/**
 * Get Single Employee (Admin only)
 * GET /api/users/:id
 */
export declare const getEmployee: (req: Request, res: Response) => Promise<void>;
/**
 * Update Employee (Admin only)
 * PATCH /api/users/:id
 */
export declare const updateEmployee: (req: Request, res: Response) => Promise<void>;
/**
 * Deactivate Employee (Admin only)
 * DELETE /api/users/:id
 */
export declare const deactivateEmployee: (req: Request, res: Response) => Promise<void>;
/**
 * Get logged-in user's profile + company info
 * GET /api/users/me/profile
 */
export declare const getMyProfile: (req: Request, res: Response) => Promise<void>;
declare const _default: {
    createEmployee: (req: Request, res: Response) => Promise<void>;
    getAllEmployees: (req: Request, res: Response) => Promise<void>;
    getEmployeeDropdown: (req: Request, res: Response) => Promise<void>;
    getEmployee: (req: Request, res: Response) => Promise<void>;
    updateEmployee: (req: Request, res: Response) => Promise<void>;
    deactivateEmployee: (req: Request, res: Response) => Promise<void>;
    getMyProfile: (req: Request, res: Response) => Promise<void>;
};
export default _default;
//# sourceMappingURL=user.controller.d.ts.map