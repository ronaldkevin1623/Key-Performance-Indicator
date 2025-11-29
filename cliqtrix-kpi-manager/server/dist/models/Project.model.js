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
// Project Schema
const projectSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Project name is required'],
        trim: true,
        maxlength: [200, 'Project name cannot exceed 200 characters'],
        index: true,
    },
    description: {
        type: String,
        trim: true,
        maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    company: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Company',
        required: [true, 'Company reference is required'],
        index: true,
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Creator reference is required'],
        index: true,
    },
    teamMembers: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
    status: {
        type: String,
        enum: {
            values: ['planning', 'active', 'on-hold', 'completed', 'cancelled'],
            message: 'Invalid project status',
        },
        default: 'planning',
        index: true,
    },
    priority: {
        type: String,
        enum: {
            values: ['low', 'medium', 'high', 'critical'],
            message: 'Invalid priority level',
        },
        default: 'medium',
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required'],
        default: Date.now,
    },
    endDate: {
        type: Date,
        validate: {
            validator: function (value) {
                return !value || value > this.startDate;
            },
            message: 'End date must be after start date',
        },
    },
    budget: {
        type: Number,
        min: [0, 'Budget cannot be negative'],
    },
    tags: [
        {
            type: String,
            trim: true,
            lowercase: true,
        },
    ],
    color: {
        type: String,
        default: '#3B82F6',
        match: [/^#[0-9A-F]{6}$/i, 'Please provide a valid hex color code'],
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    completedAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
// Indexes for better query performance
projectSchema.index({ company: 1, status: 1 });
projectSchema.index({ company: 1, isActive: 1 });
projectSchema.index({ createdBy: 1 });
projectSchema.index({ teamMembers: 1 });
projectSchema.index({ status: 1, priority: 1 });
// Virtual field: Get task count
projectSchema.virtual('taskCount', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'project',
    count: true,
});
// Virtual field: Get completed task count
projectSchema.virtual('completedTaskCount', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'project',
    count: true,
    match: { status: 'completed' },
});
// Virtual field: Calculate progress percentage
projectSchema.virtual('progress').get(function () {
    if (!this.taskCount || this.taskCount === 0)
        return 0;
    return Math.round(((this.completedTaskCount || 0) / this.taskCount) * 100);
});
// Virtual field: Check if project is overdue
projectSchema.virtual('isOverdue').get(function () {
    if (!this.endDate || this.status === 'completed' || this.status === 'cancelled') {
        return false;
    }
    return new Date() > this.endDate;
});
// Virtual field: Days remaining
projectSchema.virtual('daysRemaining').get(function () {
    if (!this.endDate || this.status === 'completed' || this.status === 'cancelled') {
        return null;
    }
    const today = new Date();
    const end = new Date(this.endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
});
// Static method: Find projects by company
projectSchema.statics.findByCompany = function (companyId) {
    return this.find({ company: companyId, isActive: true })
        .populate('createdBy', 'firstName lastName email')
        .populate('teamMembers', 'firstName lastName email avatar');
};
// Static method: Find active projects
projectSchema.statics.findActiveProjects = function (companyId) {
    return this.find({
        company: companyId,
        status: 'active',
        isActive: true
    });
};
// Static method: Find projects by team member
projectSchema.statics.findByTeamMember = function (userId) {
    return this.find({
        teamMembers: userId,
        isActive: true
    })
        .populate('company', 'name')
        .populate('createdBy', 'firstName lastName');
};
// Instance method: Add team member
projectSchema.methods.addTeamMember = function (userId) {
    if (!this.teamMembers.includes(userId)) {
        this.teamMembers.push(userId);
    }
    return this.save();
};
// Instance method: Remove team member
projectSchema.methods.removeTeamMember = function (userId) {
    this.teamMembers = this.teamMembers.filter((memberId) => memberId.toString() !== userId.toString());
    return this.save();
};
// Instance method: Mark as completed
projectSchema.methods.markAsCompleted = function () {
    this.status = 'completed';
    this.completedAt = new Date();
    return this.save();
};
// Pre-save middleware: Set completedAt when status changes to completed
projectSchema.pre('save', function (next) {
    if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
        this.completedAt = new Date();
    }
    next();
});
// Create and export the Project model
const Project = mongoose_1.default.model('Project', projectSchema);
exports.default = Project;
//# sourceMappingURL=Project.model.js.map