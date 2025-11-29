"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTeam = exports.getTeamByProject = exports.getAllTeams = exports.upsertTeamForProject = void 0;
const models_1 = require("../models");
const upsertTeamForProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { name, memberIds } = req.body;
        const companyId = req.user.companyId;
        const project = await models_1.Project.findOne({
            _id: projectId,
            company: companyId,
        });
        if (!project) {
            res.status(404).json({ status: "error", message: "Project not found" });
            return;
        }
        const users = await models_1.User.find({
            _id: { $in: memberIds },
            company: companyId,
        });
        if (users.length !== memberIds.length) {
            res
                .status(400)
                .json({ status: "error", message: "Some members are invalid" });
            return;
        }
        const team = await models_1.Team.findOneAndUpdate({ project: projectId, company: companyId }, { name: name || "Project Team", members: memberIds }, { new: true, upsert: true, setDefaultsOnInsert: true })
            .populate("project", "name")
            .populate("members", "firstName lastName email");
        res.status(200).json({ status: "success", data: { team } });
    }
    catch (e) {
        res
            .status(500)
            .json({ status: "error", message: e.message || "Error saving team" });
    }
};
exports.upsertTeamForProject = upsertTeamForProject;
const getAllTeams = async (req, res) => {
    try {
        const companyId = req.user.companyId;
        const teams = await models_1.Team.find({ company: companyId })
            .populate("project", "name")
            .populate("members", "firstName lastName email");
        res.status(200).json({ status: "success", data: { teams } });
    }
    catch (e) {
        res
            .status(500)
            .json({ status: "error", message: e.message || "Error loading teams" });
    }
};
exports.getAllTeams = getAllTeams;
const getTeamByProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const companyId = req.user.companyId;
        const team = await models_1.Team.findOne({
            project: projectId,
            company: companyId,
        })
            .populate("project", "name")
            .populate("members", "firstName lastName email");
        if (!team) {
            res.status(404).json({ status: "error", message: "Team not found" });
            return;
        }
        res.status(200).json({ status: "success", data: { team } });
    }
    catch (e) {
        res
            .status(500)
            .json({ status: "error", message: e.message || "Error loading team" });
    }
};
exports.getTeamByProject = getTeamByProject;
const deleteTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const companyId = req.user.companyId;
        const team = await models_1.Team.findOneAndDelete({ _id: id, company: companyId });
        if (!team) {
            res.status(404).json({ status: "error", message: "Team not found" });
            return;
        }
        res
            .status(200)
            .json({ status: "success", message: "Team deleted successfully" });
    }
    catch (e) {
        res
            .status(500)
            .json({ status: "error", message: e.message || "Error deleting team" });
    }
};
exports.deleteTeam = deleteTeam;
exports.default = {
    upsertTeamForProject: exports.upsertTeamForProject,
    getAllTeams: exports.getAllTeams,
    getTeamByProject: exports.getTeamByProject,
    deleteTeam: exports.deleteTeam,
};
//# sourceMappingURL=team.controller.js.map