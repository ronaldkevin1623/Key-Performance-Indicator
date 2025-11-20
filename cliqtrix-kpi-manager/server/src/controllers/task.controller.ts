
import { Request, Response } from 'express';
import { Task, Project, User } from '../models';
import logger from '../utils/logger';

/**
 * Create Task (Admin only)
 * POST /api/tasks
 */
export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title,
      description,
      project,
      assignedTo,
      status,
      priority,
      points,
      dueDate,
      estimatedHours,
      tags,
    } = req.body;

    // Validate required fields
    if (!title || !project || !assignedTo) {
      res.status(400).json({
        status: 'error',
        message: 'Title, project, and assignedTo are required.',
      });
      return;
    }

    const companyId = req.user!.companyId;
    const assignedById = req.user!.userId;

    // Verify project exists and belongs to company
    const projectDoc = await Project.findOne({
      _id: project,
      company: companyId,
      isActive: true,
    });

    if (!projectDoc) {
      res.status(404).json({
        status: 'error',
        message: 'Project not found.',
      });
      return;
    }

    // Verify assignedTo user exists and belongs to company
    const assignedToUser = await User.findOne({
      _id: assignedTo,
      company: companyId,
      isActive: true,
    });

    if (!assignedToUser) {
      res.status(404).json({
        status: 'error',
        message: 'Assigned user not found or not in your company.',
      });
      return;
    }

    // Create task
    const task = await Task.create({
      title,
      description,
      project,
      company: companyId,
      assignedTo,
      assignedBy: assignedById,
      status: status || 'pending',
      priority: priority || 'medium',
      points: points || 10,
      dueDate,
      estimatedHours,
      tags: tags || [],
      isActive: true,
    });

    await task.populate('project', 'name color');
    await task.populate('assignedTo', 'firstName lastName email avatar');
    await task.populate('assignedBy', 'firstName lastName email');

    logger.info(`Task created: ${title} assigned to ${assignedToUser.email}`);

    res.status(201).json({
      status: 'success',
      message: 'Task created successfully!',
      data: {
        task,
      },
    });
  } catch (error: any) {
    logger.error('Create task error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error creating task.',
    });
  }
};

/**
 * Get All Tasks (Admin gets all, Employee gets their tasks)
 * GET /api/tasks
 */
export const getAllTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const companyId = req.user!.companyId;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    // Query parameters
    const { status, priority, project, assignedTo } = req.query;

    // Build query based on role
    const query: any = { company: companyId, isActive: true };

    // If employee, only show their tasks
    if (userRole === 'employee') {
      query.assignedTo = userId;
    }

    // Apply filters
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (project) query.project = project;
    if (assignedTo && userRole === 'admin') query.assignedTo = assignedTo;

    const tasks = await Task.find(query)
      .populate('project', 'name color')
      .populate('assignedTo', 'firstName lastName email avatar')
      .populate('assignedBy', 'firstName lastName email')
      .sort({ dueDate: 1, priority: -1 });

    res.status(200).json({
      status: 'success',
      results: tasks.length,
      data: {
        tasks,
      },
    });
  } catch (error: any) {
    logger.error('Get tasks error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching tasks.',
    });
  }
};

/**
 * Get Single Task
 * GET /api/tasks/:id
 */
export const getTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const companyId = req.user!.companyId;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    const query: any = {
      _id: id,
      company: companyId,
    };

    // If employee, only allow viewing their own tasks
    if (userRole === 'employee') {
      query.assignedTo = userId;
    }

    const task = await Task.findOne(query)
      .populate('project', 'name description color')
      .populate('assignedTo', 'firstName lastName email avatar department position')
      .populate('assignedBy', 'firstName lastName email')
      .populate('comments.user', 'firstName lastName email avatar');

    if (!task) {
      res.status(404).json({
        status: 'error',
        message: 'Task not found.',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: {
        task,
      },
    });
  } catch (error: any) {
    logger.error('Get task error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching task.',
    });
  }
};

/**
 * Update Task (Admin or assigned employee)
 * PATCH /api/tasks/:id
 */
