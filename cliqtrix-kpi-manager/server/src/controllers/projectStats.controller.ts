import { Request, Response } from "express";
import { Project, Task, Team } from "../models";

export const getProjectOverview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user!.companyId;

    const project = await Project.findOne({ _id: id, company: companyId });
    if (!project) {
      res.status(404).json({ status: "error", message: "Project not found" });
      return;
    }

    const tasks = await Task.find({
      project: id,
      company: companyId,
      isActive: true,
    })
      .sort({ updatedAt: -1 })
      .limit(10);

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "completed").length;
    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const team = await Team.findOne({ project: id, company: companyId }).populate(
      "members",
      "firstName lastName email"
    );

    res.status(200).json({
      status: "success",
      data: {
        project: {
          id: project._id,
          name: project.name,
          startDate: project.startDate,
          endDate: project.endDate,
        },
        stats: {
          teamSize: team ? team.members.length : 0,
          totalTasks,
          completionRate,
        },
        teamMembers: team?.members || [],
        recentTasks: tasks.map((t) => ({
          id: t._id,
          title: t.title,
          status: t.status,
          dueDate: t.dueDate,
        })),
      },
    });
  } catch (e: any) {
    res.status(500).json({
      status: "error",
      message: e.message || "Error loading project overview",
    });
  }
};
