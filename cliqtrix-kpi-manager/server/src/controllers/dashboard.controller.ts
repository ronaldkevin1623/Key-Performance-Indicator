import { Request, Response } from "express";
import mongoose from "mongoose";
import { Project, User, Task } from "../models";

// Utility to convert string to valid ObjectId
function toObjectId(id: string | undefined): mongoose.Types.ObjectId {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Provided ID is not a valid ObjectId: " + id);
  }
  return new mongoose.Types.ObjectId(id);
}

export const getAdminDashboard = async (req: Request, res: Response) => {
  try {
    const companyId = toObjectId(req.user?.companyId);

    const totalProjects = await Project.countDocuments({ company: companyId });
    const totalUsers = await User.countDocuments({ company: companyId });
    const totalTasks = await Task.countDocuments({ company: companyId });
    const completedTasks = await Task.countDocuments({
      company: companyId,
      status: "completed",
    });
    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    res.status(200).json({
      status: "success",
      data: { totalProjects, totalUsers, totalTasks, completionRate },
    });
  } catch (error: any) {
    console.error("Admin Dashboard error:", error.stack || error.message || error);
    res.status(500).json({
      status: "error",
      message: error.message || "Error loading admin dashboard.",
    });
  }
};

export const getEmployeeDashboard = async (req: Request, res: Response) => {
  try {
    const userId = toObjectId(req.user?.userId);
    const companyId = toObjectId(req.user?.companyId);

    // Only count active tasks for this employee in this company!
    const filter = { assignedTo: userId, company: companyId, isActive: true };

    const totalTasks = await Task.countDocuments(filter);
    const completedTasks = await Task.countDocuments({
      ...filter,
      status: "completed",
    });
    const pointsAgg = await Task.aggregate([
      { $match: { ...filter } },
      { $group: { _id: null, total: { $sum: "$earnedPoints" } } }, // use earnedPoints
    ]);
    const totalPoints = pointsAgg.length ? pointsAgg[0].total : 0;
    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    res.status(200).json({
      status: "success",
      data: { totalTasks, completedTasks, totalPoints, completionRate },
    });
  } catch (error: any) {
    console.error("Employee Dashboard error:", error.stack || error.message || error);
    res.status(500).json({
      status: "error",
      message: error.message || "Error loading employee dashboard.",
    });
  }
};

export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const companyId = toObjectId(req.user?.companyId);

    const leaderboard = await Task.aggregate([
      { $match: { company: companyId, isActive: true } },
      {
        $group: {
          _id: "$assignedTo",
          earnedPoints: { $sum: { $ifNull: ["$earnedPoints", 0] } },
          totalPoints: { $sum: "$points" },
          pendingTasks: {
            $sum: {
              $cond: [
                { $in: ["$status", ["pending", "in-progress", "review"]] },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 0,
          userId: "$user._id",
          firstName: "$user.firstName",
          lastName: "$user.lastName",
          email: "$user.email",
          earnedPoints: 1,
          totalPoints: 1,
          pendingTasks: 1,
          score: {
            $subtract: [
              "$earnedPoints",
              { $multiply: ["$pendingTasks", 5] }, // penalty per pending task
            ],
          },
        },
      },
      { $sort: { score: -1, earnedPoints: -1 } },
    ]);

    res.status(200).json({
      status: "success",
      data: { leaderboard },
    });
  } catch (error: any) {
    console.error("Leaderboard error:", error.stack || error.message || error);
    res.status(500).json({
      status: "error",
      message: error.message || "Error loading leaderboard.",
    });
  }
};
