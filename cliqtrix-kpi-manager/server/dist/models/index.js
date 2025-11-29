"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Team = exports.KPI = exports.Task = exports.Project = exports.Company = exports.User = void 0;
const User_model_1 = __importDefault(require("./User.model"));
exports.User = User_model_1.default;
const Company_model_1 = __importDefault(require("./Company.model"));
exports.Company = Company_model_1.default;
const Project_model_1 = __importDefault(require("./Project.model"));
exports.Project = Project_model_1.default;
const Task_model_1 = __importDefault(require("./Task.model"));
exports.Task = Task_model_1.default;
const KPI_model_1 = __importDefault(require("./KPI.model"));
exports.KPI = KPI_model_1.default;
const Team_model_1 = __importDefault(require("./Team.model"));
exports.Team = Team_model_1.default;
// Export default object with all models
exports.default = {
    User: User_model_1.default,
    Company: Company_model_1.default,
    Project: Project_model_1.default,
    Task: Task_model_1.default,
    KPI: KPI_model_1.default,
    Team: Team_model_1.default,
};
//# sourceMappingURL=index.js.map