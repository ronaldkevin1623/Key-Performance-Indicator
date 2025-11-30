"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmployeeKPI = exports.addComment = exports.deleteTask = exports.updateTask = exports.getTask = exports.getAllTasks = exports.createTask = void 0;
const models_1 = require("../models");
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Create Task (Admin only)
 * POST /api/tasks
 */
const createTask = async (req, res) => {
    try {
        const { title, description, project, assignedTo, status, priority, points, dueDate, estimatedHours, tags, startDate, endTime, graceTime, } = req.body;
        if (!title || !project || !assignedTo) {
            res.status(400).json({
                status: 'error',
                message: 'Title, project, and assignedTo are required.',
            });
            return;
        }
        const companyId = req.user.companyId;
        const assignedById = req.user.userId;
        const projectDoc = await models_1.Project.findOne({
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
        const assignedToUser = await models_1.User.findOne({
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
        const task = await models_1.Task.create({
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
            startDate,
            endTime,
            graceTime,
            tags: tags || [],
            isActive: true,
            completionPercent: 0,
            completionDetails: "",
            earnedPoints: 0,
        });
        await task.populate('project', 'name color');
        await task.populate('assignedTo', 'firstName lastName email avatar');
        await task.populate('assignedBy', 'firstName lastName email');
        logger_1.default.info(`Task created: ${title} assigned to ${assignedToUser.email}`);
        res.status(201).json({
            status: 'success',
            message: 'Task created successfully!',
            data: { task },
        });
    }
    catch (error) {
        logger_1.default.error('Create task error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error creating task.',
        });
    }
};
exports.createTask = createTask;
/**
 * Get All Tasks (Admin gets all, Employee gets their tasks)
 * GET /api/tasks
 */
const getAllTasks = async (req, res) => {
    try {
        const companyId = req.user.companyId;
        const userId = req.user.userId;
        const userRole = req.user.role;
        const { status, priority, project, assignedTo } = req.query;
        const query = { company: companyId, isActive: true };
        if (userRole === 'employee') {
            query.assignedTo = userId;
        }
        if (status)
            query.status = status;
        if (priority)
            query.priority = priority;
        if (project)
            query.project = project;
        if (assignedTo && userRole === 'admin')
            query.assignedTo = assignedTo;
        const tasks = await models_1.Task.find(query)
            .populate('project', 'name color')
            .populate('assignedTo', 'firstName lastName email avatar')
            .populate('assignedBy', 'firstName lastName email')
            .sort({ dueDate: 1, priority: -1 });
        res.status(200).json(tasks);
    }
    catch (error) {
        logger_1.default.error('Get tasks error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching tasks.',
        });
    }
};
exports.getAllTasks = getAllTasks;
/**
 * Get Single Task
 * GET /api/tasks/:id
 */
const getTask = async (req, res) => {
    try {
        const { id } = req.params;
        const companyId = req.user.companyId;
        const userId = req.user.userId;
        const userRole = req.user.role;
        const query = { _id: id, company: companyId };
        if (userRole === 'employee') {
            query.assignedTo = userId;
        }
        const task = await models_1.Task.findOne(query)
            .populate('project', 'name description color')
            .populate('assignedTo', 'firstName lastName email avatar department position')
            .populate('assignedBy', 'firstName lastName email')
            .populate('comments.user', 'firstName lastName email avatar');
        if (!task) {
            res.status(404).json({ status: 'error', message: 'Task not found.' });
            return;
        }
        res.status(200).json({ status: 'success', data: { task } });
    }
    catch (error) {
        logger_1.default.error('Get task error:', error);
        res.status(500).json({ status: 'error', message: 'Error fetching task.' });
    }
};
exports.getTask = getTask;
/**
 * Update Task (Admin or assigned employee)
 * PATCH /api/tasks/:id
 */
const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const companyId = req.user.companyId;
        const userId = req.user.userId;
        const userRole = req.user.role;
        const { title, description, status, priority, points, dueDate, estimatedHours, actualHours, tags, completionPercent, completionDetails, endTime, graceTime, } = req.body;
        const task = await models_1.Task.findOne({ _id: id, company: companyId });
        if (!task) {
            res.status(404).json({ status: 'error', message: 'Task not found.' });
            return;
        }
        if (userRole === 'employee') {
            if (task.assignedTo.toString() !== userId) {
                res.status(403).json({ status: 'error', message: 'You can only update your own tasks.' });
                return;
            }
            if (status)
                task.status = status;
            if (actualHours !== undefined)
                task.actualHours = actualHours;
            if (completionPercent !== undefined)
                task.completionPercent = completionPercent;
            if (completionDetails !== undefined)
                task.completionDetails = completionDetails;
        }
        else {
            if (title)
                task.title = title;
            if (description !== undefined)
                task.description = description;
            if (status)
                task.status = status;
            if (priority)
                task.priority = priority;
            if (points)
                task.points = points;
            if (dueDate !== undefined)
                task.dueDate = dueDate;
            if (estimatedHours !== undefined)
                task.estimatedHours = estimatedHours;
            if (actualHours !== undefined)
                task.actualHours = actualHours;
            if (tags)
                task.tags = tags;
            if (completionPercent !== undefined)
                task.completionPercent = completionPercent;
            if (completionDetails !== undefined)
                task.completionDetails = completionDetails;
            if (endTime !== undefined)
                task.endTime = endTime;
            if (graceTime !== undefined)
                task.graceTime = graceTime;
        }
        // If 100% complete, update status and completedDate
        if (completionPercent !== undefined && completionPercent >= 100) {
            task.status = 'completed';
            if (!task.completedDate) {
                task.completedDate = new Date();
            }
        }
        // KPI / earnedPoints calculation
        if (completionPercent !== undefined) {
            const now = new Date();
            const totalPoints = task.points || 0;
            const pct = completionPercent / 100;
            if (pct >= 1 && task.endTime && now <= task.endTime) {
                // Finished before end time: 100% of points
                task.earnedPoints = totalPoints;
            }
            else if (pct >= 1 &&
                task.endTime &&
                task.graceTime &&
                now > task.endTime &&
                now <= task.graceTime) {
                // Finished between end and grace: 50% of points
                task.earnedPoints = Math.round(totalPoints * 0.5);
            }
            else if (task.graceTime && now > task.graceTime) {
                // After grace: 30% of progress * points
                task.earnedPoints = Math.round(totalPoints * pct * 0.3);
            }
            else {
                // Before deadlines but not finished yet: partial credit (30% of progress)
                task.earnedPoints = Math.round(totalPoints * pct * 0.3);
            }
        }
        await task.save();
        await task.populate('project', 'name color');
        await task.populate('assignedTo', 'firstName lastName email avatar');
        await task.populate('assignedBy', 'firstName lastName email');
        logger_1.default.info(`Task updated: ${task.title} by ${req.user.email}`);
        res.status(200).json({
            status: 'success',
            message: 'Task updated successfully!',
            data: { task },
        });
    }
    catch (error) {
        logger_1.default.error('Update task error:', error);
        res.status(500).json({ status: 'error', message: 'Error updating task.' });
    }
};
exports.updateTask = updateTask;
/**
 * Delete Task (Admin only)
 * DELETE /api/tasks/:id
 */
