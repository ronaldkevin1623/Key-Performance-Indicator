"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
// Task Schema
const taskSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, 'Task title is required'],
        trim: true,
        maxlength: [300, 'Task title cannot exceed 300 characters'],
        index: true,
    },
    description: {
        type: String,
        trim: true,
        maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },
    project: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Project',
        required: [true, 'Project reference is required'],
        index: true,
    },
    company: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Company',
        required: [true, 'Company reference is required'],
        index: true,
    },
    assignedTo: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Assigned user is required'],
        index: true,
    },
    assignedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Assigner reference is required'],
        index: true,
    },
    status: {
        type: String,
        enum: {
            values: ['pending', 'in-progress', 'review', 'completed', 'cancelled'],
            message: 'Invalid task status',
        },
        default: 'pending',
        index: true,
    },
    priority: {
        type: String,
        enum: {
            values: ['low', 'medium', 'high', 'critical'],
            message: 'Invalid priority level',
        },
        default: 'medium',
        index: true,
    },
    points: {
        type: Number,
        required: [true, 'KPI points are required'],
        min: [1, 'Points must be at least 1'],
        max: [1000, 'Points cannot exceed 1000'],
        default: 10,
    },
    dueDate: {
        type: Date,
        index: true,
    },
    startDate: {
        type: Date,
        default: null,
    },
    completedDate: {
        type: Date,
        default: null,
    },
    endTime: {
        type: Date,
        default: null,
    },
    graceTime: {
        type: Date,
        default: null,
    },
    estimatedHours: {
        type: Number,
        min: [0, 'Estimated hours cannot be negative'],
    },
    actualHours: {
        type: Number,
        min: [0, 'Actual hours cannot be negative'],
    },
    tags: [
        {
            type: String,
            trim: true,
            lowercase: true,
        },
    ],
    attachments: [
        {
            type: String,
            trim: true,
        },
    ],
    comments: [
        {
            user: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
            text: {
                type: String,
                required: true,
                trim: true,
                maxlength: [1000, 'Comment cannot exceed 1000 characters'],
            },
            createdAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    completionPercent: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },
    completionDetails: {
        type: String,
        trim: true,
        default: "",
        maxlength: [2000, 'Completion details cannot exceed 2000 characters'],
    },
    earnedPoints: {
        type: Number,
        default: 0,
        min: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
// Indexes for better query performance
taskSchema.index({ company: 1, status: 1 });
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ dueDate: 1, status: 1 });
taskSchema.index({ assignedTo: 1, completedDate: 1 });
// Virtual field: Check if task is overdue
taskSchema.virtual('isOverdue').get(function () {
    if (!this.dueDate || this.status === 'completed' || this.status === 'cancelled') {
        return false;
    }
    return new Date() > this.dueDate;
});
// Virtual field: Check if completed on time
taskSchema.virtual('isCompletedOnTime').get(function () {
    if (!this.completedDate || !this.dueDate || this.status !== 'completed') {
        return null;
    }
    return this.completedDate <= this.dueDate;
});
// Virtual field: Days until due
taskSchema.virtual('daysUntilDue').get(function () {
    if (!this.dueDate || this.status === 'completed' || this.status === 'cancelled') {
        return null;
    }
    const today = new Date();
    const due = new Date(this.dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
});
// Virtual field: Calculate efficiency (if actual vs estimated hours available)
taskSchema.virtual('efficiency').get(function () {
    if (!this.estimatedHours || !this.actualHours || this.actualHours === 0) {
        return null;
    }
    return Math.round((this.estimatedHours / this.actualHours) * 100);
});
// Static method: Find tasks by employee
taskSchema.statics.findByEmployee = function (userId) {
    return this.find({ assignedTo: userId, isActive: true })
        .populate('project', 'name color')
        .populate('assignedBy', 'firstName lastName')
        .sort({ dueDate: 1 });
};
// Static method: Find pending tasks
taskSchema.statics.findPendingTasks = function (userId) {
    return this.find({
        assignedTo: userId,
        status: { $in: ['pending', 'in-progress'] },
        isActive: true
    }).sort({ dueDate: 1 });
};
// Static method: Find completed tasks in date range
taskSchema.statics.findCompletedInRange = function (userId, startDate, endDate) {
    return this.find({
        assignedTo: userId,
        status: 'completed',
        completedDate: { $gte: startDate, $lte: endDate },
        isActive: true,
    });
};
// Static method: Find overdue tasks
taskSchema.statics.findOverdueTasks = function (userId) {
    return this.find({
        assignedTo: userId,
        status: { $nin: ['completed', 'cancelled'] },
        dueDate: { $lt: new Date() },
        isActive: true,
    }).sort({ dueDate: 1 });
};
// Static method: Calculate total points for employee (earnedPoints)
taskSchema.statics.calculateTotalPoints = async function (userId, startDate, endDate) {
    const query = {
        assignedTo: userId,
        status: 'completed',
        isActive: true,
    };
    if (startDate && endDate) {
        query.completedDate = { $gte: startDate, $lte: endDate };
    }
    const tasks = await this.find(query);
    return tasks.reduce((total, task) => total + (task.earnedPoints || 0), 0);
};
// Instance method: Mark as completed
taskSchema.methods.markAsCompleted = function () {
    this.status = 'completed';
    this.completedDate = new Date();
    return this.save();
};
// Instance method: Add comment
taskSchema.methods.addComment = function (userId, text) {
    this.comments = this.comments || [];
    this.comments.push({
        user: userId,
        text: text,
        createdAt: new Date(),
    });
    return this.save();
};
// Instance method: Update status
taskSchema.methods.updateStatus = function (newStatus) {
    this.status = newStatus;
    if (newStatus === 'in-progress' && !this.startDate) {
        this.startDate = new Date();
    }
    if (newStatus === 'completed' && !this.completedDate) {
        this.completedDate = new Date();
    }
    return this.save();
};
// Pre-save middleware: Auto-set completion date
taskSchema.pre('save', function (next) {
    if (this.isModified('status')) {
        if (this.status === 'completed' && !this.completedDate) {
            this.completedDate = new Date();
        }
        if (this.status === 'in-progress' && !this.startDate) {
            this.startDate = new Date();
        }
    }
    next();
});
// Create and export the Task model
const Task = mongoose_1.default.model('Task', taskSchema);
exports.default = Task;
//# sourceMappingURL=Task.model.js.map