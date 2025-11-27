// src/controllers/team.controller.ts
import { Request, Response } from "express";
import { Team, Project, User } from "../models";

export const upsertTeamForProject = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { name, memberIds } = req.body;
    const companyId = req.user!.companyId;

    const project = await Project.findOne({
      _id: projectId,
      company: companyId,
    });
    if (!project) {
      res.status(404).json({ status: "error", message: "Project not found" });
      return;
    }

    const users = await User.find({
      _id: { $in: memberIds },
      company: companyId,
    });
    if (users.length !== memberIds.length) {
      res
        .status(400)
        .json({ status: "error", message: "Some members are invalid" });
      return;
    }

    const team = await Team.findOneAndUpdate(
      { project: projectId, company: companyId },
      { name: name || "Project Team", members: memberIds },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )
      .populate("project", "name")
      .populate("members", "firstName lastName email");

    res.status(200).json({ status: "success", data: { team } });
  } catch (e: any) {
    res
      .status(500)
      .json({ status: "error", message: e.message || "Error saving team" });
  }
};

export const getAllTeams = async (req: Request, res: Response) => {
  try {
    const companyId = req.user!.companyId;

    const teams = await Team.find({ company: companyId })
      .populate("project", "name")
      .populate("members", "firstName lastName email");

    res.status(200).json({ status: "success", data: { teams } });
  } catch (e: any) {
    res
      .status(500)
      .json({ status: "error", message: e.message || "Error loading teams" });
  }
};

export const getTeamByProject = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const companyId = req.user!.companyId;

    const team = await Team.findOne({
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
  } catch (e: any) {
    res
      .status(500)
      .json({ status: "error", message: e.message || "Error loading team" });
  }
};

export const deleteTeam = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user!.companyId;

    const team = await Team.findOneAndDelete({ _id: id, company: companyId });
    if (!team) {
      res.status(404).json({ status: "error", message: "Team not found" });
      return;
    }

    res
      .status(200)
      .json({ status: "success", message: "Team deleted successfully" });
  } catch (e: any) {
    res
      .status(500)
      .json({ status: "error", message: e.message || "Error deleting team" });
  }
};

export default {
  upsertTeamForProject,
  getAllTeams,
  getTeamByProject,
  deleteTeam,
};