const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const companyId = req.user.companyId;
        const task = await models_1.Task.findOne({ _id: id, company: companyId });
        if (!task) {
            res.status(404).json({ status: 'error', message: 'Task not found.' });
            return;
        }
        task.isActive = false;
        await task.save();
        logger_1.default.info(`Task deleted: ${task.title} by ${req.user.email}`);
        res.status(200).json({ status: 'success', message: 'Task deleted successfully!' });
    }
    catch (error) {
        logger_1.default.error('Delete task error:', error);
        res.status(500).json({ status: 'error', message: 'Error deleting task.' });
    }
};
exports.deleteTask = deleteTask;
/**
 * Add Comment to Task
 * POST /api/tasks/:id/comments
 */
const addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;
        const companyId = req.user.companyId;
        const userId = req.user.userId;
        if (!text) {
            res.status(400).json({ status: 'error', message: 'Comment text is required.' });
            return;
        }
        const task = await models_1.Task.findOne({ _id: id, company: companyId });
        if (!task) {
            res.status(404).json({ status: 'error', message: 'Task not found.' });
            return;
        }
        task.comments = task.comments || [];
        task.comments.push({ user: userId, text, createdAt: new Date() });
        await task.save();
        await task.populate('comments.user', 'firstName lastName email avatar');
        logger_1.default.info(`Comment added to task: ${task.title}`);
        res.status(200).json({
            status: 'success',
            message: 'Comment added successfully!',
            data: { task },
        });
    }
    catch (error) {
        logger_1.default.error('Add comment error:', error);
        res.status(500).json({ status: 'error', message: 'Error adding comment.' });
    }
};
exports.addComment = addComment;
/**
 * Get Employee KPI (Total points for date range)
 * GET /api/tasks/kpi/:userId
 */
const getEmployeeKPI = async (req, res) => {
    try {
        const { userId } = req.params;
        const { startDate, endDate } = req.query;
        const companyId = req.user.companyId;
        const user = await models_1.User.findOne({ _id: userId, company: companyId });
        if (!user) {
            res.status(404).json({ status: 'error', message: 'User not found.' });
            return;
        }
        const query = {
            assignedTo: userId,
            company: companyId,
            status: 'completed',
            isActive: true,
        };
        if (startDate && endDate) {
            query.completedDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        }
        const completedTasks = await models_1.Task.find(query);
        const totalPoints = completedTasks.reduce((sum, task) => sum + (task.earnedPoints || 0), 0);
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
    }
    catch (error) {
        logger_1.default.error('Get employee KPI error:', error);
        res.status(500).json({ status: 'error', message: 'Error fetching KPI data.' });
    }
};
exports.getEmployeeKPI = getEmployeeKPI;
exports.default = {
    createTask: exports.createTask,
    getAllTasks: exports.getAllTasks,
    getTask: exports.getTask,
    updateTask: exports.updateTask,
    deleteTask: exports.deleteTask,
    addComment: exports.addComment,
    getEmployeeKPI: exports.getEmployeeKPI,
};
//# sourceMappingURL=task.controller.js.map