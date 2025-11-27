import User, { IUser } from './User.model';
import Company, { ICompany } from './Company.model';
import Project, { IProject } from './Project.model';
import Task, { ITask } from './Task.model';
import KPI, { IKPI } from './KPI.model';
import Team, { ITeam } from './Team.model';

// Export all models
export {
  User,
  Company,
  Project,
  Task,
  KPI,
  Team,
};

// Export all interfaces
export type {
  IUser,
  ICompany,
  IProject,
  ITask,
  IKPI,
  ITeam,
};

// Export default object with all models
export default {
  User,
  Company,
  Project,
  Task,
  KPI,
  Team,
};
