import User, { IUser } from './User.model';
import Company, { ICompany } from './Company.model';
import Project, { IProject } from './Project.model';
import Task, { ITask } from './Task.model';
import KPI, { IKPI } from './KPI.model';

// Export all models
export {
  User,
  Company,
  Project,
  Task,
  KPI,
};

// Export all interfaces
export type {
  IUser,
  ICompany,
  IProject,
  ITask,
  IKPI,
};

// Export default object with all models
export default {
  User,
  Company,
  Project,
  Task,
  KPI,
};