import { Request, Response } from "express";
import { Project, User, Company, Task } from "../models";
import logger from "../utils/logger";

/**
 * Create Project (Admin only)
 * POST /api/projects
 */
export const createProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      name,
      description,
      teamMembers,
      status,
      priority,
      startDate,
      endDate,
      budget,
      tags,
      color,
    } = req.body;

    if (!name) {
      res.status(400).json({
        status: "error",
        message: "Project name is required.",
      });
      return;
    }

    const companyId = req.user!.companyId;
    const createdById = req.user!.userId;

    const company = await Company.findById(companyId);
    if (!company) {
      res.status(404).json({
        status: "error",
        message: "Company not found.",
      });
      return;
    }

    const activeProjectsCount = await Project.countDocuments({
      company: companyId,
      isActive: true,
    });

    if (activeProjectsCount >= company.subscription.maxProjects) {
      res.status(403).json({
        status: "error",
        message: `Project limit reached. Your plan allows ${company.subscription.maxProjects} projects.`,
      });
      return;
    }

    if (teamMembers && teamMembers.length > 0) {
      const validMembers = await User.countDocuments({
        _id: { $in: teamMembers },
        company: companyId,
        isActive: true,
      });

      if (validMembers !== teamMembers.length) {
        res.status(400).json({
          status: "error",
          message: "Some team members are invalid or not in your company.",
        });
        return;
      }
    }

    const project = await Project.create({
      name,
      description,
      company: companyId,
      createdBy: createdById,
      teamMembers: teamMembers || [],
      status: status || "planning",
      priority: priority || "medium",
      startDate: startDate || new Date(),
      endDate,
      budget,
      tags: tags || [],
      color: color || "#3B82F6",
      isActive: true,
    });

    await project.populate("createdBy", "firstName lastName email");
    await project.populate("teamMembers", "firstName lastName email avatar");

    logger.info(`Project created: ${name} by ${req.user!.email}`);

    res.status(201).json({
      status: "success",
      message: "Project created successfully!",
      data: {
        project,
      },
    });
  } catch (error: any) {
    logger.error("Create project error:", error);
    res.status(500).json({
      status: "error",
      message: "Error creating project.",
    });
  }
};

/**
 * Get All Projects (Admin only)
 * GET /api/projects
 */
export const getAllProjects = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const companyId = req.user!.companyId;

    const { status, priority, isActive } = req.query;

    const query: any = { company: companyId };

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (isActive !== undefined) query.isActive = isActive === "true";

    const projects = await Project.find(query)
      .populate("createdBy", "firstName lastName email")
      .populate("teamMembers", "firstName lastName email avatar")
      .sort({ createdAt: -1 });

    res.status(200).json(projects);
  } catch (error: any) {
    logger.error("Get projects error:", error);
    res.status(500).json({
      status: "error",
      message: "Error fetching projects.",
    });
  }
};

/**
 * Get Single Project (Admin only)
 * GET /api/projects/:id
 */
export const getProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const companyId = req.user!.companyId;

    const project = await Project.findOne({
      _id: id,
      company: companyId,
    })
      .populate("createdBy", "firstName lastName email")
      .populate(
        "teamMembers",
        "firstName lastName email avatar department position"
      );

    if (!project) {
      res.status(404).json({
        status: "error",
        message: "Project not found.",
      });
      return;
    }

    res.status(200).json({
      status: "success",
      data: {
        project,
      },
    });
  } catch (error: any) {
    logger.error("Get project error:", error);
    res.status(500).json({
      status: "error",
      message: "Error fetching project.",
    });
  }
};

/**
 * Update Project (Admin only)
 * PATCH /api/projects/:id
 */
export const updateProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const companyId = req.user!.companyId;

    const {
      name,
      description,
      teamMembers,
      status,
      priority,
      startDate,
      endDate,
      budget,
      tags,
      color,
      isActive,
    } = req.body;

    const project = await Project.findOne({
      _id: id,
      company: companyId,
    });

    if (!project) {
      res.status(404).json({
        status: "error",
        message: "Project not found.",
      });
      return;
    }

    if (teamMembers && teamMembers.length > 0) {
      const validMembers = await User.countDocuments({
        _id: { $in: teamMembers },
        company: companyId,
        isActive: true,
      });

      if (validMembers !== teamMembers.length) {
        res.status(400).json({
          status: "error",
          message: "Some team members are invalid or not in your company.",
        });
        return;
      }
    }

    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (teamMembers) project.teamMembers = teamMembers;
    if (status) project.status = status;
    if (priority) project.priority = priority;
    if (startDate) project.startDate = startDate;
    if (endDate !== undefined) project.endDate = endDate;
    if (budget !== undefined) project.budget = budget;
    if (tags) project.tags = tags;
    if (color) project.color = color;
    if (isActive !== undefined) project.isActive = isActive;

    await project.save();
    await project.populate("createdBy", "firstName lastName email");
    await project.populate("teamMembers", "firstName lastName email avatar");

    logger.info(`Project updated: ${project.name} by ${req.user!.email}`);

    res.status(200).json({
      status: "success",
      message: "Project updated successfully!",
      data: {
        project,
      },
    });
  } catch (error: any) {
    logger.error("Update project error:", error);
    res.status(500).json({
      status: "error",
      message: "Error updating project.",
    });
  }
};

/**
 * Delete Project (Admin only)
 * DELETE /api/projects/:id
 */
