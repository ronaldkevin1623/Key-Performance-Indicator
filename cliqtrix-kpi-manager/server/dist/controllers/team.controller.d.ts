import { Request, Response } from "express";
export declare const upsertTeamForProject: (req: Request, res: Response) => Promise<void>;
export declare const getAllTeams: (req: Request, res: Response) => Promise<void>;
export declare const getTeamByProject: (req: Request, res: Response) => Promise<void>;
export declare const deleteTeam: (req: Request, res: Response) => Promise<void>;
declare const _default: {
    upsertTeamForProject: (req: Request, res: Response) => Promise<void>;
    getAllTeams: (req: Request, res: Response) => Promise<void>;
    getTeamByProject: (req: Request, res: Response) => Promise<void>;
    deleteTeam: (req: Request, res: Response) => Promise<void>;
};
export default _default;
//# sourceMappingURL=team.controller.d.ts.map