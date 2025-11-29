"use strict";
/**
 * Company Model
 * Represents organizations using the KPI Manager
 *
 * Location: server/src/models/Company.model.ts
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
// Company Schema
const companySchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true,
        unique: true,
        maxlength: [200, 'Company name cannot exceed 200 characters'],
        index: true,
    },
    email: {
        type: String,
        required: [true, 'Company email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    website: {
        type: String,
        trim: true,
        match: [
            /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/,
            'Please provide a valid URL',
        ],
    },
    phone: {
        type: String,
        trim: true,
        match: [/^\+?[\d\s-()]+$/, 'Please provide a valid phone number'],
    },
    address: {
        street: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        country: { type: String, trim: true },
        zipCode: { type: String, trim: true },
    },
    industry: {
        type: String,
        trim: true,
        maxlength: [100, 'Industry name cannot exceed 100 characters'],
    },
    logo: {
        type: String,
        default: null,
    },
    subscription: {
        plan: {
            type: String,
            enum: ['free', 'basic', 'premium', 'enterprise'],
            default: 'free',
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'trial', 'suspended'],
            default: 'trial',
        },
        startDate: {
            type: Date,
            default: Date.now,
        },
        endDate: {
            type: Date,
        },
        maxEmployees: {
            type: Number,
            default: 10, // Free tier default
        },
        maxProjects: {
            type: Number,
            default: 5, // Free tier default
        },
    },
    settings: {
        kpiCalculationMethod: {
            type: String,
            enum: ['weighted', 'simple', 'custom'],
            default: 'weighted',
        },
        taskCompletionWeight: {
            type: Number,
            default: 70, // 70% weight for task completion
            min: 0,
            max: 100,
        },
        onTimeWeight: {
            type: Number,
            default: 30, // 30% weight for on-time completion
            min: 0,
            max: 100,
        },
        timezone: {
            type: String,
            default: 'Asia/Kolkata',
        },
        workingHours: {
            start: {
                type: String,
                default: '09:00',
            },
            end: {
                type: String,
                default: '18:00',
            },
        },
    },
    zohoCliq: {
        enabled: {
            type: Boolean,
            default: false,
        },
        webhookUrl: {
            type: String,
            trim: true,
        },
        botToken: {
            type: String,
            trim: true,
            select: false, // Don't return in queries by default
        },
        channelId: {
            type: String,
            trim: true,
        },
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
companySchema.index({ email: 1 });
companySchema.index({ isActive: 1 });
companySchema.index({ 'subscription.status': 1 });
// Virtual field: Get total employees
companySchema.virtual('employeeCount', {
    ref: 'User',
    localField: '_id',
    foreignField: 'company',
    count: true,
    match: { role: 'employee', isActive: true },
});
// Virtual field: Get total projects
companySchema.virtual('projectCount', {
    ref: 'Project',
    localField: '_id',
    foreignField: 'company',
    count: true,
    match: { isActive: true },
});
// Static method: Check if company can add more employees
companySchema.statics.canAddEmployee = async function (companyId) {
    const company = await this.findById(companyId).populate('employeeCount');
    if (!company)
        return false;
    const currentEmployees = company.employeeCount || 0;
    return currentEmployees < company.subscription.maxEmployees;
};
// Static method: Check if company can add more projects
companySchema.statics.canAddProject = async function (companyId) {
    const company = await this.findById(companyId).populate('projectCount');
    if (!company)
        return false;
    const currentProjects = company.projectCount || 0;
    return currentProjects < company.subscription.maxProjects;
};
// Instance method: Check if subscription is active
companySchema.methods.hasActiveSubscription = function () {
    return this.subscription.status === 'active' || this.subscription.status === 'trial';
};
// Pre-save middleware: Validate KPI weight totals
companySchema.pre('save', function (next) {
    const totalWeight = this.settings.taskCompletionWeight + this.settings.onTimeWeight;
    if (totalWeight !== 100) {
        return next(new Error('Task completion weight and on-time weight must total 100%'));
    }
    next();
});
// Create and export the Company model
const Company = mongoose_1.default.model('Company', companySchema);
exports.default = Company;
//# sourceMappingURL=Company.model.js.map