export const deleteProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const companyId = req.user!.companyId;

    const project = await Project.findOne({
      _id: id,
      company: companyId,
    });

    if (!project) {
      res.status(404).json({
        status: "error",
        message: "Project not found.",
      });
      return;
    }

    project.isActive = false;
    await project.save();

    logger.info(`Project deleted: ${project.name} by ${req.user!.email}`);

    res.status(200).json({
      status: "success",
      message: "Project deleted successfully!",
    });
  } catch (error: any) {
    logger.error("Delete project error:", error);
    res.status(500).json({
      status: "error",
      message: "Error deleting project.",
    });
  }
};

/**
 * Add Team Member to Project (Admin only)
 * POST /api/projects/:id/members
 */
export const addTeamMember = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const companyId = req.user!.companyId;

    if (!userId) {
      res.status(400).json({
        status: "error",
        message: "User ID is required.",
      });
      return;
    }

    const user = await User.findOne({
      _id: userId,
      company: companyId,
      isActive: true,
    });

    if (!user) {
      res.status(404).json({
        status: "error",
        message: "User not found or not in your company.",
      });
      return;
    }

    const project = await Project.findOne({
      _id: id,
      company: companyId,
    });

    if (!project) {
      res.status(404).json({
        status: "error",
        message: "Project not found.",
      });
      return;
    }

    if (project.teamMembers.includes(user._id)) {
      res.status(400).json({
        status: "error",
        message: "User is already a team member.",
      });
      return;
    }

    project.teamMembers.push(user._id);
    await project.save();
    await project.populate("teamMembers", "firstName lastName email avatar");

    logger.info(`Team member added to ${project.name}: ${user.email}`);

    res.status(200).json({
      status: "success",
      message: "Team member added successfully!",
      data: {
        project,
      },
    });
  } catch (error: any) {
    logger.error("Add team member error:", error);
    res.status(500).json({
      status: "error",
      message: "Error adding team member.",
    });
  }
};

/**
 * Remove Team Member from Project (Admin only)
 * DELETE /api/projects/:id/members/:userId
 */
export const removeTeamMember = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id, userId } = req.params;
    const companyId = req.user!.companyId;

    const project = await Project.findOne({
      _id: id,
      company: companyId,
    });

    if (!project) {
      res.status(404).json({
        status: "error",
        message: "Project not found.",
      });
      return;
    }

    project.teamMembers = project.teamMembers.filter(
      (memberId) => memberId.toString() !== userId
    );

    await project.save();
    await project.populate("teamMembers", "firstName lastName email avatar");

    logger.info(`Team member removed from ${project.name}`);

    res.status(200).json({
      status: "success",
      message: "Team member removed successfully!",
      data: {
        project,
      },
    });
  } catch (error: any) {
    logger.error("Remove team member error:", error);
    res.status(500).json({
      status: "error",
      message: "Error removing team member.",
    });
  }
};

/**
 * Company-wide per-employee KPI progress
 * GET /api/projects/kpi-progress
 */
export const getCompanyKpiProgress = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const companyId = req.user!.companyId;

    // use your real schema: company, status, completedDate, earnedPoints
    const tasks = await Task.find({
      company: companyId,
      status: "completed",
      isActive: true,
    }).select("assignedTo earnedPoints points completedDate updatedAt");

    if (tasks.length === 0) {
      res.status(200).json({
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        data: [],
      });
      return;
    }

    type Key = string; // `${userId}:${dateISO}`
    const pointsByUserDate = new Map<
      Key,
      { userId: string; date: string; points: number }
    >();
    const userIds = new Set<string>();

    tasks.forEach((t: any) => {
      const userId = t.assignedTo?.toString();
      if (!userId) return;
      userIds.add(userId);

      const dateSource = t.completedDate || t.updatedAt;
      if (!dateSource) return;

      const d = new Date(dateSource);
      const iso = d.toISOString().split("T")[0];

      const key = `${userId}:${iso}`;
      const existing = pointsByUserDate.get(key);
      const pts = typeof t.earnedPoints === "number" && t.earnedPoints > 0
        ? t.earnedPoints
        : t.points || 0;

      if (existing) {
        existing.points += pts;
      } else {
        pointsByUserDate.set(key, { userId, date: iso, points: pts });
      }
    });

    if (pointsByUserDate.size === 0) {
      res.status(200).json({
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        data: [],
      });
      return;
    }

    const users = await User.find({
      _id: { $in: Array.from(userIds) },
    }).select("firstName lastName");

    const userNameById = new Map<string, string>();
    users.forEach((u: any) => {
      const name = `${u.firstName || ""} ${u.lastName || ""}`.trim() || "User";
      userNameById.set(u._id.toString(), name);
    });

    const data = Array.from(pointsByUserDate.values()).map((row) => ({
      date: row.date,
      userId: row.userId,
      userName: userNameById.get(row.userId) || "Unknown",
      points: row.points,
    }));

    data.sort((a, b) => {
      if (a.date === b.date) return a.userId.localeCompare(b.userId);
      return a.date.localeCompare(b.date);
    });

    const dateList = data.map((d) => d.date).sort();
    const startDate = dateList[0];
    const endDate = dateList[dateList.length - 1];

    res.status(200).json({
      startDate,
      endDate,
      data,
    });
  } catch (error: any) {
    logger.error("Get company KPI progress error:", error);
    res.status(500).json({
      status: "error",
      message: "Error fetching KPI progress.",
    });
  }
};

export default {
  createProject,
  getAllProjects,
  getProject,
  updateProject,
  deleteProject,
  addTeamMember,
  removeTeamMember,
  getCompanyKpiProgress,
};
