"use strict";
/**
 * KPI Model
 * Stores and calculates KPI scores for employees
 *
 * Location: server/src/models/KPI.model.ts
 */
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
// KPI Schema
const kpiSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User reference is required'],
        index: true,
    },
    company: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Company',
        required: [true, 'Company reference is required'],
        index: true,
    },
    period: {
        type: {
            type: String,
            enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
            default: 'monthly',
            required: true,
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
    },
    metrics: {
        totalTasksAssigned: {
            type: Number,
            default: 0,
            min: 0,
        },
        totalTasksCompleted: {
            type: Number,
            default: 0,
            min: 0,
        },
        tasksCompletedOnTime: {
            type: Number,
            default: 0,
            min: 0,
        },
        tasksCompletedLate: {
            type: Number,
            default: 0,
            min: 0,
        },
        totalPointsEarned: {
            type: Number,
            default: 0,
            min: 0,
        },
        totalPossiblePoints: {
            type: Number,
            default: 0,
            min: 0,
        },
        averageCompletionTime: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    score: {
        completionRate: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        onTimeRate: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        overallScore: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
            index: true,
        },
        grade: {
            type: String,
            enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'],
            default: 'C',
        },
    },
    rank: {
        position: {
            type: Number,
            default: 0,
            min: 0,
        },
        outOf: {
            type: Number,
            default: 0,
            min: 0,
        },
        percentile: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
    },
    trends: {
        previousScore: {
            type: Number,
            default: 0,
        },
        scoreChange: {
            type: Number,
            default: 0,
        },
        trend: {
            type: String,
            enum: ['improving', 'stable', 'declining'],
            default: 'stable',
        },
    },
    badges: [
        {
            name: {
                type: String,
                required: true,
                trim: true,
            },
            description: {
                type: String,
                trim: true,
            },
            earnedAt: {
                type: Date,
                default: Date.now,
            },
            icon: {
                type: String,
                trim: true,
            },
        },
    ],
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
// Compound indexes for efficient queries
kpiSchema.index({ user: 1, company: 1 });
kpiSchema.index({ user: 1, 'period.startDate': 1 });
kpiSchema.index({ company: 1, 'score.overallScore': -1 });
kpiSchema.index({ 'period.type': 1, 'period.startDate': 1 });
// Virtual field: Performance level
kpiSchema.virtual('performanceLevel').get(function () {
    const score = this.score.overallScore;
    if (score >= 90)
        return 'Exceptional';
    if (score >= 80)
        return 'Excellent';
    if (score >= 70)
        return 'Good';
    if (score >= 60)
        return 'Average';
    if (score >= 50)
        return 'Below Average';
    return 'Needs Improvement';
});
// Static method: Calculate KPI score
kpiSchema.statics.calculateScore = async function (userId, companyId, startDate, endDate) {
    const Task = mongoose_1.default.model('Task');
    const Company = mongoose_1.default.model('Company');
    // Get company settings for weights
    const company = await Company.findById(companyId);
    if (!company)
        throw new Error('Company not found');
    const completionWeight = company.settings.taskCompletionWeight;
    const onTimeWeight = company.settings.onTimeWeight;
    // Get all assigned tasks in period
    const assignedTasks = await Task.find({
        assignedTo: userId,
        company: companyId,
        createdAt: { $gte: startDate, $lte: endDate },
        isActive: true,
    });
    // Get completed tasks
    const completedTasks = assignedTasks.filter((task) => task.status === 'completed');
    // Get on-time completed tasks
    const onTimeTasks = completedTasks.filter((task) => task.completedDate && task.dueDate && task.completedDate <= task.dueDate);
    // Calculate metrics
    const totalTasksAssigned = assignedTasks.length;
    const totalTasksCompleted = completedTasks.length;
    const tasksCompletedOnTime = onTimeTasks.length;
    const tasksCompletedLate = completedTasks.length - onTimeTasks.length;
    const totalPointsEarned = completedTasks.reduce((sum, task) => sum + task.points, 0);
    const totalPossiblePoints = assignedTasks.reduce((sum, task) => sum + task.points, 0);
    // Calculate rates
    const completionRate = totalTasksAssigned > 0
        ? (totalTasksCompleted / totalTasksAssigned) * 100
        : 0;
    const onTimeRate = totalTasksCompleted > 0
        ? (tasksCompletedOnTime / totalTasksCompleted) * 100
        : 0;
    // Calculate weighted overall score
    const overallScore = (completionRate * completionWeight / 100) +
        (onTimeRate * onTimeWeight / 100);
    // Determine grade
    let grade;
    if (overallScore >= 95)
        grade = 'A+';
    else if (overallScore >= 90)
        grade = 'A';
    else if (overallScore >= 85)
        grade = 'B+';
    else if (overallScore >= 80)
        grade = 'B';
    else if (overallScore >= 75)
        grade = 'C+';
    else if (overallScore >= 70)
        grade = 'C';
    else if (overallScore >= 60)
        grade = 'D';
    else
        grade = 'F';
    return {
        metrics: {
            totalTasksAssigned,
            totalTasksCompleted,
            tasksCompletedOnTime,
            tasksCompletedLate,
            totalPointsEarned,
            totalPossiblePoints,
            averageCompletionTime: 0, // Calculate if needed
        },
        score: {
            completionRate: Math.round(completionRate * 100) / 100,
            onTimeRate: Math.round(onTimeRate * 100) / 100,
            overallScore: Math.round(overallScore * 100) / 100,
            grade,
        },
    };
};
// Static method: Get leaderboard
kpiSchema.statics.getLeaderboard = async function (companyId, periodType = 'monthly', limit = 10) {
    return this.find({
        company: companyId,
        'period.type': periodType,
        isActive: true,
    })
        .sort({ 'score.overallScore': -1 })
        .limit(limit)
        .populate('user', 'firstName lastName email avatar department');
};
// Static method: Update ranks for company
kpiSchema.statics.updateRanks = async function (companyId, periodType = 'monthly') {
    const kpis = await this.find({
        company: companyId,
        'period.type': periodType,
        isActive: true,
    }).sort({ 'score.overallScore': -1 });
    const totalEmployees = kpis.length;
    for (let i = 0; i < kpis.length; i++) {
        kpis[i].rank.position = i + 1;
        kpis[i].rank.outOf = totalEmployees;
        kpis[i].rank.percentile = Math.round(((totalEmployees - i) / totalEmployees) * 100);
        await kpis[i].save();
    }
};
// Instance method: Award badge
kpiSchema.methods.awardBadge = function (name, description, icon) {
    const existingBadge = this.badges.find((b) => b.name === name);
    if (!existingBadge) {
        this.badges.push({
            name,
            description,
            earnedAt: new Date(),
            icon,
        });
    }
    return this.save();
};
// Instance method: Check for achievements
kpiSchema.methods.checkAchievements = function () {
    const achievements = [];
    // Perfect score achievement
    if (this.score.overallScore === 100) {
        achievements.push({
            name: 'Perfect Score',
            description: 'Achieved a perfect KPI score of 100',
            icon: '🏆',
        });
    }
    // Top performer
    if (this.rank.position === 1) {
        achievements.push({
            name: 'Top Performer',
            description: 'Ranked #1 in the company',
            icon: '🥇',
        });
    }
    // All tasks on time
    if (this.metrics.tasksCompletedLate === 0 && this.metrics.totalTasksCompleted > 0) {
        achievements.push({
            name: 'Always On Time',
            description: 'Completed all tasks before deadline',
            icon: '⏰',
        });
    }
    // High completion rate
    if (this.score.completionRate >= 95) {
        achievements.push({
            name: 'Task Master',
            description: '95%+ task completion rate',
            icon: '✅',
        });
    }
    return achievements;
};
// Create and export the KPI model
const KPI = mongoose_1.default.model('KPI', kpiSchema);
exports.default = KPI;
//# sourceMappingURL=KPI.model.js.map