export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const companyId = req.user!.companyId;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    const {
      title,
      description,
      status,
      priority,
      points,
      dueDate,
      estimatedHours,
      actualHours,
      tags,
    } = req.body;

    const task = await Task.findOne({
      _id: id,
      company: companyId,
    });

    if (!task) {
      res.status(404).json({
        status: 'error',
        message: 'Task not found.',
      });
      return;
    }

    // Employees can only update their own tasks and limited fields
    if (userRole === 'employee') {
      if (task.assignedTo.toString() !== userId) {
        res.status(403).json({
          status: 'error',
          message: 'You can only update your own tasks.',
        });
        return;
      }
      // Employees can only update status and actual hours
      if (status) task.status = status;
      if (actualHours !== undefined) task.actualHours = actualHours;
    } else {
      // Admin can update all fields
      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (status) task.status = status;
      if (priority) task.priority = priority;
      if (points) task.points = points;
      if (dueDate !== undefined) task.dueDate = dueDate;
      if (estimatedHours !== undefined) task.estimatedHours = estimatedHours;
      if (actualHours !== undefined) task.actualHours = actualHours;
      if (tags) task.tags = tags;
    }

    await task.save();
    await task.populate('project', 'name color');
    await task.populate('assignedTo', 'firstName lastName email avatar');
    await task.populate('assignedBy', 'firstName lastName email');

    logger.info(`Task updated: ${task.title} by ${req.user!.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Task updated successfully!',
      data: {
        task,
      },
    });
  } catch (error: any) {
    logger.error('Update task error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating task.',
    });
  }
};

/**
 * Delete Task (Admin only)
 * DELETE /api/tasks/:id
 */
export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const companyId = req.user!.companyId;

    const task = await Task.findOne({
      _id: id,
      company: companyId,
    });

    if (!task) {
      res.status(404).json({
        status: 'error',
        message: 'Task not found.',
      });
      return;
    }

    task.isActive = false;
    await task.save();

    logger.info(`Task deleted: ${task.title} by ${req.user!.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Task deleted successfully!',
    });
  } catch (error: any) {
    logger.error('Delete task error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting task.',
    });
  }
};

/**
 * Add Comment to Task
 * POST /api/tasks/:id/comments
 */
export const addComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const companyId = req.user!.companyId;
    const userId = req.user!.userId;

    if (!text) {
      res.status(400).json({
        status: 'error',
        message: 'Comment text is required.',
      });
      return;
    }

    const task = await Task.findOne({
      _id: id,
      company: companyId,
    });

    if (!task) {
      res.status(404).json({
        status: 'error',
        message: 'Task not found.',
      });
      return;
    }

    task.comments = task.comments || [];
    task.comments.push({
      user: userId as any,
      text,
      createdAt: new Date(),
    });

    await task.save();
    await task.populate('comments.user', 'firstName lastName email avatar');

    logger.info(`Comment added to task: ${task.title}`);

    res.status(200).json({
      status: 'success',
      message: 'Comment added successfully!',
      data: {
        task,
      },
    });
  } catch (error: any) {
    logger.error('Add comment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error adding comment.',
    });
  }
};

/**
 * Get Employee KPI (Total points for date range)
 * GET /api/tasks/kpi/:userId
 */
export const getEmployeeKPI = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;
    const companyId = req.user!.companyId;

    // Verify user belongs to company
    const user = await User.findOne({
      _id: userId,
      company: companyId,
    });

    if (!user) {
      res.status(404).json({
        status: 'error',
        message: 'User not found.',
      });
      return;
    }

    // Build query
    const query: any = {
      assignedTo: userId,
      company: companyId,
      status: 'completed',
      isActive: true,
    };

    if (startDate && endDate) {
      query.completedDate = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    }

    const completedTasks = await Task.find(query);
    const totalPoints = completedTasks.reduce((sum, task) => sum + task.points, 0);
    const taskCount = completedTasks.length;

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          name: user.getFullName(),
          email: user.email,
        },
        kpi: {
          totalPoints,
          completedTasks: taskCount,
          averagePoints: taskCount > 0 ? Math.round(totalPoints / taskCount) : 0,
          period: {
            startDate: startDate || null,
            endDate: endDate || null,
          },
        },
        tasks: completedTasks,
      },
    });
  } catch (error: any) {
    logger.error('Get employee KPI error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching KPI data.',
    });
  }
};

export default {
  createTask,
  getAllTasks,
  getTask,
  updateTask,
  deleteTask,
  addComment,
  getEmployeeKPI,
};