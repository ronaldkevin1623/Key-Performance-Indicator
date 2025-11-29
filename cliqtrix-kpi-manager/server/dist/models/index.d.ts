import User, { IUser } from './User.model';
import Company, { ICompany } from './Company.model';
import Project, { IProject } from './Project.model';
import Task, { ITask } from './Task.model';
import KPI, { IKPI } from './KPI.model';
import Team, { ITeam } from './Team.model';
export { User, Company, Project, Task, KPI, Team, };
export type { IUser, ICompany, IProject, ITask, IKPI, ITeam, };
declare const _default: {
    User: import("mongoose").Model<IUser, {}, {}, {}, import("mongoose").Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, any>;
    Company: import("mongoose").Model<ICompany, {}, {}, {}, import("mongoose").Document<unknown, {}, ICompany, {}, {}> & ICompany & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, any>;
    Project: import("mongoose").Model<IProject, {}, {}, {}, import("mongoose").Document<unknown, {}, IProject, {}, {}> & IProject & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, any>;
    Task: import("mongoose").Model<ITask, {}, {}, {}, import("mongoose").Document<unknown, {}, ITask, {}, {}> & ITask & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, any>;
    KPI: import("mongoose").Model<IKPI, {}, {}, {}, import("mongoose").Document<unknown, {}, IKPI, {}, {}> & IKPI & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, any>;
    Team: import("mongoose").Model<ITeam, {}, {}, {}, import("mongoose").Document<unknown, {}, ITeam, {}, {}> & ITeam & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, any>;
};
export default _default;
//# sourceMappingURL=index.d.ts.map